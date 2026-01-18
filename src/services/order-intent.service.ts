import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import {
    sendApplicationApprovedWebhook,
    sendApplicationRejectedWebhook,
} from './webhook.service';

type OrderIntent = Tables<'order_intents'>;
type BNPLApplication = Tables<'bnpl_applications'>;

export interface CreateOrderIntentParams {
    checkoutSessionId: string;
    customerId?: string;
    applicationId?: string;
}

export interface OrderIntentResult {
    success: boolean;
    orderIntent?: OrderIntent;
    error?: string;
}

/**
 * Order Intent Service
 * Manages the complete purchase flow from checkout to merchant fulfillment
 */

/**
 * Create a new order intent from checkout session
 */
export async function createOrderIntent(
    params: CreateOrderIntentParams
): Promise<OrderIntentResult> {
    try {
        const { data: orderIntent, error } = await supabase
            .from('order_intents')
            .insert({
                checkout_session_id: params.checkoutSessionId,
                customer_id: params.customerId,
                application_id: params.applicationId,
                status: 'created',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating order intent:', error);
            return {
                success: false,
                error: 'Failed to create order intent',
            };
        }

        return {
            success: true,
            orderIntent,
        };
    } catch (error: any) {
        console.error('Order intent creation error:', error);
        return {
            success: false,
            error: error.message || 'Failed to create order intent',
        };
    }
}

/**
 * Get order intent by ID
 */
export async function getOrderIntent(intentId: string): Promise<OrderIntent | null> {
    const { data, error } = await supabase
        .from('order_intents')
        .select('*')
        .eq('id', intentId)
        .single();

    if (error) {
        console.error('Error fetching order intent:', error);
        return null;
    }

    return data;
}

/**
 * Get order intent by checkout session
 */
export async function getOrderIntentBySession(
    sessionId: string
): Promise<OrderIntent | null> {
    const { data, error } = await supabase
        .from('order_intents')
        .select('*')
        .eq('checkout_session_id', sessionId)
        .single();

    if (error) {
        console.error('Error fetching order intent:', error);
        return null;
    }

    return data;
}

/**
 * Approve order intent and notify merchant
 */
export async function approveOrderIntent(
    intentId: string,
    applicationId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Update order intent status
        const { error: updateError } = await supabase
            .from('order_intents')
            .update({
                status: 'approved',
                application_id: applicationId,
                updated_at: new Date().toISOString(),
            })
            .eq('id', intentId);

        if (updateError) {
            console.error('Error updating order intent:', updateError);
            return { success: false, error: 'Failed to approve order intent' };
        }

        // Get order intent with session details
        const { data: intent, error: fetchError } = await supabase
            .from('order_intents')
            .select(`
        *,
        checkout_session:merchant_checkout_sessions(*)
      `)
            .eq('id', intentId)
            .single();

        if (fetchError || !intent) {
            return { success: false, error: 'Failed to fetch order intent details' };
        }

        // Send webhook notification to merchant
        const session = (intent as any).checkout_session;
        if (session?.webhook_url) {
            await sendApplicationApprovedWebhook(applicationId, session.webhook_url);
        }

        // Update application with merchant notification timestamp
        await supabase
            .from('bnpl_applications')
            .update({ merchant_notified_at: new Date().toISOString() })
            .eq('id', applicationId);

        return { success: true };
    } catch (error: any) {
        console.error('Order intent approval error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Reject order intent and notify merchant
 */
export async function rejectOrderIntent(
    intentId: string,
    applicationId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Update order intent status
        const { error: updateError } = await supabase
            .from('order_intents')
            .update({
                status: 'rejected',
                application_id: applicationId,
                updated_at: new Date().toISOString(),
            })
            .eq('id', intentId);

        if (updateError) {
            console.error('Error updating order intent:', updateError);
            return { success: false, error: 'Failed to reject order intent' };
        }

        // Get order intent with session details
        const { data: intent, error: fetchError } = await supabase
            .from('order_intents')
            .select(`
        *,
        checkout_session:merchant_checkout_sessions(*)
      `)
            .eq('id', intentId)
            .single();

        if (fetchError || !intent) {
            return { success: false, error: 'Failed to fetch order intent details' };
        }

        // Send webhook notification to merchant
        const session = (intent as any).checkout_session;
        if (session?.webhook_url) {
            await sendApplicationRejectedWebhook(applicationId, session.webhook_url, reason);
        }

        // Update application with merchant notification timestamp
        await supabase
            .from('bnpl_applications')
            .update({ merchant_notified_at: new Date().toISOString() })
            .eq('id', applicationId);

        return { success: true };
    } catch (error: any) {
        console.error('Order intent rejection error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Complete order intent (merchant confirmed fulfillment)
 */
export async function completeOrderIntent(
    intentId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('order_intents')
            .update({
                status: 'completed',
                updated_at: new Date().toISOString(),
            })
            .eq('id', intentId);

        if (error) {
            console.error('Error completing order intent:', error);
            return { success: false, error: 'Failed to complete order intent' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Order intent completion error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Cancel order intent
 */
export async function cancelOrderIntent(
    intentId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('order_intents')
            .update({
                status: 'cancelled',
                updated_at: new Date().toISOString(),
            })
            .eq('id', intentId);

        if (error) {
            console.error('Error cancelling order intent:', error);
            return { success: false, error: 'Failed to cancel order intent' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Order intent cancellation error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Mark order intent as failed
 */
export async function failOrderIntent(
    intentId: string,
    errorMessage: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('order_intents')
            .update({
                status: 'failed',
                updated_at: new Date().toISOString(),
            })
            .eq('id', intentId);

        if (error) {
            console.error('Error marking order intent as failed:', error);
            return { success: false, error: 'Failed to mark order intent as failed' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Order intent failure error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get order intents for a merchant
 */
export async function getMerchantOrderIntents(
    merchantId: string,
    status?: string
): Promise<OrderIntent[]> {
    let query = supabase
        .from('order_intents')
        .select(`
      *,
      checkout_session:merchant_checkout_sessions!inner(
        merchant_id
      )
    `)
        .eq('checkout_session.merchant_id', merchantId)
        .order('created_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching merchant order intents:', error);
        return [];
    }

    return data || [];
}

/**
 * Get customer order intents for a customer
 */
export async function getCustomerOrderIntents(
    customerId: string,
    status?: string
): Promise<OrderIntent[]> {
    let query = supabase
        .from('order_intents')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching customer order intents:', error);
        return [];
    }

    return data || [];
}
