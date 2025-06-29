export interface PaymentMethod {
  id: string;
  name: string;
  type: 'upi' | 'card' | 'netbanking' | 'wallet';
  icon: string;
  enabled: boolean;
}

export interface UPIProvider {
  id: string;
  name: string;
  appName: string;
  packageName: string;
  icon: string;
  color: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  upiId?: string;
  paymentMethod: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  message: string;
  timestamp: string;
}

export interface Transaction {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  upi_id?: string;
  transaction_id?: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  gateway_response: any;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total_amount: number;
  delivery_fee: number;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: any;
  created_at: string;
  updated_at: string;
}