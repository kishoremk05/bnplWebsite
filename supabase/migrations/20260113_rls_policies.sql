-- RegalPay BNPL Platform - Row Level Security Policies
-- This migration sets up RLS policies for all tables

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
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
-- HELPER FUNCTIONS
-- ============================================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (SELECT role FROM users_extended WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'admin' FROM users_extended WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get customer profile ID for current user
CREATE OR REPLACE FUNCTION get_customer_profile_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM customer_profiles WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get merchant profile ID for current user
CREATE OR REPLACE FUNCTION get_merchant_profile_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM merchant_profiles WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USERS EXTENDED POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users_extended FOR
SELECT USING (auth.uid () = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users_extended FOR
UPDATE USING (auth.uid () = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users_extended FOR
SELECT USING (is_admin ());

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON users_extended FOR
UPDATE USING (is_admin ());

-- ============================================================================
-- CUSTOMER PROFILES POLICIES
-- ============================================================================

-- Customers can view their own profile
CREATE POLICY "Customers can view own profile" ON customer_profiles FOR
SELECT USING (user_id = auth.uid ());

-- Customers can update their own profile
CREATE POLICY "Customers can update own profile" ON customer_profiles FOR
UPDATE USING (user_id = auth.uid ());

-- Merchants can view customer profiles for their BNPL applications
CREATE POLICY "Merchants can view related customers" ON customer_profiles FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM
                bnpl_applications ba
                JOIN merchant_profiles mp ON ba.merchant_id = mp.id
            WHERE
                ba.customer_id = customer_profiles.id
                AND mp.user_id = auth.uid ()
        )
    );

-- Admins can view all customer profiles
CREATE POLICY "Admins can view all customers" ON customer_profiles FOR
SELECT USING (is_admin ());

-- Admins can update all customer profiles
CREATE POLICY "Admins can update all customers" ON customer_profiles FOR
UPDATE USING (is_admin ());

-- ============================================================================
-- MERCHANT PROFILES POLICIES
-- ============================================================================

-- Merchants can view their own profile
CREATE POLICY "Merchants can view own profile" ON merchant_profiles FOR
SELECT USING (user_id = auth.uid ());

-- Merchants can update their own profile
CREATE POLICY "Merchants can update own profile" ON merchant_profiles FOR
UPDATE USING (user_id = auth.uid ());

-- Customers can view merchant profiles for their BNPL applications
CREATE POLICY "Customers can view related merchants" ON merchant_profiles FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM
                bnpl_applications ba
                JOIN customer_profiles cp ON ba.customer_id = cp.id
            WHERE
                ba.merchant_id = merchant_profiles.id
                AND cp.user_id = auth.uid ()
        )
    );

-- Admins can view all merchant profiles
CREATE POLICY "Admins can view all merchants" ON merchant_profiles FOR
SELECT USING (is_admin ());

-- Admins can update all merchant profiles
CREATE POLICY "Admins can update all merchants" ON merchant_profiles FOR
UPDATE USING (is_admin ());

-- ============================================================================
-- MERCHANT LOCATIONS POLICIES
-- ============================================================================

