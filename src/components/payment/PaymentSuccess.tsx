import React, { useEffect, useState } from 'react';
import { CheckCircle, Download, ArrowRight, Package, Clock } from 'lucide-react';
import { usePayment } from '../../hooks/usePayment';

interface PaymentSuccessProps {
  orderId: string;
  onContinueShopping: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ orderId, onContinueShopping }) => {
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const { verifyPayment, currentTransaction } = usePayment();

  useEffect(() => {
    // Simulate order details
    setOrderDetails({
      orderId,
      amount: currentTransaction?.amount || 0,
      status: 'confirmed',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      trackingNumber: `TRK${Date.now().toString().slice(-8)}`
    });
  }, [orderId, currentTransaction]);

  const downloadInvoice = () => {
    // In a real app, this would generate and download a PDF invoice
    alert('Invoice download feature would be implemented here');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      {/* Success Message */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Payment Successful!
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Thank you for your order. Your payment has been processed successfully.
      </p>

      {/* Order Details */}
      {orderDetails && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium text-gray-900">{orderDetails.orderId}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-medium text-gray-900">₹{orderDetails.amount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Package className="w-3 h-3 mr-1" />
                {orderDetails.status}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Tracking Number:</span>
              <span className="font-medium text-gray-900">{orderDetails.trackingNumber}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Delivery:</span>
              <span className="font-medium text-gray-900 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {orderDetails.estimatedDelivery}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={downloadInvoice}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Invoice</span>
        </button>
        
        <button
          onClick={onContinueShopping}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">What's Next?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• You'll receive an order confirmation email shortly</li>
          <li>• We'll send you tracking updates via SMS and email</li>
          <li>• Your order will be delivered within 2-3 business days</li>
          <li>• Contact us if you have any questions about your order</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentSuccess;