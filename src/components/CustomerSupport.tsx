import React, { useState } from 'react';
import { MessageCircle, X, Headphones } from 'lucide-react';

const CustomerSupport: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleWhatsAppSupport = () => {
    const message = "Hi! I need help with your products and services. Could you please assist me?";
    const whatsappUrl = `https://wa.me/918179715455?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Main Support Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Expanded Card */}
        {isExpanded && (
          <div className="absolute bottom-16 right-0 mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Customer Support</h3>
                    <p className="text-green-100 text-sm">We're here to help!</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Quick Support</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Get instant help with orders, product information, and any questions you have.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Response Time</span>
                    <span className="text-sm text-green-600 font-semibold">Usually within 2-3 mins</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Available</span>
                    <span className="text-sm text-gray-600">24/7</span>
                  </div>
                </div>

                <button
                  onClick={handleWhatsAppSupport}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group shadow-lg hover:shadow-xl"
                >
                  <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
                  <span>Start WhatsApp Chat</span>
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Click to open WhatsApp and chat with our support team
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group transform hover:scale-110 relative overflow-hidden"
        >
          {/* Ripple effect */}
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-75"></div>
          
          {/* Icon */}
          <div className="relative z-10">
            {isExpanded ? (
              <X className="w-7 h-7 transition-transform duration-200" />
            ) : (
              <MessageCircle className="w-7 h-7 group-hover:animate-bounce transition-transform duration-200" />
            )}
          </div>

          {/* Online indicator */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
          </div>
        </button>

        {/* Tooltip for desktop */}
        <div className="absolute bottom-full right-0 mb-2 hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
            Need Help? Chat with us!
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerSupport;