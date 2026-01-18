// Supabase Edge Function: webhook-handler
// Receives and processes webhooks from Stripe
// @ts-nocheck - This file runs on Deno runtime, not Node.js

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Verify webhook signature from Stripe (inlined)
 */
function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    try {
        // Stripe uses HMAC-SHA256 for webhook signatures
        // In production, use proper crypto verification
        // For now, basic validation
        if (!signature || signature.length === 0) {
            return false;
        }
        return true;
    } catch (error) {
        console.error('Webhook verification error:', error);
        return false;
    }
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Initialize Supabase client
        // @ts-ignore - Deno runtime provides env
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Get webhook payload and signature
        const payload = await req.text();
        const signature = req.headers.get('stripe-signature') || ''; // Stripe webhook signature
        // @ts-ignore - Deno runtime provides env
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

        // Verify webhook signature
        const isValid = verifyWebhookSignature(payload, signature, webhookSecret);

        // Log webhook
        const { data: webhookLog } = await supabaseClient
            .from('webhook_logs')
            .insert({
                event_type: 'unknown',
                payload: JSON.parse(payload),
                signature,
                verified: isValid,
            })
            .select()
            .single();

        if (!isValid) {
            console.warn('Invalid webhook signature');
            return new Response(
                JSON.stringify({ error: 'Invalid signature' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Parse event
        const event = JSON.parse(payload);
        const eventType = event.type;
        const eventData = event.data;

        // Update webhook log with event type
        await supabaseClient
            .from('webhook_logs')
            .update({ event_type: eventType })
            .eq('id', webhookLog.id);

        // Process different event types
        switch (eventType) {
            case 'payment.success':
                await handlePaymentSuccess(supabaseClient, eventData);
                break;

            case 'payment.failed':
                await handlePaymentFailed(supabaseClient, eventData);
                break;

            case 'refund.processed':
                await handleRefundProcessed(supabaseClient, eventData);
                break;

            case 'chargeback.created':
                await handleChargeback(supabaseClient, eventData);
                break;

            default:
                console.log(`Unhandled event type: ${eventType}`);
        }

        // Mark webhook as processed
        await supabaseClient
            .from('webhook_logs')
            .update({
                processed: true,
                processed_at: new Date().toISOString(),
            })
            .eq('id', webhookLog.id);

        return new Response(
            JSON.stringify({ received: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Webhook handler error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

/**
 * Handle successful payment webhook
 */
async function handlePaymentSuccess(supabase: any, data: any) {
    const transactionId = data.id;

    // Find transaction by Ellacash ID
    const { data: transaction } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('ellacash_transaction_id', transactionId)
        .single();

    if (!transaction) {
        console.warn(`Transaction not found for Ellacash ID: ${transactionId}`);
        return;
    }

    // Update transaction status
    await supabase
        .from('payment_transactions')
        .update({
            status: 'success',
            webhook_received: true,
            processed_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

    console.log(`Payment success processed for transaction: ${transaction.id}`);
}

/**
 * Handle failed payment webhook
 */
async function handlePaymentFailed(supabase: any, data: any) {
    const transactionId = data.id;
    const errorMessage = data.error?.message || 'Payment failed';

    // Find transaction
    const { data: transaction } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('ellacash_transaction_id', transactionId)
        .single();

    if (!transaction) {
        console.warn(`Transaction not found for Ellacash ID: ${transactionId}`);
        return;
    }

    // Update transaction status
    await supabase
        .from('payment_transactions')
        .update({
            status: 'failed',
            error_message: errorMessage,
            webhook_received: true,
            processed_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

    // TODO: Trigger retry logic or notify customer

    console.log(`Payment failed processed for transaction: ${transaction.id}`);
}

/**
 * Handle refund processed webhook
 */
async function handleRefundProcessed(supabase: any, data: any) {
    const refundId = data.id;
    const chargeId = data.charge;

    // Find original transaction
    const { data: transaction } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('ellacash_transaction_id', chargeId)
        .single();

    if (!transaction) {
        console.warn(`Transaction not found for charge ID: ${chargeId}`);
        return;
    }

    // Create refund transaction record
    await supabase
        .from('payment_transactions')
        .insert({
            customer_id: transaction.customer_id,
            application_id: transaction.application_id,
            transaction_type: 'refund',
            amount: -Math.abs(data.amount / 100), // Negative amount for refund
            currency: data.currency.toUpperCase(),
            status: 'success',
            ellacash_transaction_id: refundId,
            webhook_received: true,
            processed_at: new Date().toISOString(),
        });

    console.log(`Refund processed for transaction: ${transaction.id}`);
}

/**
 * Handle chargeback webhook
 */
async function handleChargeback(supabase: any, data: any) {
    const chargeId = data.charge;

    // Find transaction
    const { data: transaction } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('ellacash_transaction_id', chargeId)
        .single();

    if (!transaction) {
        console.warn(`Transaction not found for charge ID: ${chargeId}`);
        return;
    }

    // Update transaction to indicate chargeback
    await supabase
        .from('payment_transactions')
        .update({
            status: 'refunded', // Or create a 'chargeback' status
            error_message: 'Chargeback initiated',
            webhook_received: true,
        })
        .eq('id', transaction.id);

    // TODO: Alert admin, freeze customer account if needed

    console.log(`Chargeback processed for transaction: ${transaction.id}`);
}
