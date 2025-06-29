import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { CartItem, CartSummary, Product } from '../types/cart';

interface CartContextType {
  items: CartItem[];
  summary: CartSummary;
  loading: boolean;
  error: string | null;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  saveForLater: (itemId: string) => Promise<void>;
  moveToCart: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const DELIVERY_FEE_THRESHOLD = 500;
const DELIVERY_FEE = 50;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Calculate cart summary
  const summary: CartSummary = React.useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal >= DELIVERY_FEE_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, deliveryFee, total, itemCount };
  }, [items]);

  // Load cart items when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCartItems();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, user]);

  const loadCartItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Test Supabase connection first
      const { data: connectionTest, error: connectionError } = await supabase
        .from('cart_items')
        .select('count')
        .limit(1);

      if (connectionError) {
        console.error('Supabase connection error:', connectionError);
        throw new Error(`Database connection failed: ${connectionError.message}`);
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Cart items query error:', error);
        throw new Error(`Failed to load cart items: ${error.message}`);
      }

      setItems(data || []);
    } catch (err) {
      console.error('Error loading cart items:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to load cart items. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!user) {
      setError('Please sign in to add items to cart');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert product.id to integer for database compatibility
      const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
      
      if (isNaN(productId)) {
        throw new Error('Invalid product ID');
      }

      // Check if item already exists in cart
      const existingItem = items.find(item => item.product_id === productId);

      if (existingItem) {
        // Update quantity
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        // Add new item
        const newItem = {
          user_id: user.id,
          product_id: productId,
          product_name: product.name,
          quantity,
          price: parseFloat(product.price.toString()),
          weight: product.weight || null,
          image: product.image || null,
          description: product.description || null
        };

        const { data, error } = await supabase
          .from('cart_items')
          .insert([newItem])
          .select()
          .single();

        if (error) {
          console.error('Add to cart error:', error);
          throw new Error(`Failed to add item to cart: ${error.message}`);
        }

        setItems(prev => [data, ...prev]);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add item to cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Remove from cart error:', error);
        throw new Error(`Failed to remove item: ${error.message}`);
      }

      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing from cart:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to remove item from cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user || quantity < 1) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Update quantity error:', error);
        throw new Error(`Failed to update quantity: ${error.message}`);
      }

      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    } catch (err) {
      console.error('Error updating quantity:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update quantity. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Clear cart error:', error);
        throw new Error(`Failed to clear cart: ${error.message}`);
      }

      setItems([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to clear cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveForLater = async (itemId: string) => {
    // This would move item to a "saved_items" table
    // For now, we'll just remove from cart
    await removeFromCart(itemId);
  };

  const moveToCart = async (itemId: string) => {
    // This would move item from "saved_items" back to cart
    // Implementation depends on saved items structure
  };

  const refreshCart = async () => {
    await loadCartItems();
  };

  const value: CartContextType = {
    items,
    summary,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    saveForLater,
    moveToCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}