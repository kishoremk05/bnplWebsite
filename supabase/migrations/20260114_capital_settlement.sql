-- Capital & Settlement Model - Phase 3
-- This migration creates tables for capital management, merchant settlements, and reconciliation

-- ============================================================================
-- CAPITAL POOL
-- ============================================================================
CREATE TABLE capital_pool (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    total_capital DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (total_capital >= 0),
    available_capital DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (available_capital >= 0),
    reserved_capital DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (reserved_capital >= 0),
    deployed_capital DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (deployed_capital >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initialize with single row (singleton pattern)
INSERT INTO
    capital_pool (
        total_capital,
        available_capital
    )
VALUES (1000000.00, 1000000.00);

COMMENT ON
TABLE capital_pool IS 'Tracks overall capital available for BNPL deployments';

COMMENT ON COLUMN capital_pool.total_capital IS 'Total capital in the pool';

COMMENT ON COLUMN capital_pool.available_capital IS 'Capital available for new deployments';

COMMENT ON COLUMN capital_pool.reserved_capital IS 'Capital reserved for pending applications';

COMMENT ON COLUMN capital_pool.deployed_capital IS 'Capital deployed to active applications';

-- ============================================================================
-- FUNDING SOURCES
-- ============================================================================
CREATE TABLE funding_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    source_name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (
        source_type IN (
            'bank_account',
            'credit_line',
            'investor',
            'revenue'
        )
    ),
    total_amount DECIMAL(15, 2) NOT NULL CHECK (total_amount >= 0),
    available_amount DECIMAL(15, 2) NOT NULL CHECK (available_amount >= 0),
    interest_rate DECIMAL(5, 2) DEFAULT 0 CHECK (interest_rate >= 0),
    maturity_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for funding sources
CREATE INDEX idx_funding_sources_active ON funding_sources (is_active);

CREATE INDEX idx_funding_sources_type ON funding_sources (source_type);

COMMENT ON
TABLE funding_sources IS 'Tracks sources of capital funding';

-- ============================================================================
-- MERCHANT SETTLEMENTS
-- ============================================================================
CREATE TABLE merchant_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    merchant_id UUID NOT NULL REFERENCES merchant_profiles (id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES bnpl_applications (id) ON DELETE CASCADE,
    settlement_amount DECIMAL(10, 2) NOT NULL CHECK (settlement_amount >= 0),
    settlement_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
        status IN (
            'scheduled',
            'processing',
            'completed',
            'failed',
            'cancelled'
        )
    ),
    payment_method TEXT CHECK (
        payment_method IN (
            'ach',
            'wire',
            'check',
            'platform_credit'
        )
    ),
    payment_reference TEXT,
    fees_deducted DECIMAL(10, 2) DEFAULT 0 CHECK (fees_deducted >= 0),
    net_amount DECIMAL(10, 2) NOT NULL CHECK (net_amount >= 0),
    scheduled_by UUID REFERENCES users_extended (id),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (application_id) -- One settlement per application
);

-- Indexes for merchant settlements
CREATE INDEX idx_settlements_merchant ON merchant_settlements (merchant_id);

CREATE INDEX idx_settlements_application ON merchant_settlements (application_id);

CREATE INDEX idx_settlements_status ON merchant_settlements (status);

CREATE INDEX idx_settlements_date ON merchant_settlements (settlement_date);

CREATE INDEX idx_settlements_scheduled ON merchant_settlements (settlement_date, status)
WHERE
    status = 'scheduled';

COMMENT ON
TABLE merchant_settlements IS 'Tracks merchant payouts for approved applications';

COMMENT ON COLUMN merchant_settlements.settlement_amount IS 'Gross amount to settle';

COMMENT ON COLUMN merchant_settlements.fees_deducted IS 'Platform fees deducted from settlement';

COMMENT ON COLUMN merchant_settlements.net_amount IS 'Net amount paid to merchant';

-- ============================================================================
-- CAPITAL TRANSACTIONS
-- ============================================================================
CREATE TABLE capital_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    transaction_type TEXT NOT NULL CHECK (
        transaction_type IN (
            'deployment',
            'collection',
            'reserve',
            'release',
            'fee',
            'refund'
        )
    ),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
    application_id UUID REFERENCES bnpl_applications (id) ON DELETE SET NULL,
    settlement_id UUID REFERENCES merchant_settlements (id) ON DELETE SET NULL,
    funding_source_id UUID REFERENCES funding_sources (id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for capital transactions
CREATE INDEX idx_capital_txn_type ON capital_transactions (transaction_type);

CREATE INDEX idx_capital_txn_application ON capital_transactions (application_id);

CREATE INDEX idx_capital_txn_settlement ON capital_transactions (settlement_id);

CREATE INDEX idx_capital_txn_created ON capital_transactions (created_at DESC);

COMMENT ON
TABLE capital_transactions IS 'Ledger of all capital movements';

-- ============================================================================
-- RECONCILIATION RECORDS
-- ============================================================================
CREATE TABLE reconciliation_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    record_date DATE NOT NULL UNIQUE,
    total_disbursed DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_collected DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_fees DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_outstanding DECIMAL(15, 2) NOT NULL DEFAULT 0,
    net_position DECIMAL(15, 2) NOT NULL DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    settlements_count INTEGER DEFAULT 0,
    payments_count INTEGER DEFAULT 0,
    reconciled_by UUID REFERENCES users_extended (id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for reconciliation records
CREATE INDEX idx_reconciliation_date ON reconciliation_records (record_date DESC);

COMMENT ON
TABLE reconciliation_records IS 'Daily financial reconciliation snapshots';

COMMENT ON COLUMN reconciliation_records.net_position IS 'Net cash position (collected - disbursed + fees)';

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_capital_pool_updated_at 
    BEFORE UPDATE ON capital_pool
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funding_sources_updated_at 
    BEFORE UPDATE ON funding_sources
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchant_settlements_updated_at 
    BEFORE UPDATE ON merchant_settlements
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- Merchant settlement summary view
CREATE OR REPLACE VIEW merchant_settlement_summary AS
SELECT
    m.id as merchant_id,
    m.business_name,
    COUNT(DISTINCT ms.id) as total_settlements,
    SUM(
        CASE
            WHEN ms.status = 'completed' THEN ms.net_amount
            ELSE 0
        END
    ) as total_paid,
    SUM(
        CASE
            WHEN ms.status = 'scheduled' THEN ms.net_amount
            ELSE 0
        END
    ) as pending_amount,
    MAX(ms.completed_at) as last_settlement_date
FROM
    merchant_profiles m
    LEFT JOIN merchant_settlements ms ON m.id = ms.merchant_id
GROUP BY
    m.id,
    m.business_name;

COMMENT ON VIEW merchant_settlement_summary IS 'Summary of merchant settlement statistics';

-- Capital health view
CREATE OR REPLACE VIEW capital_health AS
SELECT
    cp.total_capital,
    cp.available_capital,
    cp.reserved_capital,
    cp.deployed_capital,
    ROUND(
        (
            cp.available_capital / NULLIF(cp.total_capital, 0) * 100
        ),
        2
    ) as available_percentage,
    ROUND(
        (
            cp.deployed_capital / NULLIF(cp.total_capital, 0) * 100
        ),
        2
    ) as deployment_percentage,
    COUNT(DISTINCT ba.id) as active_applications,
    SUM(ba.total_amount) as total_exposure
FROM
    capital_pool cp
    CROSS JOIN bnpl_applications ba
WHERE
    ba.status IN ('approved', 'active')
GROUP BY
    cp.id,
    cp.total_capital,
    cp.available_capital,
    cp.reserved_capital,
    cp.deployed_capital;

COMMENT ON VIEW capital_health IS 'Real-time capital pool health metrics';