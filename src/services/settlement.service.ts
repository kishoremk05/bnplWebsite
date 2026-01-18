import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type MerchantSettlement = Tables<'merchant_settlements'>;

export interface CreateSettlementParams {
    merchantId: string;
    applicationId: string;
    settlementAmount: number;
    feesDeducted?: number;
    settlementDate?: Date;
    paymentMethod?: 'ach' | 'wire' | 'check' | 'platform_credit';
}

export interface SettlementResult {
    success: boolean;
    settlement?: MerchantSettlement;
    error?: string;
}

/**
 * Settlement Service
 * Manages merchant payouts for approved BNPL applications
 */

/**
 * Create a settlement for a merchant
 */
export async function createMerchantSettlement(
    params: CreateSettlementParams
): Promise<SettlementResult> {
    try {
        // Verify application exists and is approved
        const { data: application, error: appError } = await supabase
            .from('bnpl_applications')
            .select('*')
            .eq('id', params.applicationId)
            .single();

        if (appError || !application) {
            return {
                success: false,
                error: 'Application not found',
            };
        }

        if (application.status !== 'approved' && application.status !== 'active') {
            return {
                success: false,
                error: 'Application must be approved or active to create settlement',
            };
        }

        // Check if settlement already exists
        const { data: existing } = await supabase
            .from('merchant_settlements')
            .select('id')
            .eq('application_id', params.applicationId)
            .single();

        if (existing) {
            return {
                success: false,
                error: 'Settlement already exists for this application',
            };
        }

        // Calculate fees and net amount
        const feesDeducted = params.feesDeducted || 0;
        const netAmount = params.settlementAmount - feesDeducted;

        // Determine settlement date (default to 2 days from now)
        const settlementDate = params.settlementDate || new Date();
        if (!params.settlementDate) {
            settlementDate.setDate(settlementDate.getDate() + 2);
        }

        // Create settlement
        const { data: settlement, error } = await supabase
            .from('merchant_settlements')
            .insert({
                merchant_id: params.merchantId,
                application_id: params.applicationId,
                settlement_amount: params.settlementAmount,
                fees_deducted: feesDeducted,
                net_amount: netAmount,
                settlement_date: settlementDate.toISOString().split('T')[0],
                payment_method: params.paymentMethod || 'ach',
                status: 'scheduled',
            })
            .select()
            .single();

        if (error || !settlement) {
            console.error('Error creating settlement:', error);
            return {
                success: false,
                error: 'Failed to create settlement',
            };
        }

        return {
            success: true,
            settlement,
        };
    } catch (error: any) {
        console.error('Settlement creation error:', error);
        return {
            success: false,
            error: error.message || 'Failed to create settlement',
        };
    }
}

/**
 * Get settlements for a merchant
 */
export async function getMerchantSettlements(
    merchantId: string,
    status?: string
): Promise<MerchantSettlement[]> {
    try {
        let query = supabase
            .from('merchant_settlements')
            .select(`
        *,
        application:bnpl_applications(
          id,
          purchase_amount,
          total_amount,
          customer_id
        )
      `)
            .eq('merchant_id', merchantId)
            .order('settlement_date', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching settlements:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error getting merchant settlements:', error);
        return [];
    }
}

/**
 * Get scheduled settlements (due for processing)
 */
export async function getScheduledSettlements(date?: Date): Promise<MerchantSettlement[]> {
    try {
        const targetDate = date || new Date();
        const dateString = targetDate.toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('merchant_settlements')
            .select(`
        *,
        merchant:merchant_profiles(
          id,
          business_name,
          user_id
        ),
        application:bnpl_applications(
          id,
          purchase_amount
        )
      `)
            .eq('status', 'scheduled')
            .lte('settlement_date', dateString)
            .order('settlement_date', { ascending: true });

        if (error) {
            console.error('Error fetching scheduled settlements:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error getting scheduled settlements:', error);
        return [];
    }
}

/**
 * Process a settlement (execute payment)
 */
export async function processSettlement(
    settlementId: string,
    paymentReference?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Get settlement details
        const { data: settlement, error: fetchError } = await supabase
            .from('merchant_settlements')
            .select('*')
            .eq('id', settlementId)
            .single();

        if (fetchError || !settlement) {
            return { success: false, error: 'Settlement not found' };
        }

        if (settlement.status !== 'scheduled') {
            return {
                success: false,
                error: `Cannot process settlement with status: ${settlement.status}`,
            };
        }

        // Update settlement to processing
        await supabase
            .from('merchant_settlements')
            .update({ status: 'processing' })
            .eq('id', settlementId);

        try {
            // Here you would integrate with payment processor (ACH, Wire, etc.)
            // For now, we'll simulate successful payment

            // Simulate payment processing delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Mark as completed
            const { error: completeError } = await supabase
                .from('merchant_settlements')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    payment_reference: paymentReference || `PAY_${Date.now()}`,
                })
                .eq('id', settlementId);

            if (completeError) {
                throw new Error('Failed to mark settlement as completed');
            }

            // Log capital transaction
            await supabase.from('capital_transactions').insert({
                transaction_type: 'fee',
                amount: settlement.fees_deducted,
                settlement_id: settlementId,
                application_id: settlement.application_id,
                description: `Platform fees collected from settlement ${settlementId}`,
                balance_before: 0,
                balance_after: settlement.fees_deducted,
            });

            return { success: true };
        } catch (error: any) {
            // Mark as failed
            await supabase
                .from('merchant_settlements')
                .update({
                    status: 'failed',
                    error_message: error.message,
                })
                .eq('id', settlementId);

            return {
                success: false,
                error: error.message || 'Settlement processing failed',
            };
        }
    } catch (error: any) {
        console.error('Settlement processing error:', error);
        return {
            success: false,
            error: error.message || 'Failed to process settlement',
        };
    }
}

