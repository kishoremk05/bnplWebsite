import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import crypto from 'crypto';

type CheckoutSession = Tables<'merchant_checkout_sessions'>;
type MerchantApiKey = Tables<'merchant_api_keys'>;

export interface CreateCheckoutSessionParams {
    merchantId: string;
    orderAmount: number;
    orderId: string;
    orderMetadata?: Record<string, any>;
    customerEmail?: string;
    customerPhone?: string;
    returnUrl: string;
    cancelUrl: string;
    webhookUrl?: string;
    expiresInMinutes?: number;
}

export interface CheckoutSessionResult {
    success: boolean;
    session?: CheckoutSession;
    sessionUrl?: string;
    error?: string;
}

/**
 * Checkout Service
 * Handles merchant checkout session creation and management
 */

/**
 * Generate a secure random session token
 */
function generateSessionToken(): string {
    return `cs_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Generate API key and secret for merchant
 */
export function generateApiKey(): { apiKey: string; apiSecret: string } {
    return {
        apiKey: `pk_${crypto.randomBytes(24).toString('hex')}`,
        apiSecret: `sk_${crypto.randomBytes(32).toString('hex')}`,
    };
}

/**
 * Validate merchant API key
 */
export async function validateMerchantApiKey(
    apiKey: string,
    domain?: string
): Promise<{ valid: boolean; merchantId?: string; error?: string }> {
    try {
        const { data: keyData, error } = await supabase
            .from('merchant_api_keys')
            .select('id, merchant_id, is_active, allowed_domains')
            .eq('api_key', apiKey)
            .single();

        if (error || !keyData) {
            return { valid: false, error: 'Invalid API key' };
        }

        if (!keyData.is_active) {
            return { valid: false, error: 'API key is inactive' };
        }

        // Check domain whitelist if provided
        if (domain && keyData.allowed_domains && keyData.allowed_domains.length > 0) {
            const domainAllowed = keyData.allowed_domains.some((allowedDomain) =>
                domain.includes(allowedDomain)
            );

            if (!domainAllowed) {
                return { valid: false, error: 'Domain not allowed for this API key' };
            }
        }

        // Update last used timestamp
        await supabase
            .from('merchant_api_keys')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', keyData.id);

        return { valid: true, merchantId: keyData.merchant_id };
    } catch (error: any) {
        console.error('API key validation error:', error);
        return { valid: false, error: 'Validation failed' };
    }
}

/**
 * Create a new checkout session
 */
export async function createCheckoutSession(
    params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResult> {
    try {
        // Validate merchant exists and is verified
        const { data: merchant, error: merchantError } = await supabase
            .from('merchant_profiles')
            .select('id, is_verified, business_name')
            .eq('id', params.merchantId)
            .single();

        if (merchantError || !merchant) {
            return {
                success: false,
                error: 'Invalid merchant ID',
            };
        }

        if (!merchant.is_verified) {
            return {
                success: false,
                error: 'Merchant is not verified',
            };
        }

        // Generate session token
        const sessionToken = generateSessionToken();

        // Calculate expiration time (default 30 minutes)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + (params.expiresInMinutes || 30));

        // Create checkout session
        const { data: session, error } = await supabase
            .from('merchant_checkout_sessions')
            .insert({
                merchant_id: params.merchantId,
                session_token: sessionToken,
                order_amount: params.orderAmount,
                order_id: params.orderId,
                order_metadata: params.orderMetadata || {},
                customer_email: params.customerEmail,
                customer_phone: params.customerPhone,
                return_url: params.returnUrl,
                cancel_url: params.cancelUrl,
                webhook_url: params.webhookUrl,
                expires_at: expiresAt.toISOString(),
            })
            .select()
            .single();

        if (error || !session) {
            console.error('Error creating checkout session:', error);
            return {
                success: false,
                error: 'Failed to create checkout session',
            };
        }

        // Generate checkout URL
        const baseUrl = window.location.origin;
        const sessionUrl = `${baseUrl}/checkout/${sessionToken}`;

        return {
            success: true,
            session,
            sessionUrl,
        };
    } catch (error: any) {
        console.error('Checkout session creation error:', error);
        return {
            success: false,
            error: error.message || 'Failed to create checkout session',
        };
    }
}

/**
 * Get checkout session by token
 */
export async function getCheckoutSession(
    sessionToken: string
): Promise<{ session: CheckoutSession | null; error?: string }> {
    try {
        const { data: session, error } = await supabase
            .from('merchant_checkout_sessions')
            .select(`
        *,
        merchant:merchant_profiles(
          id,
          business_name,
          website
        )
      `)
            .eq('session_token', sessionToken)
            .single();

        if (error || !session) {
            return { session: null, error: 'Session not found' };
        }

        // Check if session is expired
        if (new Date(session.expires_at) < new Date()) {
            // Mark as expired
            await supabase
                .from('merchant_checkout_sessions')
                .update({ status: 'expired' })
                .eq('id', session.id);

            return { session: null, error: 'Session has expired' };
        }

        // Check if session is already completed or cancelled
        if (session.status !== 'pending') {
            return { session: null, error: `Session is ${session.status}` };
        }

        return { session, error: undefined };
    } catch (error: any) {
        console.error('Error fetching checkout session:', error);
        return { session: null, error: 'Failed to fetch session' };
    }
}

/**
 * Complete a checkout session
 */
export async function completeCheckoutSession(
    sessionId: string,
    applicationId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('merchant_checkout_sessions')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', sessionId);

        if (error) {
            console.error('Error completing checkout session:', error);
            return { success: false, error: 'Failed to complete session' };
        }

        // Create order intent
        await supabase.from('order_intents').insert({
            checkout_session_id: sessionId,
            application_id: applicationId,
            status: 'created',
        });

        return { success: true };
    } catch (error: any) {
        console.error('Checkout session completion error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Cancel a checkout session
 */
export async function cancelCheckoutSession(
    sessionId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('merchant_checkout_sessions')
            .update({
                status: 'cancelled',
            })
            .eq('id', sessionId);

        if (error) {
            console.error('Error cancelling checkout session:', error);
            return { success: false, error: 'Failed to cancel session' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Checkout session cancellation error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create API key for merchant
 */
export async function createMerchantApiKey(
    merchantId: string,
    keyName: string,
    allowedDomains?: string[],
    environment: 'sandbox' | 'production' = 'sandbox'
): Promise<{ success: boolean; apiKey?: MerchantApiKey; error?: string }> {
    try {
        const { apiKey, apiSecret } = generateApiKey();

        const { data, error } = await supabase
            .from('merchant_api_keys')
            .insert({
                merchant_id: merchantId,
                key_name: keyName,
                api_key: apiKey,
                api_secret: apiSecret,
                allowed_domains: allowedDomains,
                environment,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating API key:', error);
            return { success: false, error: 'Failed to create API key' };
        }

        return { success: true, apiKey: data };
    } catch (error: any) {
        console.error('API key creation error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * List merchant API keys
 */
export async function getMerchantApiKeys(
    merchantId: string
): Promise<MerchantApiKey[]> {
    const { data, error } = await supabase
        .from('merchant_api_keys')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching API keys:', error);
        return [];
    }

    return data || [];
}

/**
 * Deactivate API key
 */
export async function deactivateApiKey(
    keyId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('merchant_api_keys')
            .update({ is_active: false })
            .eq('id', keyId);

        if (error) {
            return { success: false, error: 'Failed to deactivate API key' };
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
