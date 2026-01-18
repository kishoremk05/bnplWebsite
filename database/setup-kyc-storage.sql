-- ============================================================================
-- KYC Document Storage Setup
-- This migration sets up Supabase Storage for KYC documents
-- ============================================================================

-- Create storage bucket for KYC documents (private)
INSERT INTO
    storage.buckets (id, name, public)
VALUES (
        'kyc-documents',
        'kyc-documents',
        false
    ) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Policy: Users can upload their own KYC documents
CREATE POLICY "Users can upload own KYC documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own KYC documents
CREATE POLICY "Users can view own KYC documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update/replace their own KYC documents
CREATE POLICY "Users can update own KYC documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'kyc-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own KYC documents
CREATE POLICY "Users can delete own KYC documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'kyc-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Admins can view all KYC documents
CREATE POLICY "Admins can view all KYC documents" ON storage.objects FOR
SELECT USING (
        bucket_id = 'kyc-documents'
        AND EXISTS (
            SELECT 1
            FROM users_extended
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );

-- Policy: Admins can manage all KYC documents
CREATE POLICY "Admins can manage all KYC documents" ON storage.objects FOR ALL USING (
    bucket_id = 'kyc-documents'
    AND EXISTS (
        SELECT 1
        FROM users_extended
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify bucket was created
SELECT id, name, public, created_at
FROM storage.buckets
WHERE
    id = 'kyc-documents';