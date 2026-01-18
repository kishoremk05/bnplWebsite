// Ellacash Payment Processor Adapter
// Integration with Ellacash cannabis payment processor

import {
    IPaymentProcessor,
    TokenizedPaymentMethod,
    ChargeRequest,
    ChargeResult,
    RefundRequest,
    ProcessorConnectionStatus,
    PaymentProcessorConfig,
    generateGenericDescription,
    sanitizeMetadata,
} from './payment-processor.interface';

export class EllacashAdapter implements IPaymentProcessor {
    readonly processorId = 'ellacash';
    readonly processorName = 'Ellacash';

    private apiKey: string;
    private secretKey: string;
    private apiUrl: string;

    constructor(config: PaymentProcessorConfig) {
        this.apiKey = config.apiKey;
        this.secretKey = config.secretKey || '';
        this.apiUrl = config.environment === 'production'
            ? 'https://api.ellacash.com/v1'
            : 'https://sandbox.ellacash.com/v1';
    }

    async testConnection(): Promise<ProcessorConnectionStatus> {
        try {
            const response = await fetch(`${this.apiUrl}/merchants/me`, {
                headers: this.getHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    connected: true,
                    merchantAccountActive: data.status === 'active',
                };
            } else {
                return {
                    connected: false,
                    merchantAccountActive: false,
                    error: `API returned ${response.status}`,
                };
            }
        } catch (error: any) {
            return {
                connected: false,
                merchantAccountActive: false,
                error: error.message,
            };
        }
    }

    async tokenizeCard(cardData: {
        cardNumber: string;
        expiryMonth: number;
        expiryYear: number;
        cvv: string;
        cardholderName: string;
        billingZip?: string;
    }): Promise<TokenizedPaymentMethod | null> {
        try {
            const response = await fetch(`${this.apiUrl}/tokens`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    card_number: cardData.cardNumber.replace(/\s/g, ''),
                    exp_month: cardData.expiryMonth,
                    exp_year: cardData.expiryYear,
                    cvc: cardData.cvv,
                    name: cardData.cardholderName,
                    zip: cardData.billingZip,
                }),
            });

            if (!response.ok) {
                console.error('Ellacash tokenization failed:', response.status);
                return null;
            }

            const data = await response.json();

            return {
                token: data.token_id,
                lastFour: data.card.last4,
                cardType: this.mapCardType(data.card.brand),
                expiryMonth: data.card.exp_month,
                expiryYear: data.card.exp_year,
                processorId: this.processorId,
            };
        } catch (error) {
            console.error('Ellacash tokenization error:', error);
            return null;
        }
    }

    async charge(request: ChargeRequest): Promise<ChargeResult> {
        try {
            const response = await fetch(`${this.apiUrl}/charges`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    token: request.token,
                    amount: Math.round(request.amount * 100), // Convert to cents
                    currency: request.currency || 'usd',
                    description: request.description || 'Purchase', // Generic
                    metadata: request.metadata ? sanitizeMetadata(request.metadata) : undefined,
                }),
            });

            const data = await response.json();

            if (response.ok && data.status === 'succeeded') {
                return {
                    success: true,
                    transactionId: data.id,
                    processorTransactionId: data.processor_id,
                };
            } else {
                return {
                    success: false,
                    error: data.error?.message || 'Charge failed',
                    errorCode: data.error?.code,
                    retryable: this.isRetryable(data.error?.code),
                };
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                retryable: true,
            };
        }
    }

    async scheduleCharge(
        token: string,
        amount: number,
        chargeDate: Date
    ): Promise<{ scheduledId: string } | null> {
        try {
            const response = await fetch(`${this.apiUrl}/scheduled-charges`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    token,
                    amount: Math.round(amount * 100),
                    currency: 'usd',
                    scheduled_date: chargeDate.toISOString().split('T')[0],
                    description: 'Scheduled payment', // Generic - no installment context
                }),
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return { scheduledId: data.id };
        } catch (error) {
            console.error('Ellacash scheduleCharge error:', error);
            return null;
        }
    }

    async cancelScheduledCharge(scheduledId: string): Promise<boolean> {
        try {
            const response = await fetch(
                `${this.apiUrl}/scheduled-charges/${scheduledId}/cancel`,
                {
                    method: 'POST',
                    headers: this.getHeaders(),
                }
            );
            return response.ok;
        } catch (error) {
            console.error('Ellacash cancelScheduledCharge error:', error);
            return false;
        }
    }

    async refund(request: RefundRequest): Promise<ChargeResult> {
        try {
            const response = await fetch(`${this.apiUrl}/refunds`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    charge_id: request.transactionId,
                    amount: request.amount ? Math.round(request.amount * 100) : undefined,
                    reason: request.reason || 'requested_by_customer',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    transactionId: data.id,
                };
            } else {
                return {
                    success: false,
                    error: data.error?.message || 'Refund failed',
                };
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    private getHeaders(): Record<string, string> {
        return {
            'Authorization': `Bearer ${this.secretKey}`,
            'X-Api-Key': this.apiKey,
            'Content-Type': 'application/json',
        };
    }

    private mapCardType(
        brand: string
    ): 'visa' | 'mastercard' | 'amex' | 'discover' | 'debit' | 'other' {
        const brandMap: Record<string, 'visa' | 'mastercard' | 'amex' | 'discover' | 'debit' | 'other'> = {
            'visa': 'visa',
            'mastercard': 'mastercard',
            'american express': 'amex',
            'amex': 'amex',
            'discover': 'discover',
            'debit': 'debit',
        };
        return brandMap[brand?.toLowerCase()] || 'other';
    }

    private isRetryable(errorCode?: string): boolean {
        // These error codes indicate temporary issues
        const retryableCodes = [
            'rate_limit',
            'temporary_error',
            'network_error',
            'timeout',
        ];
        return retryableCodes.includes(errorCode || '');
    }
}