-- Merchants can view their own locations
CREATE POLICY "Merchants can view own locations" ON merchant_locations FOR
SELECT USING (
        merchant_id IN (
            SELECT id
            FROM merchant_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

-- Merchants can manage their own locations
CREATE POLICY "Merchants can manage own locations" ON merchant_locations FOR ALL USING (
    merchant_id IN (
        SELECT id
        FROM merchant_profiles
        WHERE
            user_id = auth.uid ()
    )
);

-- Admins can view all locations
CREATE POLICY "Admins can view all locations" ON merchant_locations FOR
SELECT USING (is_admin ());

-- ============================================================================
-- BNPL PLANS POLICIES
-- ============================================================================

-- Everyone can view active BNPL plans
CREATE POLICY "Anyone can view active plans" ON bnpl_plans FOR
SELECT USING (
        is_active = true
        OR is_admin ()
    );

-- Only admins can manage BNPL plans
CREATE POLICY "Admins can manage plans" ON bnpl_plans FOR ALL USING (is_admin ());

-- ============================================================================
-- BNPL APPLICATIONS POLICIES
-- ============================================================================

-- Customers can view their own applications
CREATE POLICY "Customers can view own applications" ON bnpl_applications FOR
SELECT USING (
        customer_id IN (
            SELECT id
            FROM customer_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

-- Customers can create applications
CREATE POLICY "Customers can create applications" ON bnpl_applications FOR
INSERT
WITH
    CHECK (
        customer_id IN (
            SELECT id
            FROM customer_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

-- Merchants can view applications for their business
CREATE POLICY "Merchants can view own applications" ON bnpl_applications FOR
SELECT USING (
        merchant_id IN (
            SELECT id
            FROM merchant_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

-- Admins can view all applications
CREATE POLICY "Admins can view all applications" ON bnpl_applications FOR
SELECT USING (is_admin ());

-- Admins can update all applications
CREATE POLICY "Admins can update all applications" ON bnpl_applications FOR
UPDATE USING (is_admin ());

-- ============================================================================
-- PAYMENT SCHEDULES POLICIES
-- ============================================================================

-- Customers can view their own payment schedules
CREATE POLICY "Customers can view own schedules" ON payment_schedules FOR
SELECT USING (
        application_id IN (
            SELECT ba.id
            FROM
                bnpl_applications ba
                JOIN customer_profiles cp ON ba.customer_id = cp.id
            WHERE
                cp.user_id = auth.uid ()
        )
    );

-- Merchants can view schedules for their applications
CREATE POLICY "Merchants can view related schedules" ON payment_schedules FOR
SELECT USING (
        application_id IN (
            SELECT ba.id
            FROM
                bnpl_applications ba
                JOIN merchant_profiles mp ON ba.merchant_id = mp.id
            WHERE
                mp.user_id = auth.uid ()
        )
    );

-- Admins can view all schedules
CREATE POLICY "Admins can view all schedules" ON payment_schedules FOR
SELECT USING (is_admin ());

-- Admins can update schedules
CREATE POLICY "Admins can update schedules" ON payment_schedules FOR
UPDATE USING (is_admin ());

-- ============================================================================
-- TRANSACTIONS POLICIES
-- ============================================================================

-- Customers can view their own transactions
CREATE POLICY "Customers can view own transactions" ON transactions FOR
SELECT USING (
        customer_id IN (
            SELECT id
            FROM customer_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

-- Merchants can view their transactions
CREATE POLICY "Merchants can view own transactions" ON transactions FOR
SELECT USING (
        merchant_id IN (
            SELECT id
            FROM merchant_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON transactions FOR
SELECT USING (is_admin ());

-- Admins can manage transactions
CREATE POLICY "Admins can manage transactions" ON transactions FOR ALL USING (is_admin ());

-- ============================================================================
-- KYC DOCUMENTS POLICIES
-- ============================================================================

-- Customers can view their own KYC documents
CREATE POLICY "Customers can view own documents" ON kyc_documents FOR
SELECT USING (
        customer_id IN (
            SELECT id
            FROM customer_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

-- Customers can upload their own documents
CREATE POLICY "Customers can upload documents" ON kyc_documents FOR
INSERT
WITH
    CHECK (
        customer_id IN (
            SELECT id
            FROM customer_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

-- Admins can view all documents
CREATE POLICY "Admins can view all documents" ON kyc_documents FOR
SELECT USING (is_admin ());

-- Admins can update documents (for review)
CREATE POLICY "Admins can update documents" ON kyc_documents FOR
UPDATE USING (is_admin ());

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR
SELECT USING (is_admin ());

-- System can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs" ON audit_logs FOR
INSERT
WITH
    CHECK (true);