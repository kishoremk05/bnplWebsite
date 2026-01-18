// Cova POS Adapter
// Read-only integration with Cova cannabis POS system

import {
    IPOSAdapter,
    POSTransaction,
    POSConnectionStatus,
    POSAdapterConfig,
} from './pos-adapter.interface';

export class CovaAdapter implements IPOSAdapter {
    readonly posSystemId = 'cova';
    readonly posSystemName = 'Cova POS';

    private apiKey: string;
    private apiUrl: string;
    private merchantId: string;

    constructor(config: POSAdapterConfig) {
        this.apiKey = config.apiKey;
        this.apiUrl = config.apiUrl || 'https://api.covasoft.com/v2';
        this.merchantId = config.merchantId || '';
    }

    async testConnection(): Promise<POSConnectionStatus> {
        try {
            const response = await fetch(`${this.apiUrl}/merchants/${this.merchantId}/info`, {
                headers: {
                    'X-Api-Key': this.apiKey,
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
            const response = await fetch(
                `${this.apiUrl}/merchants/${this.merchantId}/transactions/${orderId}`,
                {
                    headers: {
                        'X-Api-Key': this.apiKey,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return this.mapToTransaction(data);
        } catch (error) {
            console.error('Cova fetchTransaction error:', error);
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
                from: startDate.toISOString(),
                to: endDate.toISOString(),
                pageSize: limit.toString(),
            });

            const response = await fetch(
                `${this.apiUrl}/merchants/${this.merchantId}/transactions?${params}`,
                {
                    headers: {
                        'X-Api-Key': this.apiKey,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                return [];
            }

            const data = await response.json();
            return (data.transactions || data.data || []).map((tx: any) =>
                this.mapToTransaction(tx)
            );
        } catch (error) {
            console.error('Cova fetchTransactions error:', error);
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
            const response = await fetch(
                `${this.apiUrl}/merchants/${this.merchantId}/transactions/${orderId}/notes`,
                {
                    method: 'PATCH',
                    headers: {
                        'X-Api-Key': this.apiKey,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        internalNote: `Tracking: ${internalReference}`,
                    }),
                }
            );

            return response.ok;
        } catch (error) {
            console.error('Cova updateOrderNotes error:', error);
            return false;
        }
    }

    private mapToTransaction(data: any): POSTransaction {
        return {
            transactionId: data.transactionId || data.id,
            orderId: data.invoiceNumber || data.id,
            customerReference: data.customerId || data.customer?.id || '',
            purchaseAmount: parseFloat(data.subTotal || data.subtotal || 0),
            taxAmount: parseFloat(data.taxTotal || data.tax || 0),
            totalAmount: parseFloat(data.grandTotal || data.total || 0),
            items: (data.lineItems || data.items || []).map((item: any) => ({
                sku: item.productSku || item.sku,
                name: item.productName || item.name,
                quantity: item.quantity || 1,
                unitPrice: parseFloat(item.unitPrice || 0),
                totalPrice: parseFloat(item.lineTotal || item.total || 0),
            })),
            timestamp: new Date(data.transactionDate || data.createdAt || Date.now()),
            status: this.mapStatus(data.status),
            metadata: {
                locationId: data.locationId,
                registerId: data.registerId,
            },
        };
    }

    private mapStatus(status: string): 'pending' | 'completed' | 'cancelled' | 'refunded' {
        const statusMap: Record<string, 'pending' | 'completed' | 'cancelled' | 'refunded'> = {
            'open': 'pending',
            'closed': 'completed',
            'completed': 'completed',
            'voided': 'cancelled',
            'refunded': 'refunded',
        };
        return statusMap[status?.toLowerCase()] || 'pending';
    }
}
