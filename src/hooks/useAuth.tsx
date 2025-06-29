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
const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
const registerRateLimiter = new RateLimiter(3, 60 * 60 * 1000); // 3 attempts per hour
const passwordResetRateLimiter = new RateLimiter(3, 60 * 60 * 1000); // 3 attempts per hour

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState & { error?: AuthError | null }>({
    user: null,
    session: null,
    loading: true,
    profile: null,
    error: null,
  });

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        console.log('🔄 [AUTH] Getting initial session...');
        console.log('🔄 [AUTH] About to set loading state to true');
        setState(prev => {
          console.log('🔄 [AUTH] Setting loading state to true - prev state:', {
            hasUser: !!prev.user,
            loading: prev.loading
          });
          return { ...prev, loading: true, error: null };
        });
        console.log('✅ [AUTH] Loading state set to true');
        
        console.log('📡 [AUTH] Calling supabase.auth.getSession()...');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('📡 [AUTH] supabase.auth.getSession() completed');
        
        if (error) {
          console.error('❌ [AUTH] Error getting session:', error);
          if (mounted) {
            console.log('🔄 [AUTH] Setting error state due to session error');
            setState(prev => ({ 
              ...prev, 
              loading: false,
              error: { message: 'Failed to restore session', code: 'session_error' }
            }));
            console.log('✅ [AUTH] Error state set');
          }
          return;
        }

        console.log('📊 [AUTH] Session data received:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          userEmail: session?.user?.email
        });

        if (session?.user && mounted) {
          console.log('✅ [AUTH] Session found, starting profile fetch process...');
          console.log('🔄 [AUTH] About to call fetchUserProfile for user:', session.user.id);
          
          try {
            console.log('📋 [AUTH] Calling fetchUserProfile...');
            let profile = await fetchUserProfile(session.user.id);
            console.log('📋 [AUTH] fetchUserProfile returned:', {
              hasProfile: !!profile,
              profileId: profile?.id,
              profileEmail: profile?.email
            });
            
            // If no profile exists, create one
            if (!profile) {
              console.log('📝 [AUTH] No profile found, calling createUserProfile...');
              profile = await createUserProfile(session.user);
              console.log('📝 [AUTH] createUserProfile returned:', {
                hasProfile: !!profile,
                profileId: profile?.id,
                profileEmail: profile?.email
              });
            }
            
            console.log('🔄 [AUTH] About to update state with session and profile...');
            console.log('📊 [AUTH] Final state data before setState:', {
              userId: session.user.id,
              userEmail: session.user.email,
              hasProfile: !!profile,
              profileEmail: profile?.email,
              sessionAccessToken: session.access_token ? 'present' : 'missing',
              mounted
            });
            
            if (mounted) {
              console.log('🔄 [AUTH] Component still mounted, calling setState...');
              setState({
                user: session.user as AuthUser,
                session: session as AuthSession,
                profile,
                loading: false,
                error: null,
              });
              console.log('✅ [AUTH] setState called - initial session setup should be complete');
            } else {
              console.log('⚠️ [AUTH] Component unmounted, skipping setState');
            }
          } catch (profileError) {
            console.error('❌ [AUTH] Error during profile operations:', profileError);
            if (mounted) {
              setState({
                user: session.user as AuthUser,
                session: session as AuthSession,
                profile: null,
                loading: false,
                error: { message: 'Profile fetch failed', details: profileError },
              });
            }
          }
        } else if (mounted) {
          console.log('ℹ️ [AUTH] No session found - setting unauthenticated state');
          setState(prev => {
            console.log('🔄 [AUTH] Setting unauthenticated state');
            return { 
              ...prev, 
              user: null,
              session: null,
              profile: null,
              loading: false, 
              error: null 
            };
          });
          console.log('✅ [AUTH] Unauthenticated state set');
        } else {
          console.log('⚠️ [AUTH] Component unmounted during session check');
        }
      } catch (error) {
        console.error('❌ [AUTH] Error initializing auth:', error);
        if (mounted) {
          console.log('🔄 [AUTH] Setting error state due to initialization error');
          setState(prev => ({ 
            ...prev, 
            user: null,
            session: null,
            profile: null,
            loading: false,
            error: { message: 'Failed to initialize authentication', details: error }
          }));
          console.log('✅ [AUTH] Error state set due to initialization error');
        }
      }
    }

    console.log('🚀 [AUTH] Starting initial session check...');
    getInitialSession().then(() => {
      console.log('🏁 [AUTH] getInitialSession completed');
    }).catch((error) => {
      console.error('💥 [AUTH] getInitialSession threw an error:', error);
    });

    // Listen for auth changes
    console.log('👂 [AUTH] Setting up auth state change listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) {
          console.log('⚠️ [AUTH] Component unmounted, ignoring auth state change');
          return;
        }

        console.log('🔄 [AUTH] Auth state change event received:', {
          event,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          hasSession: !!session,
          mounted
        });

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ [AUTH] SIGNED_IN event - starting profile fetch process');
            setState(prev => {
              console.log('🔄 [AUTH] Setting loading state for SIGNED_IN');
              return { ...prev, loading: true };
            });
            
            console.log('📋 [AUTH] Fetching profile for SIGNED_IN user:', session.user.id);
            let profile = await fetchUserProfile(session.user.id);
            
            // If no profile exists, create one
            if (!profile) {
              console.log('📝 [AUTH] Creating new profile for SIGNED_IN user');
              profile = await createUserProfile(session.user);
            }
            
            console.log('✅ [AUTH] SIGNED_IN complete - updating state', {
              userId: session.user.id,
              hasProfile: !!profile,
              mounted
            });
            
            if (mounted) {
              setState({
                user: session.user as AuthUser,
                session: session as AuthSession,
                profile,
                loading: false,
                error: null,
              });
              console.log('✅ [AUTH] SIGNED_IN state update complete');
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('🚪 [AUTH] SIGNED_OUT event - clearing state');
            setState({
              user: null,
              session: null,
              profile: null,
              loading: false,
              error: null,
            });
            
            // Clear any cached data
            localStorage.removeItem('supabase.auth.remember');
            
            // Redirect to home if on protected route
            if (window.location.pathname.includes('/profile')) {
              console.log('🔄 [AUTH] Redirecting from protected route to home');
              window.location.href = '/';
            }
            console.log('✅ [AUTH] SIGNED_OUT state update complete');
          } else if (event === 'TOKEN_REFRESHED' && session) {
            console.log('🔄 [AUTH] TOKEN_REFRESHED event');
            setState(prev => ({
              ...prev,
              session: session as AuthSession,
              user: session.user as AuthUser,
              error: null,
            }));
            console.log('✅ [AUTH] TOKEN_REFRESHED state update complete');
          } else if (event === 'USER_UPDATED' && session) {
            console.log('👤 [AUTH] USER_UPDATED event');
            setState(prev => ({
              ...prev,
              user: session.user as AuthUser,
              session: session as AuthSession,
            }));
            console.log('✅ [AUTH] USER_UPDATED state update complete');
          } else {
            console.log('ℹ️ [AUTH] Unhandled auth event:', event);
          }
        } catch (error) {
          console.error('❌ [AUTH] Error handling auth state change:', error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: { message: 'Authentication error occurred', details: error }
          }));
        }
      }
    );
    console.log('✅ [AUTH] Auth state change listener set up');

    return () => {
      console.log('🧹 [AUTH] Cleaning up auth provider');
      mounted = false;
      subscription.unsubscribe();
      console.log('✅ [AUTH] Auth provider cleanup complete');
    };
  }, []);

  // Fetch user profile
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('📋 [PROFILE] Starting fetchUserProfile for user:', userId);
      console.log('📋 [PROFILE] About to call supabase.from(profiles).select...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle() to handle no results gracefully

      console.log('📋 [PROFILE] Supabase query completed');

      if (error) {
        console.error('❌ [PROFILE] Error fetching profile:', error);
        console.log('📋 [PROFILE] fetchUserProfile returning null due to error');
        return null;
      }

      if (data) {
        console.log('✅ [PROFILE] Profile fetched successfully:', {
          id: data.id,
          email: data.email,
          fullName: data.full_name
        });
        console.log('📋 [PROFILE] fetchUserProfile returning profile data');
        return data;
      } else {
        console.log('ℹ️ [PROFILE] No profile found (expected for new users)');
        console.log('📋 [PROFILE] fetchUserProfile returning null (no data)');
        return null;
      }
    } catch (error) {
      console.error('❌ [PROFILE] Unexpected error fetching profile:', error);
      console.log('📋 [PROFILE] fetchUserProfile returning null due to exception');
      return null;
    }
  };

  // Create user profile
  const createUserProfile = async (user: any): Promise<UserProfile | null> => {
    try {
      console.log('📝 [PROFILE] Starting createUserProfile for user:', {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      });
      
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || null,
        address: null,
      };

      console.log('📝 [PROFILE] Profile data to insert:', profileData);
      console.log('📝 [PROFILE] About to call supabase.from(profiles).insert...');

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      console.log('📝 [PROFILE] Supabase insert completed');

      if (error) {
        console.error('❌ [PROFILE] Error creating profile:', error);
        
        // Check if the error is due to the profile already existing
        if (error.code === '23505') { // Unique constraint violation
          console.log('ℹ️ [PROFILE] Profile already exists, fetching it...');
          const existingProfile = await fetchUserProfile(user.id);
          console.log('📝 [PROFILE] createUserProfile returning existing profile');
          return existingProfile;
        }
        
        // For other errors, we can still continue with auth
        console.log('⚠️ [PROFILE] Continuing without profile record');
        console.log('📝 [PROFILE] createUserProfile returning null due to error');
        return null;
      }

      console.log('✅ [PROFILE] Profile created successfully:', data);
      console.log('📝 [PROFILE] createUserProfile returning new profile data');
      return data;
    } catch (error) {
      console.error('❌ [PROFILE] Unexpected error creating profile:', error);
      console.log('📝 [PROFILE] createUserProfile returning null due to exception');
      return null;
    }
  };

  // Clear error state
  const clearError = () => {
    console.log('🧹 [AUTH] Clearing error state');
    setState(prev => ({ ...prev, error: null }));
  };

  // Sign in with email and password
  const signIn = async (credentials: LoginCredentials): Promise<{ error: AuthError | null }> => {
    const identifier = credentials.email;
    
    console.log('🔐 [SIGNIN] Starting sign in process for:', credentials.email);
    
    if (!loginRateLimiter.isAllowed(identifier)) {
      const remainingTime = Math.ceil(loginRateLimiter.getRemainingTime(identifier) / 1000 / 60);
      console.log('⏰ [SIGNIN] Rate limit exceeded for:', identifier);
      return {
        error: {
          message: `Too many login attempts. Please try again in ${remainingTime} minutes.`,
          code: 'rate_limit_exceeded'
        }
      };
    }

    try {
      console.log('📤 [SIGNIN] Sending sign in request to Supabase...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error('❌ [SIGNIN] Sign in error:', error);
        return {
          error: {
            message: error.message,
            code: error.message.toLowerCase().includes('invalid') ? 'invalid_credentials' : 'auth_error'
          }
        };
      }

      console.log('✅ [SIGNIN] Sign in successful for user:', {
        userId: data.user?.id,
        email: data.user?.email
      });

      // Handle remember me functionality
      if (credentials.rememberMe) {
        console.log('💾 [SIGNIN] Setting remember me flag');
        localStorage.setItem('supabase.auth.remember', 'true');
      } else {
        localStorage.removeItem('supabase.auth.remember');
      }

      // The auth state change listener will handle the rest
      console.log('⏳ [SIGNIN] Waiting for auth state change to complete...');
      return { error: null };
    } catch (error) {
      console.error('❌ [SIGNIN] Unexpected sign in error:', error);
      return {
        error: {
          message: 'An unexpected error occurred during sign in',
          details: error
        }
      };
    }
  };

  // Sign up with email and password
  const signUp = async (credentials: RegisterCredentials): Promise<{ error: AuthError | null }> => {
    const identifier = credentials.email;
    
    console.log('📝 [SIGNUP] Starting sign up process for:', credentials.email);
    
    if (!registerRateLimiter.isAllowed(identifier)) {
      const remainingTime = Math.ceil(registerRateLimiter.getRemainingTime(identifier) / 1000 / 60);
      console.log('⏰ [SIGNUP] Rate limit exceeded for:', identifier);
      return {
        error: {
          message: `Too many registration attempts. Please try again in ${remainingTime} minutes.`,
          code: 'rate_limit_exceeded'
        }
      };
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('📤 [SIGNUP] Sending sign up request to Supabase...');
      
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            username: credentials.username,
            full_name: credentials.fullName || '',
          },
          emailRedirectTo: undefined // Disable email confirmation redirect to prevent navigation errors
        }
      });

      setState(prev => ({ ...prev, loading: false }));

      if (error) {
        console.error('❌ [SIGNUP] Sign up error:', error);
        return {
          error: {
            message: error.message,
            code: error.message.toLowerCase().includes('already') ? 'user_exists' : 'auth_error'
          }
        };
      }

      console.log('✅ [SIGNUP] Sign up successful:', {
        userId: data.user?.id,
        email: data.user?.email,
        needsConfirmation: !data.session
      });

      return { error: null };
    } catch (error) {
      console.error('❌ [SIGNUP] Unexpected sign up error:', error);
      setState(prev => ({ ...prev, loading: false }));
      return {
        error: {
          message: 'An unexpected error occurred during sign up',
          details: error
        }
      };
    }
  };

  // Sign out
  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      console.log('🚪 [SIGNOUT] Starting sign out process...');
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ [SIGNOUT] Sign out error:', error);
        setState(prev => ({ ...prev, loading: false }));
        return {
          error: {
            message: error.message,
            code: 'signout_error'
          }
        };
      }

      console.log('✅ [SIGNOUT] Sign out successful');
      
      // Clear remember me setting and any cached data
      localStorage.removeItem('supabase.auth.remember');
      
      // State will be updated by auth state change listener
      return { error: null };
    } catch (error) {
      console.error('❌ [SIGNOUT] Unexpected sign out error:', error);
      setState(prev => ({ ...prev, loading: false }));
      return {
        error: {
          message: 'An unexpected error occurred during sign out',
          details: error
        }
      };
    }
  };

  // Sign in with Google - Disabled in WebContainer to prevent navigation errors
  const signInWithGoogle = async (): Promise<{ error: AuthError | null }> => {
    console.log('⚠️ [OAUTH] Google sign in attempted but disabled');
    return {
      error: {
        message: 'Social login is not available in this environment. Please use email and password.',
        code: 'oauth_disabled'
      }
    };
  };

  // Sign in with GitHub - Disabled in WebContainer to prevent navigation errors
  const signInWithGitHub = async (): Promise<{ error: AuthError | null }> => {
    console.log('⚠️ [OAUTH] GitHub sign in attempted but disabled');
    return {
      error: {
        message: 'Social login is not available in this environment. Please use email and password.',
        code: 'oauth_disabled'
      }
    };
  };

  // Reset password
  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    console.log('🔑 [RESET] Starting password reset for:', email);
    
    if (!passwordResetRateLimiter.isAllowed(email)) {
      const remainingTime = Math.ceil(passwordResetRateLimiter.getRemainingTime(email) / 1000 / 60);
      console.log('⏰ [RESET] Rate limit exceeded for:', email);
      return {
        error: {
          message: `Too many password reset attempts. Please try again in ${remainingTime} minutes.`,
          code: 'rate_limit_exceeded'
        }
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: undefined // Disable redirect to prevent navigation errors
      });

      if (error) {
        console.error('❌ [RESET] Password reset error:', error);
        return {
          error: {
            message: error.message,
            code: 'password_reset_error'
          }
        };
      }

      console.log('✅ [RESET] Password reset email sent successfully');
      return { error: null };
    } catch (error) {
      console.error('❌ [RESET] Unexpected password reset error:', error);
      return {
        error: {
          message: 'An unexpected error occurred during password reset',
          details: error
        }
      };
    }
  };

  // Update user profile
  const updateProfile = async (data: UpdateProfileData): Promise<{ error: AuthError | null }> => {
    if (!state.user) {
      console.log('❌ [PROFILE] Update attempted without authenticated user');
      return {
        error: {
          message: 'User not authenticated',
          code: 'not_authenticated'
        }
      };
    }

    try {
      console.log('📝 [PROFILE] Updating profile for user:', state.user.id);
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', state.user.id);

      if (error) {
        console.error('❌ [PROFILE] Profile update error:', error);
        return {
          error: {
            message: error.message,
            code: 'profile_update_error'
          }
        };
      }

      // Refresh profile data
      console.log('🔄 [PROFILE] Refreshing profile data after update');
      const updatedProfile = await fetchUserProfile(state.user.id);
      setState(prev => ({ ...prev, profile: updatedProfile }));

      console.log('✅ [PROFILE] Profile updated successfully');
      return { error: null };
    } catch (error) {
      console.error('❌ [PROFILE] Unexpected profile update error:', error);
      return {
        error: {
          message: 'An unexpected error occurred during profile update',
          details: error
        }
      };
    }
  };

  // Change password
  const changePassword = async (data: ChangePasswordData): Promise<{ error: AuthError | null }> => {
    if (!state.user) {
      console.log('❌ [PASSWORD] Change attempted without authenticated user');
      return {
        error: {
          message: 'User not authenticated',
          code: 'not_authenticated'
        }
      };
    }

    try {
      console.log('🔑 [PASSWORD] Changing password for user:', state.user.id);
      
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) {
        console.error('❌ [PASSWORD] Password change error:', error);
        return {
          error: {
            message: error.message,
            code: 'password_change_error'
          }
        };
      }

      console.log('✅ [PASSWORD] Password changed successfully');
      return { error: null };
    } catch (error) {
      console.error('❌ [PASSWORD] Unexpected password change error:', error);
      return {
        error: {
          message: 'An unexpected error occurred during password change',
          details: error
        }
      };
    }
  };

  // Delete account
  const deleteAccount = async (): Promise<{ error: AuthError | null }> => {
    if (!state.user) {
      console.log('❌ [DELETE] Delete attempted without authenticated user');
      return {
        error: {
          message: 'User not authenticated',
          code: 'not_authenticated'
        }
      };
    }

    try {
      console.log('🗑️ [DELETE] Account deletion requested for user:', state.user.id);
      
      // Note: Supabase doesn't have a direct delete user method for client-side
      // This would typically be handled by an admin function or edge function
      // For now, we'll sign out the user and they can contact support
      await signOut();
      
      console.log('ℹ️ [DELETE] User signed out, admin approval required for deletion');
      return {
        error: {
          message: 'Account deletion requires admin approval. Please contact support.',
          code: 'deletion_requires_admin'
        }
      };
    } catch (error) {
      console.error('❌ [DELETE] Unexpected account deletion error:', error);
      return {
        error: {
          message: 'An unexpected error occurred during account deletion',
          details: error
        }
      };
    }
  };

  // Refresh session
  const refreshSession = async (): Promise<{ error: AuthError | null }> => {
    try {
      console.log('🔄 [SESSION] Refreshing session...');
      
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('❌ [SESSION] Session refresh error:', error);
        return {
          error: {
            message: error.message,
            code: 'session_refresh_error'
          }
        };
      }

      console.log('✅ [SESSION] Session refreshed successfully');
      return { error: null };
    } catch (error) {
      console.error('❌ [SESSION] Unexpected session refresh error:', error);
      return {
        error: {
          message: 'An unexpected error occurred during session refresh',
          details: error
        }
      };
    }
  };

  // Resend confirmation email
  const resendConfirmation = async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      console.log('📧 [CONFIRM] Resending confirmation email to:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: undefined // Disable redirect to prevent navigation errors
        }
      });

      if (error) {
        console.error('❌ [CONFIRM] Resend confirmation error:', error);
        return {
          error: {
            message: error.message,
            code: 'resend_error'
          }
        };
      }

      console.log('✅ [CONFIRM] Confirmation email resent successfully');
      return { error: null };
    } catch (error) {
      console.error('❌ [CONFIRM] Unexpected resend confirmation error:', error);
      return {
        error: {
          message: 'An unexpected error occurred while resending confirmation',
          details: error
        }
      };
    }
  };

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 [STATE] Auth state updated:', {
      hasUser: !!state.user,
      userEmail: state.user?.email,
      userId: state.user?.id,
      loading: state.loading,
      hasProfile: !!state.profile,
      profileEmail: state.profile?.email,
      isAuthenticated: !!state.user,
      hasError: !!state.error,
      errorMessage: state.error?.message
    });
  }, [state.user, state.loading, state.profile, state.error]);

  const value: AuthContextType = {
    user: state.user,
    session: state.session,
    loading: state.loading,
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

  console.log('🎯 [AUTH] AuthProvider rendering with value:', {
    hasUser: !!value.user,
    loading: value.loading,
    isAuthenticated: value.isAuthenticated,
    hasProfile: !!value.profile
  });

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