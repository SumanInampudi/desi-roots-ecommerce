import React, { useState } from 'react';
import { Check, X, AlertTriangle, Clock, CreditCard, DollarSign, Truck } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import type { AdminOrder } from '../../types/admin';

interface PaymentStatusManagerProps {
  order: AdminOrder;
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
}

const PaymentStatusManager: React.FC<PaymentStatusManagerProps> = ({ order, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { updatePaymentStatus } = useAdmin();

  const paymentStatusOptions = [
    { 
      value: 'pending', 
      label: 'Pending', 
      icon: Clock, 
      color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      description: 'Payment is awaiting processing'
    },
    { 
      value: 'completed', 
      label: 'Completed', 
      icon: Check, 
      color: 'bg-green-100 text-green-800 hover:bg-green-200',
      description: 'Payment has been successfully received'
    },
    { 
      value: 'cod_pending', 
      label: 'COD Pending', 
      icon: Truck, 
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      description: 'Cash on delivery - payment pending at delivery'
    },
    { 
      value: 'failed', 
      label: 'Failed', 
      icon: X, 
      color: 'bg-red-100 text-red-800 hover:bg-red-200',
      description: 'Payment processing failed'
    }
  ];

  const getPaymentStatusInfo = (status: string) => {
    const statusOption = paymentStatusOptions.find(option => option.value === status);
    return statusOption || paymentStatusOptions[0];
  };

  const isValidPaymentTransition = (currentStatus: string, newStatus: string): boolean => {
    // Define valid payment status transitions
    const validTransitions: Record<string, string[]> = {
      'pending': ['completed', 'failed', 'cod_pending'],
      'cod_pending': ['completed', 'failed'],
      'completed': [], // Final state - no transitions allowed
      'failed': ['pending', 'cod_pending'] // Allow retry
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === order.payment_status) {
      return; // No change needed
    }

    // Validate status transition
    if (!isValidPaymentTransition(order.payment_status, newStatus)) {
      setError(`Cannot change payment status from ${order.payment_status} to ${newStatus}`);
      return;
    }

    setShowConfirmation(newStatus);
  };

  const confirmStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      setError(null);

      console.log('💳 [PAYMENT-STATUS] Updating payment status:', {
        orderId: order.id,
        oldStatus: order.payment_status,
        newStatus
      });

      // Update the payment status
      await updatePaymentStatus({ orderId: order.id, status: newStatus });

      // Call the callback if provided
      onStatusUpdate?.(order.id, newStatus);

      setShowConfirmation(null);
      
      // Show success message briefly
      setTimeout(() => {
        setError(null);
      }, 3000);

    } catch (err) {
      console.error('❌ [PAYMENT-STATUS] Update error:', err);
      setError('Failed to update payment status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentStatusInfo = () => {
    return getPaymentStatusInfo(order.payment_status);
  };

  const currentStatusInfo = getCurrentStatusInfo();

  return (
    <div className="space-y-4">
      {/* Current Payment Status Display */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Current Payment Status:</span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatusInfo.color}`}>
          <currentStatusInfo.icon className="w-4 h-4 mr-1" />
          {currentStatusInfo.label}
        </span>
      </div>

      {/* Payment Method Info */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-sm">
          <CreditCard className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-700">Payment Method:</span>
          <span className="text-gray-900 capitalize">{order.payment_method.replace('_', ' ')}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm mt-1">
          <DollarSign className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-700">Amount:</span>
          <span className="text-gray-900">₹{order.total_amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Payment Status Action Buttons */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Update Payment Status:</h4>
        <div className="grid grid-cols-2 gap-2">
          {paymentStatusOptions.map((status) => {
            const Icon = status.icon;
            const isCurrentStatus = status.value === order.payment_status;
            const isValidTransition = isValidPaymentTransition(order.payment_status, status.value);
            const isDisabled = isCurrentStatus || (!isValidTransition && !isCurrentStatus);

            return (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                disabled={isDisabled || isUpdating}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isCurrentStatus 
                    ? `${status.color} cursor-default ring-2 ring-offset-1 ring-blue-500` 
                    : isDisabled 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : `${status.color} cursor-pointer transform hover:scale-105 shadow-sm hover:shadow-md`
                  }
                  disabled:opacity-50 disabled:transform-none
                `}
                title={isCurrentStatus ? 'Current status' : isDisabled ? 'Invalid transition' : status.description}
              >
                <Icon className="w-4 h-4" />
                <span>{status.label}</span>
                {isCurrentStatus && <Check className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Status Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Payment Status Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Pending:</strong> Initial status for all payments</li>
          <li>• <strong>COD Pending:</strong> For cash on delivery orders</li>
          <li>• <strong>Completed:</strong> Payment successfully received</li>
          <li>• <strong>Failed:</strong> Payment processing failed</li>
        </ul>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Payment Status Change</h3>
                <p className="text-sm text-gray-600">Order #{order.order_number}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to change the payment status from{' '}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${currentStatusInfo.color}`}>
                  <currentStatusInfo.icon className="w-3 h-3 mr-1" />
                  {currentStatusInfo.label}
                </span>
                {' '}to{' '}
                {(() => {
                  const NewStatusIcon = getPaymentStatusInfo(showConfirmation).icon;
                  return (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusInfo(showConfirmation).color}`}>
                      <NewStatusIcon className="w-3 h-3 mr-1" />
                      {getPaymentStatusInfo(showConfirmation).label}
                    </span>
                  );
                })()}
                ?
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This action will be logged and may affect order processing and customer notifications.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => confirmStatusChange(showConfirmation)}
                disabled={isUpdating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowConfirmation(null)}
                disabled={isUpdating}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatusManager;