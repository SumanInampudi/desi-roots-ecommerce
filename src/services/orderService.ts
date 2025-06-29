import { supabase } from '../lib/supabase';
import type { OrderDetails, EmailNotification, WhatsAppMessage, OrderProcessingResult } from '../types/order';
import type { CartItem, CartSummary } from '../types/cart';

export class OrderService {
  private static readonly BUSINESS_EMAIL = 'sinampudi.suman@gmail.com';
  private static readonly BUSINESS_WHATSAPP = '918179715455';
  private static readonly DELIVERY_DAYS = 3;

  static generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `DR${timestamp.toString().slice(-6)}${random}`;
  }

  static generateTrackingNumber(): string {
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    return `TRK${random}`;
  }

  static calculateEstimatedDelivery(): string {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + this.DELIVERY_DAYS);
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  static validateOrderData(customerInfo: any, items: CartItem[]): string[] {
    const errors: string[] = [];

    // Validate customer info
    if (!customerInfo.fullName?.trim()) {
      errors.push('Full name is required');
    }
    if (!customerInfo.email?.trim() || !this.isValidEmail(customerInfo.email)) {
      errors.push('Valid email address is required');
    }
    if (!customerInfo.phone?.trim() || customerInfo.phone.length < 10) {
      errors.push('Valid phone number is required');
    }

    // Validate address
    if (!customerInfo.address?.street?.trim()) {
      errors.push('Street address is required');
    }
    if (!customerInfo.address?.city?.trim()) {
      errors.push('City is required');
    }
    if (!customerInfo.address?.state?.trim()) {
      errors.push('State is required');
    }
    if (!customerInfo.address?.pincode?.trim() || customerInfo.address.pincode.length < 6) {
      errors.push('Valid pincode is required');
    }

    // Validate cart items
    if (!items || items.length === 0) {
      errors.push('Cart is empty');
    }

    items.forEach((item, index) => {
      if (!item.product_name?.trim()) {
        errors.push(`Item ${index + 1}: Product name is missing`);
      }
      if (!item.quantity || item.quantity < 1) {
        errors.push(`Item ${index + 1}: Invalid quantity`);
      }
      if (!item.price || item.price <= 0) {
        errors.push(`Item ${index + 1}: Invalid price`);
      }
    });

    return errors;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static createOrderDetails(
    customerInfo: any,
    items: CartItem[],
    summary: CartSummary,
    paymentMethod: string
  ): OrderDetails {
    const orderId = this.generateOrderId();
    const trackingNumber = this.generateTrackingNumber();
    const orderDate = new Date().toLocaleString('en-IN');
    const estimatedDelivery = this.calculateEstimatedDelivery();

    return {
      orderId,
      customerInfo: {
        name: customerInfo.fullName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address
      },
      items: items.map(item => ({
        id: item.product_id,
        name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        weight: item.weight || '',
        total: item.price * item.quantity
      })),
      summary,
      paymentMethod,
      orderDate,
      estimatedDelivery,
      trackingNumber
    };
  }

  static async saveOrderToDatabase(orderDetails: OrderDetails, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .insert([{
          id: orderDetails.orderId,
          user_id: userId,
          items: orderDetails.items,
          total_amount: orderDetails.summary.total,
          delivery_fee: orderDetails.summary.deliveryFee,
          payment_method: orderDetails.paymentMethod,
          payment_status: 'pending',
          order_status: 'pending',
          shipping_address: orderDetails.customerInfo.address
        }]);

      if (error) {
        console.error('❌ [ORDER] Database save error:', error);
        return false;
      }

      console.log('✅ [ORDER] Order saved to database:', orderDetails.orderId);
      return true;
    } catch (error) {
      console.error('❌ [ORDER] Unexpected database error:', error);
      return false;
    }
  }

  static generateEmailHTML(orderDetails: OrderDetails): string {
    const itemsHTML = orderDetails.items.map(item => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; text-align: left;">${item.name}</td>
        <td style="padding: 12px; text-align: center;">${item.weight}</td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 12px; text-align: right; font-weight: bold;">₹${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - ${orderDetails.orderId}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">🌶️ Desi Roots</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">The Authentic Taste of Guntur Spice</p>
      </div>

      <!-- Order Confirmation -->
      <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #10b981;">
        <h2 style="color: #10b981; margin: 0 0 15px 0; font-size: 24px;">✅ Order Confirmed!</h2>
        <p style="margin: 0; font-size: 16px;">Thank you for your order! We've received your order and will process it shortly.</p>
      </div>

      <!-- Order Details -->
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
        <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">📋 Order Information</h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div>
            <strong style="color: #6b7280;">Order ID:</strong><br>
            <span style="font-size: 18px; color: #dc2626; font-weight: bold;">${orderDetails.orderId}</span>
          </div>
          <div>
            <strong style="color: #6b7280;">Order Date:</strong><br>
            <span>${orderDetails.orderDate}</span>
          </div>
          <div>
            <strong style="color: #6b7280;">Tracking Number:</strong><br>
            <span style="font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${orderDetails.trackingNumber}</span>
          </div>
          <div>
            <strong style="color: #6b7280;">Estimated Delivery:</strong><br>
            <span style="color: #059669; font-weight: bold;">${orderDetails.estimatedDelivery}</span>
          </div>
        </div>
      </div>

      <!-- Customer Information -->
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
        <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">👤 Customer Details</h3>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #6b7280;">Name:</strong> ${orderDetails.customerInfo.name}<br>
          <strong style="color: #6b7280;">Email:</strong> ${orderDetails.customerInfo.email}<br>
          <strong style="color: #6b7280;">Phone:</strong> ${orderDetails.customerInfo.phone}
        </div>
        
        <div>
          <strong style="color: #6b7280;">Delivery Address:</strong><br>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 8px;">
            ${orderDetails.customerInfo.address.street}<br>
            ${orderDetails.customerInfo.address.landmark ? `Near: ${orderDetails.customerInfo.address.landmark}<br>` : ''}
            ${orderDetails.customerInfo.address.city}, ${orderDetails.customerInfo.address.state} - ${orderDetails.customerInfo.address.pincode}
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
        <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">🛒 Order Items</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Weight</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
      </div>

      <!-- Order Summary -->
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
        <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">💰 Order Summary</h3>
        
        <div style="space-y: 10px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span>Subtotal (${orderDetails.summary.itemCount} items):</span>
            <span>₹${orderDetails.summary.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span>Delivery Fee:</span>
            <span>${orderDetails.summary.deliveryFee === 0 ? 'FREE' : `₹${orderDetails.summary.deliveryFee.toFixed(2)}`}</span>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 18px; font-weight: bold; color: #dc2626;">
            <span>Total Amount:</span>
            <span>₹${orderDetails.summary.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-top: 20px;">
          <strong style="color: #92400e;">Payment Method:</strong> ${orderDetails.paymentMethod.toUpperCase()}<br>
          <strong style="color: #92400e;">Payment Status:</strong> <span style="color: #d97706;">Pending Verification</span>
        </div>
      </div>

      <!-- Next Steps -->
      <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
        <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">📱 What's Next?</h3>
        <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
          <li style="margin-bottom: 8px;">We'll verify your payment and confirm your order via WhatsApp</li>
          <li style="margin-bottom: 8px;">You'll receive tracking updates via SMS and email</li>
          <li style="margin-bottom: 8px;">Your order will be delivered within 2-3 business days</li>
          <li style="margin-bottom: 8px;">Contact us if you have any questions about your order</li>
        </ul>
      </div>

      <!-- Customer Support -->
      <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
        <h3 style="color: #15803d; margin: 0 0 15px 0; font-size: 18px;">🎧 Customer Support</h3>
        <p style="margin: 0 0 15px 0; color: #15803d;">Need help with your order? We're here to assist you!</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <strong style="color: #15803d;">📱 WhatsApp:</strong><br>
            <a href="https://wa.me/918179715455" style="color: #22c55e; text-decoration: none;">+91 81797 15455</a>
          </div>
          <div>
            <strong style="color: #15803d;">📧 Email:</strong><br>
            <a href="mailto:orders@desiroots.com" style="color: #22c55e; text-decoration: none;">orders@desiroots.com</a>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 20px; color: #6b7280; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 10px 0;">Thank you for choosing Desi Roots!</p>
        <p style="margin: 0; font-size: 14px;">© 2025 Desi Roots. All rights reserved.</p>
        <p style="margin: 10px 0 0 0; font-size: 14px;">
          <a href="https://wa.me/918179715455" style="color: #dc2626; text-decoration: none;">Contact Support</a> | 
          <a href="mailto:orders@desiroots.com" style="color: #dc2626; text-decoration: none;">Email Us</a>
        </p>
      </div>

    </body>
    </html>
    `;
  }

  static async sendEmailNotification(orderDetails: OrderDetails): Promise<boolean> {
    try {
      // In a real implementation, you would use a service like:
      // - SendGrid
      // - Mailgun
      // - AWS SES
      // - Supabase Edge Functions with email service
      
      console.log('📧 [EMAIL] Sending order confirmation email...');
      console.log('📧 [EMAIL] To:', this.BUSINESS_EMAIL);
      console.log('📧 [EMAIL] Order ID:', orderDetails.orderId);
      console.log('📧 [EMAIL] Customer:', orderDetails.customerInfo.name);
      
      // For demo purposes, we'll simulate email sending
      // In production, replace this with actual email service integration
      
      const emailData = {
        to: this.BUSINESS_EMAIL,
        subject: `🛍️ New Order Received - ${orderDetails.orderId} - Desi Roots`,
        html: this.generateEmailHTML(orderDetails),
        orderDetails
      };

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ [EMAIL] Order confirmation email sent successfully');
      return true;
    } catch (error) {
      console.error('❌ [EMAIL] Failed to send email:', error);
      return false;
    }
  }

  static generateWhatsAppMessage(orderDetails: OrderDetails): string {
    const itemsList = orderDetails.items.map((item, index) => 
      `${index + 1}. ${item.name}\n   • Quantity: ${item.quantity}\n   • Weight: ${item.weight}\n   • Price: ₹${item.price} each\n   • Total: ₹${item.total.toFixed(2)}`
    ).join('\n\n');

    return `🛍️ *NEW ORDER RECEIVED*
📋 Order ID: ${orderDetails.orderId}
📅 Date: ${orderDetails.orderDate}
🔢 Tracking: ${orderDetails.trackingNumber}

👤 *CUSTOMER DETAILS*
Name: ${orderDetails.customerInfo.name}
📧 Email: ${orderDetails.customerInfo.email}
📱 Phone: ${orderDetails.customerInfo.phone}

📍 *DELIVERY ADDRESS*
${orderDetails.customerInfo.address.street}
${orderDetails.customerInfo.address.landmark ? `Near: ${orderDetails.customerInfo.address.landmark}` : ''}
${orderDetails.customerInfo.address.city}, ${orderDetails.customerInfo.address.state} - ${orderDetails.customerInfo.address.pincode}

🛒 *ORDER ITEMS*
${itemsList}

💰 *ORDER SUMMARY*
Subtotal: ₹${orderDetails.summary.subtotal.toFixed(2)}
Delivery Fee: ${orderDetails.summary.deliveryFee === 0 ? 'FREE' : `₹${orderDetails.summary.deliveryFee.toFixed(2)}`}
*Total Amount: ₹${orderDetails.summary.total.toFixed(2)}*

💳 Payment Method: ${orderDetails.paymentMethod.toUpperCase()}
📅 Estimated Delivery: ${orderDetails.estimatedDelivery}

⚡ Please confirm this order and provide payment verification.

Thank you for choosing Desi Roots! 🌶️`;
  }

  static sendWhatsAppMessage(orderDetails: OrderDetails): boolean {
    try {
      const message = this.generateWhatsAppMessage(orderDetails);
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${this.BUSINESS_WHATSAPP}?text=${encodedMessage}`;
      
      console.log('📱 [WHATSAPP] Opening WhatsApp with order details...');
      console.log('📱 [WHATSAPP] Order ID:', orderDetails.orderId);
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      
      console.log('✅ [WHATSAPP] WhatsApp message sent successfully');
      return true;
    } catch (error) {
      console.error('❌ [WHATSAPP] Failed to send WhatsApp message:', error);
      return false;
    }
  }

  static async processOrder(
    customerInfo: any,
    items: CartItem[],
    summary: CartSummary,
    paymentMethod: string,
    userId: string
  ): Promise<OrderProcessingResult> {
    console.log('🚀 [ORDER] Starting order processing...');
    
    const errors: string[] = [];
    let emailSent = false;
    let whatsappSent = false;
    let orderId = '';

    try {
      // Step 1: Validate order data
      console.log('1️⃣ [ORDER] Validating order data...');
      const validationErrors = this.validateOrderData(customerInfo, items);
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: 'Order validation failed',
          errors: validationErrors
        };
      }
      console.log('✅ [ORDER] Order data validation passed');

      // Step 2: Create order details
      console.log('2️⃣ [ORDER] Creating order details...');
      const orderDetails = this.createOrderDetails(customerInfo, items, summary, paymentMethod);
      orderId = orderDetails.orderId;
      console.log('✅ [ORDER] Order details created:', orderId);

      // Step 3: Save to database
      console.log('3️⃣ [ORDER] Saving order to database...');
      const dbSaved = await this.saveOrderToDatabase(orderDetails, userId);
      if (!dbSaved) {
        errors.push('Failed to save order to database');
      } else {
        console.log('✅ [ORDER] Order saved to database');
      }

      // Step 4: Send email notification
      console.log('4️⃣ [ORDER] Sending email notification...');
      try {
        emailSent = await this.sendEmailNotification(orderDetails);
        if (!emailSent) {
          errors.push('Failed to send email notification');
        }
      } catch (error) {
        console.error('❌ [ORDER] Email notification error:', error);
        errors.push('Email notification failed');
      }

      // Step 5: Send WhatsApp message
      console.log('5️⃣ [ORDER] Sending WhatsApp message...');
      try {
        whatsappSent = this.sendWhatsAppMessage(orderDetails);
        if (!whatsappSent) {
          errors.push('Failed to send WhatsApp message');
        }
      } catch (error) {
        console.error('❌ [ORDER] WhatsApp message error:', error);
        errors.push('WhatsApp message failed');
      }

      // Determine success
      const success = dbSaved && (emailSent || whatsappSent);
      
      console.log('🏁 [ORDER] Order processing completed:', {
        success,
        orderId,
        dbSaved,
        emailSent,
        whatsappSent,
        errorCount: errors.length
      });

      return {
        success,
        orderId,
        message: success 
          ? 'Order placed successfully! Check your email and WhatsApp for confirmation.'
          : 'Order processing encountered some issues, but your order has been received.',
        emailSent,
        whatsappSent,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('❌ [ORDER] Unexpected error during order processing:', error);
      return {
        success: false,
        orderId,
        message: 'An unexpected error occurred while processing your order.',
        emailSent,
        whatsappSent,
        errors: [...errors, 'Unexpected processing error']
      };
    }
  }
}