import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  title?: string;
  'aria-label'?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onClick,
  variant = 'primary',
  size = 'sm',
  disabled = false,
  loading = false,
  className = '',
  title,
  'aria-label': ariaLabel,
  ...props
}) => {
  // Size configurations
  const sizeClasses = {
    xs: 'w-6 h-6 p-1',      // 24px diameter
    sm: 'w-8 h-8 p-1.5',   // 32px diameter (requested)
    md: 'w-10 h-10 p-2'    // 40px diameter
  };

  const iconSizes = {
    xs: 'w-4 h-4',         // 16px icon
    sm: 'w-5 h-5',         // 20px icon
    md: 'w-6 h-6'          // 24px icon
  };

  // Variant configurations
  const variantClasses = {
    primary: 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 hover:border-gray-400',
    success: 'bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 shadow-md hover:shadow-lg',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 shadow-md hover:shadow-lg',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-800 border-transparent hover:border-gray-300'
  };

  const baseClasses = `
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    rounded-full
    border
    font-medium
    transition-all
    duration-200
    flex
    items-center
    justify-center
    focus:outline-none
    focus:ring-2
    focus:ring-offset-1
    focus:ring-red-500
    transform
    hover:scale-110
    active:scale-95
    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:transform-none
    ${className}
  `;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
      title={title}
      aria-label={ariaLabel || title}
      {...props}
    >
      {loading ? (
        <div className={`${iconSizes[size]} animate-spin rounded-full border-2 border-current border-t-transparent`} />
      ) : (
        <Icon className={`${iconSizes[size]} flex-shrink-0`} />
      )}
    </button>
  );
};

export default IconButton;