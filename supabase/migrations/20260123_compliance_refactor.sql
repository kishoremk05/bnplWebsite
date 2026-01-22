-- ============================================================================
-- COMPLIANCE REFACTOR MIGRATION
-- Removes prohibited data fields and adds compliant third-party reference tables
-- Per client's "Golden Rule": No SSN, ID images, credit scores, bank credentials
-- ============================================================================

-- ============================================================================
-- STEP 1: REMOVE PROHIBITED DATA FROM CUSTOMER_PROFILES
-- ============================================================================

-- Remove ssn_last_4 column (violates "Do not store government ID numbers")
ALTER TABLE customer_profiles DROP COLUMN IF EXISTS ssn_last_4;

-- Add Persona verification reference fields (compliant - only stores IDs, not documents)
ALTER TABLE customer_profiles
ADD COLUMN IF NOT EXISTS persona_verification_id TEXT,
ADD COLUMN IF NOT EXISTS persona_inquiry_id TEXT,
ADD COLUMN IF NOT EXISTS persona_verification_status TEXT CHECK (
    persona_verification_status IN (
        'pending',
        'in_progress',
        'approved',
        'declined',
        'expired',
        'needs_review'
    )
);

-- ============================================================================
-- STEP 2: DROP PROHIBITED KYC_DOCUMENTS TABLE
-- This table stores file_path to ID images which violates the Golden Rule
-- Persona will handle all document storage
-- ============================================================================

-- Drop the trigger first
DROP TRIGGER IF EXISTS update_kyc_documents_updated_at ON kyc_documents;

-- Drop the indexes
DROP INDEX IF EXISTS idx_kyc_documents_customer;

DROP INDEX IF EXISTS idx_kyc_documents_status;

-- Drop the table
DROP TABLE IF EXISTS kyc_documents;

-- ============================================================================
-- STEP 3: CREATE COMPLIANT PERSONA_VERIFICATIONS TABLE
-- Only stores references to Persona, not actual document data
-- ============================================================================

CREATE TABLE IF NOT EXISTS persona_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,

-- Persona references only (NO actual document data stored)
persona_inquiry_id TEXT NOT NULL,
persona_verification_id TEXT,
persona_template_id TEXT,

-- Verification metadata (compliant - status and types only)
verification_status TEXT NOT NULL DEFAULT 'created' CHECK (
    verification_status IN (
        'created',
        'pending',
        'in_progress',
        'completed',
        'expired',
        'failed',
        'approved',
        'declined',
        'needs_review'
    )
),
verification_type TEXT, -- 'government_id', 'selfie', 'document'

-- Timestamps
initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
completed_at TIMESTAMPTZ,

-- Data retention (36 months per policy)
expires_at TIMESTAMPTZ DEFAULT(NOW() + INTERVAL '36 months'),

-- Audit
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique constraint for inquiry ID
CREATE UNIQUE INDEX IF NOT EXISTS idx_persona_verifications_inquiry ON persona_verifications (persona_inquiry_id);

CREATE INDEX IF NOT EXISTS idx_persona_verifications_customer ON persona_verifications (customer_id);

CREATE INDEX IF NOT EXISTS idx_persona_verifications_status ON persona_verifications (verification_status);

CREATE INDEX IF NOT EXISTS idx_persona_verifications_expires ON persona_verifications (expires_at);

-- ============================================================================
-- STEP 4: CREATE COMPLIANT EXPERIAN_INQUIRIES TABLE
-- Only stores inquiry references, NOT credit scores or report data
-- ============================================================================

CREATE TABLE IF NOT EXISTS experian_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    application_id UUID REFERENCES bnpl_applications(id) ON DELETE SET NULL,

-- Experian references only (NO credit score or report data)
experian_inquiry_id TEXT NOT NULL,
experian_reference_number TEXT,

-- Inquiry metadata
inquiry_type TEXT CHECK (
    inquiry_type IN ('soft', 'hard')
),
inquiry_status TEXT CHECK (
    inquiry_status IN (
        'pending',
        'completed',
        'failed',
        'expired'
    )
),

-- Decision outcome ONLY (no score stored - compliant)
decision_outcome TEXT CHECK (decision_outcome IN ('approved', 'declined', 'review', 'error')),
    decision_reasons TEXT[], -- Array of reason codes, not actual score

-- Timestamps
requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
completed_at TIMESTAMPTZ,

-- Data retention (36 months per policy)
expires_at TIMESTAMPTZ DEFAULT(NOW() + INTERVAL '36 months'),

-- Audit
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experian_inquiries_customer ON experian_inquiries (customer_id);

CREATE INDEX IF NOT EXISTS idx_experian_inquiries_application ON experian_inquiries (application_id);

CREATE INDEX IF NOT EXISTS idx_experian_inquiries_expires ON experian_inquiries (expires_at);

-- ============================================================================
-- STEP 5: CREATE COMPLIANT PLAID_CONNECTIONS TABLE
-- Only stores reference IDs, NOT account numbers or credentials
-- ============================================================================

CREATE TABLE IF NOT EXISTS plaid_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,

-- Plaid references only (NO account numbers, routing numbers, or credentials)
plaid_item_id TEXT NOT NULL,
plaid_access_token_encrypted TEXT, -- Must be encrypted at rest
plaid_account_id TEXT, -- Reference ID only

-- Connection metadata (compliant)
connection_status TEXT CHECK (
    connection_status IN (
        'active',
        'inactive',
        'expired',
        'revoked',
        'error'
    )
),
institution_id TEXT,
institution_name TEXT,

-- Verification status (compliant - no actual bank data)
verification_status TEXT CHECK (
    verification_status IN (
        'verified',
        'pending',
        'failed',
        'manual_review'
    )
),
verified_at TIMESTAMPTZ,

