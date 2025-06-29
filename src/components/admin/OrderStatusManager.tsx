import React, { useState } from 'react';
import { Check, X, AlertTriangle, Clock, Truck, Package, CheckCircle } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { OrderService } from '../../services/orderService';
import type { AdminOrder } from '../../types/admin';

interface OrderStatusManagerProps {
  order: AdminOrder;
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
}

const OrderStatusManager: React.FC<OrderStatusManagerProps> = ({ order, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { updateOrderStatus } = useAdmin();

  const statusOptions = [
    { 
      value: 'pending', 
      label: 'Pending', 
      icon: Clock, 
      color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      description: 'Order received, awaiting processing'
    },
    { 
      value: 'processing', 
      label: 'Processing', 
      icon: Package, 
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      description: 'Order is being prepared'
    },
    { 
      value: 'shipped', 
      label: 'Shipped', 
      icon: Truck, 
      color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      description: 'Order has been dispatched'
    },
    { 
      value: 'delivered', 
      label: 'Delivered', 
      icon: CheckCircle, 
      color: 'bg-green-100 text-green-800 hover:bg-green-200',
      description: 'Order successfully delivered'
    },
    { 
      value: 'cancelled', 
      label: 'Cancelled', 
      icon: X, 
      color: 'bg-red-100 text-red-800 hover:bg-red-200',
      description: 'Order has been cancelled'
    }
  ];

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === order.order_status) {
      return; // No change needed
    }

    // Validate status transition
    if (!OrderService.isValidStatusTransition(order.order_status, newStatus)) {
      setError(`Cannot change status from ${order.order_status} to ${newStatus}`);
      return;
    }

    setShowConfirmation(newStatus);
  };

  const confirmStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Update the order status
      await updateOrderStatus({ orderId: order.id, status: newStatus });

      // Log the status change
      await OrderService.logStatusChange(
        order.id,
        order.order_status,
        newStatus,
        'admin', // In a real app, get from auth context
        'admin@desiroots.com'
      );

      // Call the callback if provided
      onStatusUpdate?.(order.id, newStatus);

      setShowConfirmation(null);
      
      // Show success message briefly
      setTimeout(() => {
        setError(null);
      }, 3000);

    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentStatusInfo = () => {
    return OrderService.getStatusInfo(order.order_status);
  };

  const currentStatusInfo = getCurrentStatusInfo();

  return (
    <div className="space-y-4">
      {/* Current Status Display */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Current Status:</span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatusInfo.bgColor} ${currentStatusInfo.color}`}>
          <span className="mr-1">{currentStatusInfo.icon}</span>
          {currentStatusInfo.label}
        </span>
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

      {/* Status Action Buttons */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Update Status:</h4>
        <div className="grid grid-cols-2 gap-2">
          {statusOptions.map((status) => {
            const Icon = status.icon;
            const isCurrentStatus = status.value === order.order_status;
            const isValidTransition = OrderService.isValidStatusTransition(order.order_status, status.value);
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

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Status Change</h3>
                <p className="text-sm text-gray-600">Order #{order.order_number}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to change the order status from{' '}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${currentStatusInfo.bgColor} ${currentStatusInfo.color}`}>
                  {currentStatusInfo.icon} {currentStatusInfo.label}
                </span>
                {' '}to{' '}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${OrderService.getStatusInfo(showConfirmation).bgColor} ${OrderService.getStatusInfo(showConfirmation).color}`}>
                  {OrderService.getStatusInfo(showConfirmation).icon} {OrderService.getStatusInfo(showConfirmation).label}
                </span>
                ?
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This action will be logged and may trigger notifications to the customer.
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

export default OrderStatusManager;