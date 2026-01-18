// Supabase Edge Function: charge-payment
// Processes payment charges using Stripe
// @ts-nocheck - This file runs on Deno runtime, not Node.js

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Stripe API configuration (inlined)
// @ts-ignore - Deno runtime provides env
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const STRIPE_API_URL = 'https://api.stripe.com/v1';

// Debug: Log if key is loaded (first 7 chars only for security)
console.log('Stripe key loaded:', STRIPE_SECRET_KEY ? `${STRIPE_SECRET_KEY.substring(0, 7)}...` : 'NOT FOUND');

interface ChargePaymentParams {
    paymentMethodId: string;
    amount: number;
    currency: string;
    description: string;
    metadata?: Record<string, any>;
}

interface ChargePaymentResult {
    success: boolean;
    paymentIntentId?: string;
    status?: string;
    error?: string;
    errorCode?: string;
}

/**
 * Charge a payment using Mock Stripe (for development without activation)
 */
async function chargePayment(params: ChargePaymentParams): Promise<ChargePaymentResult> {
    try {
        console.log('🧪 MOCK STRIPE MODE - Simulating payment...');
        console.log('Payment details:', {
            amount: params.amount,
            currency: params.currency,
            description: params.description,
        });

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate mock payment intent ID
        const mockPaymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        console.log('✅ Mock payment successful!');
        console.log('Mock Payment Intent ID:', mockPaymentIntentId);

        return {
            success: true,
            paymentIntentId: mockPaymentIntentId,
            status: 'succeeded',
        };
    } catch (error: any) {
        console.error('Mock payment error:', error);
        return {
            success: false,
            error: error.message || 'Failed to process mock payment',
        };
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

        // Get request body
        const {
            payment_method_token,
            amount,
            currency = 'INR',
            application_id,
            payment_schedule_id,
            transaction_type = 'down_payment',
            customer_id,
            metadata = {},
        } = await req.json();

        // Validate required fields
        if (!payment_method_token || !amount || !customer_id) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Create pending transaction record
        const { data: transaction, error: txnError } = await supabaseClient
            .from('payment_transactions')
            .insert({
                customer_id,
                application_id,
                payment_schedule_id,
                transaction_type,
                amount,
                currency,
                status: 'processing',
                payment_method_token,
                metadata,
            })
            .select()
            .single();

        if (txnError) {
            throw new Error(`Failed to create transaction: ${txnError.message}`);
        }

        // Charge payment via Stripe
        const chargeResult = await chargePayment({
            paymentMethodId: payment_method_token, // Stripe Payment Method ID
            amount,
            currency,
            description: `${transaction_type} for application ${application_id || 'N/A'}`,
            metadata: {
                ...metadata,
                transaction_id: transaction.id,
                customer_id,
            },
        });

        // Update transaction with result
        const updateData: any = {
            processed_at: new Date().toISOString(),
        };

        if (chargeResult.success) {
            updateData.status = 'success';
            updateData.stripe_payment_intent_id = chargeResult.paymentIntentId; // Stripe Payment Intent ID
        } else {
            updateData.status = 'failed';
            updateData.error_message = chargeResult.error;
            updateData.error_code = chargeResult.errorCode;
        }

        await supabaseClient
            .from('payment_transactions')
            .update(updateData)
            .eq('id', transaction.id);

        // If successful and this is a down payment, update application status
        if (chargeResult.success && transaction_type === 'down_payment' && application_id) {
            await supabaseClient
                .from('bnpl_applications')
                .update({
                    status: 'active',
                    down_payment_paid: true,
                    down_payment_date: new Date().toISOString(),
                })
                .eq('id', application_id);
        }

        // If successful installment, update payment schedule
        if (chargeResult.success && transaction_type === 'installment' && payment_schedule_id) {
            await supabaseClient
                .from('payment_schedules')
                .update({
                    status: 'paid',
                    paid_date: new Date().toISOString(),
                })
                .eq('id', payment_schedule_id);
        }

        return new Response(
            JSON.stringify({
                success: chargeResult.success,
                transaction_id: transaction.id,
                stripe_payment_intent_id: chargeResult.paymentIntentId,
                status: chargeResult.success ? 'success' : 'failed',
                error: chargeResult.error,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Charge payment error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
