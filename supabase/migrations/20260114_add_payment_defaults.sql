-- Payment defaults tracking table for collections management
-- Tracks missed payments and collection status

CREATE TABLE IF NOT EXISTS payment_defaults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    application_id UUID NOT NULL REFERENCES bnpl_applications (id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customer_profiles (id) ON DELETE CASCADE,
    missed_payments INTEGER NOT NULL DEFAULT 0,
    total_overdue DECIMAL(10, 2) NOT NULL DEFAULT 0,
    first_missed_date DATE NOT NULL,
    last_contact_date DATE,
    collection_status TEXT DEFAULT 'initial', -- 'initial', 'reminder', 'final_notice', 'collections', 'resolved'
    collection_notes TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users_extended (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One default record per application
CREATE UNIQUE INDEX idx_unique_default_per_app ON payment_defaults (application_id);

-- Index for customer lookup
CREATE INDEX idx_defaults_customer ON payment_defaults (customer_id);

-- Index for collection status filtering
CREATE INDEX idx_defaults_status ON payment_defaults (collection_status);

-- Trigger for updated_at
CREATE TRIGGER update_payment_defaults_updated_at BEFORE UPDATE ON payment_defaults
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE payment_defaults ENABLE ROW LEVEL SECURITY;

-- Customers can view their own defaults
CREATE POLICY "Customers can view own defaults" ON payment_defaults FOR
SELECT USING (
        customer_id IN (
            SELECT id
            FROM customer_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

-- Admins can manage all defaults
CREATE POLICY "Admins can manage defaults" ON payment_defaults FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM users_extended
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);