/**
 * Calculate merchant fee for a settlement
 * Default: 3% platform fee
 */
export function calculateMerchantFee(
    settlementAmount: number,
    feePercentage: number = 3
): number {
    return Math.round(settlementAmount * (feePercentage / 100) * 100) / 100;
}

/**
 * Auto-create settlement when application is approved
 */
export async function autoCreateSettlement(applicationId: string): Promise<void> {
    try {
        // Get application details
        const { data: application } = await supabase
            .from('bnpl_applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        if (!application || application.status !== 'approved') {
            return;
        }

        // Calculate fees
        const fees = calculateMerchantFee(application.purchase_amount);

        // Create settlement
        await createMerchantSettlement({
            merchantId: application.merchant_id,
            applicationId: application.id,
            settlementAmount: application.purchase_amount,
            feesDeducted: fees,
            paymentMethod: 'ach',
        });
    } catch (error) {
        console.error('Error auto-creating settlement:', error);
    }
}

/**
 * Cancel a scheduled settlement
 */
export async function cancelSettlement(
    settlementId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data: settlement, error: fetchError } = await supabase
            .from('merchant_settlements')
            .select('*')
            .eq('id', settlementId)
            .single();

        if (fetchError || !settlement) {
            return { success: false, error: 'Settlement not found' };
        }

        if (settlement.status !== 'scheduled') {
            return {
                success: false,
                error: `Cannot cancel settlement with status: ${settlement.status}`,
            };
        }

        const { error } = await supabase
            .from('merchant_settlements')
            .update({ status: 'cancelled' })
            .eq('id', settlementId);

        if (error) {
            return { success: false, error: 'Failed to cancel settlement' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Settlement cancellation error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get settlement statistics for a merchant
 */
export async function getMerchantSettlementStats(merchantId: string): Promise<{
    totalPaid: number;
    pendingAmount: number;
    totalFees: number;
    settlementsCount: number;
}> {
    try {
        const { data: settlements } = await supabase
            .from('merchant_settlements')
            .select('*')
            .eq('merchant_id', merchantId);

        if (!settlements || settlements.length === 0) {
            return {
                totalPaid: 0,
                pendingAmount: 0,
                totalFees: 0,
                settlementsCount: 0,
            };
        }

        const totalPaid = settlements
            .filter((s) => s.status === 'completed')
            .reduce((sum, s) => sum + s.net_amount, 0);

        const pendingAmount = settlements
            .filter((s) => s.status === 'scheduled')
            .reduce((sum, s) => sum + s.net_amount, 0);

        const totalFees = settlements.reduce((sum, s) => sum + s.fees_deducted, 0);

        return {
            totalPaid,
            pendingAmount,
            totalFees,
            settlementsCount: settlements.length,
        };
    } catch (error) {
        console.error('Error getting settlement stats:', error);
        return {
            totalPaid: 0,
            pendingAmount: 0,
            totalFees: 0,
            settlementsCount: 0,
        };
    }
}
