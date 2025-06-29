import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Calendar,
  DollarSign,
  Package,
  Truck,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { OrderService } from '../../services/orderService';
import AdminLayout from './AdminLayout';
import OrderStatusManager from './OrderStatusManager';
import PaymentStatusManager from './PaymentStatusManager';
import type { AdminOrder } from '../../types/admin';

const OrderManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showStatusManager, setShowStatusManager] = useState<string | null>(null);
  const [showPaymentManager, setShowPaymentManager] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'order' | 'payment'>('order');
  
  const { orders, loadOrders, updateOrderStatus, updatePaymentStatus, exportOrders, loading, error } = useAdmin();

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.order_status === filterStatus;
    const matchesPayment = filterPayment === 'all' || order.payment_status === filterPayment;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    await updateOrderStatus({ orderId, status: newStatus });
    setShowStatusManager(null);
    
    // Update selected order if it's currently being viewed
    if (selectedOrder && selectedOrder.id === orderId) {
      const updatedOrder = orders.find(o => o.id === orderId);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
  };

  const handlePaymentStatusUpdate = async (orderId: string, newStatus: string) => {
    await updatePaymentStatus({ orderId, status: newStatus });
    setShowPaymentManager(null);
    
    // Update selected order if it's currently being viewed
    if (selectedOrder && selectedOrder.id === orderId) {
      const updatedOrder = orders.find(o => o.id === orderId);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">Manage and track customer orders</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => exportOrders('csv')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => exportOrders('json')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by order number, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Statuses</option>
                  {orderStatuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cod_pending">COD Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.order_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.payment_method.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                          {getStatusIcon(order.order_status)}
                          <span>{order.order_status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(order.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                            title="View order details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setShowStatusManager(order.id);
                              setActiveTab('order');
                            }}
                            className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors duration-200"
                            title="Update order status"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setShowPaymentManager(order.id);
                              setActiveTab('payment');
                            }}
                            className="p-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors duration-200"
                            title="Update payment status"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' || filterPayment !== 'all'
                  ? 'No orders match your search criteria' 
                  : 'No orders found'
                }
              </p>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowOrderModal(false)} />
              
              <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order Details - {selectedOrder.order_number}
                    </h3>
                    <button
                      onClick={() => setShowOrderModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Order Number</label>
                      <p className="text-sm text-gray-900">{selectedOrder.order_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Order Date</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Order Status</label>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.order_status)}`}>
                        {getStatusIcon(selectedOrder.order_status)}
                        <span>{selectedOrder.order_status}</span>
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                        {selectedOrder.payment_status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="text-sm text-gray-900">{selectedOrder.customer_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-sm text-gray-900">{selectedOrder.customer_email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-sm text-gray-900">{selectedOrder.customer_phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Shipping Address</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-900">
                        {selectedOrder.shipping_address.street}<br />
                        {selectedOrder.shipping_address.landmark && `Near: ${selectedOrder.shipping_address.landmark}`}<br />
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Order Items</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedOrder.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{item.weight}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{formatCurrency(item.price)}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(selectedOrder.total_amount - selectedOrder.delivery_fee)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivery Fee:</span>
                        <span>{selectedOrder.delivery_fee === 0 ? 'FREE' : formatCurrency(selectedOrder.delivery_fee)}</span>
                      </div>
                      <div className="flex justify-between text-base font-semibold border-t border-gray-300 pt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedOrder.total_amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Management Tabs */}
                  <div>
                    <div className="border-b border-gray-200 mb-4">
                      <nav className="-mb-px flex space-x-8">
                        <button
                          onClick={() => setActiveTab('order')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'order'
                              ? 'border-red-500 text-red-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Order Status
                        </button>
                        <button
                          onClick={() => setActiveTab('payment')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'payment'
                              ? 'border-red-500 text-red-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Payment Status
                        </button>
                      </nav>
                    </div>

                    {activeTab === 'order' && (
                      <OrderStatusManager 
                        order={selectedOrder} 
                        onStatusUpdate={handleOrderStatusUpdate}
                      />
                    )}

                    {activeTab === 'payment' && (
                      <PaymentStatusManager 
                        order={selectedOrder} 
                        onStatusUpdate={handlePaymentStatusUpdate}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Status Manager Modal */}
        {showStatusManager && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowStatusManager(null)} />
              
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Update Order Status</h3>
                  <button
                    onClick={() => setShowStatusManager(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {showStatusManager && (
                  <OrderStatusManager 
                    order={orders.find(o => o.id === showStatusManager)!} 
                    onStatusUpdate={handleOrderStatusUpdate}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Status Manager Modal */}
        {showPaymentManager && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowPaymentManager(null)} />
              
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Update Payment Status</h3>
                  <button
                    onClick={() => setShowPaymentManager(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {showPaymentManager && (
                  <PaymentStatusManager 
                    order={orders.find(o => o.id === showPaymentManager)!} 
                    onStatusUpdate={handlePaymentStatusUpdate}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderManagement;