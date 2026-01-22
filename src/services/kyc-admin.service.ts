// ============================================================================
// COMPLIANT KYC ADMIN SERVICE
// For admin review of Persona-based verifications
// NO document viewing - documents are stored only in Persona
// ============================================================================

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// COMPLIANT INTERFACES
// ============================================================================

/**
 * KYC Submission for admin review - Persona-based
 */
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
    // Updated to use Persona verification info instead of document files
    persona_verification: PersonaVerificationInfo | null;
}

/**
 * Persona verification info - COMPLIANT (no document data)
 */
export interface PersonaVerificationInfo {
    id: string;
    persona_inquiry_id: string;
    persona_verification_id: string | null;
    verification_status: string;
    verification_type: string | null;
    initiated_at: string;
    completed_at: string | null;
}

// ============================================================================
// ADMIN FUNCTIONS (COMPLIANT)
// ============================================================================

/**
 * Fetch all KYC submissions for admin review
 * Uses Persona verifications instead of document files
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
                created_at,
                persona_verification_id,
                persona_verification_status
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

        // For each profile, get user info and Persona verification
        const submissions: KYCSubmission[] = [];

        for (const profile of profiles || []) {
            // Get user info
            const { data: userData } = await supabase
                .from('users_extended')
                .select('full_name')
                .eq('id', profile.user_id)
                .single();

            // Get latest Persona verification (NOT document files)
            const { data: verification } = await supabase
                .from('persona_verifications')
                .select('id, persona_inquiry_id, persona_verification_id, verification_status, verification_type, initiated_at, completed_at')
                .eq('customer_id', profile.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

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
                persona_verification: verification as PersonaVerificationInfo | null,
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
 * Updates customer profile status based on Persona verification approval
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
                persona_verification_status: 'approved',
                verified_at: new Date().toISOString(),
                credit_limit: 200, // Set initial credit limit
                available_credit: 200,
            })
            .eq('id', customerId);

        if (profileError) {
            return { success: false, error: profileError.message };
        }

        // Update Persona verification status
        const { error: verificationError } = await supabase
            .from('persona_verifications')
            .update({
                verification_status: 'approved',
                completed_at: new Date().toISOString(),
            })
            .eq('customer_id', customerId)
            .is('completed_at', null); // Only update incomplete verifications

        if (verificationError) {
            console.error('Error updating verification:', verificationError);
            // Non-critical - main profile was updated
        }

        // Log the compliance action
        await logAdminAction(customerId, adminId, 'kyc_approved');

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
                persona_verification_status: 'declined',
            })
            .eq('id', customerId);

        if (profileError) {
            return { success: false, error: profileError.message };
        }

        // Update Persona verification status
        const { error: verificationError } = await supabase
            .from('persona_verifications')
            .update({
                verification_status: 'declined',
                completed_at: new Date().toISOString(),
            })
            .eq('customer_id', customerId)
            .is('completed_at', null);

        if (verificationError) {
            console.error('Error updating verification:', verificationError);
        }

        // Log the compliance action with reason
        await logAdminAction(customerId, adminId, 'kyc_rejected', { reason });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to reject KYC' };
    }
}

/**
 * Get Persona verification URL for admin to review on Persona dashboard
 * COMPLIANT: Documents are viewed on Persona's platform, not ours
 */
export function getPersonaVerificationUrl(personaInquiryId: string): string {
    // In production, this would link to Persona's admin dashboard
    return `https://app.withpersona.com/dashboard/inquiries/${personaInquiryId}`;
}

/**
 * Get verification summary for display
 * Returns a summary without exposing any document data
 */
export async function getVerificationSummary(customerId: string): Promise<{
    status: string;
    personaInquiryId: string | null;
    personaUrl: string | null;
    initiatedAt: string | null;
    completedAt: string | null;
}> {
    try {
        const { data: verification } = await supabase
            .from('persona_verifications')
            .select('persona_inquiry_id, verification_status, initiated_at, completed_at')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!verification) {
            return {
                status: 'not_started',
                personaInquiryId: null,
                personaUrl: null,
                initiatedAt: null,
                completedAt: null,
            };
        }

        return {
            status: verification.verification_status,
            personaInquiryId: verification.persona_inquiry_id,
            personaUrl: getPersonaVerificationUrl(verification.persona_inquiry_id),
            initiatedAt: verification.initiated_at,
            completedAt: verification.completed_at,
        };
    } catch (error) {
        console.error('Error getting verification summary:', error);
        return {
            status: 'error',
            personaInquiryId: null,
            personaUrl: null,
            initiatedAt: null,
            completedAt: null,
        };
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Log admin compliance actions for audit trail
 */
async function logAdminAction(
    customerId: string,
    adminId: string,
    action: string,
    metadata?: Record<string, any>
): Promise<void> {
    try {
        await supabase.from('audit_logs').insert({
            user_id: adminId,
            action,
            resource_type: 'customer_profiles',
            resource_id: customerId,
            compliance_category: 'kyc',
            new_values: metadata || null,
            data_retention_expires_at: new Date(Date.now() + 36 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
    } catch (error) {
        console.error('Error logging admin action:', error);
    }
}

// ============================================================================
// DEPRECATED FUNCTIONS
// ============================================================================

/**
 * @deprecated - REMOVED FOR COMPLIANCE
 * Document URLs are no longer available - documents are stored in Persona only
 */
export async function getDocumentSignedUrls(): Promise<never> {
    throw new Error(
        'Document URLs are no longer available for compliance reasons. ' +
        'Documents are stored and managed by Persona. ' +
        'Use getPersonaVerificationUrl() to link to Persona dashboard for document review.'
    );
}
