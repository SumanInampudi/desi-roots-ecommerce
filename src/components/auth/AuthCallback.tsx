import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const { refreshSession } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        await refreshSession();
        // Redirect to intended page or home
        window.location.href = '/';
      } catch (error) {
        console.error('Auth callback error:', error);
        // Redirect to login with error
        window.location.href = '/?auth=error';
      }
    };

    handleAuthCallback();
  }, [refreshSession]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin h-8 w-8 text-red-600 mx-auto mb-4" />
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;