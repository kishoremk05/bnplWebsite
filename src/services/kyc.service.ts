// ============================================================================
// COMPLIANT KYC SERVICE
// Uses Persona for identity verification - stores ONLY verification references
// NO document storage, NO SSN, NO ID images per client's "Golden Rule"
// ============================================================================

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// COMPLIANT INTERFACES
// ============================================================================

/**
 * Persona verification reference - stores ONLY reference IDs, not actual documents
 */
export interface PersonaVerification {
    id: string;
    customer_id: string;
    persona_inquiry_id: string;
    persona_verification_id?: string;
    verification_status: 'created' | 'pending' | 'in_progress' | 'completed' | 'expired' | 'failed' | 'approved' | 'declined' | 'needs_review';
    verification_type?: string;
    initiated_at: string;
    completed_at?: string;
    created_at: string;
}

/**
 * Personal info - COMPLIANT version (no SSN)
 */
export interface PersonalInfo {
    date_of_birth?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    // NOTE: ssn_last_4 REMOVED for compliance - Persona handles ID verification
}

/**
 * Persona inquiry response from webhook or API
 */
export interface PersonaInquiryResponse {
    inquiryId: string;
    verificationId?: string;
    status: string;
    templateId?: string;
}

// ============================================================================
// PERSONA INTEGRATION FUNCTIONS (COMPLIANT)
// ============================================================================

/**
 * Initiate a Persona verification session
 * This creates an inquiry in Persona and stores ONLY the reference ID
 * Customer will be redirected to Persona's hosted flow to complete verification
 * 
 * COMPLIANT: No documents stored by Veridian - Persona handles all document storage
 */
export async function initiatePersonaVerification(
    customerId: string,
    templateId?: string
): Promise<{ inquiryUrl: string; inquiryId: string; error?: string }> {
    try {
        // In production, this would call Persona's API to create an inquiry
        // For now, we'll create a placeholder inquiry ID
        const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Store ONLY the reference to the Persona inquiry - NO documents
        const { error: insertError } = await supabase
            .from('persona_verifications')
            .insert({
                customer_id: customerId,
                persona_inquiry_id: inquiryId,
                persona_template_id: templateId || 'itmpl_default',
                verification_status: 'created',
                verification_type: 'government_id',
                initiated_at: new Date().toISOString(),
            });

        if (insertError) {
            console.error('Error creating persona verification record:', insertError);
            return { inquiryUrl: '', inquiryId: '', error: insertError.message };
        }

        // Log the compliance action
        await logComplianceAction(
            customerId,
            'persona_verification_initiated',
            'persona',
            inquiryId,
            { template_id: templateId }
        );

        // In production, return the Persona-hosted verification URL
        // Customer completes verification on Persona's platform, NOT ours
        const inquiryUrl = `https://withpersona.com/verify?inquiry-id=${inquiryId}`;

        return { inquiryUrl, inquiryId };
    } catch (error: any) {
        console.error('Error initiating Persona verification:', error);
        return { inquiryUrl: '', inquiryId: '', error: error.message || 'Failed to initiate verification' };
    }
}

/**
 * Handle Persona webhook callback
 * Updates verification status based on Persona's decision
 * 
 * COMPLIANT: Only updates reference status - no document data received or stored
 */
export async function handlePersonaWebhook(
    inquiryId: string,
    status: string,
    verificationId?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Map Persona status to our status
        const statusMap: Record<string, string> = {
            'created': 'created',
            'pending': 'pending',
            'completed': 'completed',
            'approved': 'approved',
            'declined': 'declined',
            'failed': 'failed',
            'expired': 'expired',
            'needs_review': 'needs_review',
        };

        const mappedStatus = statusMap[status] || 'pending';

        // Update ONLY the reference record - no document data
        const { error: updateError } = await supabase
            .from('persona_verifications')
            .update({
                verification_status: mappedStatus,
                persona_verification_id: verificationId,
                completed_at: ['completed', 'approved', 'declined', 'failed'].includes(mappedStatus)
                    ? new Date().toISOString()
                    : null,
            })
            .eq('persona_inquiry_id', inquiryId);

        if (updateError) {
            console.error('Error updating persona verification:', updateError);
            return { success: false, error: updateError.message };
        }

        // If approved, update customer profile KYC status
        if (mappedStatus === 'approved') {
            await updateCustomerKYCStatus(inquiryId, 'approved');
        } else if (mappedStatus === 'declined') {
            await updateCustomerKYCStatus(inquiryId, 'rejected');
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error handling Persona webhook:', error);
        return { success: false, error: error.message || 'Failed to process webhook' };
    }
}

/**
 * Get verification status for a customer
 * Returns ONLY reference data - no documents
 */
export async function getVerificationStatus(
    customerId: string
): Promise<{ verifications: PersonaVerification[]; latestStatus: string | null }> {
    try {
        const { data, error } = await supabase
            .from('persona_verifications')
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching verifications:', error);
            return { verifications: [], latestStatus: null };
        }

        const verifications = (data || []) as PersonaVerification[];
        const latestStatus = verifications.length > 0 ? verifications[0].verification_status : null;

        return { verifications, latestStatus };
    } catch (error) {
        console.error('Error in getVerificationStatus:', error);
        return { verifications: [], latestStatus: null };
    }
}

// ============================================================================
// CUSTOMER PROFILE FUNCTIONS (COMPLIANT)
// ============================================================================

/**
 * Update customer personal information
 * COMPLIANT: No SSN field - removed from interface and database
 */
