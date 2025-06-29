export interface CartItem {
  id: string;
  user_id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  weight: string | null;
  image: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartSummary {
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

export interface SavedItem extends Omit<CartItem, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  saved_at: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  weight: string;
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
  searchKeywords: string[];
  features: Array<{ text: string; icon?: React.ReactNode; color?: string }>;
}