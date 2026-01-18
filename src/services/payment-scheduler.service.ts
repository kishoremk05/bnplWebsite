// Payment Scheduler Service
// Handles recurring payment processing, retry logic, and default handling

import { supabase } from '@/integrations/supabase/client';
import { PaymentSchedule, Transaction } from '@/types/database';

export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
    retryable?: boolean;
}

export interface ScheduledPaymentJob {
    scheduleId: string;
    applicationId: string;
    customerId: string;
    amount: number;
    dueDate: string;
    attemptNumber: number;
}

// Grace period in days after due date
export const GRACE_PERIOD_DAYS = 3;

// Maximum retry attempts for failed payments
export const MAX_RETRY_ATTEMPTS = 3;

// Late fee percentage
export const LATE_FEE_PERCENTAGE = 5;

/**
 * Get all payments due today or overdue
 */
export async function getDuePayments(): Promise<ScheduledPaymentJob[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('payment_schedules')
        .select(`
      id,
      application_id,
      amount,
      due_date,
      bnpl_applications (
        customer_id
      )
    `)
        .eq('status', 'scheduled')
        .lte('due_date', today);

    if (error || !data) {
        console.error('Error fetching due payments:', error);
        return [];
    }

    return data.map(schedule => ({
        scheduleId: schedule.id,
        applicationId: schedule.application_id,
        customerId: (schedule.bnpl_applications as any).customer_id,
        amount: schedule.amount,
        dueDate: schedule.due_date,
        attemptNumber: 1,
    }));
}

/**
 * Process a single scheduled payment
 * This will be called by Edge Function with actual payment processor integration
 */
