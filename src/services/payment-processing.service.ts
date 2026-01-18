/**
 * Payment Processing Service
 * Frontend service to interact with payment Edge Functions
 */

import { supabase } from '@/integrations/supabase/client';

export interface ProcessPaymentParams {
    paymentMethodToken: string;
    amount: number;
    currency?: string;
    applicationId?: string;
    paymentScheduleId?: string;
    transactionType?: 'down_payment' | 'installment' | 'late_fee';
    customerId: string;
    metadata?: Record<string, any>;
}

export interface ProcessPaymentResult {
    success: boolean;
    transactionId?: string;
    ellacashTransactionId?: string;
    status?: string;
    error?: string;
}

/**
 * Process a payment charge
 */
export async function processPayment(
    params: ProcessPaymentParams
): Promise<ProcessPaymentResult> {
    try {
        const { data, error } = await supabase.functions.invoke('charge-payment', {
            body: {
                payment_method_token: params.paymentMethodToken,
                amount: params.amount,
                currency: params.currency || 'INR',
                application_id: params.applicationId,
                payment_schedule_id: params.paymentScheduleId,
                transaction_type: params.transactionType || 'down_payment',
                customer_id: params.customerId,
                metadata: params.metadata,
            },
        });

        if (error) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                error: error.message || 'Failed to process payment',
            };
        }

        return {
            success: data.success,
            transactionId: data.transaction_id,
            ellacashTransactionId: data.ellacash_transaction_id,
            status: data.status,
            error: data.error,
        };
    } catch (error: any) {
        console.error('Process payment error:', error);
        return {
            success: false,
            error: error.message || 'Failed to process payment',
        };
    }
}

/**
 * Get payment transaction details
 */
export async function getPaymentTransaction(transactionId: string) {
    try {
        const { data, error } = await supabase
            .from('payment_transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, transaction: data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Get all transactions for a customer
 */
export async function getCustomerTransactions(customerId: string) {
    try {
        const { data, error } = await supabase
            .from('payment_transactions')
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, transactions: data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Retry a failed payment
 */
export async function retryFailedPayment(
    transactionId: string
): Promise<ProcessPaymentResult> {
    try {
        // Get original transaction
        const { data: transaction, error: fetchError } = await supabase
            .from('payment_transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (fetchError || !transaction) {
            return {
                success: false,
                error: 'Transaction not found',
            };
        }

        // Retry payment with same parameters
        return await processPayment({
            paymentMethodToken: transaction.payment_method_token,
            amount: transaction.amount,
            currency: transaction.currency,
            applicationId: transaction.application_id,
            paymentScheduleId: transaction.payment_schedule_id,
            transactionType: transaction.transaction_type,
            customerId: transaction.customer_id,
            metadata: {
                ...transaction.metadata,
                retry_of: transactionId,
                retry_count: (transaction.retry_count || 0) + 1,
            },
        });
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to retry payment',
        };
    }
}

/**
 * Format transaction amount for display
 */
export function formatTransactionAmount(amount: number, currency: string = 'INR'): string {
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
    });
    return formatter.format(amount);
}

/**
 * Get transaction status badge color
 */
export function getTransactionStatusColor(status: string): string {
    switch (status) {
        case 'success':
            return 'bg-green-500/10 text-green-500';
        case 'pending':
        case 'processing':
            return 'bg-yellow-500/10 text-yellow-500';
        case 'failed':
            return 'bg-red-500/10 text-red-500';
        case 'refunded':
            return 'bg-blue-500/10 text-blue-500';
        default:
            return 'bg-gray-500/10 text-gray-500';
    }
}
