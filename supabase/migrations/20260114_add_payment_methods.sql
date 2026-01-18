-- Add customer payment methods table for tokenized card storage
-- This stores tokens from payment processors, never actual card data

CREATE TABLE IF NOT EXISTS customer_payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    customer_id UUID NOT NULL REFERENCES customer_profiles (id) ON DELETE CASCADE,
    processor TEXT NOT NULL, -- 'ellacash', 'bizpay', 'canpay'
    token TEXT NOT NULL, -- Tokenized payment method from processor
    last_four TEXT, -- Last 4 digits for display
    card_type TEXT, -- 'visa', 'mastercard', 'amex', 'discover', 'debit', 'other'
    expiry_month INTEGER,
    expiry_year INTEGER,
    cardholder_name TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure only one default payment method per customer
CREATE UNIQUE INDEX idx_unique_default_payment_method ON customer_payment_methods (customer_id)
WHERE
    is_default = TRUE;

-- Index for customer lookup
CREATE INDEX idx_payment_methods_customer ON customer_payment_methods (customer_id);

-- Trigger for updated_at
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON customer_payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for customer_payment_methods
ALTER TABLE customer_payment_methods ENABLE ROW LEVEL SECURITY;

-- Customers can only see their own payment methods
CREATE POLICY "Customers can view own payment methods" ON customer_payment_methods FOR
SELECT USING (
        customer_id IN (
            SELECT id
            FROM customer_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

-- Customers can add payment methods
CREATE POLICY "Customers can add payment methods" ON customer_payment_methods FOR
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

-- Customers can update their payment methods
CREATE POLICY "Customers can update own payment methods" ON customer_payment_methods FOR
UPDATE USING (
    customer_id IN (
        SELECT id
        FROM customer_profiles
        WHERE
            user_id = auth.uid ()
    )
);

-- Customers can delete their payment methods
CREATE POLICY "Customers can delete own payment methods" ON customer_payment_methods FOR DELETE USING (
    customer_id IN (
        SELECT id
        FROM customer_profiles
        WHERE
            user_id = auth.uid ()
    )
);

-- Admins can view all payment methods
CREATE POLICY "Admins can view all payment methods" ON customer_payment_methods FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM users_extended
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);