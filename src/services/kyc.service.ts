import { supabase } from '@/integrations/supabase/client';

export interface KYCDocument {
    id: string;
    customer_id: string;
    document_type: string;
    file_path: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    status: 'pending' | 'in_review' | 'approved' | 'rejected';
    created_at: string;
}

export interface PersonalInfo {
    date_of_birth?: string;
    ssn_last_4?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    zip_code?: string;
}

/**
 * Upload a KYC document to Supabase Storage
 */
export async function uploadKYCDocument(
    userId: string,
    documentType: string,
    file: File
): Promise<{ filePath: string; error?: string }> {
    try {
        // Validate file size (10MB limit)
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_FILE_SIZE) {
            return { filePath: '', error: 'File size must be less than 10MB' };
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            return { filePath: '', error: 'Only JPG, PNG, and PDF files are allowed' };
        }

        // Generate unique file name
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = `${documentType}_${timestamp}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('kyc-documents')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return { filePath: '', error: uploadError.message };
        }

        return { filePath };
    } catch (error: any) {
        console.error('Error uploading document:', error);
        return { filePath: '', error: error.message || 'Failed to upload document' };
    }
}

/**
 * Save document metadata to kyc_documents table
 */
export async function saveDocumentMetadata(
    customerId: string,
    documentType: string,
    filePath: string,
    fileName: string,
    fileSize: number,
    mimeType: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if document already exists for this type
        const { data: existing } = await supabase
            .from('kyc_documents')
            .select('id')
            .eq('customer_id', customerId)
            .eq('document_type', documentType)
            .single();

        if (existing) {
            // Update existing document
            const { error } = await supabase
                .from('kyc_documents')
                .update({
                    file_path: filePath,
                    file_name: fileName,
                    file_size: fileSize,
                    mime_type: mimeType,
                    status: 'pending',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id);

            if (error) {
                console.error('Error updating document metadata:', error);
                return { success: false, error: error.message };
            }
        } else {
            // Insert new document
            const { error } = await supabase.from('kyc_documents').insert({
                customer_id: customerId,
                document_type: documentType,
                file_path: filePath,
                file_name: fileName,
                file_size: fileSize,
                mime_type: mimeType,
                status: 'pending',
            });

            if (error) {
                console.error('Error saving document metadata:', error);
                return { success: false, error: error.message };
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error in saveDocumentMetadata:', error);
        return { success: false, error: error.message || 'Failed to save document metadata' };
    }
}

/**
 * Update customer personal information
 */
export async function updatePersonalInfo(
    userId: string,
    personalInfo: PersonalInfo
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('customer_profiles')
            .update(personalInfo)
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
 * Submit KYC for verification
 */
export async function submitForVerification(
    userId: string
): Promise<{ success: boolean; error?: string }> {
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

        // Check if all required documents are uploaded
        const requiredDocTypes = ['id_front', 'id_back', 'proof_of_address', 'selfie'];
        const { data: documents, error: docsError } = await supabase
            .from('kyc_documents')
            .select('document_type')
            .eq('customer_id', profile.id);

        if (docsError) {
            return { success: false, error: docsError.message };
        }

        const uploadedTypes = documents?.map((d) => d.document_type) || [];
        const missingDocs = requiredDocTypes.filter((type) => !uploadedTypes.includes(type));

        if (missingDocs.length > 0) {
            return {
                success: false,
                error: `Missing required documents: ${missingDocs.join(', ')}`,
            };
        }

        // Update KYC status to in_review
        const { error: updateError } = await supabase
            .from('customer_profiles')
            .update({ kyc_status: 'in_review' })
            .eq('user_id', userId);

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        // Update all document statuses to in_review
        await supabase
            .from('kyc_documents')
            .update({ status: 'in_review' })
            .eq('customer_id', profile.id);

        return { success: true };
    } catch (error: any) {
        console.error('Error in submitForVerification:', error);
        return { success: false, error: error.message || 'Failed to submit for verification' };
    }
}

/**
 * Get uploaded KYC documents for a customer
 */
export async function getKYCDocuments(customerId: string): Promise<KYCDocument[]> {
    try {
        const { data, error } = await supabase
            .from('kyc_documents')
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching KYC documents:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getKYCDocuments:', error);
        return [];
    }
}

/**
 * Get signed URL for viewing a KYC document
 */
export async function getDocumentUrl(filePath: string): Promise<string | null> {
    try {
        const { data, error } = await supabase.storage
            .from('kyc-documents')
            .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (error) {
            console.error('Error creating signed URL:', error);
            return null;
        }

        return data.signedUrl;
    } catch (error) {
        console.error('Error in getDocumentUrl:', error);
        return null;
    }
}
