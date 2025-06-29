import React, { useState } from 'react';
import { ShoppingCart, MessageCircle, Check, Loader2 } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import type { Product } from '../../types/cart';

interface CompactActionButtonsProps {
  product: Product;
  quantity?: number;
  onAuthRequired?: () => void;
  onAddToCartSuccess?: (productName: string, quantity: number) => void;
  className?: string;
}

const CompactActionButtons: React.FC<CompactActionButtonsProps> = ({
  product,
  quantity = 1,
  onAuthRequired,
  onAddToCartSuccess,
  className = ''
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

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Order via WhatsApp Button - Now First */}
      <button
        onClick={handleWhatsAppOrder}
        className="
          flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm
          bg-green-600 hover:bg-green-700 text-white border border-green-600
          transition-all duration-200 transform hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500
          shadow-md hover:shadow-lg
        "
        aria-label={`Order ${product.name} via WhatsApp`}
        title={`Order ${product.name} via WhatsApp`}
      >
        <MessageCircle className="w-4 h-4" />
        <span className="whitespace-nowrap">Order via WhatsApp</span>
      </button>

      {/* Add to Cart Button - Now Second */}
      <button
        onClick={handleAddToCart}
        disabled={isLoading}
        className={`
          flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm
          transition-all duration-200 transform hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${justAdded 
            ? 'bg-green-600 hover:bg-green-700 text-white border border-green-600' 
            : 'bg-red-600 hover:bg-red-700 text-white border border-red-600'
          }
          shadow-md hover:shadow-lg
        `}
        aria-label={`Add ${product.name} to cart`}
        title={`Add ${product.name} to cart`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : justAdded ? (
          <Check className="w-4 h-4" />
        ) : (
          <ShoppingCart className="w-4 h-4" />
        )}
        <span className="whitespace-nowrap">
          {isLoading ? 'Adding...' : justAdded ? 'Added!' : 'Add to Cart'}
        </span>
      </button>
    </div>
  );
};

export default CompactActionButtons;