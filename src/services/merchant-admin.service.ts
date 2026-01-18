import { supabase } from '@/integrations/supabase/client';

export interface MerchantSubmission {
    id: string;
    user_id: string;
    full_name: string;
    business_name: string;
    business_type: string | null;
    tax_id: string | null;
    license_number: string | null;
    license_state: string | null;
    address_line1: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    website: string | null;
    is_verified: boolean;
    verified_at: string | null;
    created_at: string;
}

/**
 * Fetch all merchant submissions for admin review
 */
export async function getMerchantSubmissions(statusFilter?: string): Promise<MerchantSubmission[]> {
    try {
        let query = supabase
            .from('merchant_profiles')
            .select(`
        id,
        user_id,
        business_name,
        business_type,
        tax_id,
        license_number,
        license_state,
        address_line1,
        city,
        state,
        zip_code,
        website,
        is_verified,
        verified_at,
        verification_status,
        created_at
      `)
            .order('created_at', { ascending: false });

        // Apply status filter based on verification_status
        if (statusFilter === 'pending') {
            query = query.eq('verification_status', 'pending');
        } else if (statusFilter === 'verified') {
            query = query.eq('verification_status', 'approved');
        } else if (statusFilter === 'rejected') {
            query = query.eq('verification_status', 'rejected');
        }

        const { data: merchants, error } = await query;

        if (error) {
            console.error('Error fetching merchants:', error);
            return [];
        }

        // Get user names for each merchant
        const submissions: MerchantSubmission[] = [];

        for (const merchant of merchants || []) {
            const { data: userData } = await supabase
                .from('users_extended')
                .select('full_name')
                .eq('id', merchant.user_id)
                .single();

            submissions.push({
                ...merchant,
                full_name: userData?.full_name || 'Unknown',
            });
        }

        return submissions;
    } catch (error) {
        console.error('Error in getMerchantSubmissions:', error);
        return [];
    }
}

/**
 * Approve a merchant
 */
export async function approveMerchant(
    merchantId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('merchant_profiles')
            .update({
                is_verified: true,
                verified_at: new Date().toISOString(),
                verification_status: 'approved',
                rejection_reason: null,
                rejected_at: null,
            })
            .eq('id', merchantId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to approve merchant' };
    }
}

/**
 * Reject a merchant (set verification_status to rejected)
 */
export async function rejectMerchant(
    merchantId: string,
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('merchant_profiles')
            .update({
                is_verified: false,
                verified_at: null,
                verification_status: 'rejected',
                rejection_reason: reason || 'Verification rejected by admin',
                rejected_at: new Date().toISOString(),
            })
            .eq('id', merchantId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to reject merchant' };
    }
}
