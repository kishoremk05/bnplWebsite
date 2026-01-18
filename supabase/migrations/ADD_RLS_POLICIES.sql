-- ============================================================================
-- RegalPay BNPL Platform - RLS Policies Only
-- Run this in Supabase SQL Editor
-- This adds the missing Row Level Security policies to your existing tables
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
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
-- HELPER FUNCTIONS FOR RLS
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

CREATE OR REPLACE FUNCTION get_customer_profile_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM customer_profiles WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_merchant_profile_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM merchant_profiles WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES - USERS_EXTENDED
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON users_extended;

CREATE POLICY "Users can view own profile" ON users_extended FOR
SELECT USING (auth.uid () = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users_extended;

CREATE POLICY "Users can update own profile" ON users_extended FOR
UPDATE USING (auth.uid () = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users_extended;

CREATE POLICY "Users can insert own profile" ON users_extended FOR
INSERT
WITH
    CHECK (auth.uid () = id);

DROP POLICY IF EXISTS "Admins can view all users" ON users_extended;

CREATE POLICY "Admins can view all users" ON users_extended FOR
SELECT USING (is_admin ());

DROP POLICY IF EXISTS "Admins can update all users" ON users_extended;

CREATE POLICY "Admins can update all users" ON users_extended FOR
UPDATE USING (is_admin ());

-- ============================================================================
-- RLS POLICIES - CUSTOMER_PROFILES
-- ============================================================================

DROP POLICY IF EXISTS "Customers can view own profile" ON customer_profiles;

CREATE POLICY "Customers can view own profile" ON customer_profiles FOR
SELECT USING (user_id = auth.uid ());

DROP POLICY IF EXISTS "Customers can update own profile" ON customer_profiles;

CREATE POLICY "Customers can update own profile" ON customer_profiles FOR
UPDATE USING (user_id = auth.uid ());

DROP POLICY IF EXISTS "Customers can insert own profile" ON customer_profiles;

CREATE POLICY "Customers can insert own profile" ON customer_profiles FOR
INSERT
WITH
    CHECK (user_id = auth.uid ());

DROP POLICY IF EXISTS "Merchants can view their customers" ON customer_profiles;

CREATE POLICY "Merchants can view their customers" ON customer_profiles FOR
SELECT USING (
        id IN (
            SELECT customer_id
            FROM bnpl_applications
            WHERE
                merchant_id = get_merchant_profile_id ()
        )
    );

DROP POLICY IF EXISTS "Admins can view all customers" ON customer_profiles;

CREATE POLICY "Admins can view all customers" ON customer_profiles FOR
SELECT USING (is_admin ());

DROP POLICY IF EXISTS "Admins can update all customers" ON customer_profiles;

CREATE POLICY "Admins can update all customers" ON customer_profiles FOR
UPDATE USING (is_admin ());

-- ============================================================================
-- RLS POLICIES - MERCHANT_PROFILES
-- ============================================================================

DROP POLICY IF EXISTS "Merchants can view own profile" ON merchant_profiles;

CREATE POLICY "Merchants can view own profile" ON merchant_profiles FOR
SELECT USING (user_id = auth.uid ());

DROP POLICY IF EXISTS "Merchants can update own profile" ON merchant_profiles;

CREATE POLICY "Merchants can update own profile" ON merchant_profiles FOR
UPDATE USING (user_id = auth.uid ());

DROP POLICY IF EXISTS "Merchants can insert own profile" ON merchant_profiles;

CREATE POLICY "Merchants can insert own profile" ON merchant_profiles FOR
INSERT
WITH
    CHECK (user_id = auth.uid ());

DROP POLICY IF EXISTS "Admins can view all merchants" ON merchant_profiles;

CREATE POLICY "Admins can view all merchants" ON merchant_profiles FOR
SELECT USING (is_admin ());

DROP POLICY IF EXISTS "Admins can update all merchants" ON merchant_profiles;

CREATE POLICY "Admins can update all merchants" ON merchant_profiles FOR
UPDATE USING (is_admin ());

-- ============================================================================
-- RLS POLICIES - MERCHANT_LOCATIONS
-- ============================================================================

DROP POLICY IF EXISTS "Merchants can view own locations" ON merchant_locations;

CREATE POLICY "Merchants can view own locations" ON merchant_locations FOR
SELECT USING (
        merchant_id IN (
            SELECT id
            FROM merchant_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Merchants can manage own locations" ON merchant_locations;

CREATE POLICY "Merchants can manage own locations" ON merchant_locations FOR ALL USING (
    merchant_id IN (
        SELECT id
        FROM merchant_profiles
        WHERE
            user_id = auth.uid ()
    )
);

DROP POLICY IF EXISTS "Admins can view all locations" ON merchant_locations;

CREATE POLICY "Admins can view all locations" ON merchant_locations FOR
SELECT USING (is_admin ());

-- ============================================================================
-- RLS POLICIES - BNPL_PLANS
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view active plans" ON bnpl_plans;

CREATE POLICY "Anyone can view active plans" ON bnpl_plans FOR
SELECT USING (
        is_active = true
        OR is_admin ()
    );

DROP POLICY IF EXISTS "Admins can manage plans" ON bnpl_plans;

CREATE POLICY "Admins can manage plans" ON bnpl_plans FOR ALL USING (is_admin ());

-- ============================================================================
-- RLS POLICIES - BNPL_APPLICATIONS
-- ============================================================================

DROP POLICY IF EXISTS "Customers can view own applications" ON bnpl_applications;

CREATE POLICY "Customers can view own applications" ON bnpl_applications FOR
SELECT USING (
        customer_id = get_customer_profile_id ()
    );

DROP POLICY IF EXISTS "Customers can create applications" ON bnpl_applications;

CREATE POLICY "Customers can create applications" ON bnpl_applications FOR
INSERT
WITH
    CHECK (
        customer_id = get_customer_profile_id ()
    );

DROP POLICY IF EXISTS "Merchants can view their applications" ON bnpl_applications;

CREATE POLICY "Merchants can view their applications" ON bnpl_applications FOR
SELECT USING (
        merchant_id = get_merchant_profile_id ()
    );

DROP POLICY IF EXISTS "Merchants can update their applications" ON bnpl_applications;

CREATE POLICY "Merchants can update their applications" ON bnpl_applications FOR
UPDATE USING (
    merchant_id = get_merchant_profile_id ()
);

DROP POLICY IF EXISTS "Admins can manage all applications" ON bnpl_applications;

CREATE POLICY "Admins can manage all applications" ON bnpl_applications FOR ALL USING (is_admin ());

-- ============================================================================
-- RLS POLICIES - PAYMENT_SCHEDULES
-- ============================================================================

DROP POLICY IF EXISTS "Customers can view own schedules" ON payment_schedules;

CREATE POLICY "Customers can view own schedules" ON payment_schedules FOR
SELECT USING (
        application_id IN (
            SELECT id
            FROM bnpl_applications
            WHERE
                customer_id = get_customer_profile_id ()
        )
    );

DROP POLICY IF EXISTS "Merchants can view their schedules" ON payment_schedules;

CREATE POLICY "Merchants can view their schedules" ON payment_schedules FOR
SELECT USING (
        application_id IN (
            SELECT id
            FROM bnpl_applications
            WHERE
                merchant_id = get_merchant_profile_id ()
        )
    );

DROP POLICY IF EXISTS "Admins can manage all schedules" ON payment_schedules;

CREATE POLICY "Admins can manage all schedules" ON payment_schedules FOR ALL USING (is_admin ());

-- ============================================================================
-- RLS POLICIES - TRANSACTIONS
-- ============================================================================

DROP POLICY IF EXISTS "Customers can view own transactions" ON transactions;

CREATE POLICY "Customers can view own transactions" ON transactions FOR
SELECT USING (
        customer_id = get_customer_profile_id ()
    );

DROP POLICY IF EXISTS "Merchants can view their transactions" ON transactions;

CREATE POLICY "Merchants can view their transactions" ON transactions FOR
SELECT USING (
        merchant_id = get_merchant_profile_id ()
    );

DROP POLICY IF EXISTS "Admins can manage all transactions" ON transactions;

CREATE POLICY "Admins can manage all transactions" ON transactions FOR ALL USING (is_admin ());

DROP POLICY IF EXISTS "System can insert transactions" ON transactions;

CREATE POLICY "System can insert transactions" ON transactions FOR
INSERT
WITH
    CHECK (true);

-- ============================================================================
-- RLS POLICIES - KYC_DOCUMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Customers can view own documents" ON kyc_documents;

CREATE POLICY "Customers can view own documents" ON kyc_documents FOR
SELECT USING (
        customer_id = get_customer_profile_id ()
    );

DROP POLICY IF EXISTS "Customers can upload documents" ON kyc_documents;

CREATE POLICY "Customers can upload documents" ON kyc_documents FOR
INSERT
WITH
    CHECK (
        customer_id = get_customer_profile_id ()
    );

DROP POLICY IF EXISTS "Admins can manage all documents" ON kyc_documents;

CREATE POLICY "Admins can manage all documents" ON kyc_documents FOR ALL USING (is_admin ());

-- ============================================================================
-- RLS POLICIES - AUDIT_LOGS
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

CREATE POLICY "Admins can view audit logs" ON audit_logs FOR
SELECT USING (is_admin ());

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

CREATE POLICY "System can insert audit logs" ON audit_logs FOR
INSERT
WITH
    CHECK (true);

-- ============================================================================
-- DONE!
-- ============================================================================
-- All RLS policies have been created successfully.
-- Your app should now work without security errors.
-- ============================================================================