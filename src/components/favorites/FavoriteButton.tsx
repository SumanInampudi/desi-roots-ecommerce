import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';
import type { Product } from '../../types/cart';

interface FavoriteButtonProps {
  product: Product;
  onAuthRequired?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  product,
  onAuthRequired,
  className = '',
  size = 'md',
  showTooltip = true
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { isFavorite, toggleFavorite, loading } = useFavorites();
  const { isAuthenticated } = useAuth();

  // Don't render for non-authenticated users
  if (!isAuthenticated) {
    return null;
  }

  const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
  const favorited = isFavorite(productId);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    try {
      setIsAnimating(true);
      await toggleFavorite(product);
      
      // Keep animation for a bit longer for visual feedback
      setTimeout(() => setIsAnimating(false), 300);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setIsAnimating(false);
    }
  };

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

  const isProcessing = loading || isAnimating;

  return (
    <div className="relative group">
      <button
        onClick={handleToggleFavorite}
        disabled={isProcessing}
        className={`
          ${sizeClasses[size]}
          rounded-full
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
          ${favorited 
            ? 'bg-red-100 hover:bg-red-200 text-red-600 border-2 border-red-300' 
            : 'bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 border-2 border-gray-200 hover:border-red-300'
          }
          backdrop-blur-sm
          shadow-lg
          hover:shadow-xl
          ${className}
        `}
        aria-label={favorited ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
        title={favorited ? `Remove from favorites` : `Add to favorites`}
      >
        {isProcessing ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : (
          <Heart 
            className={`
              ${iconSizes[size]} 
              transition-all 
              duration-200
              ${favorited ? 'fill-current scale-110' : 'hover:scale-110'}
              ${isAnimating ? 'animate-pulse scale-125' : ''}
            `} 
          />
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {favorited ? 'Remove from favorites' : 'Add to favorites'}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}

      {/* Success animation */}
      {isAnimating && favorited && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
        </div>
      )}
    </div>
  );
};

export default FavoriteButton;