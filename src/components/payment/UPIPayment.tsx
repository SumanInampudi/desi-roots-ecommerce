import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import { usePayment } from '../../hooks/usePayment';
import type { UPIProvider } from '../../types/payment';

interface UPIPaymentProps {
  amount: number;
  paymentMethod: string;
  providers: UPIProvider[];
}

const UPIPayment: React.FC<UPIPaymentProps> = ({ amount, paymentMethod, providers }) => {
  const [upiId, setUpiId] = useState('');
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

  const handleProviderClick = (provider: UPIProvider) => {
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
      paymentMethod: provider.id
    });

    // Try to open the UPI app
    window.open(upiLink, '_blank');
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

  if (paymentMethod === 'qr') {
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Scan QR Code to Pay</h3>
        
        {qrCode ? (
          <div className="text-center">
            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
              <img src={qrCode} alt="UPI QR Code" className="w-48 h-48" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Scan this QR code with any UPI app to pay ₹{amount}
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Generating QR code...</p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">How to pay:</p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                <li>Scan the QR code above</li>
                <li>Verify the amount and merchant details</li>
                <li>Complete the payment</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Choose UPI App</h3>
      
      {/* UPI Apps */}
      <div className="grid grid-cols-2 gap-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleProviderClick(provider)}
            className={`
              ${provider.color} text-white p-3 rounded-lg font-medium text-sm
              hover:opacity-90 transition-opacity duration-200
              flex items-center justify-center space-x-2
            `}
          >
            <span className="text-lg">{provider.icon}</span>
            <span>{provider.name}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Manual UPI ID Entry */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-2">Or enter UPI ID manually</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Pay to:</p>
                <p className="text-sm text-gray-600">{merchantUPI}</p>
              </div>
              <button
                onClick={copyUPIId}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
              >
                {copied ? (
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
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Payment Instructions:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Click on your preferred UPI app above</li>
              <li>Or manually enter your UPI ID and pay to our merchant UPI</li>
              <li>Amount: ₹{amount}</li>
              <li>Complete the payment in your UPI app</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UPIPayment;