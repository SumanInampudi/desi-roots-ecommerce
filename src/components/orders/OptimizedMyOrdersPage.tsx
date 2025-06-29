import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Calendar, 
  Package, 
  Eye, 
  Search,
  Filter,
  Clock,
  Truck,
  CheckCircle,
  X,
  AlertTriangle,
  MessageCircle,
  Download,
  Activity,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useOptimizedOrders } from '../../hooks/useOptimizedOrders';
import { OrderService } from '../../services/orderService';
import OrderDetailsModal from './OrderDetailsModal';
import type { UserOrder } from '../../types/order';

const OptimizedMyOrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const { 
    orders, 
    loading, 
    error, 
    hasMore, 
    totalCount,
    loadOrders,
    loadMoreOrders,
    refreshOrders,
    performanceMetrics
  } = useOptimizedOrders();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  // Filter orders based on search and status (client-side filtering for search)
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
                         order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

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

  const getStatusIcon = (status: string) => {
    const statusInfo = OrderService.getStatusInfo(status);
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

  const getStatusColor = (status: string) => {
    const statusInfo = OrderService.getStatusInfo(status);
    return `${statusInfo.bgColor} ${statusInfo.color}`;
  };

  const handleOrderClick = (order: UserOrder) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleWhatsAppSupport = (order: UserOrder) => {
    const message = `Hi! I need help with my order ${order.order_number}. Could you please provide an update on the status?`;
    const whatsappUrl = `https://wa.me/918179715455?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadMoreOrders();
    }
  };

  const handleRefresh = () => {
    refreshOrders();
  };

  const handleFilterChange = (newFilter: string) => {
    setFilterStatus(newFilter);
    // Reload orders with new filter - this will replace existing orders
    loadOrders({
      forceRefresh: true,
      replace: true, // Ensure we replace existing orders
      filters: newFilter !== 'all' ? { status: newFilter } : undefined
    });
  };

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <ShoppingBag className="w-8 h-8 text-red-600" />
                <span>My Orders</span>
              </h1>
              <p className="text-gray-600 mt-1">
                {totalCount} {totalCount === 1 ? 'order' : 'orders'} found
                {filteredOrders.length !== orders.length && ` (${filteredOrders.length} shown after search)`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Performance Metrics Toggle */}
            {performanceMetrics && (
              <button
                onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors duration-200"
              >
                <Activity className="w-4 h-4" />
                <span>Performance</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showPerformanceMetrics ? 'rotate-180' : ''}`} />
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Performance Metrics Panel */}
        {showPerformanceMetrics && performanceMetrics && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {performanceMetrics.current.pageLoadTime.toFixed(0)}ms
                </div>
                <div className="text-sm text-gray-600">Page Load Time</div>
                <div className="text-xs text-gray-500">
                  Target: {performanceMetrics.target.pageLoadTime}ms
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {performanceMetrics.current.dbQueryTime.toFixed(0)}ms
                </div>
                <div className="text-sm text-gray-600">DB Query Time</div>
                <div className="text-xs text-gray-500">
                  Target: {performanceMetrics.target.dbQueryTime}ms
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(performanceMetrics.current.cacheHitRate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Cache Hit Rate</div>
                <div className="text-xs text-gray-500">
                  Target: {(performanceMetrics.target.cacheHitRate * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  performanceMetrics.status === 'excellent' ? 'text-green-600' :
                  performanceMetrics.status === 'good' ? 'text-blue-600' :
                  performanceMetrics.status === 'needs_improvement' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {performanceMetrics.status.replace('_', ' ').toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">Overall Status</div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {orders.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your order history here!
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search orders by number or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Results count */}
              {(searchTerm || filterStatus !== 'all') && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    {searchTerm && `Searching for "${searchTerm}" • `}
                    {filterStatus !== 'all' && `Filtered by ${filterStatus} • `}
                    Showing {filteredOrders.length} of {orders.length} loaded orders
                  </p>
                </div>
              )}
            </div>

            {/* Orders List */}
            {loading && orders.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your orders...</p>
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? `No orders match your search for "${searchTerm}". Try adjusting your search terms.`
                    : filterStatus !== 'all' 
                      ? `No ${filterStatus} orders found. Try selecting a different status filter.`
                      : 'No orders match your criteria.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      {/* Order Header */}
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order.order_number}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(order.created_at)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Package className="w-4 h-4" />
                                <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(order.total_amount)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {order.payment_method.toUpperCase()}
                            </div>
                          </div>
                          
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                            {getStatusIcon(order.order_status)}
                            <span>{order.order_status}</span>
                          </span>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-sm font-medium text-gray-900">{item.name}</span>
                              <span className="text-xs text-gray-600">×{item.quantity}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                              +{order.items.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleOrderClick(order)}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>

                        <button
                          onClick={() => handleWhatsAppSupport(order)}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Get Support</span>
                        </button>

                        {order.order_status === 'delivered' && (
                          <button
                            onClick={() => {/* Handle reorder */}}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Reorder</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Load More Button */}
                {hasMore && filterStatus === 'all' && (
                  <div className="text-center py-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Load More Orders</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default OptimizedMyOrdersPage;