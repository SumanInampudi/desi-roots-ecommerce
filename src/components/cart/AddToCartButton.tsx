import React, { useState } from 'react';
import { ShoppingCart, Check, Loader2, Plus } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import type { Product } from '../../types/cart';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onSuccess?: () => void;
  onAuthRequired?: () => void;
  showIcon?: boolean;
  showText?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  quantity = 1,
  variant = 'icon',
  size = 'md',
  className = '',
  onSuccess,
  onAuthRequired,
  showIcon = true,
  showText = false
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { addToCart, loading } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    try {
      setIsAdding(true);
      await addToCart(product, quantity);
      
      setJustAdded(true);
      onSuccess?.();
      
      // Reset the "just added" state after 2 seconds
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const isLoading = isAdding || loading;

  // Size configurations for the minimalist icon button
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',   // 32px - perfect for mobile tapping
    md: 'w-10 h-10 p-2',   // 40px - comfortable desktop size
    lg: 'w-12 h-12 p-2.5'  // 48px - large touch target
  };

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6', 
    lg: 'w-7 h-7'
  };

  // State-based styling
  const getButtonClasses = () => {
    const baseClasses = `
      ${sizeClasses[size]}
      rounded-full
      font-semibold
      transition-all
      duration-300
      ease-out
      flex
      items-center
      justify-center
      focus:outline-none
      focus:ring-2
      focus:ring-offset-2
      focus:ring-red-500
      transform
      hover:scale-110
      active:scale-95
      disabled:opacity-50
      disabled:cursor-not-allowed
      disabled:transform-none
      relative
      overflow-hidden
      group
      shadow-lg
      hover:shadow-xl
    `;

    if (justAdded) {
      return `${baseClasses} bg-green-600 hover:bg-green-700 text-white border-2 border-green-600 animate-pulse`;
    }

    if (variant === 'icon') {
      return `${baseClasses} bg-red-600 hover:bg-red-700 text-white border-2 border-red-600`;
    }

    // Fallback for other variants
    return `${baseClasses} bg-red-600 hover:bg-red-700 text-white border-2 border-red-600`;
  };

  // Icon selection based on state
  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />;
    }
    
    if (justAdded) {
      return <Check className={`${iconSizeClasses[size]} animate-bounce`} />;
    }
    
    return <ShoppingCart className={`${iconSizeClasses[size]} group-hover:animate-pulse`} />;
  };

  // Accessibility label
  const getAriaLabel = () => {
    if (isLoading) return `Adding ${product.name} to cart...`;
    if (justAdded) return `${product.name} added to cart successfully`;
    return `Add ${product.name} to cart`;
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className={`${getButtonClasses()} ${className}`}
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
      type="button"
    >
      {/* Ripple effect background */}
      <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out opacity-0 group-hover:opacity-100" />
      
      {/* Icon */}
      <div className="relative z-10">
        {getIcon()}
      </div>

      {/* Success indicator ring */}
      {justAdded && (
        <div className="absolute inset-0 border-2 border-green-300 rounded-full animate-ping" />
      )}

      {/* Loading indicator ring */}
      {isLoading && (
        <div className="absolute inset-0 border-2 border-red-300 rounded-full animate-pulse" />
      )}
    </button>
  );
};

export default AddToCartButton;