import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { AdminUser, AdminOrder, AdminStats, OrderStatusUpdate, UserStatusUpdate, PaymentStatusUpdate } from '../types/admin';

interface AdminContextType {
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  users: AdminUser[];
  orders: AdminOrder[];
  stats: AdminStats | null;
  checkAdminStatus: () => Promise<boolean>;
  loadUsers: () => Promise<void>;
  loadOrders: () => Promise<void>;
  loadStats: () => Promise<void>;
  updateOrderStatus: (update: OrderStatusUpdate) => Promise<void>;
  updatePaymentStatus: (update: PaymentStatusUpdate) => Promise<void>;
  updateUserStatus: (update: UserStatusUpdate) => Promise<void>;
  exportOrders: (format: 'csv' | 'json') => void;
  clearError: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_EMAILS = [
  'sinampudi.suman@gmail.com',
  'admin@desiroots.com'
];

export function AdminProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  
  const { user } = useAuth();

  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }

    try {
      // Check if user email is in admin list
      const isAdminEmail = ADMIN_EMAILS.includes(user.email || '');
      
      if (isAdminEmail) {
        // Ensure user has admin flag in profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          return false;
        }

        // Update profile to mark as admin if not already
        if (!profile.is_admin) {
          await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', user.id);
        }

        setIsAdmin(true);
        return true;
      }

      setIsAdmin(false);
      return false;
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
      return false;
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          phone,
          is_admin,
          is_active,
          created_at,
          updated_at,
          last_login
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📦 [ADMIN] Loading orders...');

      // First, get all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          user_id,
          items,
          total_amount,
          delivery_fee,
          payment_method,
          payment_status,
          order_status,
          shipping_address,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('❌ [ADMIN] Orders query error:', ordersError);
        throw ordersError;
      }

      console.log('📦 [ADMIN] Raw orders data:', ordersData?.length || 0, 'orders');

      if (!ordersData || ordersData.length === 0) {
        console.log('📦 [ADMIN] No orders found');
        setOrders([]);
        return;
      }

      // Get unique user IDs from orders
      const userIds = [...new Set(ordersData.map(order => order.user_id))];
      console.log('👥 [ADMIN] Unique user IDs:', userIds.length);

      // Get user profiles for these orders
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ [ADMIN] Profiles query error:', profilesError);
        // Continue without profile data rather than failing completely
      }

      console.log('👥 [ADMIN] Profiles data:', profilesData?.length || 0, 'profiles');

      // Create a map of user profiles for quick lookup
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      // Combine orders with profile data
      const formattedOrders: AdminOrder[] = ordersData.map(order => {
        const profile = profilesMap.get(order.user_id);
        
        return {
          id: order.id,
          order_number: order.order_number || `ORD-${order.id.slice(0, 8)}`,
          user_id: order.user_id,
          customer_name: profile?.full_name || 'Unknown Customer',
          customer_email: profile?.email || 'No email',
          customer_phone: profile?.phone || '',
          items: order.items || [],
          total_amount: order.total_amount,
          delivery_fee: order.delivery_fee || 0,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          order_status: order.order_status,
          shipping_address: order.shipping_address,
          created_at: order.created_at,
          updated_at: order.updated_at
        };
      });

      console.log('✅ [ADMIN] Formatted orders:', formattedOrders.length);
      setOrders(formattedOrders);

    } catch (err) {
      console.error('❌ [ADMIN] Error loading orders:', err);
      setError(`Failed to load orders: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 [ADMIN] Loading statistics...');

      // Get user count
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('❌ [ADMIN] Users count error:', usersError);
      }

      console.log('👥 [ADMIN] Total users:', totalUsers);

      // Get active user count
      const { count: activeUsers, error: activeUsersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (activeUsersError) {
        console.error('❌ [ADMIN] Active users count error:', activeUsersError);
      }

      console.log('✅ [ADMIN] Active users:', activeUsers);

      // Get order count
      const { count: totalOrders, error: ordersCountError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (ordersCountError) {
        console.error('❌ [ADMIN] Orders count error:', ordersCountError);
      }

      console.log('📦 [ADMIN] Total orders:', totalOrders);

      // Get pending orders count
      const { count: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('order_status', 'pending');

      if (pendingError) {
        console.error('❌ [ADMIN] Pending orders count error:', pendingError);
      }

      console.log('⏳ [ADMIN] Pending orders:', pendingOrders);

      // Get total revenue from ALL orders (not just completed payments)
      const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('total_amount, payment_status, order_status')
        .neq('order_status', 'cancelled'); // Exclude cancelled orders

      if (revenueError) {
        console.error('❌ [ADMIN] Revenue query error:', revenueError);
      }

      console.log('💰 [ADMIN] Revenue data:', revenueData?.length || 0, 'orders');

      // Calculate total revenue including COD orders
      const totalRevenue = revenueData?.reduce((sum, order) => {
        console.log(`💰 Order: ${order.total_amount}, Payment: ${order.payment_status}, Status: ${order.order_status}`);
        return sum + (order.total_amount || 0);
      }, 0) || 0;

      console.log('💰 [ADMIN] Calculated total revenue:', totalRevenue);

      // Get recent orders (use the same approach as loadOrders)
      const { data: recentOrdersData, error: recentOrdersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          user_id,
          items,
          total_amount,
          delivery_fee,
          payment_method,
          payment_status,
          order_status,
          shipping_address,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentOrdersError) {
        console.error('❌ [ADMIN] Recent orders query error:', recentOrdersError);
      }

      let recentOrders: AdminOrder[] = [];

      if (recentOrdersData && recentOrdersData.length > 0) {
        // Get user profiles for recent orders
        const recentUserIds = [...new Set(recentOrdersData.map(order => order.user_id))];
        const { data: recentProfilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone')
          .in('id', recentUserIds);

        const recentProfilesMap = new Map();
        if (recentProfilesData) {
          recentProfilesData.forEach(profile => {
            recentProfilesMap.set(profile.id, profile);
          });
        }

        recentOrders = recentOrdersData.map(order => {
          const profile = recentProfilesMap.get(order.user_id);
          
          return {
            id: order.id,
            order_number: order.order_number || `ORD-${order.id.slice(0, 8)}`,
            user_id: order.user_id,
            customer_name: profile?.full_name || 'Unknown Customer',
            customer_email: profile?.email || 'No email',
            customer_phone: profile?.phone || '',
            items: order.items || [],
            total_amount: order.total_amount,
            delivery_fee: order.delivery_fee || 0,
            payment_method: order.payment_method,
            payment_status: order.payment_status,
            order_status: order.order_status,
            shipping_address: order.shipping_address,
            created_at: order.created_at,
            updated_at: order.updated_at
          };
        });
      }

      const statsData = {
        totalUsers: totalUsers || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        pendingOrders: pendingOrders || 0,
        activeUsers: activeUsers || 0,
        recentOrders
      };

      console.log('📊 [ADMIN] Final stats:', statsData);

      setStats(statsData);
    } catch (err) {
      console.error('❌ [ADMIN] Error loading stats:', err);
      setError(`Failed to load statistics: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (update: OrderStatusUpdate) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('orders')
        .update({ 
          order_status: update.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === update.orderId 
          ? { ...order, order_status: update.status, updated_at: new Date().toISOString() }
          : order
      ));

      // Update stats if needed
      if (stats) {
        await loadStats();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (update: PaymentStatusUpdate) => {
    try {
      setLoading(true);
      setError(null);

      console.log('💳 [ADMIN] Updating payment status:', update);

      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: update.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === update.orderId 
          ? { ...order, payment_status: update.status, updated_at: new Date().toISOString() }
          : order
      ));

      console.log('✅ [ADMIN] Payment status updated successfully');

      // Update stats if needed
      if (stats) {
        await loadStats();
      }
    } catch (err) {
      console.error('❌ [ADMIN] Error updating payment status:', err);
      setError('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (update: UserStatusUpdate) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: update.isActive,
          is_admin: update.isAdmin,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === update.userId 
          ? { 
              ...user, 
              is_active: update.isActive,
              is_admin: update.isAdmin,
              updated_at: new Date().toISOString()
            }
          : user
      ));
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  const exportOrders = (format: 'csv' | 'json') => {
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'csv') {
        const headers = [
          'Order ID',
          'Order Number',
          'Customer Name',
          'Customer Email',
          'Customer Phone',
          'Total Amount',
          'Payment Method',
          'Payment Status',
          'Order Status',
          'Created At'
        ];

        const rows = orders.map(order => [
          order.id,
          order.order_number,
          order.customer_name,
          order.customer_email,
          order.customer_phone,
          order.total_amount,
          order.payment_method,
          order.payment_status,
          order.order_status,
          new Date(order.created_at).toLocaleDateString()
        ]);

        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        filename = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        content = JSON.stringify(orders, null, 2);
        filename = `orders_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting orders:', err);
      setError('Failed to export orders');
    }
  };

  const clearError = () => setError(null);

  const value: AdminContextType = {
    loading,
    error,
    isAdmin,
    users,
    orders,
    stats,
    checkAdminStatus,
    loadUsers,
    loadOrders,
    loadStats,
    updateOrderStatus,
    updatePaymentStatus,
    updateUserStatus,
    exportOrders,
    clearError
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}