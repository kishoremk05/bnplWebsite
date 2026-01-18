-- ============================================================================
-- RegalPay BNPL Platform - Complete Database Setup
-- Run this entire file in Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE user_role AS ENUM ('customer', 'merchant', 'admin');

CREATE TYPE kyc_status AS ENUM ('pending', 'in_review', 'approved', 'rejected');

CREATE TYPE bnpl_status AS ENUM ('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted');

CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

CREATE TYPE payment_status AS ENUM ('scheduled', 'processing', 'completed', 'failed', 'skipped');

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS users_extended (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'customer',
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
    pos_system TEXT,
    pos_api_key TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)
);

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

CREATE TABLE bnpl_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name TEXT NOT NULL,
    description TEXT,
    installments INTEGER NOT NULL CHECK (
        installments >= 2
        AND installments <= 12
    ),
    interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
    min_amount DECIMAL(10, 2) NOT NULL,
    max_amount DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bnpl_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    customer_id UUID NOT NULL REFERENCES customer_profiles (id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchant_profiles (id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES bnpl_plans (id),
    purchase_amount DECIMAL(10, 2) NOT NULL,
    down_payment DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    status bnpl_status NOT NULL DEFAULT 'pending',
    risk_score INTEGER,
    approval_notes TEXT,
    approved_by UUID REFERENCES users_extended (id),
    approved_at TIMESTAMPTZ,
    rejected_reason TEXT,
    merchant_order_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    application_id UUID NOT NULL REFERENCES bnpl_applications (id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status payment_status NOT NULL DEFAULT 'scheduled',
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    paid_at TIMESTAMPTZ,
    transaction_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (
        application_id,
        installment_number
    )
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    application_id UUID REFERENCES bnpl_applications (id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customer_profiles (id) ON DELETE CASCADE,
    merchant_id UUID REFERENCES merchant_profiles (id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type TEXT NOT NULL,
    status transaction_status NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    payment_processor TEXT,
    processor_transaction_id TEXT,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE payment_schedules
ADD CONSTRAINT fk_transaction FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE SET NULL;

CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    customer_id UUID NOT NULL REFERENCES customer_profiles (id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
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

CREATE INDEX idx_users_extended_role ON users_extended (role);

CREATE INDEX idx_customer_profiles_kyc_status ON customer_profiles (kyc_status);

CREATE INDEX idx_customer_profiles_user_id ON customer_profiles (user_id);

CREATE INDEX idx_merchant_profiles_user_id ON merchant_profiles (user_id);

CREATE INDEX idx_merchant_profiles_verified ON merchant_profiles (is_verified);

CREATE INDEX idx_bnpl_applications_customer ON bnpl_applications (customer_id);

CREATE INDEX idx_bnpl_applications_merchant ON bnpl_applications (merchant_id);

CREATE INDEX idx_bnpl_applications_status ON bnpl_applications (status);

CREATE INDEX idx_bnpl_applications_created ON bnpl_applications (created_at DESC);

CREATE INDEX idx_payment_schedules_application ON payment_schedules (application_id);

CREATE INDEX idx_payment_schedules_status ON payment_schedules (status);

CREATE INDEX idx_payment_schedules_due_date ON payment_schedules (due_date);

CREATE INDEX idx_transactions_customer ON transactions (customer_id);

CREATE INDEX idx_transactions_merchant ON transactions (merchant_id);

CREATE INDEX idx_transactions_status ON transactions (status);

CREATE INDEX idx_transactions_created ON transactions (created_at DESC);

CREATE INDEX idx_kyc_documents_customer ON kyc_documents (customer_id);

CREATE INDEX idx_kyc_documents_status ON kyc_documents (status);

CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);

CREATE INDEX idx_audit_logs_resource ON audit_logs (resource_type, resource_id);

CREATE INDEX idx_audit_logs_created ON audit_logs (created_at DESC);

-- ============================================================================
-- TRIGGERS
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

-- ============================================================================
-- ROW LEVEL SECURITY - ENABLE
-- ============================================================================

ALTER TABLE users_extended ENABLE ROW LEVEL SECURITY;

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE merchant_profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE merchant_locations ENABLE ROW LEVEL SECURITY;

ALTER TABLE bnpl_plans ENABLE ROW LEVEL SECURITY;

ALTER TABLE bnpl_applications ENABLE ROW LEVEL SECURITY;

ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (SELECT role FROM users_extended WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'admin' FROM users_extended WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES - USERS EXTENDED
-- ============================================================================

CREATE POLICY "Users can view own profile" ON users_extended FOR
SELECT USING (auth.uid () = id);

CREATE POLICY "Users can update own profile" ON users_extended FOR
UPDATE USING (auth.uid () = id);

CREATE POLICY "Users can insert own profile" ON users_extended FOR
INSERT
WITH
    CHECK (auth.uid () = id);

CREATE POLICY "Admins can view all users" ON users_extended FOR
SELECT USING (is_admin ());

CREATE POLICY "Admins can update all users" ON users_extended FOR
UPDATE USING (is_admin ());

-- ============================================================================
-- RLS POLICIES - CUSTOMER PROFILES
-- ============================================================================

CREATE POLICY "Customers can view own profile" ON customer_profiles FOR
SELECT USING (user_id = auth.uid ());

CREATE POLICY "Customers can update own profile" ON customer_profiles FOR
UPDATE USING (user_id = auth.uid ());

CREATE POLICY "Customers can insert own profile" ON customer_profiles FOR
INSERT
WITH
    CHECK (user_id = auth.uid ());

CREATE POLICY "Admins can view all customers" ON customer_profiles FOR
SELECT USING (is_admin ());

CREATE POLICY "Admins can update all customers" ON customer_profiles FOR
UPDATE USING (is_admin ());

-- ============================================================================
-- RLS POLICIES - MERCHANT PROFILES
-- ============================================================================

CREATE POLICY "Merchants can view own profile" ON merchant_profiles FOR
SELECT USING (user_id = auth.uid ());

CREATE POLICY "Merchants can update own profile" ON merchant_profiles FOR
UPDATE USING (user_id = auth.uid ());

CREATE POLICY "Merchants can insert own profile" ON merchant_profiles FOR
INSERT
WITH
    CHECK (user_id = auth.uid ());

CREATE POLICY "Admins can view all merchants" ON merchant_profiles FOR
SELECT USING (is_admin ());

CREATE POLICY "Admins can update all merchants" ON merchant_profiles FOR
UPDATE USING (is_admin ());

-- ============================================================================
-- RLS POLICIES - MERCHANT LOCATIONS
-- ============================================================================

CREATE POLICY "Merchants can view own locations" ON merchant_locations FOR
SELECT USING (
        merchant_id IN (
            SELECT id
            FROM merchant_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Merchants can manage own locations" ON merchant_locations FOR ALL USING (
    merchant_id IN (
        SELECT id
        FROM merchant_profiles
        WHERE
            user_id = auth.uid ()
    )
);

CREATE POLICY "Admins can view all locations" ON merchant_locations FOR
SELECT USING (is_admin ());

-- ============================================================================
-- RLS POLICIES - BNPL PLANS
-- ============================================================================

CREATE POLICY "Anyone can view active plans" ON bnpl_plans FOR
SELECT USING (
        is_active = true
        OR is_admin ()
    );

CREATE POLICY "Admins can manage plans" ON bnpl_plans FOR ALL USING (is_admin ());

-- ============================================================================
-- RLS POLICIES - AUDIT LOGS
-- ============================================================================

CREATE POLICY "Admins can view audit logs" ON audit_logs FOR
SELECT USING (is_admin ());

CREATE POLICY "System can insert audit logs" ON audit_logs FOR
INSERT
WITH
    CHECK (true);

-- ============================================================================
-- SEED DATA
-- ============================================================================

INSERT INTO
    bnpl_plans (
        name,
        description,
        installments,
        interest_rate,
        min_amount,
        max_amount,
        is_active
    )
VALUES (
        'Pay in 2',
        'Split your purchase into 2 equal payments with 0% interest',
        2,
        0,
        50,
        500,
        true
    ),
    (
        'Pay in 4',
        'Split your purchase into 4 equal payments with 0% interest',
        4,
        0,
        100,
        1000,
        true
    ),
    (
        'Pay in 6',
        'Split your purchase into 6 monthly payments with low interest',
        6,
        5.99,
        200,
        2000,
        true
    ),
    (
        'Pay in 12',
        'Split your purchase into 12 monthly payments',
        12,
        9.99,
        500,
        5000,
        true
    );