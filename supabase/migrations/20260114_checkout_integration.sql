-- Merchant Checkout Integration - Phase 1
-- This migration creates tables for merchant checkout sessions, API keys, and webhooks

-- ============================================================================
-- MERCHANT CHECKOUT SESSIONS
-- ============================================================================
CREATE TABLE merchant_checkout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    merchant_id UUID NOT NULL REFERENCES merchant_profiles (id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    order_amount DECIMAL(10, 2) NOT NULL CHECK (order_amount > 0),
    order_id TEXT NOT NULL, -- Merchant's order ID
    order_metadata JSONB DEFAULT '{}',
    customer_email TEXT,
    customer_phone TEXT,
    return_url TEXT NOT NULL,
    cancel_url TEXT NOT NULL,
    webhook_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'completed',
            'cancelled',
            'expired'
        )
    ),
    expires_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for checkout sessions
CREATE INDEX idx_checkout_sessions_merchant ON merchant_checkout_sessions (merchant_id);

CREATE INDEX idx_checkout_sessions_token ON merchant_checkout_sessions (session_token);

CREATE INDEX idx_checkout_sessions_status ON merchant_checkout_sessions (status);

CREATE INDEX idx_checkout_sessions_expires ON merchant_checkout_sessions (expires_at);

COMMENT ON
TABLE merchant_checkout_sessions IS 'Tracks checkout sessions initiated by merchants';

COMMENT ON COLUMN merchant_checkout_sessions.session_token IS 'Unique token for checkout session identification';

COMMENT ON COLUMN merchant_checkout_sessions.order_metadata IS 'Additional order data from merchant (e.g., items, customer info)';

-- ============================================================================
-- MERCHANT API KEYS
-- ============================================================================
CREATE TABLE merchant_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    api_secret TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    allowed_domains TEXT[], -- CORS whitelist
    environment TEXT NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    UNIQUE(merchant_id, key_name)
);

-- Indexes for API keys
CREATE INDEX idx_api_keys_merchant ON merchant_api_keys (merchant_id);

CREATE INDEX idx_api_keys_key ON merchant_api_keys (api_key);

CREATE INDEX idx_api_keys_active ON merchant_api_keys (is_active);

COMMENT ON
TABLE merchant_api_keys IS 'API credentials for merchant integrations';

COMMENT ON COLUMN merchant_api_keys.allowed_domains IS 'Domains allowed to use this API key (CORS)';

-- ============================================================================
-- WEBHOOK LOGS
-- ============================================================================
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    checkout_session_id UUID REFERENCES merchant_checkout_sessions (id) ON DELETE SET NULL,
    application_id UUID REFERENCES bnpl_applications (id) ON DELETE SET NULL,
    webhook_url TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'checkout.completed', 'application.approved', 'payment.completed', etc.
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    attempt_number INTEGER DEFAULT 1,
    success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_retry_at TIMESTAMPTZ
);

-- Indexes for webhook logs
CREATE INDEX idx_webhook_logs_session ON webhook_logs (checkout_session_id);

CREATE INDEX idx_webhook_logs_application ON webhook_logs (application_id);

CREATE INDEX idx_webhook_logs_success ON webhook_logs (success);

CREATE INDEX idx_webhook_logs_retry ON webhook_logs (next_retry_at)
WHERE
    success = FALSE;

COMMENT ON
TABLE webhook_logs IS 'Tracks all webhook delivery attempts to merchants';

-- ============================================================================
-- ORDER INTENTS (Phase 2 preparation)
-- ============================================================================
CREATE TABLE order_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    checkout_session_id UUID NOT NULL REFERENCES merchant_checkout_sessions (id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customer_profiles (id) ON DELETE SET NULL,
    application_id UUID REFERENCES bnpl_applications (id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'created' CHECK (
        status IN (
            'created',
            'approved',
            'rejected',
            'completed',
            'failed',
            'cancelled'
        )
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for order intents
CREATE INDEX idx_order_intents_session ON order_intents (checkout_session_id);

CREATE INDEX idx_order_intents_customer ON order_intents (customer_id);

CREATE INDEX idx_order_intents_application ON order_intents (application_id);

CREATE INDEX idx_order_intents_status ON order_intents (status);

-- Trigger for updated_at
CREATE TRIGGER update_order_intents_updated_at 
    BEFORE UPDATE ON order_intents
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- UPDATE EXISTING TABLES
-- ============================================================================

-- Add checkout session reference to bnpl_applications
ALTER TABLE bnpl_applications
ADD COLUMN checkout_session_id UUID REFERENCES merchant_checkout_sessions (id) ON DELETE SET NULL,
ADD COLUMN order_intent_id TEXT,
ADD COLUMN merchant_notified_at TIMESTAMPTZ;

CREATE INDEX idx_bnpl_applications_checkout_session ON bnpl_applications (checkout_session_id);

COMMENT ON COLUMN bnpl_applications.checkout_session_id IS 'Reference to merchant checkout session if initiated via SDK';

COMMENT ON COLUMN bnpl_applications.merchant_notified_at IS 'Timestamp when merchant was notified of approval/rejection';