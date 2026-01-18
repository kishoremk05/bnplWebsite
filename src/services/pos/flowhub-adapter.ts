// Flowhub POS Adapter
// Read-only integration with Flowhub cannabis POS system

import {
    IPOSAdapter,
    POSTransaction,
    POSConnectionStatus,
    POSAdapterConfig,
    generateObfuscatedReference,
} from './pos-adapter.interface';

export class FlowhubAdapter implements IPOSAdapter {
    readonly posSystemId = 'flowhub';
    readonly posSystemName = 'Flowhub';

    private apiKey: string;
    private apiUrl: string;

    constructor(config: POSAdapterConfig) {
        this.apiKey = config.apiKey;
        this.apiUrl = config.apiUrl || 'https://api.flowhub.com/v1';
    }

    async testConnection(): Promise<POSConnectionStatus> {
        try {
            // Test API connection by fetching store info
            const response = await fetch(`${this.apiUrl}/stores`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                return {
                    connected: true,
                    lastSync: new Date(),
                };
            } else {
                return {
                    connected: false,
                    error: `API returned ${response.status}: ${response.statusText}`,
                };
            }
        } catch (error: any) {
            return {
                connected: false,
                error: error.message || 'Connection failed',
            };
        }
    }

    async fetchTransaction(orderId: string): Promise<POSTransaction | null> {
        try {
            const response = await fetch(`${this.apiUrl}/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return this.mapToTransaction(data);
        } catch (error) {
            console.error('Flowhub fetchTransaction error:', error);
            return null;
        }
    }

    async fetchTransactions(
        startDate: Date,
        endDate: Date,
        limit: number = 100
    ): Promise<POSTransaction[]> {
        try {
            const params = new URLSearchParams({
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                limit: limit.toString(),
            });

            const response = await fetch(`${this.apiUrl}/orders?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                return [];
            }

            const data = await response.json();
            return (data.orders || []).map((order: any) => this.mapToTransaction(order));
        } catch (error) {
            console.error('Flowhub fetchTransactions error:', error);
            return [];
        }
    }

    async getCustomerReference(orderId: string): Promise<string | null> {
        const transaction = await this.fetchTransaction(orderId);
        return transaction?.customerReference || null;
    }

    async getPurchaseAmount(orderId: string): Promise<number | null> {
        const transaction = await this.fetchTransaction(orderId);
        return transaction?.totalAmount || null;
    }

    async updateOrderNotes(orderId: string, internalReference: string): Promise<boolean> {
        try {
            // Add obfuscated reference to order notes
            const response = await fetch(`${this.apiUrl}/orders/${orderId}/notes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    note: `Ref: ${internalReference}`, // Appears as generic reference
                    type: 'internal',
                }),
            });

            return response.ok;
        } catch (error) {
            console.error('Flowhub updateOrderNotes error:', error);
            return false;
        }
    }

    /**
     * Map Flowhub API response to standard POSTransaction format
     */
    private mapToTransaction(data: any): POSTransaction {
        return {
            transactionId: data.id,
            orderId: data.order_number || data.id,
            customerReference: data.customer_id || data.customer?.id || '',
            purchaseAmount: parseFloat(data.subtotal || 0),
            taxAmount: parseFloat(data.tax || 0),
            totalAmount: parseFloat(data.total || 0),
            items: (data.items || []).map((item: any) => ({
                sku: item.sku || item.product_id,
                name: item.name || item.product_name,
                quantity: item.quantity || 1,
                unitPrice: parseFloat(item.unit_price || 0),
                totalPrice: parseFloat(item.total || 0),
            })),
            timestamp: new Date(data.created_at || Date.now()),
            status: this.mapStatus(data.status),
            metadata: {
                storeId: data.store_id,
                employeeId: data.employee_id,
            },
        };
    }

    private mapStatus(status: string): 'pending' | 'completed' | 'cancelled' | 'refunded' {
        const statusMap: Record<string, 'pending' | 'completed' | 'cancelled' | 'refunded'> = {
            'pending': 'pending',
            'processing': 'pending',
            'completed': 'completed',
            'complete': 'completed',
            'cancelled': 'cancelled',
            'canceled': 'cancelled',
            'refunded': 'refunded',
            'void': 'cancelled',
        };
        return statusMap[status?.toLowerCase()] || 'pending';
    }
}
