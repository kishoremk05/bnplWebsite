// BizPay Payment Processor Adapter
// Integration with BizPay cannabis payment processor

import {
    IPaymentProcessor,
    TokenizedPaymentMethod,
    ChargeRequest,
    ChargeResult,
    RefundRequest,
    ProcessorConnectionStatus,
    PaymentProcessorConfig,
    sanitizeMetadata,
} from './payment-processor.interface';

export class BizPayAdapter implements IPaymentProcessor {
    readonly processorId = 'bizpay';
    readonly processorName = 'BizPay';

    private apiKey: string;
    private merchantId: string;
    private apiUrl: string;

    constructor(config: PaymentProcessorConfig) {
        this.apiKey = config.apiKey;
        this.merchantId = config.merchantId || '';
        this.apiUrl = config.environment === 'production'
            ? 'https://api.bizpay.com/v2'
            : 'https://sandbox-api.bizpay.com/v2';
    }

    async testConnection(): Promise<ProcessorConnectionStatus> {
        try {
            const response = await fetch(`${this.apiUrl}/merchant/${this.merchantId}/status`, {
                headers: this.getHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    connected: true,
                    merchantAccountActive: data.account_status === 'active',
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
            const response = await fetch(`${this.apiUrl}/tokens/create`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    merchant_id: this.merchantId,
                    card: {
                        number: cardData.cardNumber.replace(/\s/g, ''),
                        exp_month: String(cardData.expiryMonth).padStart(2, '0'),
                        exp_year: String(cardData.expiryYear),
                        cvv: cardData.cvv,
                        holder_name: cardData.cardholderName,
                    },
                    billing: {
                        postal_code: cardData.billingZip,
                    },
                }),
            });

            if (!response.ok) {
                console.error('BizPay tokenization failed:', response.status);
                return null;
            }

            const data = await response.json();

            return {
                token: data.payment_token,
                lastFour: data.card_details.last_four,
                cardType: this.mapCardType(data.card_details.brand),
                expiryMonth: parseInt(data.card_details.exp_month),
                expiryYear: parseInt(data.card_details.exp_year),
                processorId: this.processorId,
            };
        } catch (error) {
            console.error('BizPay tokenization error:', error);
            return null;
        }
    }

    async charge(request: ChargeRequest): Promise<ChargeResult> {
        try {
            const response = await fetch(`${this.apiUrl}/payments/charge`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    merchant_id: this.merchantId,
                    payment_token: request.token,
                    amount: request.amount, // BizPay uses dollars, not cents
                    currency: request.currency || 'USD',
                    description: request.description || 'Payment', // Keep generic
                    reference: request.metadata?.order_ref,
                }),
            });

            const data = await response.json();

            if (response.ok && data.transaction_status === 'completed') {
                return {
                    success: true,
                    transactionId: data.transaction_id,
                    processorTransactionId: data.processor_ref,
                };
            } else {
                return {
                    success: false,
                    error: data.error_message || data.decline_reason || 'Charge failed',
                    errorCode: data.error_code,
                    retryable: this.isRetryable(data.error_code),
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
            const response = await fetch(`${this.apiUrl}/payments/schedule`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    merchant_id: this.merchantId,
                    payment_token: token,
                    amount,
                    currency: 'USD',
                    schedule_date: chargeDate.toISOString().split('T')[0],
                    description: 'Scheduled payment', // Generic
                }),
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return { scheduledId: data.schedule_id };
        } catch (error) {
            console.error('BizPay scheduleCharge error:', error);
            return null;
        }
    }

    async cancelScheduledCharge(scheduledId: string): Promise<boolean> {
        try {
            const response = await fetch(
                `${this.apiUrl}/payments/schedule/${scheduledId}/cancel`,
                {
                    method: 'DELETE',
                    headers: this.getHeaders(),
                }
            );
            return response.ok;
        } catch (error) {
            console.error('BizPay cancelScheduledCharge error:', error);
            return false;
        }
    }

    async refund(request: RefundRequest): Promise<ChargeResult> {
        try {
            const response = await fetch(`${this.apiUrl}/payments/refund`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    merchant_id: this.merchantId,
                    transaction_id: request.transactionId,
                    amount: request.amount, // Omit for full refund
                    reason: request.reason || 'customer_request',
                }),
            });

            const data = await response.json();

            if (response.ok && data.refund_status === 'completed') {
                return {
                    success: true,
                    transactionId: data.refund_id,
                };
            } else {
                return {
                    success: false,
                    error: data.error_message || 'Refund failed',
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
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Merchant-Id': this.merchantId,
            'Content-Type': 'application/json',
        };
    }

    private mapCardType(
        brand: string
    ): 'visa' | 'mastercard' | 'amex' | 'discover' | 'debit' | 'other' {
        const brandMap: Record<string, 'visa' | 'mastercard' | 'amex' | 'discover' | 'debit' | 'other'> = {
            'visa': 'visa',
            'mastercard': 'mastercard',
            'mc': 'mastercard',
            'american_express': 'amex',
            'amex': 'amex',
            'discover': 'discover',
            'debit': 'debit',
        };
        return brandMap[brand?.toLowerCase()] || 'other';
    }

    private isRetryable(errorCode?: string): boolean {
        const retryableCodes = [
            'RATE_LIMIT_EXCEEDED',
            'SERVICE_UNAVAILABLE',
            'TIMEOUT',
            'NETWORK_ERROR',
        ];
        return retryableCodes.includes(errorCode || '');
    }
}
