import React, { useState } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
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
  variant = 'primary',
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

  // Size classes
  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm h-8',
    md: 'py-2.5 px-4 text-sm h-10',
    lg: 'py-3 px-6 text-base h-12'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Variant classes
  const getVariantClasses = () => {
    if (justAdded) {
      return 'bg-green-600 hover:bg-green-700 text-white border-green-600';
    }

    switch (variant) {
      case 'primary':
        return 'bg-red-600 hover:bg-red-700 text-white border-red-600';
      case 'secondary':
        return 'bg-white hover:bg-gray-50 text-gray-900 border-gray-300';
      case 'icon':
        return 'bg-red-600 hover:bg-red-700 text-white border-red-600 p-2';
      default:
        return 'bg-red-600 hover:bg-red-700 text-white border-red-600';
    }
  };

  const buttonClasses = `
    ${variant === 'icon' ? 'p-2' : sizeClasses[size]}
    ${getVariantClasses()}
    font-semibold rounded-lg transition-all duration-200 
    flex items-center justify-center space-x-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-105 active:scale-95
    border
    ${className}
  `;

  if (variant === 'icon') {
    return (
      <button
        onClick={handleAddToCart}
        disabled={isLoading}
        className={buttonClasses}
        title="Add to Cart"
      >
        {isLoading ? (
          <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />
        ) : justAdded ? (
          <Check className={iconSizeClasses[size]} />
        ) : (
          <ShoppingCart className={iconSizeClasses[size]} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className={buttonClasses}
    >
      {isLoading ? (
        <>
          <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />
          {showText && <span>Adding...</span>}
        </>
      ) : justAdded ? (
        <>
          <Check className={iconSizeClasses[size]} />
          {showText && <span>Added!</span>}
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart className={iconSizeClasses[size]} />}
          {showText && <span>Add to Cart</span>}
        </>
      )}
    </button>
  );
};

export default AddToCartButton;