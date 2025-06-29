import React, { useState } from 'react';
import { QrCode, Truck, CreditCard } from 'lucide-react';
import { usePayment } from '../../hooks/usePayment';
import UPIPayment from './UPIPayment';

interface PaymentMethodsProps {
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
  amount: number;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  selectedMethod,
  onMethodSelect,
  amount
}) => {
  const { upiProviders } = usePayment();

  // Payment methods including COD
  const paymentMethods = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when your order is delivered to your doorstep',
      icon: <Truck className="w-6 h-6" />,
      popular: true,
      note: 'No advance payment required'
    },
    {
      id: 'qr',
      name: 'QR Code Payment',
      description: 'Scan QR code with any UPI app (Google Pay, PhonePe, Paytm, etc.)',
      icon: <QrCode className="w-6 h-6" />,
      popular: false,
      note: 'Instant payment verification'
    }
  ];

  // Auto-select COD method if none selected
  React.useEffect(() => {
    if (!selectedMethod) {
      onMethodSelect('cod');
    }
  }, [selectedMethod, onMethodSelect]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Method</h2>
      
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div key={method.id}>
            <label
              className={`
                flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200
                ${selectedMethod === method.id
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) => onMethodSelect(e.target.value)}
                className="sr-only"
              />
              
              <div className="flex items-center space-x-4 flex-1">
                <div className={`
                  p-2 rounded-lg
                  ${selectedMethod === method.id ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}
                `}>
                  {method.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{method.name}</h3>
                    {method.popular && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{method.description}</p>
                  {method.note && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">{method.note}</p>
                  )}
                </div>
              </div>
              
              <div className={`
                w-4 h-4 border-2 rounded-full flex items-center justify-center
                ${selectedMethod === method.id 
                  ? 'border-red-500 bg-red-500' 
                  : 'border-gray-300'
                }
              `}>
                {selectedMethod === method.id && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </label>

            {/* COD Payment Details */}
            {selectedMethod === method.id && method.id === 'cod' && (
              <div className="mt-4 ml-4 pl-4 border-l-2 border-red-200">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Truck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-green-900 mb-2">Cash on Delivery Details</h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Pay ₹{amount.toFixed(2)} when your order is delivered</li>
                        <li>• No advance payment required</li>
                        <li>• Delivery within 2-3 business days</li>
                        <li>• Please keep exact change ready</li>
                        <li>• COD available for orders up to ₹5,000</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* COD Terms */}
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-amber-900">Important Notes</h4>
                      <p className="text-sm text-amber-800 mt-1">
                        Please ensure someone is available at the delivery address to receive the order and make payment. 
                        Orders may be returned if delivery cannot be completed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* QR Payment Details */}
            {selectedMethod === method.id && method.id === 'qr' && (
              <div className="mt-4 ml-4 pl-4 border-l-2 border-red-200">
                <UPIPayment
                  amount={amount}
                  paymentMethod={method.id}
                  providers={upiProviders}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Security Notice for Online Payments */}
      {selectedMethod === 'qr' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900">Secure Online Payment</h4>
              <p className="text-sm text-blue-700">
                Your payment is processed securely through UPI. We never store your payment details. Simply scan the QR code with any UPI app to complete your payment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* COD Availability Notice */}
      {selectedMethod === 'cod' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Truck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-900">COD Service Available</h4>
              <p className="text-sm text-green-700">
                Cash on Delivery is available for all locations we serve. Your order will be confirmed via WhatsApp, 
                and our delivery partner will contact you before delivery.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Supported UPI Apps - only show for QR payment */}
      {selectedMethod === 'qr' && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Supported UPI Apps</h4>
          <div className="flex flex-wrap gap-2">
            {upiProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center space-x-1 px-2 py-1 bg-white border border-gray-200 rounded-md text-xs"
              >
                <span>{provider.icon}</span>
                <span className="text-gray-700">{provider.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;