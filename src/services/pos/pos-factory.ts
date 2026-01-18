// POS Factory
// Factory pattern for instantiating the correct POS adapter based on merchant configuration

import { IPOSAdapter, POSAdapterConfig } from './pos-adapter.interface';
import { FlowhubAdapter } from './flowhub-adapter';
import { CovaAdapter } from './cova-adapter';

export type POSSystemType = 'flowhub' | 'cova' | 'indicaonline' | 'other';

/**
 * Create the appropriate POS adapter based on system type
 */
export function createPOSAdapter(
    systemType: POSSystemType,
    config: POSAdapterConfig
): IPOSAdapter | null {
    switch (systemType) {
        case 'flowhub':
            return new FlowhubAdapter(config);
        case 'cova':
            return new CovaAdapter(config);
        case 'indicaonline':
            // TODO: Implement IndicaOnline adapter when needed
            console.warn('IndicaOnline adapter not yet implemented');
            return null;
        case 'other':
            console.warn('Generic POS adapter not available');
            return null;
        default:
            console.warn(`Unknown POS system type: ${systemType}`);
            return null;
    }
}

/**
 * Get list of supported POS systems
 */
export function getSupportedPOSSystems(): { id: POSSystemType; name: string; available: boolean }[] {
    return [
        { id: 'flowhub', name: 'Flowhub', available: true },
        { id: 'cova', name: 'Cova POS', available: true },
        { id: 'indicaonline', name: 'IndicaOnline', available: false },
        { id: 'other', name: 'Other', available: false },
    ];
}

/**
 * Test POS connection for a merchant
 */
export async function testPOSConnection(
    systemType: POSSystemType,
    apiKey: string,
    merchantId?: string
): Promise<{ success: boolean; message: string }> {
    const adapter = createPOSAdapter(systemType, {
        apiKey,
        merchantId,
    });

    if (!adapter) {
        return {
            success: false,
            message: `POS system "${systemType}" is not supported yet`,
        };
    }

    try {
        const status = await adapter.testConnection();

        if (status.connected) {
            return {
                success: true,
                message: `Successfully connected to ${adapter.posSystemName}`,
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
            message: error.message || 'Unexpected error during connection test',
        };
    }
}
