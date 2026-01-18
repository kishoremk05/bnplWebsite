import { supabase } from '@/integrations/supabase/client';
import { getDocumentUrl } from './kyc.service';

export interface KYCSubmission {
    id: string;
    user_id: string;
    full_name: string;
    kyc_status: 'pending' | 'in_review' | 'approved' | 'rejected';
    date_of_birth: string | null;
    address_line1: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    created_at: string;
    documents: KYCDocumentInfo[];
}

export interface KYCDocumentInfo {
    id: string;
    document_type: string;
    file_path: string;
    file_name: string;
    status: string;
    created_at: string;
}

/**
 * Fetch all KYC submissions for admin review
 */
export async function getKYCSubmissions(statusFilter?: string): Promise<KYCSubmission[]> {
    try {
        // Build the query for customer profiles with KYC info
        let query = supabase
            .from('customer_profiles')
            .select(`
        id,
        user_id,
        kyc_status,
        date_of_birth,
        address_line1,
        city,
        state,
        zip_code,
        created_at
      `)
            .order('created_at', { ascending: false });

        // Apply status filter
        if (statusFilter && statusFilter !== 'all') {
            query = query.eq('kyc_status', statusFilter as 'pending' | 'in_review' | 'approved' | 'rejected');
        }

        const { data: profiles, error: profilesError } = await query;

        if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            return [];
        }

        // For each profile, get user info and documents
        const submissions: KYCSubmission[] = [];

        for (const profile of profiles || []) {
            // Get user info
            const { data: userData } = await supabase
                .from('users_extended')
                .select('full_name')
                .eq('id', profile.user_id)
                .single();

            // Get KYC documents
            const { data: documents } = await supabase
                .from('kyc_documents')
                .select('id, document_type, file_path, file_name, status, created_at')
                .eq('customer_id', profile.id)
                .order('created_at', { ascending: true });

            submissions.push({
                id: profile.id,
                user_id: profile.user_id,
                full_name: userData?.full_name || 'Unknown',
                kyc_status: profile.kyc_status,
                date_of_birth: profile.date_of_birth,
                address_line1: profile.address_line1,
                city: profile.city,
                state: profile.state,
                zip_code: profile.zip_code,
                created_at: profile.created_at,
                documents: documents || [],
            });
        }

        return submissions;
    } catch (error) {
        console.error('Error in getKYCSubmissions:', error);
        return [];
    }
}

/**
 * Approve a KYC submission
 */
export async function approveKYC(
    customerId: string,
    adminId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Update customer profile
        const { error: profileError } = await supabase
            .from('customer_profiles')
            .update({
                kyc_status: 'approved',
                verified_at: new Date().toISOString(),
            })
            .eq('id', customerId);

        if (profileError) {
            return { success: false, error: profileError.message };
        }

        // Update all documents for this customer
        const { error: docsError } = await supabase
            .from('kyc_documents')
            .update({
                status: 'approved',
                reviewed_by: adminId,
                reviewed_at: new Date().toISOString(),
            })
            .eq('customer_id', customerId);

        if (docsError) {
            console.error('Error updating documents:', docsError);
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to approve KYC' };
    }
}

/**
 * Reject a KYC submission
 */
export async function rejectKYC(
    customerId: string,
    adminId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Update customer profile
        const { error: profileError } = await supabase
            .from('customer_profiles')
            .update({
                kyc_status: 'rejected',
            })
            .eq('id', customerId);

        if (profileError) {
            return { success: false, error: profileError.message };
        }

        // Update all documents for this customer with rejection reason
        const { error: docsError } = await supabase
            .from('kyc_documents')
            .update({
                status: 'rejected',
                reviewed_by: adminId,
                reviewed_at: new Date().toISOString(),
                rejection_reason: reason,
            })
            .eq('customer_id', customerId);

        if (docsError) {
            console.error('Error updating documents:', docsError);
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to reject KYC' };
    }
}

/**
 * Get document URLs for viewing
 */
export async function getDocumentSignedUrls(
    documents: KYCDocumentInfo[]
): Promise<Record<string, string>> {
    const urls: Record<string, string> = {};

    for (const doc of documents) {
        const url = await getDocumentUrl(doc.file_path);
        if (url) {
            urls[doc.document_type] = url;
        }
    }

    return urls;
}