-- Account type info (compliant - category only, no numbers)
account_type TEXT, -- 'checking', 'savings', 'credit'
account_subtype TEXT,

-- Timestamps
connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
last_verified_at TIMESTAMPTZ,

-- Data retention (36 months per policy)
expires_at TIMESTAMPTZ DEFAULT(NOW() + INTERVAL '36 months'),

-- Audit
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plaid_connections_customer ON plaid_connections (customer_id);

CREATE INDEX IF NOT EXISTS idx_plaid_connections_item ON plaid_connections (plaid_item_id);

CREATE INDEX IF NOT EXISTS idx_plaid_connections_status ON plaid_connections (connection_status);

CREATE INDEX IF NOT EXISTS idx_plaid_connections_expires ON plaid_connections (expires_at);

-- ============================================================================
-- STEP 6: ENHANCE AUDIT_LOGS FOR COMPLIANCE TRACKING
-- ============================================================================

-- Add compliance tracking fields
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS third_party_provider TEXT CHECK (
    third_party_provider IS NULL
    OR third_party_provider IN (
        'persona',
        'experian',
        'plaid',
        'stripe'
    )
),
ADD COLUMN IF NOT EXISTS third_party_reference_id TEXT,
ADD COLUMN IF NOT EXISTS data_retention_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS compliance_category TEXT CHECK (
    compliance_category IS NULL
    OR compliance_category IN (
        'kyc',
        'credit_check',
        'bank_verification',
        'payment',
        'data_access'
    )
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_provider ON audit_logs (third_party_provider);

CREATE INDEX IF NOT EXISTS idx_audit_logs_retention ON audit_logs (data_retention_expires_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_compliance ON audit_logs (compliance_category);

-- ============================================================================
-- STEP 7: CREATE DATA RETENTION CLEANUP FUNCTIONS
-- ============================================================================

-- Function to clean up expired Persona verifications
CREATE OR REPLACE FUNCTION cleanup_expired_persona_verifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM persona_verifications
    WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup
    INSERT INTO audit_logs (action, resource_type, new_values, compliance_category)
    VALUES (
        'data_retention_cleanup',
        'persona_verifications',
        jsonb_build_object('deleted_count', deleted_count, 'cleanup_date', NOW()),
        'kyc'
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired Experian inquiries
CREATE OR REPLACE FUNCTION cleanup_expired_experian_inquiries()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM experian_inquiries
    WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup
    INSERT INTO audit_logs (action, resource_type, new_values, compliance_category)
    VALUES (
        'data_retention_cleanup',
        'experian_inquiries',
        jsonb_build_object('deleted_count', deleted_count, 'cleanup_date', NOW()),
        'credit_check'
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired Plaid connections
CREATE OR REPLACE FUNCTION cleanup_expired_plaid_connections()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM plaid_connections
    WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup
    INSERT INTO audit_logs (action, resource_type, new_values, compliance_category)
    VALUES (
        'data_retention_cleanup',
        'plaid_connections',
        jsonb_build_object('deleted_count', deleted_count, 'cleanup_date', NOW()),
        'bank_verification'
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Master cleanup function that runs all data retention cleanups
CREATE OR REPLACE FUNCTION run_data_retention_cleanup()
RETURNS TABLE(table_name TEXT, deleted_count INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 'persona_verifications'::TEXT, cleanup_expired_persona_verifications();
    
    RETURN QUERY
    SELECT 'experian_inquiries'::TEXT, cleanup_expired_experian_inquiries();
    
    RETURN QUERY
    SELECT 'plaid_connections'::TEXT, cleanup_expired_plaid_connections();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 8: ADD UPDATED_AT TRIGGERS FOR NEW TABLES
-- ============================================================================

CREATE TRIGGER update_persona_verifications_updated_at 
    BEFORE UPDATE ON persona_verifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experian_inquiries_updated_at 
    BEFORE UPDATE ON experian_inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plaid_connections_updated_at 
    BEFORE UPDATE ON plaid_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 9: ADD RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE persona_verifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE experian_inquiries ENABLE ROW LEVEL SECURITY;

ALTER TABLE plaid_connections ENABLE ROW LEVEL SECURITY;

-- Persona verifications policies
CREATE POLICY "Customers can view own persona verifications" ON persona_verifications FOR
SELECT USING (
        customer_id IN (
            SELECT id
            FROM customer_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Service role can manage persona verifications" ON persona_verifications FOR ALL USING (
    auth.jwt () ->> 'role' = 'service_role'
);

-- Experian inquiries policies
CREATE POLICY "Customers can view own experian inquiries" ON experian_inquiries FOR
SELECT USING (
        customer_id IN (
            SELECT id
            FROM customer_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Service role can manage experian inquiries" ON experian_inquiries FOR ALL USING (
    auth.jwt () ->> 'role' = 'service_role'
);

-- Plaid connections policies
CREATE POLICY "Customers can view own plaid connections" ON plaid_connections FOR
SELECT USING (
        customer_id IN (
            SELECT id
            FROM customer_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Service role can manage plaid connections" ON plaid_connections FOR ALL USING (
    auth.jwt () ->> 'role' = 'service_role'
);

-- ============================================================================
-- MIGRATION COMPLETE
-- Summary of changes:
-- 1. Removed ssn_last_4 from customer_profiles (compliance)
-- 2. Dropped kyc_documents table (compliance - no ID images stored)
-- 3. Created persona_verifications table (compliant references only)
-- 4. Created experian_inquiries table (compliant - no credit scores)
-- 5. Created plaid_connections table (compliant - no account numbers)
-- 6. Enhanced audit_logs with compliance tracking
-- 7. Added data retention cleanup functions
-- 8. Added proper triggers and RLS policies
-- ============================================================================