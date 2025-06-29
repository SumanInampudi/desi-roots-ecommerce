import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, User, Phone, Mail, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useOrder } from '../../hooks/useOrder';
import PaymentMethods from './PaymentMethods';
import OrderSummary from './OrderSummary';
import OrderConfirmationModal from '../order/OrderConfirmationModal';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().min(6, 'Valid pincode is required'),
    landmark: z.string().optional()
  })
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutPageProps {
  onBack: () => void;
  onPaymentSuccess: (orderId: string) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onPaymentSuccess }) => {
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('qr');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  
  const { items, summary } = useCart();
  const { user, profile } = useAuth();
  const { processOrder, loading: orderLoading, lastOrderResult, clearLastOrder } = useOrder();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || {
        street: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
      }
    }
  });

  // Pre-fill form with user data
  useEffect(() => {
    if (profile) {
      setValue('fullName', profile.full_name || '');
      setValue('phone', profile.phone || '');
      if (profile.address) {
        setValue('address', profile.address);
      }
    }
    if (user?.email) {
      setValue('email', user.email);
    }
  }, [profile, user, setValue]);

  // Handle order result
  useEffect(() => {
    if (lastOrderResult) {
      setShowConfirmationModal(true);
      if (lastOrderResult.success && lastOrderResult.orderId) {
        onPaymentSuccess(lastOrderResult.orderId);
      }
    }
  }, [lastOrderResult, onPaymentSuccess]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (step === 'details') {
      setStep('payment');
      return;
    }

    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    try {
      console.log('🛒 [CHECKOUT] Processing order...');
      
      // Process the order with comprehensive handling
      await processOrder(data, selectedPaymentMethod);
      
    } catch (error) {
      console.error('❌ [CHECKOUT] Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleModalClose = () => {
    setShowConfirmationModal(false);
    clearLastOrder();
    
    // If order was successful, go back to home
    if (lastOrderResult?.success) {
      onBack();
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
          <button
            onClick={onBack}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const isProcessing = orderLoading || isSubmitting;

  return (
    <>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={step === 'payment' ? () => setStep('details') : onBack}
            disabled={isProcessing}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">
              Step {step === 'details' ? '1' : '2'} of 2: {step === 'details' ? 'Delivery Details' : 'Payment & Order'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {step === 'details' && (
                <>
                  {/* Personal Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <User className="w-5 h-5 text-gray-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          {...register('fullName')}
                          type="text"
                          disabled={isProcessing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                          placeholder="Enter your full name"
                        />
                        {errors.fullName && (
                          <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            {...register('phone')}
                            type="tel"
                            disabled={isProcessing}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                            placeholder="Enter your phone number"
                          />
                        </div>
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            {...register('email')}
                            type="email"
                            disabled={isProcessing}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                            placeholder="Enter your email address"
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address *
                        </label>
                        <input
                          {...register('address.street')}
                          type="text"
                          disabled={isProcessing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                          placeholder="House/Flat number, Street name"
                        />
                        {errors.address?.street && (
                          <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Landmark (Optional)
                        </label>
                        <input
                          {...register('address.landmark')}
                          type="text"
                          disabled={isProcessing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                          placeholder="Near landmark"
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          <input
                            {...register('address.city')}
                            type="text"
                            disabled={isProcessing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                            placeholder="City"
                          />
                          {errors.address?.city && (
                            <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State *
                          </label>
                          <input
                            {...register('address.state')}
                            type="text"
                            disabled={isProcessing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                            placeholder="State"
                          />
                          {errors.address?.state && (
                            <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pincode *
                          </label>
                          <input
                            {...register('address.pincode')}
                            type="text"
                            disabled={isProcessing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                            placeholder="Pincode"
                          />
                          {errors.address?.pincode && (
                            <p className="mt-1 text-sm text-red-600">{errors.address.pincode.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === 'payment' && (
                <PaymentMethods
                  selectedMethod={selectedPaymentMethod}
                  onMethodSelect={setSelectedPaymentMethod}
                  amount={summary.total}
                />
              )}

              {/* Continue Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {step === 'details' ? (
                      <span>Continue to Payment</span>
                    ) : (
                      <span>Place Order</span>
                    )}
                  </>
                )}
              </button>

              {/* Order Processing Info */}
              {step === 'payment' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-green-900 mb-1">Complete Order Processing</h4>
                      <p className="text-sm text-green-800">
                        When you place your order, we will:
                      </p>
                      <ul className="text-sm text-green-800 mt-2 space-y-1">
                        <li>• Generate your order confirmation with tracking number</li>
                        <li>• Send detailed order summary to sinampudi.suman@gmail.com</li>
                        <li>• Automatically send order details to WhatsApp for immediate processing</li>
                        <li>• Provide you with order confirmation and tracking information</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary items={items} summary={summary} />
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {lastOrderResult && (
        <OrderConfirmationModal
          isOpen={showConfirmationModal}
          onClose={handleModalClose}
          result={lastOrderResult}
        />
      )}
    </>
  );
};

export default CheckoutPage;