import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type CapitalPool = Tables<'capital_pool'>;
type CapitalTransaction = Tables<'capital_transactions'>;

export interface CapitalStatus {
    totalCapital: number;
    availableCapital: number;
    reservedCapital: number;
    deployedCapital: number;
    utilizationRate: number; // Percentage of capital deployed
    availabilityRate: number; // Percentage of capital available
}

/**
 * Capital Pool Service
 * Manages the central capital pool for BNPL deployments
 */

/**
 * Get current capital pool status
 */
export async function getCapitalStatus(): Promise<CapitalStatus | null> {
    try {
        const { data, error } = await supabase
            .from('capital_pool')
            .select('*')
            .single();

        if (error || !data) {
            console.error('Error fetching capital pool:', error);
            return null;
        }

        const utilizationRate = data.total_capital > 0
            ? (data.deployed_capital / data.total_capital) * 100
            : 0;

        const availabilityRate = data.total_capital > 0
            ? (data.available_capital / data.total_capital) * 100
            : 0;

        return {
            totalCapital: data.total_capital,
            availableCapital: data.available_capital,
            reservedCapital: data.reserved_capital,
            deployedCapital: data.deployed_capital,
            utilizationRate: Math.round(utilizationRate * 100) / 100,
            availabilityRate: Math.round(availabilityRate * 100) / 100,
        };
    } catch (error) {
        console.error('Error getting capital status:', error);
        return null;
    }
}

/**
 * Reserve capital for a pending application
 */
export async function reserveCapital(
    amount: number,
    applicationId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Get current capital pool
        const { data: pool, error: fetchError } = await supabase
            .from('capital_pool')
            .select('*')
            .single();

        if (fetchError || !pool) {
            return { success: false, error: 'Failed to fetch capital pool' };
        }

        // Check if enough capital available
        if (pool.available_capital < amount) {
            return {
                success: false,
                error: `Insufficient capital available. Required: $${amount}, Available: $${pool.available_capital}`,
            };
        }

        // Update capital pool
        const { error: updateError } = await supabase
            .from('capital_pool')
            .update({
                available_capital: pool.available_capital - amount,
                reserved_capital: pool.reserved_capital + amount,
            })
            .eq('id', pool.id);

        if (updateError) {
            return { success: false, error: 'Failed to reserve capital' };
        }

        // Log transaction
        await logCapitalTransaction({
            transaction_type: 'reserve',
            amount,
            application_id: applicationId,
            settlement_id: null,
            funding_source_id: null,
            description: `Reserved capital for application ${applicationId}`,
            balance_before: pool.available_capital,
            balance_after: pool.available_capital - amount,
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error reserving capital:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Deploy capital when application is approved
 */
export async function deployCapital(
    amount: number,
    applicationId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Get current capital pool
        const { data: pool, error: fetchError } = await supabase
            .from('capital_pool')
            .select('*')
            .single();

        if (fetchError || !pool) {
            return { success: false, error: 'Failed to fetch capital pool' };
        }

        // Move from reserved to deployed
        const { error: updateError } = await supabase
            .from('capital_pool')
            .update({
                reserved_capital: pool.reserved_capital - amount,
                deployed_capital: pool.deployed_capital + amount,
            })
            .eq('id', pool.id);

        if (updateError) {
            return { success: false, error: 'Failed to deploy capital' };
        }

        // Log transaction
        await logCapitalTransaction({
            transaction_type: 'deployment',
            amount,
            application_id: applicationId,
            settlement_id: null,
            funding_source_id: null,
            description: `Deployed capital for approved application ${applicationId}`,
            balance_before: pool.deployed_capital,
            balance_after: pool.deployed_capital + amount,
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error deploying capital:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Release reserved capital (application rejected/cancelled)
 */
export async function releaseCapital(
    amount: number,
    applicationId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Get current capital pool
        const { data: pool, error: fetchError } = await supabase
            .from('capital_pool')
            .select('*')
            .single();

        if (fetchError || !pool) {
            return { success: false, error: 'Failed to fetch capital pool' };
        }

        // Move from reserved back to available
        const { error: updateError } = await supabase
            .from('capital_pool')
            .update({
                reserved_capital: pool.reserved_capital - amount,
                available_capital: pool.available_capital + amount,
            })
            .eq('id', pool.id);

        if (updateError) {
            return { success: false, error: 'Failed to release capital' };
        }

        // Log transaction
        await logCapitalTransaction({
            transaction_type: 'release',
            amount,
            application_id: applicationId,
            settlement_id: null,
            funding_source_id: null,
            description: `Released reserved capital for application ${applicationId}`,
            balance_before: pool.available_capital,
            balance_after: pool.available_capital + amount,
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error releasing capital:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Collect payment (customer payment received)
 */
export async function collectPayment(
    amount: number,
    applicationId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Get current capital pool
        const { data: pool, error: fetchError } = await supabase
            .from('capital_pool')
            .select('*')
            .single();

        if (fetchError || !pool) {
            return { success: false, error: 'Failed to fetch capital pool' };
        }

        // Move from deployed back to available
        const { error: updateError } = await supabase
            .from('capital_pool')
            .update({
                deployed_capital: pool.deployed_capital - amount,
                available_capital: pool.available_capital + amount,
            })
            .eq('id', pool.id);

        if (updateError) {
            return { success: false, error: 'Failed to collect payment' };
        }

        // Log transaction
        await logCapitalTransaction({
            transaction_type: 'collection',
            amount,
            application_id: applicationId,
            settlement_id: null,
            funding_source_id: null,
            description: `Collected payment for application ${applicationId}`,
            balance_before: pool.available_capital,
            balance_after: pool.available_capital + amount,
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error collecting payment:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Log capital transaction
 */
async function logCapitalTransaction(
    transaction: Omit<CapitalTransaction, 'id' | 'created_at'>
): Promise<void> {
    try {
        await supabase.from('capital_transactions').insert(transaction);
    } catch (error) {
        console.error('Error logging capital transaction:', error);
    }
}

/**
 * Get capital transactions history
 */
export async function getCapitalTransactions(
    limit: number = 50,
    transactionType?: string
): Promise<CapitalTransaction[]> {
    try {
        let query = supabase
            .from('capital_transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (transactionType) {
            query = query.eq('transaction_type', transactionType);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching capital transactions:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error getting capital transactions:', error);
        return [];
    }
}

/**
 * Add funds to capital pool
 */
export async function addFundsToPool(
    amount: number,
    fundingSourceId?: string,
    description?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Get current capital pool
        const { data: pool, error: fetchError } = await supabase
            .from('capital_pool')
            .select('*')
            .single();

        if (fetchError || !pool) {
            return { success: false, error: 'Failed to fetch capital pool' };
        }

        // Add to total and available capital
        const { error: updateError } = await supabase
            .from('capital_pool')
            .update({
                total_capital: pool.total_capital + amount,
                available_capital: pool.available_capital + amount,
            })
            .eq('id', pool.id);

        if (updateError) {
            return { success: false, error: 'Failed to add funds' };
        }

        // Log transaction
        await logCapitalTransaction({
            transaction_type: 'deployment',
            amount,
            application_id: null,
            settlement_id: null,
            funding_source_id: fundingSourceId || null,
            description: description || `Added $${amount} to capital pool`,
            balance_before: pool.available_capital,
            balance_after: pool.available_capital + amount,
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error adding funds to pool:', error);
        return { success: false, error: error.message };
    }
}
