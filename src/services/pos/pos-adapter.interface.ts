// POS Adapter Interface
// Defines standard contract for all POS system integrations
// Read-only access pattern to protect IP and ensure vendor invisibility

export interface POSTransaction {
    transactionId: string;
    orderId: string;
    customerReference: string;
    purchaseAmount: number;
    taxAmount: number;
    totalAmount: number;
    items: POSLineItem[];
    timestamp: Date;
    status: 'pending' | 'completed' | 'cancelled' | 'refunded';
    metadata?: Record<string, any>;
}

export interface POSLineItem {
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface POSCustomer {
    customerId: string;
    externalId: string;
    phone?: string;
    email?: string;
}

export interface POSConnectionStatus {
    connected: boolean;
    lastSync?: Date;
    error?: string;
}

/**
 * Abstract interface for POS system adapters
 * All implementations must adhere to this read-only pattern
 */
export interface IPOSAdapter {
    /**
     * Unique identifier for this POS system
     */
    readonly posSystemId: string;

    /**
     * Display name for the POS system
     */
    readonly posSystemName: string;

    /**
     * Test connection to POS system
     */
    testConnection(): Promise<POSConnectionStatus>;

    /**
     * Fetch a specific transaction by order ID
     * Read-only - never modifies POS data
     */
    fetchTransaction(orderId: string): Promise<POSTransaction | null>;

    /**
     * Get transactions for a time period
     * Read-only - for sync purposes
     */
    fetchTransactions(
        startDate: Date,
        endDate: Date,
        limit?: number
    ): Promise<POSTransaction[]>;

    /**
     * Get customer reference ID from an order
     * Used for shadow mapping without exposing BNPL logic
     */
    getCustomerReference(orderId: string): Promise<string | null>;

    /**
     * Get purchase amount from an order
     */
    getPurchaseAmount(orderId: string): Promise<number | null>;

    /**
     * Update order notes with harmless BNPL reference
     * This is the only write operation - adds internal reference only
     * Note content is obfuscated to prevent reverse-engineering
     */
    updateOrderNotes(orderId: string, internalReference: string): Promise<boolean>;
}

/**
 * POS Adapter Configuration
 */
export interface POSAdapterConfig {
    apiKey: string;
    apiUrl?: string;
    webhookSecret?: string;
    merchantId?: string;
}

/**
 * Generate obfuscated internal reference for POS mapping
 * This appears as harmless metadata to the POS vendor
 */
export function generateObfuscatedReference(applicationId: string): string {
    // Simple obfuscation - looks like internal tracking number
    const timestamp = Date.now().toString(36);
    const shortId = applicationId.slice(0, 8);
    return `INT-${timestamp}-${shortId}`.toUpperCase();
}

/**
 * Decode obfuscated reference back to application ID
 */
export function decodeObfuscatedReference(reference: string): string | null {
    try {
        const parts = reference.split('-');
        if (parts.length >= 3 && parts[0] === 'INT') {
            return parts[2];
        }
        return null;
    } catch {
        return null;
    }
}
