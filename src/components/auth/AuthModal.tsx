import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

type AuthMode = 'login' | 'register' | 'forgot-password';

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const { user, loading } = useAuth();

  // Close modal when user successfully signs in
  useEffect(() => {
    if (user && !loading) {
      console.log('✅ [AUTH-MODAL] User authenticated, closing modal');
      onClose();
    }
  }, [user, loading, onClose]);

  // Reset mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleToggleForm = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const handleForgotPassword = () => {
    setMode('forgot-password');
  };

  const handleBackToLogin = () => {
    setMode('login');
  };

  const handleClose = () => {
    setMode('login'); // Reset to login mode
    onClose();
  };

  const handleFormSuccess = () => {
    console.log('📝 [AUTH-MODAL] Form success callback triggered');
    // Don't close immediately - let the auth state change handle it
  };

  console.log('🎯 [AUTH-MODAL] Render state:', {
    isOpen,
    mode,
    hasUser: !!user,
    loading
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform transition-all">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute -top-4 -right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Form Content */}
          {mode === 'login' && (
            <LoginForm 
              onToggleForm={handleToggleForm}
              onForgotPassword={handleForgotPassword}
              onSuccess={handleFormSuccess}
            />
          )}
          
          {mode === 'register' && (
            <RegisterForm 
              onToggleForm={handleToggleForm}
              onSuccess={handleFormSuccess}
            />
          )}
          
          {mode === 'forgot-password' && (
            <ForgotPasswordForm 
              onBack={handleBackToLogin}
              onSuccess={handleFormSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;