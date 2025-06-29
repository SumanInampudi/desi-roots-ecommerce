import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { PerformanceService } from '../services/performanceService';
import type { UserOrder } from '../types/order';

interface OptimizedOrdersContextType {
  orders: UserOrder[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  loadOrders: (options?: LoadOrdersOptions) => Promise<void>;
  loadMoreOrders: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  clearCache: () => void;
  performanceMetrics: any;
}

interface LoadOrdersOptions {
  limit?: number;
  offset?: number;
  forceRefresh?: boolean;
  replace?: boolean; // New option to replace existing orders
  filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

const OptimizedOrdersContext = createContext<OptimizedOrdersContextType | undefined>(undefined);

export function OptimizedOrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  
  const { user } = useAuth();

  const DEFAULT_LIMIT = 20;

  // Optimized query with proper indexing hints
  const buildOptimizedQuery = useCallback((options: LoadOrdersOptions = {}) => {
    const { limit = DEFAULT_LIMIT, offset = 0, filters } = options;
    
    let query = supabase
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
      `, { count: 'exact' })
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (filters?.status) {
      query = query.eq('order_status', filters.status);
    }
    
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    return query;
  }, [user]);

  const loadOrders = useCallback(async (options: LoadOrdersOptions = {}) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    const { forceRefresh = false, replace = false, offset = 0 } = options;
    
    // If this is a new query (offset 0) or replace is true, always replace existing orders
    const shouldReplace = offset === 0 || replace;
    
    // Check if filters have changed
    const filtersChanged = JSON.stringify(currentFilters) !== JSON.stringify(options.filters);
    
    if (filtersChanged) {
      setCurrentFilters(options.filters || null);
      // Reset pagination when filters change
      setCurrentOffset(0);
      options.offset = 0;
    }

    const cacheKey = PerformanceService.getCacheKey(user.id, options);

    try {
      setLoading(true);
      setError(null);

      const pageLoadStart = PerformanceService.startTimer();

      // Check cache first (unless force refresh or filters changed)
      if (!forceRefresh && !filtersChanged && !shouldReplace) {
        const cachedData = PerformanceService.getFromCache<{
          orders: UserOrder[];
          totalCount: number;
        }>(cacheKey);
        
        if (cachedData) {
          if (shouldReplace) {
            setOrders(cachedData.orders);
          } else {
            setOrders(prev => [...prev, ...cachedData.orders]);
          }
          setTotalCount(cachedData.totalCount);
          setHasMore(cachedData.orders.length < cachedData.totalCount);
          setCurrentOffset(prev => shouldReplace ? cachedData.orders.length : prev + cachedData.orders.length);
          
          const pageLoadTime = PerformanceService.endTimer(pageLoadStart);
          PerformanceService.recordMetrics({
            pageLoadTime,
            totalOrdersLoaded: cachedData.orders.length,
            cacheHitRate: 1
          });
          
          setLoading(false);
          return;
        }
      }

      console.log('📦 [OPTIMIZED-ORDERS] Loading orders with options:', {
        ...options,
        shouldReplace,
        filtersChanged
      });

      // Execute query with performance monitoring
      const { data, metrics } = await PerformanceService.measureQuery(
        () => PerformanceService.withRetry(
          () => buildOptimizedQuery(options),
          'loadOrders'
        ),
        'orders_query'
      );

      const { data: ordersData, count, error: queryError } = await data;

      if (queryError) {
        console.error('❌ [OPTIMIZED-ORDERS] Query error:', queryError);
        throw new Error(`Failed to load orders: ${queryError.message}`);
      }

      console.log('✅ [OPTIMIZED-ORDERS] Loaded orders:', ordersData?.length || 0);

      // Transform data
      const userOrders: UserOrder[] = (ordersData || []).map(order => ({
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

      // Remove duplicates by order ID
      const uniqueOrders = userOrders.filter((order, index, self) => 
        index === self.findIndex(o => o.id === order.id)
      );

      // Update state
      if (shouldReplace) {
        setOrders(uniqueOrders);
        setCurrentOffset(uniqueOrders.length);
      } else {
        setOrders(prev => {
          // Merge with existing orders and remove duplicates
          const combined = [...prev, ...uniqueOrders];
          const unique = combined.filter((order, index, self) => 
            index === self.findIndex(o => o.id === order.id)
          );
          return unique;
        });
        setCurrentOffset(prev => prev + uniqueOrders.length);
      }
      
      setTotalCount(count || 0);
      setHasMore((options.offset || 0) + uniqueOrders.length < (count || 0));

      // Cache the results (only for initial loads)
      if (shouldReplace) {
        PerformanceService.setCache(cacheKey, {
          orders: uniqueOrders,
          totalCount: count || 0
        });
      }

      // Record performance metrics
      const pageLoadTime = PerformanceService.endTimer(pageLoadStart);
      PerformanceService.recordMetrics({
        pageLoadTime,
        dbQueryTime: metrics.queryTime,
        apiResponseTime: metrics.queryTime,
        totalOrdersLoaded: uniqueOrders.length,
        errorRate: metrics.success ? 0 : 1,
        cacheHitRate: 0
      });

      // Update performance metrics state
      setPerformanceMetrics(PerformanceService.getPerformanceBenchmarks());

    } catch (err) {
      console.error('❌ [OPTIMIZED-ORDERS] Error loading orders:', err);
      
      const errorMessage = err instanceof Error 
        ? err.message.includes('Failed to fetch') || err.message.includes('Network')
          ? 'Unable to connect to the server. Please check your internet connection and try again.'
          : err.message
        : 'Failed to load orders. Please try again.';
      
      setError(errorMessage);
      
      // Record error metrics
      PerformanceService.recordMetrics({
        errorRate: 1,
        totalOrdersLoaded: 0
      });
      
    } finally {
      setLoading(false);
    }
  }, [user, buildOptimizedQuery, currentFilters]);

  const loadMoreOrders = useCallback(async () => {
    if (!hasMore || loading) return;
    
    await loadOrders({
      offset: currentOffset,
      limit: DEFAULT_LIMIT,
      filters: currentFilters,
      replace: false // Explicitly don't replace for load more
    });
  }, [hasMore, loading, currentOffset, currentFilters, loadOrders]);

  const refreshOrders = useCallback(async () => {
    setCurrentOffset(0);
    await loadOrders({ 
      forceRefresh: true, 
      replace: true,
      filters: currentFilters 
    });
  }, [loadOrders, currentFilters]);

  const clearCache = useCallback(() => {
    if (user) {
      PerformanceService.clearCache(user.id);
    }
  }, [user]);

  // Auto-load orders when user changes
  useEffect(() => {
    if (user) {
      setCurrentOffset(0);
      setCurrentFilters(null);
      loadOrders({ replace: true });
    } else {
      setOrders([]);
      setTotalCount(0);
      setHasMore(false);
      setCurrentOffset(0);
      setCurrentFilters(null);
    }
  }, [user, loadOrders]);

  const value: OptimizedOrdersContextType = {
    orders,
    loading,
    error,
    hasMore,
    totalCount,
    loadOrders,
    loadMoreOrders,
    refreshOrders,
    clearCache,
    performanceMetrics
  };

  return (
    <OptimizedOrdersContext.Provider value={value}>
      {children}
    </OptimizedOrdersContext.Provider>
  );
}

export function useOptimizedOrders() {
  const context = useContext(OptimizedOrdersContext);
  if (context === undefined) {
    throw new Error('useOptimizedOrders must be used within an OptimizedOrdersProvider');
  }
  return context;
}