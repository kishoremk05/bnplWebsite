-- RegalPay BNPL Platform - Initial Database Schema
-- This migration creates all core tables for the platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('customer', 'merchant', 'admin');

-- KYC status enum
CREATE TYPE kyc_status AS ENUM ('pending', 'in_review', 'approved', 'rejected');

-- BNPL application status enum
CREATE TYPE bnpl_status AS ENUM ('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted');

-- Transaction status enum
CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- Payment status enum
CREATE TYPE payment_status AS ENUM ('scheduled', 'processing', 'completed', 'failed', 'skipped');

-- ============================================================================
-- USERS EXTENDED TABLE
-- ============================================================================
CREATE TABLE users_extended (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'customer',
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CUSTOMER PROFILES
-- ============================================================================
CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL REFERENCES users_extended (id) ON DELETE CASCADE,
    kyc_status kyc_status NOT NULL DEFAULT 'pending',
    credit_limit DECIMAL(10, 2) DEFAULT 0,
    available_credit DECIMAL(10, 2) DEFAULT 0,
    date_of_birth DATE,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    ssn_last_4 TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)
);

-- ============================================================================
-- MERCHANT PROFILES
-- ============================================================================
CREATE TABLE merchant_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL REFERENCES users_extended (id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT,
    tax_id TEXT,
    license_number TEXT,
    license_state TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    website TEXT,
    pos_system TEXT, -- 'flowhub', 'cova', 'indicaonline', 'other'
    pos_api_key TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)
);

-- ============================================================================
-- MERCHANT LOCATIONS
-- ============================================================================
CREATE TABLE merchant_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    merchant_id UUID NOT NULL REFERENCES merchant_profiles (id) ON DELETE CASCADE,
    location_name TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- BNPL PLANS (Templates)
-- ============================================================================
CREATE TABLE bnpl_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name TEXT NOT NULL,
    description TEXT,
    installments INTEGER NOT NULL CHECK (
        installments >= 2
        AND installments <= 12
    ),
    interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 0, -- percentage
    min_amount DECIMAL(10, 2) NOT NULL,
    max_amount DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- BNPL APPLICATIONS
-- ============================================================================
CREATE TABLE bnpl_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    customer_id UUID NOT NULL REFERENCES customer_profiles (id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchant_profiles (id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES bnpl_plans (id),
    purchase_amount DECIMAL(10, 2) NOT NULL,
    down_payment DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL, -- purchase_amount + interest
    status bnpl_status NOT NULL DEFAULT 'pending',
    risk_score INTEGER, -- 0-100
    approval_notes TEXT,
    approved_by UUID REFERENCES users_extended (id),
    approved_at TIMESTAMPTZ,
    rejected_reason TEXT,
    merchant_order_id TEXT, -- Reference to POS system order
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PAYMENT SCHEDULES
-- ============================================================================
CREATE TABLE payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    application_id UUID NOT NULL REFERENCES bnpl_applications (id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status payment_status NOT NULL DEFAULT 'scheduled',
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    paid_at TIMESTAMPTZ,
    transaction_id UUID, -- Will reference transactions table
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (
        application_id,
        installment_number
    )
);

-- ============================================================================
-- TRANSACTIONS
-- ============================================================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    application_id UUID REFERENCES bnpl_applications (id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customer_profiles (id) ON DELETE CASCADE,
    merchant_id UUID REFERENCES merchant_profiles (id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type TEXT NOT NULL, -- 'payment', 'refund', 'fee'
    status transaction_status NOT NULL DEFAULT 'pending',
    payment_method TEXT, -- 'card', 'ach', 'ellacash', 'bizpay', 'canpay'
    payment_processor TEXT,
    processor_transaction_id TEXT,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key to payment_schedules
ALTER TABLE payment_schedules
ADD CONSTRAINT fk_transaction FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE SET NULL;

-- ============================================================================
-- KYC DOCUMENTS
-- ============================================================================
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    customer_id UUID NOT NULL REFERENCES customer_profiles (id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'id_front', 'id_back', 'proof_of_address', 'selfie'
    file_path TEXT NOT NULL, -- Supabase Storage path
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    status kyc_status NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES users_extended (id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES users_extended (id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users Extended
CREATE INDEX idx_users_extended_role ON users_extended (role);

-- Customer Profiles
CREATE INDEX idx_customer_profiles_kyc_status ON customer_profiles (kyc_status);

CREATE INDEX idx_customer_profiles_user_id ON customer_profiles (user_id);

-- Merchant Profiles
CREATE INDEX idx_merchant_profiles_user_id ON merchant_profiles (user_id);

CREATE INDEX idx_merchant_profiles_verified ON merchant_profiles (is_verified);

-- BNPL Applications
CREATE INDEX idx_bnpl_applications_customer ON bnpl_applications (customer_id);

CREATE INDEX idx_bnpl_applications_merchant ON bnpl_applications (merchant_id);

CREATE INDEX idx_bnpl_applications_status ON bnpl_applications (status);

CREATE INDEX idx_bnpl_applications_created ON bnpl_applications (created_at DESC);

-- Payment Schedules
CREATE INDEX idx_payment_schedules_application ON payment_schedules (application_id);

CREATE INDEX idx_payment_schedules_status ON payment_schedules (status);

CREATE INDEX idx_payment_schedules_due_date ON payment_schedules (due_date);

-- Transactions
CREATE INDEX idx_transactions_customer ON transactions (customer_id);

CREATE INDEX idx_transactions_merchant ON transactions (merchant_id);

CREATE INDEX idx_transactions_status ON transactions (status);

CREATE INDEX idx_transactions_created ON transactions (created_at DESC);

-- KYC Documents
CREATE INDEX idx_kyc_documents_customer ON kyc_documents (customer_id);

CREATE INDEX idx_kyc_documents_status ON kyc_documents (status);

-- Audit Logs
CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);

CREATE INDEX idx_audit_logs_resource ON audit_logs (resource_type, resource_id);

CREATE INDEX idx_audit_logs_created ON audit_logs (created_at DESC);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_extended_updated_at BEFORE UPDATE ON users_extended
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchant_profiles_updated_at BEFORE UPDATE ON merchant_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchant_locations_updated_at BEFORE UPDATE ON merchant_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bnpl_plans_updated_at BEFORE UPDATE ON bnpl_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bnpl_applications_updated_at BEFORE UPDATE ON bnpl_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_schedules_updated_at BEFORE UPDATE ON payment_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON kyc_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();