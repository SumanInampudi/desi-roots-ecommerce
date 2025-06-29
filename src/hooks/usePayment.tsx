import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { PaymentRequest, PaymentResponse, Transaction, UPIProvider } from '../types/payment';

interface PaymentContextType {
  loading: boolean;
  error: string | null;
  currentTransaction: Transaction | null;
  upiProviders: UPIProvider[];
  initiatePayment: (request: PaymentRequest) => Promise<PaymentResponse>;
  verifyPayment: (transactionId: string) => Promise<PaymentResponse>;
  generateUPILink: (request: PaymentRequest) => string;
  generateQRCode: (upiLink: string) => Promise<string>;
  getTransactionHistory: () => Promise<Transaction[]>;
  clearError: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

const UPI_PROVIDERS: UPIProvider[] = [
  {
    id: 'googlepay',
    name: 'Google Pay',
    appName: 'Google Pay',
    packageName: 'com.google.android.apps.nfc.payment',
    icon: '🟢',
    color: 'bg-green-600'
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    appName: 'PhonePe',
    packageName: 'com.phonepe.app',
    icon: '🟣',
    color: 'bg-purple-600'
  },
  {
    id: 'paytm',
    name: 'Paytm',
    appName: 'Paytm',
    packageName: 'net.one97.paytm',
    icon: '🔵',
    color: 'bg-blue-600'
  },
  {
    id: 'bhim',
    name: 'BHIM UPI',
    appName: 'BHIM',
    packageName: 'in.gov.uidai.bhimupi',
    icon: '🇮🇳',
    color: 'bg-orange-600'
  }
];

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const { user } = useAuth();

  const clearError = () => setError(null);

  const generateOrderId = () => {
    return `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateUPILink = (request: PaymentRequest): string => {
    const merchantUPI = 'merchant@upi'; // Replace with actual merchant UPI ID
    const params = new URLSearchParams({
      pa: request.upiId || merchantUPI,
      pn: 'Desi Roots',
      tr: request.orderId,
      tn: request.description,
      am: request.amount.toString(),
      cu: request.currency || 'INR'
    });

    return `upi://pay?${params.toString()}`;
  };

  const generateQRCode = async (upiLink: string): Promise<string> => {
    try {
      const QRCode = (await import('qrcode')).default;
      return await QRCode.toDataURL(upiLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (err) {
      console.error('Error generating QR code:', err);
      throw new Error('Failed to generate QR code');
    }
  };

  const createTransaction = async (request: PaymentRequest): Promise<Transaction> => {
    if (!user) throw new Error('User not authenticated');

    const transaction = {
      order_id: request.orderId,
      user_id: user.id,
      amount: request.amount,
      currency: request.currency || 'INR',
      payment_method: request.paymentMethod,
      upi_id: request.upiId,
      status: 'pending' as const,
      gateway_response: {}
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateTransaction = async (
    transactionId: string, 
    updates: Partial<Transaction>
  ): Promise<Transaction> => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const initiatePayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
    try {
      setLoading(true);
      setError(null);

      // Create transaction record
      const transaction = await createTransaction(request);
      setCurrentTransaction(transaction);

      // Generate UPI link
      const upiLink = generateUPILink(request);

      // In a real implementation, you would integrate with a payment gateway
      // For demo purposes, we'll simulate the payment process
      
      // Simulate payment gateway response
      const response: PaymentResponse = {
        success: true,
        transactionId: transaction.id,
        orderId: request.orderId,
        amount: request.amount,
        status: 'pending',
        message: 'Payment initiated successfully',
        timestamp: new Date().toISOString()
      };

      // Update transaction with gateway response
      await updateTransaction(transaction.id, {
        gateway_response: { upiLink, response }
      });

      return response;
    } catch (err) {
      console.error('Error initiating payment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment initiation failed';
      setError(errorMessage);
      
      return {
        success: false,
        orderId: request.orderId,
        amount: request.amount,
        status: 'failed',
        message: errorMessage,
        timestamp: new Date().toISOString()
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (transactionId: string): Promise<PaymentResponse> => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, you would verify with the payment gateway
      // For demo purposes, we'll simulate verification
      
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) throw error;

      // Simulate random success/failure for demo
      const isSuccess = Math.random() > 0.3; // 70% success rate
      const status = isSuccess ? 'success' : 'failed';

      // Update transaction status
      const updatedTransaction = await updateTransaction(transactionId, {
        status,
        gateway_response: {
          ...transaction.gateway_response,
          verification: {
            verified: isSuccess,
            timestamp: new Date().toISOString()
          }
        }
      });

      setCurrentTransaction(updatedTransaction);

      return {
        success: isSuccess,
        transactionId,
        orderId: transaction.order_id,
        amount: transaction.amount,
        status,
        message: isSuccess ? 'Payment verified successfully' : 'Payment verification failed',
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error verifying payment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment verification failed';
      setError(errorMessage);
      
      return {
        success: false,
        transactionId,
        orderId: '',
        amount: 0,
        status: 'failed',
        message: errorMessage,
        timestamp: new Date().toISOString()
      };
    } finally {
      setLoading(false);
    }
  };

  const getTransactionHistory = async (): Promise<Transaction[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      setError('Failed to fetch transaction history');
      return [];
    }
  };

  const value: PaymentContextType = {
    loading,
    error,
    currentTransaction,
    upiProviders: UPI_PROVIDERS,
    initiatePayment,
    verifyPayment,
    generateUPILink,
    generateQRCode,
    getTransactionHistory,
    clearError
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}