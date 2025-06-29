import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Trash2, 
  Save, 
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { profileUpdateSchema, changePasswordSchema } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import type { UpdateProfileData, ChangePasswordData } from '../../types/auth';

const ProfileSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'danger'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { user, profile, updateProfile, changePassword, deleteAccount, signOut } = useAuth();

  // Profile form
  const profileForm = useForm<UpdateProfileData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      address: profile?.address || null
    }
  });

  // Password form
  const passwordForm = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema)
  });

  // Update form values when profile data loads
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || null
      });
    }
  }, [profile, profileForm]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const onUpdateProfile = async (data: UpdateProfileData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      console.log('📝 [PROFILE] Updating profile with data:', data);

      const { error } = await updateProfile(data);
      
      if (error) {
        console.error('❌ [PROFILE] Update error:', error);
        setError(error.message);
      } else {
        console.log('✅ [PROFILE] Profile updated successfully');
        setSuccess('Profile updated successfully!');
      }
    } catch (err) {
      console.error('❌ [PROFILE] Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      console.log('🔑 [PASSWORD] Changing password');

      const { error } = await changePassword(data);
      
      if (error) {
        console.error('❌ [PASSWORD] Change error:', error);
        setError(error.message);
      } else {
        console.log('✅ [PASSWORD] Password changed successfully');
        setSuccess('Password changed successfully!');
        passwordForm.reset();
      }
    } catch (err) {
      console.error('❌ [PASSWORD] Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteAccount = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🗑️ [DELETE] Deleting account');

      const { error } = await deleteAccount();
      
      if (error) {
        console.error('❌ [DELETE] Delete error:', error);
        setError(error.message);
      }
    } catch (err) {
      console.error('❌ [DELETE] Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Account Settings</h1>
              <p className="text-white/80">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...profileForm.register('full_name')}
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                  </div>
                  {profileForm.formState.errors.full_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {profileForm.formState.errors.full_name.message}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...profileForm.register('phone')}
                      type="tel"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your phone number"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      {...profileForm.register('address')}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                      placeholder="Enter your address"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || profileForm.formState.isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading || profileForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
              <div className="max-w-md space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...passwordForm.register('currentPassword')}
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter current password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...passwordForm.register('newPassword')}
                      type={showNewPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter new password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...passwordForm.register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Confirm new password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || passwordForm.formState.isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading || passwordForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Changing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                      Delete Account
                    </h3>
                    <p className="text-red-700 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                      All your data, including orders and profile information, will be permanently deleted.
                    </p>
                    
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Account</span>
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-red-800 font-medium">
                          Are you absolutely sure? This action cannot be undone.
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={onDeleteAccount}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="animate-spin w-4 h-4" />
                                <span>Deleting...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                <span>Yes, Delete My Account</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isLoading}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;