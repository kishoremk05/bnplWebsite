-- RegalPay BNPL Platform - Seed Data
-- This migration adds initial data for testing

-- ============================================================================
-- SEED BNPL PLANS
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

-- ============================================================================
-- SEED ADMIN USER (You'll need to create this user in Supabase Auth first)
-- ============================================================================

-- Note: This assumes you've created an admin user in Supabase Auth
-- Replace 'YOUR_ADMIN_USER_ID' with the actual UUID from auth.users

-- Example (commented out - uncomment and replace with actual UUID):
-- INSERT INTO users_extended (id, role, full_name, phone) VALUES
-- ('YOUR_ADMIN_USER_ID', 'admin', 'System Administrator', '+1234567890');