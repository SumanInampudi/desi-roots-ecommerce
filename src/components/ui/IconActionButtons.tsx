import React, { useState } from 'react';
import { ShoppingCart, MessageCircle, Check, Loader2 } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import type { Product } from '../../types/cart';

interface IconActionButtonsProps {
  product: Product;
  quantity?: number;
  onAuthRequired?: () => void;
  onAddToCartSuccess?: (productName: string, quantity: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const IconActionButtons: React.FC<IconActionButtonsProps> = ({
  product,
  quantity = 1,
  onAuthRequired,
  onAddToCartSuccess,
  className = '',
  size = 'md'
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
      onAddToCartSuccess?.(product.name, quantity);
      
      // Reset the "just added" state after 2 seconds
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWhatsAppOrder = () => {
    const message = `Hi! I'd like to order ${product.name} (${product.weight}). Could you please provide me with more details about pricing and availability?`;
    const whatsappUrl = `https://wa.me/918179715455?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const isLoading = isAdding || loading;

  // Size configurations
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const baseButtonClasses = `
    ${sizeClasses[size]}
    rounded-full font-medium transition-all duration-200
    flex items-center justify-center
    focus:outline-none focus:ring-2 focus:ring-offset-1
    transform hover:scale-110 active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    shadow-lg hover:shadow-xl border-2
  `;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Add to Cart Icon Button */}
      <button
        onClick={handleAddToCart}
        disabled={isLoading}
        className={`
          ${baseButtonClasses}
          ${justAdded 
            ? 'bg-green-600 hover:bg-green-700 text-white border-green-600 focus:ring-green-500' 
            : 'bg-red-600 hover:bg-red-700 text-white border-red-600 focus:ring-red-500'
          }
        `}
        aria-label={`Add ${product.name} to cart`}
        title={`Add ${product.name} to cart`}
      >
        {isLoading ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : justAdded ? (
          <Check className={`${iconSizes[size]} animate-bounce`} />
        ) : (
          <ShoppingCart className={`${iconSizes[size]}`} />
        )}
      </button>

      {/* WhatsApp Order Icon Button */}
      <button
        onClick={handleWhatsAppOrder}
        className={`
          ${baseButtonClasses}
          bg-green-600 hover:bg-green-700 text-white border-green-600 focus:ring-green-500
        `}
        aria-label={`Order ${product.name} via WhatsApp`}
        title={`Order ${product.name} via WhatsApp`}
      >
        <MessageCircle className={`${iconSizes[size]}`} />
      </button>
    </div>
  );
};

export default IconActionButtons;