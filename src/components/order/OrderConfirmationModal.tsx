import React from 'react';
import { CheckCircle, AlertTriangle, Mail, MessageCircle, Copy, X, ExternalLink } from 'lucide-react';
import type { OrderProcessingResult } from '../../types/order';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: OrderProcessingResult;
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  const [copiedOrderId, setCopiedOrderId] = React.useState(false);

  if (!isOpen) return null;

  const copyOrderId = async () => {
    if (result.orderId) {
      try {
        await navigator.clipboard.writeText(result.orderId);
        setCopiedOrderId(true);
        setTimeout(() => setCopiedOrderId(false), 2000);
      } catch (error) {
        console.error('Failed to copy order ID:', error);
      }
    }
  };

  const openWhatsApp = () => {
    const message = `Hi! I just placed an order (ID: ${result.orderId}) and wanted to confirm the details. Could you please help me track my order status?`;
    const whatsappUrl = `https://wa.me/918179715455?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className={`p-6 rounded-t-2xl ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {result.success ? (
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                )}
                <div>
                  <h2 className={`text-xl font-bold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                    {result.success ? 'Order Placed Successfully!' : 'Order Processing Issue'}
                  </h2>
                  {result.orderId && (
                    <p className="text-sm text-gray-600">Order ID: {result.orderId}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Message */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                {result.message}
              </p>
            </div>

            {/* Order ID */}
            {result.orderId && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Order ID</p>
                    <p className="text-lg font-mono font-bold text-gray-900">{result.orderId}</p>
                  </div>
                  <button
                    onClick={copyOrderId}
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors duration-200"
                  >
                    {copiedOrderId ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Status Indicators */}
            {result.success && (
              <div className="mb-6 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${result.emailSent ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm text-gray-700">
                    Email confirmation {result.emailSent ? 'sent' : 'pending'}
                  </span>
                  {result.emailSent && <Mail className="w-4 h-4 text-green-500" />}
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${result.whatsappSent ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm text-gray-700">
                    WhatsApp notification {result.whatsappSent ? 'sent' : 'pending'}
                  </span>
                  {result.whatsappSent && <MessageCircle className="w-4 h-4 text-green-500" />}
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors && result.errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-medium text-red-900 mb-2">Issues encountered:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            {result.success && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">What's Next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• We'll verify your payment and confirm your order</li>
                  <li>• You'll receive tracking updates via SMS and email</li>
                  <li>• Your order will be delivered within 2-3 business days</li>
                  <li>• Contact us if you have any questions</li>
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {result.success && (
                <button
                  onClick={openWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Track Order on WhatsApp</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={onClose}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 ${
                  result.success
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {result.success ? 'Continue Shopping' : 'Try Again'}
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-2">Need help with your order?</p>
              <div className="flex justify-center space-x-4 text-xs">
                <a
                  href="https://wa.me/918179715455"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 flex items-center space-x-1"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="mailto:orders@desiroots.com"
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <Mail className="w-3 h-3" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmationModal;