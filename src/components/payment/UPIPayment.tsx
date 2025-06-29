import React, { useState, useEffect } from 'react';
import { Copy, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import { usePayment } from '../../hooks/usePayment';
import type { UPIProvider } from '../../types/payment';

interface UPIPaymentProps {
  amount: number;
  paymentMethod: string;
  providers: UPIProvider[];
}

const UPIPayment: React.FC<UPIPaymentProps> = ({ amount, paymentMethod, providers }) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { generateUPILink, generateQRCode } = usePayment();

  const merchantUPI = 'merchant@upi'; // Replace with actual merchant UPI ID

  useEffect(() => {
    if (paymentMethod === 'qr') {
      generateQRCodeForPayment();
    }
  }, [paymentMethod, amount]);

  const generateQRCodeForPayment = async () => {
    try {
      const upiLink = generateUPILink({
        orderId: `ORD_${Date.now()}`,
        amount,
        currency: 'INR',
        description: 'Desi Roots Order Payment',
        customerInfo: {
          name: '',
          email: '',
          phone: ''
        },
        paymentMethod: 'qr'
      });

      const qrCodeDataUrl = await generateQRCode(upiLink);
      setQrCode(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const copyUPIId = async () => {
    try {
      await navigator.clipboard.writeText(merchantUPI);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy UPI ID:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-gray-900">Scan QR Code to Pay</h3>
      
      {/* QR Code Display */}
      <div className="text-center">
        {qrCode ? (
          <div className="inline-block p-6 bg-white border-2 border-gray-200 rounded-xl shadow-lg">
            <img src={qrCode} alt="UPI QR Code" className="w-56 h-56 mx-auto" />
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Amount to Pay</p>
              <p className="text-2xl font-bold text-green-600">₹{amount}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Generating QR code...</p>
          </div>
        )}
      </div>

      {/* Payment Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">How to pay using QR code:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open any UPI app (Google Pay, PhonePe, Paytm, BHIM, etc.)</li>
              <li>Tap on "Scan QR" or "Pay" option</li>
              <li>Scan the QR code above using your phone camera</li>
              <li>Verify the amount (₹{amount}) and merchant details</li>
              <li>Enter your UPI PIN to complete the payment</li>
              <li>Take a screenshot of the payment confirmation</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Manual UPI ID Option */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-900 mb-3">Alternative: Pay using UPI ID</h4>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Pay to UPI ID:</p>
              <p className="text-lg font-mono text-gray-800 bg-white px-3 py-2 rounded border mt-1">
                {merchantUPI}
              </p>
              <p className="text-sm text-gray-600 mt-1">Amount: ₹{amount}</p>
            </div>
            <button
              onClick={copyUPIId}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors duration-200"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy UPI ID</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Supported Apps */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-3">Supported UPI Apps</h4>
        <div className="grid grid-cols-2 gap-3">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center space-x-2 p-2 bg-white border border-green-200 rounded-lg"
            >
              <span className="text-lg">{provider.icon}</span>
              <span className="text-sm font-medium text-gray-800">{provider.name}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-green-700 mt-2">
          * Any UPI-enabled app can be used to scan the QR code
        </p>
      </div>

      {/* Important Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Important:</p>
            <p>After completing the payment, please take a screenshot of the payment confirmation and keep it for your records. Our team will verify the payment and confirm your order via WhatsApp.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UPIPayment;