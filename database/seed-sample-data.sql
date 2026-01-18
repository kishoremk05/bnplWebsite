-- Quick Setup Script for Regal Pay BNPL Platform
-- This script updates existing data and creates missing items

-- ============================================
-- 1. CREATE BNPL PLANS (if missing)
-- ============================================

INSERT INTO
    bnpl_plans (
        id,
        name,
        installments,
        interest_rate,
        min_amount,
        max_amount,
        is_active,
        created_at
    )
SELECT
    gen_random_uuid (),
    name,
    installments,
    interest_rate,
    min_amount,
    max_amount,
    true,
    NOW()
FROM (
        VALUES ('Pay in 4', 4, 0, 50, 5000), ('Pay in 6', 6, 5, 100, 10000), (
                'Pay in 12', 12, 10, 500, 20000
            )
    ) AS plans (
        name, installments, interest_rate, min_amount, max_amount
    )
WHERE
    NOT EXISTS (
        SELECT 1
        FROM bnpl_plans
        WHERE
            name = plans.name
    );

-- ============================================
-- 2. UPDATE ALL CUSTOMERS WITH CREDIT LIMITS
-- ============================================

UPDATE customer_profiles
SET
    credit_limit = GREATEST(credit_limit, 5000),
    available_credit = GREATEST(available_credit, 5000)
WHERE
    credit_limit < 5000
    OR credit_limit IS NULL;

-- ============================================
-- 3. VERIFY ALL EXISTING MERCHANTS
-- ============================================

UPDATE merchant_profiles
SET
    is_verified = true,
    verified_at = COALESCE(verified_at, NOW())
WHERE
    is_verified = false
    OR is_verified IS NULL;

-- ============================================
-- 4. VIEW CURRENT DATA
-- ============================================

-- BNPL Plans
SELECT
    name,
    installments || ' payments' as plan,
    interest_rate || '%' as interest,
    '$' || min_amount || ' - $' || max_amount as range
FROM bnpl_plans
WHERE
    is_active = true
ORDER BY installments;

-- Merchants
SELECT 
  business_name,
  business_type,
  is_verified,
  created_at::date as registered
FROM merchant_profiles
ORDER BY created_at DESC;

-- Customers
SELECT u.full_name, c.credit_limit, c.available_credit, c.kyc_status
FROM
    customer_profiles c
    JOIN users_extended u ON c.user_id = u.id
ORDER BY u.created_at DESC
LIMIT 10;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Setup Complete!' as status, 'Merchants are now visible in dropdown' as message;