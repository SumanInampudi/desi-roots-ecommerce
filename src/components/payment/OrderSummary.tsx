import React from 'react';
import { Package, Truck, Tag } from 'lucide-react';
import type { CartItem, CartSummary } from '../../types/cart';

interface OrderSummaryProps {
  items: CartItem[];
  summary: CartSummary;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ items, summary }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
      <div className="flex items-center space-x-2 mb-4">
        <Package className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex space-x-3">
            <img
              src={item.image || '/placeholder-spice.jpg'}
              alt={item.product_name}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {item.product_name}
              </h4>
              <p className="text-xs text-gray-600">
                {item.weight} × {item.quantity}
              </p>
            </div>
            <div className="text-sm font-medium text-gray-900">
              ₹{(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({summary.itemCount} items)</span>
          <span className="font-medium">₹{summary.subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Truck className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Delivery Fee</span>
          </div>
          <span className="font-medium">
            {summary.deliveryFee === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              `₹${summary.deliveryFee.toFixed(2)}`
            )}
          </span>
        </div>

        {summary.subtotal < 500 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Tag className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                Add ₹{(500 - summary.subtotal).toFixed(2)} more for FREE delivery!
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between text-base font-semibold border-t border-gray-300 pt-3">
          <span>Total</span>
          <span>₹{summary.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Savings */}
      {summary.deliveryFee === 0 && summary.subtotal >= 500 && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-green-800">
              You saved ₹50 on delivery!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;