import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { 
  AuthState, 
  AuthUser, 
  AuthSession, 
  UserProfile, 
  LoginCredentials, 
  RegisterCredentials,
  UpdateProfileData,
  ChangePasswordData,
  AuthError 
} from '../types/auth';
import { RateLimiter } from '../utils/validation';

interface AuthContextType extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<{ error: AuthError | null }>;
  signUp: (credentials: RegisterCredentials) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithGitHub: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (data: UpdateProfileData) => Promise<{ error: AuthError | null }>;
  changePassword: (data: ChangePasswordData) => Promise<{ error: AuthError | null }>;
  deleteAccount: () => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<{ error: AuthError | null }>;
  resendConfirmation: (email: string) => Promise<{ error: AuthError | null }>;
  clearError: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rate limiters for different operations
const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000);
const registerRateLimiter = new RateLimiter(3, 60 * 60 * 1000);
const passwordResetRateLimiter = new RateLimiter(3, 60 * 60 * 1000);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState & { error?: AuthError | null }>({
    user: null,
    session: null,
    loading: true,
    profile: null,
    error: null,
  });

  // Track initialization state separately
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Helper function to clear auth state immediately
  const clearAuthState = () => {
    setState({
      user: null,
      session: null,
      profile: null,
      loading: false,
      error: null,
    });
  };

  // Initialize auth state with faster loading
  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    async function getInitialSession() {
      try {
        // Set a shorter timeout for faster UX
        initTimeout = setTimeout(() => {
          if (mounted && !isInitialized) {
            console.log('⏰ [AUTH] Fast initialization timeout');
            setState(prev => ({ ...prev, loading: false }));
            setIsInitialized(true);
          }
        }, 2000); // Reduced from 5 seconds to 2 seconds

        const { data: { session }, error } = await supabase.auth.getSession();
        
        clearTimeout(initTimeout);

        if (error) {
          console.error('❌ [AUTH] Session error:', error);
          
          // Check for invalid refresh token error
          if (error.message?.includes('refresh_token_not_found') || 
              error.message?.includes('Invalid Refresh Token') ||
              error.message?.includes('Refresh Token Not Found')) {
            console.log('🔄 [AUTH] Invalid refresh token detected, clearing session');
            // Clear the invalid session from local storage
            await supabase.auth.signOut();
            // Immediately clear auth state
            if (mounted) {
              clearAuthState();
              setIsInitialized(true);
            }
            return;
          }
          
          if (mounted) {
            setState(prev => ({ ...prev, loading: false, error: null }));
            setIsInitialized(true);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('✅ [AUTH] Session found');
          
          // Set user immediately, fetch profile in background
          setState({
            user: session.user as AuthUser,
            session: session as AuthSession,
            profile: null, // Will be loaded in background
            loading: false,
            error: null,
          });
          setIsInitialized(true);

          // Fetch profile in background without blocking UI
          fetchUserProfile(session.user.id).then(profile => {
            if (!profile) {
              createUserProfile(session.user).then(newProfile => {
                if (mounted) {
                  setState(prev => ({ ...prev, profile: newProfile }));
                }
              });
            } else if (mounted) {
              setState(prev => ({ ...prev, profile }));
            }
          });
        } else if (mounted) {
          setState(prev => ({ 
            ...prev, 
            user: null,
            session: null,
            profile: null,
            loading: false, 
            error: null 
          }));
          setIsInitialized(true);
        }
      } catch (error: any) {
        console.error('❌ [AUTH] Init error:', error);
        
        // Check for invalid refresh token error in catch block as well
        if (error?.message?.includes('refresh_token_not_found') || 
            error?.message?.includes('Invalid Refresh Token') ||
            error?.message?.includes('Refresh Token Not Found')) {
          console.log('🔄 [AUTH] Invalid refresh token detected in catch, clearing session');
          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            console.error('❌ [AUTH] Error during signOut:', signOutError);
          }
          // Immediately clear auth state
          if (mounted) {
            clearAuthState();
            setIsInitialized(true);
          }
          return;
        }
        
        clearTimeout(initTimeout);
        if (mounted) {
          setState(prev => ({ 
            ...prev, 
            loading: false,
            error: null
          }));
          setIsInitialized(true);
        }
      }
    }

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log(`🔄 [AUTH] ${event}`);

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            setIsSigningIn(false);
            
            // Set user immediately for fast UI update
            setState({
              user: session.user as AuthUser,
              session: session as AuthSession,
              profile: null, // Will be loaded in background
              loading: false,
              error: null,
            });

            // Load profile in background
            fetchUserProfile(session.user.id).then(profile => {
              if (!profile) {
                createUserProfile(session.user).then(newProfile => {
                  if (mounted) {
                    setState(prev => ({ ...prev, profile: newProfile }));
                  }
                });
              } else if (mounted) {
                setState(prev => ({ ...prev, profile }));
              }
            });
          } else if (event === 'SIGNED_OUT') {
            setIsSigningIn(false);
            clearAuthState();
            
            localStorage.removeItem('supabase.auth.remember');
            
            if (window.location.pathname.includes('/profile') || window.location.pathname.includes('/admin')) {
              window.location.href = '/';
            }
          } else if (event === 'TOKEN_REFRESHED' && session) {
            setState(prev => ({
              ...prev,
              session: session as AuthSession,
              user: session.user as AuthUser,
              loading: false,
            }));
          } else if (event === 'USER_UPDATED' && session) {
            setState(prev => ({
              ...prev,
              user: session.user as AuthUser,
              session: session as AuthSession,
              loading: false,
            }));
          }
        } catch (error: any) {
          console.error('❌ [AUTH] Auth state change error:', error);
          
          // Handle invalid refresh token errors in auth state changes
          if (error?.message?.includes('refresh_token_not_found') || 
              error?.message?.includes('Invalid Refresh Token') ||
              error?.message?.includes('Refresh Token Not Found')) {
            console.log('🔄 [AUTH] Invalid refresh token in auth state change, clearing session');
            try {
              await supabase.auth.signOut();
            } catch (signOutError) {
              console.error('❌ [AUTH] Error during signOut in auth state change:', signOutError);
            }
            // Immediately clear auth state
            if (mounted) {
              clearAuthState();
            }
            return;
          }
          
          setIsSigningIn(false);
          setState(prev => ({
            ...prev,
            loading: false,
            error: null // Don't show error to user for refresh token issues
          }));
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Optimized profile fetching
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ [PROFILE] Fetch error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ [PROFILE] Unexpected fetch error:', error);
      return null;
    }
  };

  // Optimized profile creation
  const createUserProfile = async (user: any): Promise<UserProfile | null> => {
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || null,
        address: null,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return await fetchUserProfile(user.id);
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ [PROFILE] Create error:', error);
      return null;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Optimized sign in
  const signIn = async (credentials: LoginCredentials): Promise<{ error: AuthError | null }> => {
    const identifier = credentials.email;
    
    if (!loginRateLimiter.isAllowed(identifier)) {
      const remainingTime = Math.ceil(loginRateLimiter.getRemainingTime(identifier) / 1000 / 60);
      return {
        error: {
          message: `Too many login attempts. Please try again in ${remainingTime} minutes.`,
          code: 'rate_limit_exceeded'
        }
      };
    }

    if (isSigningIn) {
      return {
        error: {
          message: 'Sign in already in progress',
          code: 'signin_in_progress'
        }
      };
    }

    try {
      setIsSigningIn(true);
      setState(prev => ({ ...prev, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error('❌ [SIGNIN] Error:', error);
        setIsSigningIn(false);
        return {
          error: {
            message: error.message,
            code: error.message.toLowerCase().includes('invalid') ? 'invalid_credentials' : 'auth_error'
          }
        };
      }

      // Handle remember me
      if (credentials.rememberMe) {
        localStorage.setItem('supabase.auth.remember', 'true');
      } else {
        localStorage.removeItem('supabase.auth.remember');
      }

      return { error: null };
    } catch (error: any) {
      console.error('❌ [SIGNIN] Unexpected error:', error);
      setIsSigningIn(false);
      
      // Handle invalid refresh token during sign in
      if (error?.message?.includes('refresh_token_not_found') || 
          error?.message?.includes('Invalid Refresh Token') ||
          error?.message?.includes('Refresh Token Not Found')) {
        console.log('🔄 [AUTH] Invalid refresh token during sign in, clearing session');
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('❌ [AUTH] Error during signOut in sign in:', signOutError);
        }
        // Immediately clear auth state
        clearAuthState();
        return {
          error: {
            message: 'Session expired. Please try signing in again.',
            code: 'session_expired'
          }
        };
      }
      
      return {
        error: {
          message: 'An unexpected error occurred during sign in',
          details: error
        }
      };
    }
  };

  const signUp = async (credentials: RegisterCredentials): Promise<{ error: AuthError | null }> => {
    const identifier = credentials.email;
    
    if (!registerRateLimiter.isAllowed(identifier)) {
      const remainingTime = Math.ceil(registerRateLimiter.getRemainingTime(identifier) / 1000 / 60);
      return {
        error: {
          message: `Too many registration attempts. Please try again in ${remainingTime} minutes.`,
          code: 'rate_limit_exceeded'
        }
      };
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            username: credentials.username,
            full_name: credentials.fullName || '',
          },
          emailRedirectTo: undefined
        }
      });

      setState(prev => ({ ...prev, loading: false }));

      if (error) {
        return {
          error: {
            message: error.message,
            code: error.message.toLowerCase().includes('already') ? 'user_exists' : 'auth_error'
          }
        };
      }

      return { error: null };
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      return {
        error: {
          message: 'An unexpected error occurred during sign up',
          details: error
        }
      };
    }
  };

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return {
          error: {
            message: error.message,
            code: 'signout_error'
          }
        };
      }

      localStorage.removeItem('supabase.auth.remember');
      return { error: null };
    } catch (error) {
      return {
        error: {
          message: 'An unexpected error occurred during sign out',
          details: error
        }
      };
    }
  };

  const signInWithGoogle = async (): Promise<{ error: AuthError | null }> => {
    return {
      error: {
        message: 'Social login is not available in this environment. Please use email and password.',
        code: 'oauth_disabled'
      }
    };
  };

  const signInWithGitHub = async (): Promise<{ error: AuthError | null }> => {
    return {
      error: {
        message: 'Social login is not available in this environment. Please use email and password.',
        code: 'oauth_disabled'
      }
    };
  };

  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    if (!passwordResetRateLimiter.isAllowed(email)) {
      const remainingTime = Math.ceil(passwordResetRateLimiter.getRemainingTime(email) / 1000 / 60);
      return {
        error: {
          message: `Too many password reset attempts. Please try again in ${remainingTime} minutes.`,
          code: 'rate_limit_exceeded'
        }
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: undefined
      });

      if (error) {
        return {
          error: {
            message: error.message,
            code: 'password_reset_error'
          }
        };
      }

      return { error: null };
    } catch (error) {
      return {
        error: {
          message: 'An unexpected error occurred during password reset',
          details: error
        }
      };
    }
  };

  const updateProfile = async (data: UpdateProfileData): Promise<{ error: AuthError | null }> => {
    if (!state.user) {
      return {
        error: {
          message: 'User not authenticated',
          code: 'not_authenticated'
        }
      };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', state.user.id);

      if (error) {
        return {
          error: {
            message: error.message,
            code: 'profile_update_error'
          }
        };
      }

      const updatedProfile = await fetchUserProfile(state.user.id);
      setState(prev => ({ ...prev, profile: updatedProfile }));

      return { error: null };
    } catch (error) {
      return {
        error: {
          message: 'An unexpected error occurred during profile update',
          details: error
        }
      };
    }
  };

  const changePassword = async (data: ChangePasswordData): Promise<{ error: AuthError | null }> => {
    if (!state.user) {
      return {
        error: {
          message: 'User not authenticated',
          code: 'not_authenticated'
        }
      };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) {
        return {
          error: {
            message: error.message,
            code: 'password_change_error'
          }
        };
      }

      return { error: null };
    } catch (error) {
      return {
        error: {
          message: 'An unexpected error occurred during password change',
          details: error
        }
      };
    }
  };

  const deleteAccount = async (): Promise<{ error: AuthError | null }> => {
    if (!state.user) {
      return {
        error: {
          message: 'User not authenticated',
          code: 'not_authenticated'
        }
      };
    }

    try {
      await signOut();
      
      return {
        error: {
          message: 'Account deletion requires admin approval. Please contact support.',
          code: 'deletion_requires_admin'
        }
      };
    } catch (error) {
      return {
        error: {
          message: 'An unexpected error occurred during account deletion',
          details: error
        }
      };
    }
  };

  const refreshSession = async (): Promise<{ error: AuthError | null }> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        // Handle invalid refresh token during manual refresh
        if (error.message?.includes('refresh_token_not_found') || 
            error.message?.includes('Invalid Refresh Token') ||
            error.message?.includes('Refresh Token Not Found')) {
          console.log('🔄 [AUTH] Invalid refresh token during manual refresh, clearing session');
          await supabase.auth.signOut();
          // Immediately clear auth state
          clearAuthState();
          return {
            error: {
              message: 'Session expired. Please sign in again.',
              code: 'session_expired'
            }
          };
        }
        
        return {
          error: {
            message: error.message,
            code: 'session_refresh_error'
          }
        };
      }

      return { error: null };
    } catch (error: any) {
      // Handle invalid refresh token in catch block
      if (error?.message?.includes('refresh_token_not_found') || 
          error?.message?.includes('Invalid Refresh Token') ||
          error?.message?.includes('Refresh Token Not Found')) {
        console.log('🔄 [AUTH] Invalid refresh token in refresh catch, clearing session');
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('❌ [AUTH] Error during signOut in refresh catch:', signOutError);
        }
        // Immediately clear auth state
        clearAuthState();
        return {
          error: {
            message: 'Session expired. Please sign in again.',
            code: 'session_expired'
          }
        };
      }
      
      return {
        error: {
          message: 'An unexpected error occurred during session refresh',
          details: error
        }
      };
    }
  };

  const resendConfirmation = async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: undefined
        }
      });

      if (error) {
        return {
          error: {
            message: error.message,
            code: 'resend_error'
          }
        };
      }

      return { error: null };
    } catch (error) {
      return {
        error: {
          message: 'An unexpected error occurred while resending confirmation',
          details: error
        }
      };
    }
  };

  const value: AuthContextType = {
    user: state.user,
    session: state.session,
    loading: state.loading || isSigningIn,
    profile: state.profile,
    isAuthenticated: !!state.user,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGitHub,
    resetPassword,
    updateProfile,
    changePassword,
    deleteAccount,
    refreshSession,
    resendConfirmation,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}