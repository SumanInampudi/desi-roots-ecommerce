export interface OrderDetails {
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      landmark?: string;
    };
  };
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    weight: string;
    total: number;
  }>;
  summary: {
    subtotal: number;
    deliveryFee: number;
    total: number;
    itemCount: number;
  };
  paymentMethod: string;
  orderDate: string;
  estimatedDelivery: string;
  trackingNumber?: string;
}

export interface EmailNotification {
  to: string;
  subject: string;
  htmlContent: string;
  orderDetails: OrderDetails;
}

export interface WhatsAppMessage {
  phoneNumber: string;
  message: string;
  orderDetails: OrderDetails;
}

export interface OrderProcessingResult {
  success: boolean;
  orderId?: string;
  message: string;
  emailSent?: boolean;
  whatsappSent?: boolean;
  errors?: string[];
}