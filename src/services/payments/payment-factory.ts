// Payment Factory
// Factory pattern for instantiating the correct payment processor

import { IPaymentProcessor, PaymentProcessorConfig } from './payment-processor.interface';
import { EllacashAdapter } from './ellacash-adapter';
import { BizPayAdapter } from './bizpay-adapter';

export type PaymentProcessorType = 'ellacash' | 'bizpay' | 'canpay';

/**
 * Create the appropriate payment processor adapter
 */
export function createPaymentProcessor(
    processorType: PaymentProcessorType,
    config: PaymentProcessorConfig
): IPaymentProcessor | null {
    switch (processorType) {
        case 'ellacash':
            return new EllacashAdapter(config);
        case 'bizpay':
            return new BizPayAdapter(config);
        case 'canpay':
            // TODO: Implement CanPay adapter when needed
            console.warn('CanPay adapter not yet implemented');
            return null;
        default:
            console.warn(`Unknown payment processor type: ${processorType}`);
            return null;
    }
}

/**
 * Get list of supported payment processors
 */
export function getSupportedProcessors(): {
    id: PaymentProcessorType;
    name: string;
    available: boolean;
}[] {
    return [
        { id: 'ellacash', name: 'Ellacash', available: true },
        { id: 'bizpay', name: 'BizPay', available: true },
        { id: 'canpay', name: 'CanPay', available: false },
    ];
}

/**
 * Test payment processor connection
 */
export async function testProcessorConnection(
    processorType: PaymentProcessorType,
    config: PaymentProcessorConfig
): Promise<{ success: boolean; message: string; merchantActive?: boolean }> {
    const processor = createPaymentProcessor(processorType, config);

    if (!processor) {
        return {
            success: false,
            message: `Payment processor "${processorType}" is not supported yet`,
        };
    }

    try {
        const status = await processor.testConnection();

        if (status.connected) {
            return {
                success: true,
                message: `Connected to ${processor.processorName}`,
                merchantActive: status.merchantAccountActive,
            };
        } else {
            return {
                success: false,
                message: status.error || 'Connection failed',
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Unexpected error',
        };
    }
}
