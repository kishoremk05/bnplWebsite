import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import crypto from 'crypto';

type WebhookLog = Tables<'webhook_logs'>;

export interface WebhookPayload {
    event: string;
    data: Record<string, any>;
    timestamp: string;
}

export interface SendWebhookParams {
    url: string;
    payload: WebhookPayload;
    secret?: string;
    checkoutSessionId?: string;
    applicationId?: string;
}

/**
 * Webhook Service
 * Handles webhook delivery to merchants with retry logic
 */

/**
 * Generate HMAC signature for webhook payload
 */
function generateWebhookSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Send webhook to merchant
 */
export async function sendWebhook(params: SendWebhookParams): Promise<{
    success: boolean;
    logId?: string;
    error?: string;
}> {
    const payloadString = JSON.stringify(params.payload);

    try {
        // Prepare headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'RegalPay-Webhook/1.0',
            'X-RegalPay-Event': params.payload.event,
        };

        // Add signature if secret provided
        if (params.secret) {
            const signature = generateWebhookSignature(payloadString, params.secret);
            headers['X-RegalPay-Signature'] = signature;
        }

        // Send webhook
        const response = await fetch(params.url, {
            method: 'POST',
            headers,
            body: payloadString,
        });

        const responseBody = await response.text();
        const success = response.ok;

        // Log webhook attempt
        const { data: log, error: logError } = await supabase
            .from('webhook_logs')
            .insert({
                checkout_session_id: params.checkoutSessionId,
                application_id: params.applicationId,
                webhook_url: params.url,
                event_type: params.payload.event,
                payload: params.payload.data,
                response_status: response.status,
                response_body: responseBody.substring(0, 1000), // Limit length
                success,
                attempt_number: 1,
                error_message: success ? null : `HTTP ${response.status}`,
            })
            .select('id')
            .single();

        if (logError) {
            console.error('Error logging webhook:', logError);
        }

        if (!success) {
            // Schedule retry for failed webhook
            await scheduleWebhookRetry(log?.id, params);
        }

        return {
            success,
            logId: log?.id,
            error: success ? undefined : `Webhook failed with status ${response.status}`,
        };
    } catch (error: any) {
        console.error('Webhook delivery error:', error);

        // Log failed attempt
        const { data: log } = await supabase
            .from('webhook_logs')
            .insert({
                checkout_session_id: params.checkoutSessionId,
                application_id: params.applicationId,
                webhook_url: params.url,
                event_type: params.payload.event,
                payload: params.payload.data,
                success: false,
                attempt_number: 1,
                error_message: error.message,
            })
            .select('id')
            .single();

        // Schedule retry
        await scheduleWebhookRetry(log?.id, params);

        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Schedule webhook retry
 */
async function scheduleWebhookRetry(
    logId: string | undefined,
    params: SendWebhookParams
): Promise<void> {
    if (!logId) return;

    // Calculate next retry time (exponential backoff: 1min, 5min, 15min)
    const nextRetry = new Date();
    nextRetry.setMinutes(nextRetry.getMinutes() + 1);

    await supabase
        .from('webhook_logs')
        .update({ next_retry_at: nextRetry.toISOString() })
        .eq('id', logId);
}

/**
 * Retry failed webhook
 */
export async function retryWebhook(logId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        // Get original webhook log
        const { data: log, error: fetchError } = await supabase
            .from('webhook_logs')
            .select('*')
            .eq('id', logId)
            .single();

        if (fetchError || !log) {
            return { success: false, error: 'Webhook log not found' };
        }

        // Don't retry if already successful
        if (log.success) {
            return { success: true };
        }

        // Max 3 retry attempts
        if (log.attempt_number >= 3) {
            return { success: false, error: 'Max retry attempts reached' };
        }

        // Prepare payload
        const payloadString = JSON.stringify({
            event: log.event_type,
            data: log.payload,
            timestamp: new Date().toISOString(),
        });

        // Send webhook
        const response = await fetch(log.webhook_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'RegalPay-Webhook/1.0',
                'X-RegalPay-Event': log.event_type,
                'X-RegalPay-Retry': log.attempt_number.toString(),
            },
            body: payloadString,
        });

        const responseBody = await response.text();
        const success = response.ok;

        // Update log
        const updateData: any = {
            response_status: response.status,
            response_body: responseBody.substring(0, 1000),
            success,
            attempt_number: log.attempt_number + 1,
            error_message: success ? null : `HTTP ${response.status}`,
        };

        // Schedule next retry if still failing
        if (!success && log.attempt_number < 2) {
            const nextRetry = new Date();
            const retryDelay = log.attempt_number === 1 ? 5 : 15; // 5min, then 15min
            nextRetry.setMinutes(nextRetry.getMinutes() + retryDelay);
            updateData.next_retry_at = nextRetry.toISOString();
        }

        await supabase.from('webhook_logs').update(updateData).eq('id', logId);

        return { success };
    } catch (error: any) {
        console.error('Webhook retry error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get pending webhook retries
 */
export async function getPendingWebhookRetries(): Promise<WebhookLog[]> {
    const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('success', false)
        .not('next_retry_at', 'is', null)
        .lte('next_retry_at', new Date().toISOString())
        .lt('attempt_number', 3);

    if (error) {
        console.error('Error fetching pending retries:', error);
        return [];
    }

    return data || [];
}

/**
 * Send checkout completed webhook
 */
export async function sendCheckoutCompletedWebhook(
    sessionId: string,
    applicationId: string,
    webhookUrl: string,
    secret?: string
): Promise<void> {
    // Get session and application details
    const { data: session } = await supabase
        .from('merchant_checkout_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

    const { data: application } = await supabase
        .from('bnpl_applications')
        .select('*, plan:bnpl_plans(*)')
        .eq('id', applicationId)
        .single();

    if (!session || !application) return;

    await sendWebhook({
        url: webhookUrl,
        payload: {
            event: 'checkout.completed',
            data: {
                session_id: session.id,
                session_token: session.session_token,
                order_id: session.order_id,
                order_amount: session.order_amount,
                application_id: application.id,
                application_status: application.status,
                customer_id: application.customer_id,
            },
            timestamp: new Date().toISOString(),
        },
        secret,
        checkoutSessionId: sessionId,
        applicationId,
    });
}

/**
 * Send application approved webhook
 */
export async function sendApplicationApprovedWebhook(
    applicationId: string,
    webhookUrl: string,
    secret?: string
): Promise<void> {
    const { data: application } = await supabase
        .from('bnpl_applications')
        .select('*, merchant:merchant_profiles(*), plan:bnpl_plans(*)')
        .eq('id', applicationId)
        .single();

    if (!application) return;

    await sendWebhook({
        url: webhookUrl,
        payload: {
            event: 'application.approved',
            data: {
                application_id: application.id,
                order_id: application.merchant_order_id,
                purchase_amount: application.purchase_amount,
                total_amount: application.total_amount,
                customer_id: application.customer_id,
                approved_at: application.approved_at,
                plan: {
                    name: application.plan?.name,
                    installments: application.plan?.installments,
                    interest_rate: application.plan?.interest_rate,
                },
            },
            timestamp: new Date().toISOString(),
        },
        secret,
        applicationId,
    });
}

/**
 * Send application rejected webhook
 */
export async function sendApplicationRejectedWebhook(
    applicationId: string,
    webhookUrl: string,
    reason: string,
    secret?: string
): Promise<void> {
    const { data: application } = await supabase
        .from('bnpl_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

    if (!application) return;

    await sendWebhook({
        url: webhookUrl,
        payload: {
            event: 'application.rejected',
            data: {
                application_id: application.id,
                order_id: application.merchant_order_id,
                customer_id: application.customer_id,
                reason,
            },
            timestamp: new Date().toISOString(),
        },
        secret,
        applicationId,
    });
}
