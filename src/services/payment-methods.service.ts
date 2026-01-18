/**
 * Payment Methods Service
 * Handles saving and managing tokenized payment methods
 */

import { supabase } from '@/integrations/supabase/client';

export interface PaymentMethod {
    id: string;
    customer_id: string;
    token: string;
    card_last_4: string;
    card_brand: string | null;
    card_exp_month: number | null;
    card_exp_year: number | null;
    is_default: boolean;
    created_at: string;
}

export interface SavePaymentMethodParams {
    customerId: string;
    token: string;
    cardLast4: string;
    cardBrand: string;
    expiryMonth: number;
    expiryYear: number;
    setAsDefault?: boolean;
}

/**
 * Save a new payment method
 */
export async function savePaymentMethod(
    params: SavePaymentMethodParams
): Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: string }> {
    try {
        const { customerId, token, cardLast4, cardBrand, expiryMonth, expiryYear, setAsDefault } = params;

        // If setting as default, unset other defaults first
        if (setAsDefault) {
            await supabase
                .from('payment_methods')
                .update({ is_default: false })
                .eq('customer_id', customerId);
        }

        // Insert new payment method
        const { data, error } = await supabase
            .from('payment_methods')
            .insert({
                customer_id: customerId,
                token,
                card_last_4: cardLast4,
                card_brand: cardBrand,
                card_exp_month: expiryMonth,
                card_exp_year: expiryYear,
                is_default: setAsDefault || false,
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving payment method:', error);
            return { success: false, error: error.message };
        }

        return { success: true, paymentMethod: data };
    } catch (error: any) {
        console.error('Error in savePaymentMethod:', error);
        return { success: false, error: error.message || 'Failed to save payment method' };
    }
}

/**
 * Get all payment methods for a customer
 */
export async function getPaymentMethods(
    customerId: string
): Promise<{ success: boolean; paymentMethods?: PaymentMethod[]; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching payment methods:', error);
            return { success: false, error: error.message };
        }

        return { success: true, paymentMethods: data || [] };
    } catch (error: any) {
        console.error('Error in getPaymentMethods:', error);
        return { success: false, error: error.message || 'Failed to fetch payment methods' };
    }
}

/**
 * Get default payment method for a customer
 */
export async function getDefaultPaymentMethod(
    customerId: string
): Promise<{ success: boolean; paymentMethod?: PaymentMethod | null; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('customer_id', customerId)
            .eq('is_default', true)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching default payment method:', error);
            return { success: false, error: error.message };
        }

        return { success: true, paymentMethod: data || null };
    } catch (error: any) {
        console.error('Error in getDefaultPaymentMethod:', error);
        return { success: false, error: error.message || 'Failed to fetch default payment method' };
    }
}

/**
 * Set a payment method as default
 */
export async function setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Unset all defaults
        await supabase
            .from('payment_methods')
            .update({ is_default: false })
            .eq('customer_id', customerId);

        // Set new default
        const { error } = await supabase
            .from('payment_methods')
            .update({ is_default: true })
            .eq('id', paymentMethodId)
            .eq('customer_id', customerId);

        if (error) {
            console.error('Error setting default payment method:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error in setDefaultPaymentMethod:', error);
        return { success: false, error: error.message || 'Failed to set default payment method' };
    }
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(
    paymentMethodId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('payment_methods')
            .delete()
            .eq('id', paymentMethodId);

        if (error) {
            console.error('Error deleting payment method:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error in deletePaymentMethod:', error);
        return { success: false, error: error.message || 'Failed to delete payment method' };
    }
}

/**
 * Check if card is expiring soon (within 30 days)
 */
export function isCardExpiringSoon(expiryMonth: number, expiryYear: number): boolean {
    const now = new Date();
    const expiry = new Date(expiryYear, expiryMonth - 1); // Month is 0-indexed
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return expiry <= thirtyDaysFromNow;
}

/**
 * Format card display (e.g., "Visa •••• 4242")
 */
export function formatCardDisplay(brand: string | null, last4: string): string {
    const brandName = brand || 'Card';
    return `${brandName} •••• ${last4}`;
}
