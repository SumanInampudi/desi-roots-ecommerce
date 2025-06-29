import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OrderService } from '../services/orderService';
import { useAuth } from './useAuth';
import { useCart } from './useCart';
import type { OrderProcessingResult } from '../types/order';
import type { CartItem, CartSummary } from '../types/cart';

interface OrderContextType {
  loading: boolean;
  error: string | null;
  lastOrderResult: OrderProcessingResult | null;
  processOrder: (customerInfo: any, paymentMethod: string) => Promise<OrderProcessingResult>;
  clearError: () => void;
  clearLastOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOrderResult, setLastOrderResult] = useState<OrderProcessingResult | null>(null);
  
  const { user } = useAuth();
  const { items, summary, clearCart } = useCart();

  const processOrder = async (
    customerInfo: any,
    paymentMethod: string
  ): Promise<OrderProcessingResult> => {
    if (!user) {
      const result: OrderProcessingResult = {
        success: false,
        message: 'User not authenticated'
      };
      setLastOrderResult(result);
      return result;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🛒 [ORDER-HOOK] Processing order with:', {
        customerName: customerInfo.fullName,
        itemCount: items.length,
        total: summary.total,
        paymentMethod
      });

      const result = await OrderService.processOrder(
        customerInfo,
        items,
        summary,
        paymentMethod,
        user.id
      );

      setLastOrderResult(result);

      if (result.success) {
        // Clear cart only if order was successful
        await clearCart();
        console.log('✅ [ORDER-HOOK] Order processed successfully, cart cleared');
      } else {
        setError(result.message);
        console.error('❌ [ORDER-HOOK] Order processing failed:', result.errors);
      }

      return result;
    } catch (error) {
      console.error('❌ [ORDER-HOOK] Unexpected error:', error);
      const result: OrderProcessingResult = {
        success: false,
        message: 'An unexpected error occurred while processing your order.'
      };
      setLastOrderResult(result);
      setError(result.message);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearLastOrder = () => setLastOrderResult(null);

  const value: OrderContextType = {
    loading,
    error,
    lastOrderResult,
    processOrder,
    clearError,
    clearLastOrder
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}