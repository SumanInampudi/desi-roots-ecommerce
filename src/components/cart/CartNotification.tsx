import React, { useEffect, useState } from 'react';
import { CheckCircle, ShoppingCart, X } from 'lucide-react';

interface CartNotificationProps {
  show: boolean;
  productName: string;
  quantity: number;
  onClose: () => void;
  duration?: number;
}

const CartNotification: React.FC<CartNotificationProps> = ({
  show,
  productName,
  quantity,
  onClose,
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show && !isVisible) return null;

  return (
    <div className={`
      fixed top-20 right-4 z-50 
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-2xl p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <ShoppingCart className="w-4 h-4 text-gray-600" />
              <p className="text-sm font-semibold text-gray-900">Added to Cart</p>
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">{quantity}x {productName}</span> added successfully
            </p>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-green-600 h-1 rounded-full transition-all duration-300 ease-linear"
            style={{
              width: isVisible ? '0%' : '100%',
              transition: `width ${duration}ms linear`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CartNotification;