import { supabase } from '@/integrations/supabase/client';

export interface MerchantCapitalStatus {
    merchantId: string;
    capitalLimit: number;
    currentDeployedCapital: number;
    availableCapital: number;
    utilizationPercentage: number;
}

/**
 * Merchant Capital Service
 * Manages per-merchant capital limits for BNPL deployments
 */

/**
 * Get merchant's current capital status
 */
export async function getMerchantCapitalStatus(merchantId: string): Promise<MerchantCapitalStatus | null> {
    try {
        const { data, error } = await supabase
            .from('merchant_profiles')
            .select('id, capital_limit, current_deployed_capital')
            .eq('id', merchantId)
            .single();

        if (error || !data) {
            console.error('Error fetching merchant capital status:', error);
            return null;
        }

        const capitalLimit = data.capital_limit || 10000;
        const currentDeployed = data.current_deployed_capital || 0;
        const available = capitalLimit - currentDeployed;
        const utilization = capitalLimit > 0 ? (currentDeployed / capitalLimit) * 100 : 0;

        return {
            merchantId: data.id,
            capitalLimit,
            currentDeployedCapital: currentDeployed,
            availableCapital: Math.max(0, available),
            utilizationPercentage: Math.round(utilization * 100) / 100,
        };
    } catch (error) {
        console.error('Error getting merchant capital status:', error);
        return null;
    }
}

/**
 * Check if merchant can approve a new application within their capital limit
 */
export async function checkMerchantCapitalLimit(
    merchantId: string,
    applicationAmount: number
): Promise<{ canApprove: boolean; error?: string; availableCapital?: number }> {
    try {
        const status = await getMerchantCapitalStatus(merchantId);

        if (!status) {
            return { canApprove: false, error: 'Unable to fetch merchant capital status' };
        }

        if (applicationAmount > status.availableCapital) {
            return {
                canApprove: false,
                error: `Capital limit reached. Available: $${status.availableCapital.toFixed(2)}. Required: $${applicationAmount.toFixed(2)}. Wait for customer repayments to free up capital.`,
                availableCapital: status.availableCapital,
            };
        }

        return { canApprove: true, availableCapital: status.availableCapital };
    } catch (error: any) {
        console.error('Error checking merchant capital limit:', error);
        return { canApprove: false, error: error.message };
    }
}

/**
 * Deploy capital for an approved application (increase deployed capital)
 */
export async function deployMerchantCapital(
    merchantId: string,
    amount: number
): Promise<{ success: boolean; error?: string }> {
    try {
        // First check if within limit
        const check = await checkMerchantCapitalLimit(merchantId, amount);
        if (!check.canApprove) {
            return { success: false, error: check.error };
        }

        // Get current deployed capital
        const { data: merchant, error: fetchError } = await supabase
            .from('merchant_profiles')
            .select('current_deployed_capital')
            .eq('id', merchantId)
            .single();

        if (fetchError || !merchant) {
            return { success: false, error: 'Failed to fetch merchant profile' };
        }

        const currentDeployed = merchant.current_deployed_capital || 0;

        // Update deployed capital
        const { error: updateError } = await supabase
            .from('merchant_profiles')
            .update({
                current_deployed_capital: currentDeployed + amount,
            })
            .eq('id', merchantId);

        if (updateError) {
            return { success: false, error: 'Failed to update merchant deployed capital' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error deploying merchant capital:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Release capital when customer makes a payment (reduce deployed capital)
 */
export async function releaseMerchantCapital(
    merchantId: string,
    amount: number
): Promise<{ success: boolean; error?: string }> {
    try {
        // Get current deployed capital
        const { data: merchant, error: fetchError } = await supabase
            .from('merchant_profiles')
            .select('current_deployed_capital')
            .eq('id', merchantId)
            .single();

        if (fetchError || !merchant) {
            return { success: false, error: 'Failed to fetch merchant profile' };
        }

        const currentDeployed = merchant.current_deployed_capital || 0;
        const newDeployed = Math.max(0, currentDeployed - amount);

        // Update deployed capital
        const { error: updateError } = await supabase
            .from('merchant_profiles')
            .update({
                current_deployed_capital: newDeployed,
            })
            .eq('id', merchantId);

        if (updateError) {
            return { success: false, error: 'Failed to release merchant capital' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error releasing merchant capital:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Recalculate merchant's deployed capital from active applications
 * Useful for syncing after manual adjustments or data fixes
 */
export async function recalculateMerchantCapital(
    merchantId: string
): Promise<{ success: boolean; deployedCapital?: number; error?: string }> {
    try {
        // Sum all active application amounts for this merchant
        const { data: applications, error: fetchError } = await supabase
            .from('bnpl_applications')
            .select('total_amount')
            .eq('merchant_id', merchantId)
            .in('status', ['approved', 'active']);

        if (fetchError) {
            return { success: false, error: 'Failed to fetch applications' };
        }

        const totalDeployed = applications?.reduce(
            (sum, app) => sum + (Number(app.total_amount) || 0),
            0
        ) || 0;

        // Update merchant profile
        const { error: updateError } = await supabase
            .from('merchant_profiles')
            .update({
                current_deployed_capital: totalDeployed,
            })
            .eq('id', merchantId);

        if (updateError) {
            return { success: false, error: 'Failed to update merchant capital' };
        }

        return { success: true, deployedCapital: totalDeployed };
    } catch (error: any) {
        console.error('Error recalculating merchant capital:', error);
        return { success: false, error: error.message };
    }
}