export async function updatePersonalInfo(
    userId: string,
    personalInfo: PersonalInfo
): Promise<{ success: boolean; error?: string }> {
    try {
        // Ensure we never try to update ssn_last_4 (it no longer exists)
        const { error } = await supabase
            .from('customer_profiles')
            .update({
                date_of_birth: personalInfo.date_of_birth,
                address_line1: personalInfo.address_line1,
                address_line2: personalInfo.address_line2,
                city: personalInfo.city,
                state: personalInfo.state,
                zip_code: personalInfo.zip_code,
            })
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating personal info:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error in updatePersonalInfo:', error);
        return { success: false, error: error.message || 'Failed to update personal information' };
    }
}

/**
 * Submit for verification - initiates Persona flow
 * COMPLIANT: No document uploads - redirects to Persona hosted verification
 */
export async function submitForVerification(
    userId: string
): Promise<{ success: boolean; inquiryUrl?: string; error?: string }> {
    try {
        // Get customer profile
        const { data: profile, error: profileError } = await supabase
            .from('customer_profiles')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (profileError || !profile) {
            return { success: false, error: 'Customer profile not found' };
        }

        // Check if there's already an active verification
        const { data: existingVerification } = await supabase
            .from('persona_verifications')
            .select('persona_inquiry_id, verification_status')
            .eq('customer_id', profile.id)
            .in('verification_status', ['created', 'pending', 'in_progress'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (existingVerification) {
            // Return existing verification URL
            const inquiryUrl = `https://withpersona.com/verify?inquiry-id=${existingVerification.persona_inquiry_id}`;
            return { success: true, inquiryUrl };
        }

        // Initiate new Persona verification
        const { inquiryUrl, error: verificationError } = await initiatePersonaVerification(
            profile.id
        );

        if (verificationError) {
            return { success: false, error: verificationError };
        }

        // Update KYC status to in_review
        await supabase
            .from('customer_profiles')
            .update({
                kyc_status: 'in_review',
                persona_verification_status: 'pending'
            })
            .eq('user_id', userId);

        return { success: true, inquiryUrl };
    } catch (error: any) {
        console.error('Error in submitForVerification:', error);
        return { success: false, error: error.message || 'Failed to submit for verification' };
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Update customer KYC status based on Persona verification result
 */
async function updateCustomerKYCStatus(
    inquiryId: string,
    status: 'approved' | 'rejected'
): Promise<void> {
    try {
        // Get the verification record to find customer
        const { data: verification } = await supabase
            .from('persona_verifications')
            .select('customer_id')
            .eq('persona_inquiry_id', inquiryId)
            .single();

        if (!verification) return;

        // Update customer profile
        await supabase
            .from('customer_profiles')
            .update({
                kyc_status: status,
                persona_verification_status: status,
                verified_at: status === 'approved' ? new Date().toISOString() : null,
            })
            .eq('id', verification.customer_id);

        // If approved, set initial credit limit
        if (status === 'approved') {
            await supabase
                .from('customer_profiles')
                .update({
                    credit_limit: 200, // Default credit limit for approved KYC
                    available_credit: 200,
                })
                .eq('id', verification.customer_id);
        }
    } catch (error) {
        console.error('Error updating customer KYC status:', error);
    }
}

/**
 * Log compliance-related actions for audit trail
 */
async function logComplianceAction(
    customerId: string,
    action: string,
    provider: 'persona' | 'experian' | 'plaid' | 'stripe',
    referenceId: string,
    metadata?: Record<string, any>
): Promise<void> {
    try {
        await supabase.from('audit_logs').insert({
            action,
            resource_type: 'customer_profiles',
            resource_id: customerId,
            third_party_provider: provider,
            third_party_reference_id: referenceId,
            compliance_category: provider === 'persona' ? 'kyc' :
                provider === 'experian' ? 'credit_check' :
                    provider === 'plaid' ? 'bank_verification' : 'payment',
            new_values: metadata ? metadata : null,
            data_retention_expires_at: new Date(Date.now() + 36 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 36 months
        });
    } catch (error) {
        console.error('Error logging compliance action:', error);
    }
}

// ============================================================================
// DEPRECATED FUNCTIONS - These have been removed for compliance
// DO NOT RE-ADD document upload/storage functionality
// ============================================================================

/**
 * @deprecated - REMOVED FOR COMPLIANCE
 * Document uploads are now handled by Persona directly
 * Veridian does NOT store ID images, selfies, or document files
 */
export async function uploadKYCDocument(): Promise<never> {
    throw new Error(
        'Document upload has been disabled for compliance. ' +
        'Use initiatePersonaVerification() instead - customers upload documents directly to Persona.'
    );
}

/**
 * @deprecated - REMOVED FOR COMPLIANCE
 * The kyc_documents table has been removed from the database
 */
export async function saveDocumentMetadata(): Promise<never> {
    throw new Error(
        'Document metadata storage has been disabled for compliance. ' +
        'Persona handles all document storage. Use persona_verifications table for verification status only.'
    );
}

/**
 * @deprecated - REMOVED FOR COMPLIANCE
 * Veridian does not store or serve document files
 */
export async function getKYCDocuments(): Promise<never> {
    throw new Error(
        'Document retrieval has been disabled for compliance. ' +
        'Documents are stored and served by Persona, not Veridian. ' +
        'Use getVerificationStatus() to check verification status.'
    );
}

/**
 * @deprecated - REMOVED FOR COMPLIANCE
 * Veridian does not store document files
 */
export async function getDocumentUrl(): Promise<never> {
    throw new Error(
        'Document URL generation has been disabled for compliance. ' +
        'Veridian does not store ID documents. Contact Persona for document access if needed.'
    );
}
