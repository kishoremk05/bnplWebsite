-- Fix all missing RLS policies for Stripe payment flow

-- 1. Allow customers to insert payment schedules (for auto-approval flow)
DROP POLICY IF EXISTS "Customers can create payment schedules" ON payment_schedules;

CREATE POLICY "Customers can create payment schedules" ON payment_schedules FOR
INSERT
WITH
    CHECK (
        application_id IN (
            SELECT id
            FROM bnpl_applications
            WHERE
                customer_id IN (
                    SELECT id
                    FROM customer_profiles
                    WHERE
                        user_id = auth.uid ()
                )
        )
    );

-- 2. Allow merchants to insert payment schedules (for manual approval)
DROP POLICY IF EXISTS "Merchants can create payment schedules" ON payment_schedules;

CREATE POLICY "Merchants can create payment schedules" ON payment_schedules FOR
INSERT
WITH
    CHECK (
        application_id IN (
            SELECT id
            FROM bnpl_applications
            WHERE
                merchant_id IN (
                    SELECT id
                    FROM merchant_profiles
                    WHERE
                        user_id = auth.uid ()
                )
        )
    );

-- 3. Create payment_methods table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    customer_id UUID NOT NULL REFERENCES customer_profiles (id) ON DELETE CASCADE,
    stripe_payment_method_id TEXT NOT NULL,
    card_brand TEXT,
    card_last4 TEXT,
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- 5. Allow customers to view their own payment methods
DROP POLICY IF EXISTS "Customers can view own payment methods" ON payment_methods;

CREATE POLICY "Customers can view own payment methods" ON payment_methods FOR
SELECT USING (
        customer_id IN (
            SELECT id
            FROM customer_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

-- 6. Allow customers to insert their own payment methods
DROP POLICY IF EXISTS "Customers can insert payment methods" ON payment_methods;

CREATE POLICY "Customers can insert payment methods" ON payment_methods FOR
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

-- 7. Allow customers to update their own payment methods
DROP POLICY IF EXISTS "Customers can update payment methods" ON payment_methods;

CREATE POLICY "Customers can update payment methods" ON payment_methods FOR
UPDATE USING (
    customer_id IN (
        SELECT id
        FROM customer_profiles
        WHERE
            user_id = auth.uid ()
    )
);

-- 8. Allow customers to delete their own payment methods
DROP POLICY IF EXISTS "Customers can delete payment methods" ON payment_methods;

CREATE POLICY "Customers can delete payment methods" ON payment_methods FOR DELETE USING (
    customer_id IN (
        SELECT id
        FROM customer_profiles
        WHERE
            user_id = auth.uid ()
    )
);

-- 9. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_methods_customer ON payment_methods (customer_id);

CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods (customer_id, is_default)
WHERE
    is_default = true;

-- 10. Add updated_at trigger
CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;

CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_methods_updated_at();