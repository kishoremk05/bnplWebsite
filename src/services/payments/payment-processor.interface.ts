// Payment Processor Interface
// Defines standard contract for all payment processor integrations
// Abstracts BNPL context from processors - they only see token, amount, date

export interface TokenizedPaymentMethod {
    token: string;
    lastFour: string;
    cardType: 'visa' | 'mastercard' | 'amex' | 'discover' | 'debit' | 'other';
    expiryMonth: number;
    expiryYear: number;
    processorId: string;
}

export interface ChargeRequest {
    token: string;
    amount: number;
    currency?: string;
    description?: string; // Keep generic - no BNPL context
    metadata?: Record<string, string>; // Only safe, non-revealing data
}

export interface ChargeResult {
    success: boolean;
    transactionId?: string;
    processorTransactionId?: string;
    error?: string;
    errorCode?: string;
    retryable?: boolean;
}

export interface RefundRequest {
    transactionId: string;
    amount?: number; // Partial refund amount, omit for full refund
    reason?: string;
}

export interface ProcessorConnectionStatus {
    connected: boolean;
    merchantAccountActive: boolean;
    error?: string;
}

/**
 * Abstract interface for payment processor adapters
 * All implementations must hide BNPL context from processors
 */
export interface IPaymentProcessor {
    /**
     * Unique identifier for this processor
     */
    readonly processorId: string;

    /**
     * Display name for the processor
     */
    readonly processorName: string;

    /**
     * Test connection to processor
     */
    testConnection(): Promise<ProcessorConnectionStatus>;

    /**
     * Tokenize a payment method (card)
     * Stores card securely with processor, returns token
     */
    tokenizeCard(cardData: {
        cardNumber: string;
        expiryMonth: number;
        expiryYear: number;
        cvv: string;
        cardholderName: string;
        billingZip?: string;
    }): Promise<TokenizedPaymentMethod | null>;

    /**
     * Charge a tokenized payment method
     * NOTE: Description and metadata must be generic - no BNPL context
     */
    charge(request: ChargeRequest): Promise<ChargeResult>;

    /**
     * Schedule a future charge (for installments)
     * Processor only sees: token, amount, date - not installment context
     */
    scheduleCharge(
        token: string,
        amount: number,
        chargeDate: Date
    ): Promise<{ scheduledId: string } | null>;

    /**
     * Cancel a scheduled charge
     */
    cancelScheduledCharge(scheduledId: string): Promise<boolean>;

    /**
     * Process a refund
     */
    refund(request: RefundRequest): Promise<ChargeResult>;
}

/**
 * Payment Processor Configuration
 */
export interface PaymentProcessorConfig {
    apiKey: string;
    secretKey?: string;
    merchantId?: string;
    environment?: 'sandbox' | 'production';
}

/**
 * Generate a generic description for processor
 * IMPORTANT: No BNPL, installment, or financing terms
 */
export function generateGenericDescription(merchantName: string): string {
    // Keep description merchant-focused, no financing context
    return `Purchase at ${merchantName}`;
}

/**
 * Filter metadata to remove any BNPL-revealing information
 */
export function sanitizeMetadata(
    metadata: Record<string, any>
): Record<string, string> {
    // Only allow safe, non-revealing fields
    const allowedFields = ['order_ref', 'merchant_ref', 'timestamp'];
    const sanitized: Record<string, string> = {};

    for (const key of allowedFields) {
        if (metadata[key]) {
            sanitized[key] = String(metadata[key]);
        }
    }

    return sanitized;
}
