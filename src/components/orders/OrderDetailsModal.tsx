import React from 'react';
import { 
  X, 
  Calendar, 
  Package, 
  MapPin, 
  CreditCard, 
  Truck,
  MessageCircle,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { OrderService } from '../../services/orderService';
import type { UserOrder } from '../../types/order';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: UserOrder;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'processing':
        return <Package className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <X className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusInfo = OrderService.getStatusInfo(status);
    return `${statusInfo.bgColor} ${statusInfo.color}`;
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cod_pending':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleWhatsAppSupport = () => {
    const message = `Hi! I need help with my order ${order.order_number}. Could you please provide an update on the status?`;
    const whatsappUrl = `https://wa.me/918179715455?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownloadInvoice = () => {
    // In a real implementation, this would generate and download a PDF invoice
    alert('Invoice download feature would be implemented here');
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <p className="text-gray-600">Order #{order.order_number}</p>
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
          <div className="p-6 space-y-8">
            {/* Order Status and Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                  <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${getStatusColor(order.order_status)}`}>
                    {getStatusIcon(order.order_status)}
                    <span className="capitalize">{order.order_status}</span>
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                    {order.payment_status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <CreditCard className="w-4 h-4" />
                    <span className="capitalize">{order.payment_method.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Delivery Address</span>
              </h3>
              <div className="text-gray-700">
                <p>{order.shipping_address.street}</p>
                {order.shipping_address.landmark && (
                  <p>Near: {order.shipping_address.landmark}</p>
                )}
                <p>{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}</p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Order Items</span>
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weight
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.weight}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({order.items.length} items):</span>
                  <span className="font-medium">{formatCurrency(order.total_amount - order.delivery_fee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-medium">
                    {order.delivery_fee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatCurrency(order.delivery_fee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-3">
                  <span>Total Amount:</span>
                  <span className="text-red-600">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleWhatsAppSupport}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contact Support</span>
              </button>

              <button
                onClick={handleDownloadInvoice}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Download className="w-5 h-5" />
                <span>Download Invoice</span>
              </button>

              {order.order_status === 'delivered' && (
                <button
                  onClick={() => {/* Handle reorder */}}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <Package className="w-5 h-5" />
                  <span>Reorder Items</span>
                </button>
              )}
            </div>

            {/* Order Timeline (if available) */}
            {order.order_status !== 'pending' && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order Placed</p>
                      <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  {order.order_status !== 'pending' && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order Processing</p>
                        <p className="text-sm text-gray-600">Your order is being prepared</p>
                      </div>
                    </div>
                  )}

                  {['shipped', 'delivered'].includes(order.order_status) && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Truck className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order Shipped</p>
                        <p className="text-sm text-gray-600">Your order is on the way</p>
                      </div>
                    </div>
                  )}

                  {order.order_status === 'delivered' && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order Delivered</p>
                        <p className="text-sm text-gray-600">Your order has been delivered successfully</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsModal;