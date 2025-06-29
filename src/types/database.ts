export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          address: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          address?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          address?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          items: any;
          total_amount: number;
          delivery_fee: number | null;
          payment_method: string;
          payment_status: string | null;
          order_status: string | null;
          shipping_address: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          items: any;
          total_amount: number;
          delivery_fee?: number | null;
          payment_method: string;
          payment_status?: string | null;
          order_status?: string | null;
          shipping_address: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          items?: any;
          total_amount?: number;
          delivery_fee?: number | null;
          payment_method?: string;
          payment_status?: string | null;
          order_status?: string | null;
          shipping_address?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: number;
          product_name: string;
          quantity?: number;
          price: number;
          weight?: string | null;
          image?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: number;
          product_name?: string;
          quantity?: number;
          price?: number;
          weight?: string | null;
          image?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}