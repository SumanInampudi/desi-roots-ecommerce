import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Settings, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import CartIcon from './cart/CartIcon';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './auth/AuthModal';

interface HeaderProps {
  activeSection: string;
  onNavClick: (section: string) => void;
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onNavClick, onCartClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { user, signOut, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('🎯 [HEADER] Auth state changed:', {
      hasUser: !!user,
      userEmail: user?.email,
      userId: user?.id,
      loading,
      isAuthenticated,
      timestamp: new Date().toISOString()
    });
  }, [user, loading, isAuthenticated]);

  // Debug logging for component renders
  useEffect(() => {
    console.log('🎯 [HEADER] Component rendered/re-rendered');
  });

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'products', label: 'Products' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact Us' }
  ];

  const handleAuthClick = () => {
    console.log('🔐 [HEADER] Auth button clicked');
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    console.log('🚪 [HEADER] User clicked logout button');
    setShowUserMenu(false);
    
    try {
      const { error } = await signOut();
      if (error) {
        console.error('❌ [HEADER] Logout error:', error);
        alert('Failed to logout. Please try again.');
      } else {
        console.log('✅ [HEADER] Logout successful, redirecting to home');
        navigate('/');
      }
    } catch (error) {
      console.error('❌ [HEADER] Unexpected logout error:', error);
      alert('An unexpected error occurred during logout.');
    }
  };

  const handleProfileSettings = () => {
    console.log('⚙️ [HEADER] Profile settings clicked');
    setShowUserMenu(false);
    navigate('/profile');
  };

  const handleAuthModalClose = () => {
    console.log('❌ [HEADER] Auth modal closed');
    setIsAuthModalOpen(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        console.log('👆 [HEADER] Click outside detected, closing user menu');
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  console.log('🎯 [HEADER] Rendering with state:', {
    loading,
    isAuthenticated,
    hasUser: !!user,
    userEmail: user?.email,
    showUserMenu,
    isAuthModalOpen
  });

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Logo size="md" />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavClick(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'text-red-800 bg-red-50'
                      : 'text-gray-700 hover:text-red-800 hover:bg-red-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right Side - Cart and Auth */}
            <div className="flex items-center space-x-3">
              {/* Cart Icon */}
              <CartIcon onClick={onCartClick} variant="header" />

              {/* Auth Section */}
              <div className="flex items-center">
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="hidden md:block w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <span className="text-xs text-gray-500 hidden lg:block">Loading...</span>
                  </div>
                ) : isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('👤 [HEADER] User menu button clicked');
                        setShowUserMenu(!showUserMenu);
                      }}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    >
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 hidden md:block max-w-24 truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                      </span>
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                      <>
                        {/* Backdrop for mobile */}
                        <div 
                          className="fixed inset-0 z-10 md:hidden" 
                          onClick={() => setShowUserMenu(false)}
                        />
                        
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.user_metadata?.full_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                          
                          <button
                            onClick={handleProfileSettings}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors duration-200"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Account Settings</span>
                          </button>
                          
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors duration-200 border-t border-gray-100"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleAuthClick}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    title="Sign In"
                  >
                    <LogIn className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-md text-gray-700 hover:text-red-800 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavClick(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      activeSection === item.id
                        ? 'text-red-800 bg-red-50'
                        : 'text-gray-700 hover:text-red-800 hover:bg-red-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                
                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-gray-200">
                  {isAuthenticated && user ? (
                    <div className="space-y-2">
                      <div className="px-3 py-2 text-sm text-gray-600 border-b border-gray-100 pb-3">
                        <p className="font-medium text-gray-900">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          handleProfileSettings();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                      >
                        <Settings className="w-5 h-5" />
                        <span>Account Settings</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        handleAuthClick();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-base font-medium bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors duration-200"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        initialMode="login"
      />
    </>
  );
};

export default Header;