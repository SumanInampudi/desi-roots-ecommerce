import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

interface CartIconProps {
  onClick: () => void;
  className?: string;
  variant?: 'header' | 'floating' | 'compact';
}

const CartIcon: React.FC<CartIconProps> = ({ 
  onClick, 
  className = '',
  variant = 'header'
}) => {
  const { summary } = useCart();

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'relative p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1';
      case 'floating':
        return 'fixed bottom-6 right-6 z-50 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-300';
      case 'header':
      default:
        return 'relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1';
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'compact':
        return 'w-5 h-5';
      case 'floating':
        return 'w-7 h-7';
      case 'header':
      default:
        return 'w-6 h-6';
    }
  };

  const getBadgeClasses = () => {
    const baseClasses = 'absolute text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse border-2 border-white';
    
    switch (variant) {
      case 'compact':
        return `${baseClasses} -top-1 -right-1 bg-red-600 ${summary.itemCount > 99 ? 'w-6 h-4 text-xs' : 'w-4 h-4'}`;
      case 'floating':
        return `${baseClasses} -top-1 -right-1 bg-orange-500 ${summary.itemCount > 99 ? 'w-7 h-5 text-xs' : 'w-5 h-5'}`;
      case 'header':
      default:
        return `${baseClasses} -top-1 -right-1 bg-red-600 ${summary.itemCount > 99 ? 'w-7 h-5 text-xs' : 'w-5 h-5'}`;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`${getVariantClasses()} ${className}`}
      title="Shopping Cart"
      aria-label={`Shopping cart with ${summary.itemCount} items`}
    >
      <div className="relative flex items-center justify-center">
        <ShoppingBag className={`${getIconSize()} ${variant === 'floating' ? 'text-white' : 'text-gray-700'}`} />
        
        {summary.itemCount > 0 && (
          <div className={getBadgeClasses()}>
            {summary.itemCount > 99 ? '99+' : summary.itemCount}
          </div>
        )}
      </div>
      
      {variant === 'floating' && summary.itemCount > 0 && (
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
        </div>
      )}
    </button>
  );
};

export default CartIcon;