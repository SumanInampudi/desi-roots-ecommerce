import { User, Session } from '@supabase/supabase-js';

export interface AuthUser extends User {
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    username?: string;
  };
}

export interface AuthSession extends Session {
  user: AuthUser;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: any | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  profile: UserProfile | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  address?: any;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthError {
  message: string;
  code?: string;
  details?: any;
}