export async function processScheduledPayment(
    job: ScheduledPaymentJob
): Promise<PaymentResult> {
    try {
        // Update schedule status to processing
        await supabase
            .from('payment_schedules')
            .update({ status: 'processing' })
            .eq('id', job.scheduleId);

        // Get customer's default payment method
        const { data: paymentMethod } = await supabase
            .from('customer_payment_methods')
            .select('*')
            .eq('customer_id', job.customerId)
            .eq('is_default', true)
            .single();

        if (!paymentMethod) {
            // No payment method - mark as failed
            await supabase
                .from('payment_schedules')
                .update({ status: 'scheduled' }) // Keep as scheduled for retry
                .eq('id', job.scheduleId);

            return {
                success: false,
                error: 'No payment method on file',
                retryable: true,
            };
        }

        // Create transaction record
        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .insert({
                application_id: job.applicationId,
                customer_id: job.customerId,
                amount: job.amount,
                transaction_type: 'payment',
                status: 'processing',
                payment_method: paymentMethod.card_type,
                payment_processor: paymentMethod.processor,
            })
            .select()
            .single();

        if (txError || !transaction) {
            return {
                success: false,
                error: 'Failed to create transaction record',
                retryable: true,
            };
        }

        // TODO: Actual payment processor call would go here
        // For now, simulate success (this will be replaced with real processor integration)
        const processorResult = await simulatePaymentProcessing(
            paymentMethod.token,
            job.amount
        );

        if (processorResult.success) {
            // Update transaction as completed
            await supabase
                .from('transactions')
                .update({
                    status: 'completed',
                    processor_transaction_id: processorResult.transactionId,
                })
                .eq('id', transaction.id);

            // Update payment schedule as completed
            await supabase
                .from('payment_schedules')
                .update({
                    status: 'completed',
                    paid_amount: job.amount,
                    paid_at: new Date().toISOString(),
                    transaction_id: transaction.id,
                })
                .eq('id', job.scheduleId);

            // Check if all payments completed for this application
            await checkApplicationCompletion(job.applicationId);

            return {
                success: true,
                transactionId: transaction.id,
            };
        } else {
            // Payment failed
            await supabase
                .from('transactions')
                .update({
                    status: 'failed',
                    error_message: processorResult.error,
                })
                .eq('id', transaction.id);

            // Keep schedule as 'scheduled' for retry if retryable
            if (processorResult.retryable) {
                await supabase
                    .from('payment_schedules')
                    .update({ status: 'scheduled' })
                    .eq('id', job.scheduleId);
            } else {
                await supabase
                    .from('payment_schedules')
                    .update({ status: 'failed' })
                    .eq('id', job.scheduleId);
            }

            return {
                success: false,
                error: processorResult.error,
                retryable: processorResult.retryable,
            };
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        return {
            success: false,
            error: 'Unexpected error processing payment',
            retryable: true,
        };
    }
}

/**
 * Simulate payment processing (placeholder for real processor)
 */
async function simulatePaymentProcessing(
    token: string,
    amount: number
): Promise<{ success: boolean; transactionId?: string; error?: string; retryable?: boolean }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // For development: simulate 95% success rate
    const isSuccess = Math.random() > 0.05;

    if (isSuccess) {
        return {
            success: true,
            transactionId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
    } else {
        return {
            success: false,
            error: 'Simulated payment failure',
            retryable: true,
        };
    }
}

/**
 * Check if all payments are completed for an application
 */
async function checkApplicationCompletion(applicationId: string): Promise<void> {
    const { data: schedules } = await supabase
        .from('payment_schedules')
        .select('status')
        .eq('application_id', applicationId);

    if (!schedules) return;

    const allCompleted = schedules.every(s => s.status === 'completed');

    if (allCompleted) {
        // Update application status to completed
        await supabase
            .from('bnpl_applications')
            .update({ status: 'completed' })
            .eq('id', applicationId);

        // Restore customer's available credit
        const { data: application } = await supabase
            .from('bnpl_applications')
            .select('customer_id, purchase_amount')
            .eq('id', applicationId)
            .single();

        if (application) {
            const { data: profile } = await supabase
                .from('customer_profiles')
                .select('available_credit')
                .eq('id', application.customer_id)
                .single();

            if (profile) {
                await supabase
                    .from('customer_profiles')
                    .update({
                        available_credit: profile.available_credit + application.purchase_amount,
                    })
                    .eq('id', application.customer_id);
            }
        }
    }
}

/**
 * Calculate late fee for overdue payment
 */
export function calculateLateFee(amount: number, daysOverdue: number): number {
    if (daysOverdue <= GRACE_PERIOD_DAYS) {
        return 0;
    }
    return Math.round((amount * LATE_FEE_PERCENTAGE) / 100 * 100) / 100;
}

/**
 * Check for defaulted applications (3+ missed payments)
 */
export async function detectDefaults(): Promise<string[]> {
    const today = new Date().toISOString().split('T')[0];
    const defaultedApplications: string[] = [];

    // Get all active applications
    const { data: applications } = await supabase
        .from('bnpl_applications')
        .select('id')
        .eq('status', 'active');

    if (!applications) return [];

    for (const app of applications) {
        // Count overdue payments
        const { count } = await supabase
            .from('payment_schedules')
            .select('*', { count: 'exact', head: true })
            .eq('application_id', app.id)
            .eq('status', 'scheduled')
            .lt('due_date', today);

        if (count && count >= 3) {
            // Mark as defaulted
            await supabase
                .from('bnpl_applications')
                .update({
                    status: 'defaulted',
                    approval_notes: 'Automatically defaulted: 3+ missed payments',
                })
                .eq('id', app.id);

            defaultedApplications.push(app.id);
        }
    }

    return defaultedApplications;
}

/**
 * Process manual payment from customer
 */
export async function processManualPayment(
    scheduleId: string,
    customerId: string,
    paymentMethodId: string
): Promise<PaymentResult> {
    // Fetch schedule details
    const { data: schedule, error: schedError } = await supabase
        .from('payment_schedules')
        .select(`
      *,
      bnpl_applications (
        id,
        customer_id
      )
    `)
        .eq('id', scheduleId)
        .single();

    if (schedError || !schedule) {
        return { success: false, error: 'Payment schedule not found' };
    }

    // Verify customer owns this schedule
    if ((schedule.bnpl_applications as any).customer_id !== customerId) {
        return { success: false, error: 'Unauthorized' };
    }

    // Get payment method
    const { data: paymentMethod } = await supabase
        .from('customer_payment_methods')
        .select('*')
        .eq('id', paymentMethodId)
        .eq('customer_id', customerId)
        .single();

    if (!paymentMethod) {
        return { success: false, error: 'Payment method not found' };
    }

    // Process payment
    return processScheduledPayment({
        scheduleId: schedule.id,
        applicationId: schedule.application_id,
        customerId,
        amount: schedule.amount,
        dueDate: schedule.due_date,
        attemptNumber: 1,
    });
}
