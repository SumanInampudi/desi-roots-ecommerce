import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Product } from '../types/cart';

interface FavoriteItem {
  id: string;
  user_id: string;
  product_id: number;
  product_name: string;
  product_image: string | null;
  product_price: string;
  product_weight: string | null;
  created_at: string;
  updated_at: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  loading: boolean;
  error: string | null;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (product: Product) => Promise<void>;
  removeFavorite: (productId: number) => Promise<void>;
  clearError: () => void;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Load favorites when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, user]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Favorites query error:', error);
        throw new Error(`Failed to load favorites: ${error.message}`);
      }

      setFavorites(data || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to load favorites. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (productId: number): boolean => {
    return favorites.some(fav => fav.product_id === productId);
  };

  const toggleFavorite = async (product: Product) => {
    if (!user) {
      setError('Please sign in to add favorites');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
      
      if (isNaN(productId)) {
        throw new Error('Invalid product ID');
      }

      const existingFavorite = favorites.find(fav => fav.product_id === productId);

      if (existingFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existingFavorite.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Remove favorite error:', error);
          throw new Error(`Failed to remove favorite: ${error.message}`);
        }

        setFavorites(prev => prev.filter(fav => fav.id !== existingFavorite.id));
      } else {
        // Add to favorites
        const newFavorite = {
          user_id: user.id,
          product_id: productId,
          product_name: product.name,
          product_image: product.image || null,
          product_price: product.price.toString(),
          product_weight: product.weight || null
        };

        const { data, error } = await supabase
          .from('favorites')
          .insert([newFavorite])
          .select()
          .single();

        if (error) {
          console.error('Add favorite error:', error);
          throw new Error(`Failed to add favorite: ${error.message}`);
        }

        setFavorites(prev => [data, ...prev]);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update favorites. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId: number) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Remove favorite error:', error);
        throw new Error(`Failed to remove favorite: ${error.message}`);
      }

      setFavorites(prev => prev.filter(fav => fav.product_id !== productId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to remove favorite. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const refreshFavorites = async () => {
    await loadFavorites();
  };

  const value: FavoritesContextType = {
    favorites,
    loading,
    error,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearError,
    refreshFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}