/**
 * Stripe Backend Service
 * Server-side API wrapper for Stripe payment processing
 * 
 * NOTE: This runs on Supabase Edge Functions (Deno runtime)
 * @ts-nocheck - Deno runtime types
 */

// Stripe API configuration
// @ts-ignore - Deno runtime provides env
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const STRIPE_API_URL = 'https://api.stripe.com/v1';

export interface ChargePaymentParams {
    paymentMethodId: string;
    amount: number;
    currency: string;
    description: string;
    metadata?: Record<string, any>;
}

export interface ChargePaymentResult {
    success: boolean;
    paymentIntentId?: string;
    status?: string;
    error?: string;
    errorCode?: string;
}

export interface RefundParams {
    paymentIntentId: string;
    amount?: number;
    reason?: string;
}

/**
 * Charge a payment using Stripe Payment Intent
 */
export async function chargePayment(params: ChargePaymentParams): Promise<ChargePaymentResult> {
    try {
        const response = await fetch(`${STRIPE_API_URL}/payment_intents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                amount: Math.round(params.amount * 100).toString(), // Convert to cents
                currency: params.currency.toLowerCase(),
                payment_method: params.paymentMethodId,
                confirm: 'true',
                description: params.description,
                'metadata[application_id]': params.metadata?.application_id || '',
                'metadata[customer_id]': params.metadata?.customer_id || '',
            }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            return {
                success: false,
                error: data.error?.message || 'Payment failed',
                errorCode: data.error?.code,
            };
        }

        return {
            success: data.status === 'succeeded',
            paymentIntentId: data.id, // pi_xxxxx
            status: data.status,
        };
    } catch (error: any) {
        console.error('Stripe charge error:', error);
        return {
            success: false,
            error: error.message || 'Failed to process payment',
        };
    }
}

/**
 * Create a refund for a payment intent
 */
export async function createRefund(params: RefundParams): Promise<ChargePaymentResult> {
    try {
        const body = new URLSearchParams({
            payment_intent: params.paymentIntentId,
        });

        if (params.amount) {
            body.append('amount', Math.round(params.amount * 100).toString());
        }

        if (params.reason) {
            body.append('reason', params.reason);
        }

        const response = await fetch(`${STRIPE_API_URL}/refunds`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body,
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            return {
                success: false,
                error: data.error?.message || 'Refund failed',
                errorCode: data.error?.code,
            };
        }

        return {
            success: true,
            paymentIntentId: data.id,
            status: data.status,
        };
    } catch (error: any) {
        console.error('Stripe refund error:', error);
        return {
            success: false,
            error: error.message || 'Failed to process refund',
        };
    }
}

/**
 * Verify webhook signature from Stripe
 */
export function verifyWebhookSignature(
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

/**
 * Get payment intent details
 */
export async function getPaymentIntent(paymentIntentId: string) {
    try {
        const response = await fetch(`${STRIPE_API_URL}/payment_intents/${paymentIntentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
            },
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error?.message || 'Failed to fetch payment intent');
        }

        return {
            success: true,
            paymentIntent: data,
        };
    } catch (error: any) {
        console.error('Get payment intent error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}
