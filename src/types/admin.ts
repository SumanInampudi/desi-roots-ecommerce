export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: any[];
  total_amount: number;
  delivery_fee: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  shipping_address: any;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeUsers: number;
  recentOrders: AdminOrder[];
}

export interface OrderStatusUpdate {
  orderId: string;
  status: string;
  notes?: string;
}

export interface PaymentStatusUpdate {
  orderId: string;
  status: string;
  notes?: string;
}

export interface UserStatusUpdate {
  userId: string;
  isActive: boolean;
  isAdmin: boolean;
}

export interface StatusChangeLog {
  id: string;
  order_id: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  changed_by_email: string;
  changed_at: string;
  notes?: string;
}