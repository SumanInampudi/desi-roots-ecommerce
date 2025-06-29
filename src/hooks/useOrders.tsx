import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { UserOrder } from '../types/order';

interface OrdersContextType {
  orders: UserOrder[];
  loading: boolean;
  error: string | null;
  loadUserOrders: () => Promise<void>;
  clearError: () => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadUserOrders = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📦 [ORDERS] Loading user orders for:', user.id);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [ORDERS] Query error:', error);
        throw new Error(`Failed to load orders: ${error.message}`);
      }

      console.log('✅ [ORDERS] Loaded orders:', data?.length || 0);

      // Transform the data to match UserOrder interface
      const userOrders: UserOrder[] = (data || []).map(order => ({
        id: order.id,
        order_number: order.order_number || `ORD-${order.id.slice(0, 8)}`,
        items: order.items || [],
        total_amount: order.total_amount,
        delivery_fee: order.delivery_fee || 0,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        order_status: order.order_status,
        shipping_address: order.shipping_address,
        created_at: order.created_at,
        updated_at: order.updated_at
      }));

      setOrders(userOrders);
    } catch (err) {
      console.error('❌ [ORDERS] Error loading orders:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value: OrdersContextType = {
    orders,
    loading,
    error,
    loadUserOrders,
    clearError
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}