/**
 * Stripe Frontend Service
 * Handles client-side card tokenization using Stripe.js
 * 
 * SECURITY: Card details are sent directly to Stripe, never to our server
 */

export interface CardDetails {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardholderName: string;
}

export interface TokenizeResult {
    success: boolean;
    token?: string;
    cardLast4?: string;
    cardBrand?: string;
    error?: string;
}

// Stripe publishable key (from environment)
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_';

/**
 * Load Stripe.js SDK dynamically
 */
export async function loadStripeScript(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if ((window as any).Stripe) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;

        script.onload = () => {
            if ((window as any).Stripe) {
                resolve(true);
            } else {
                reject(new Error('Stripe.js failed to load'));
            }
        };

        script.onerror = () => {
            reject(new Error('Failed to load Stripe.js'));
        };

        document.head.appendChild(script);
    });
}

/**
 * Validate card details client-side
 */
export function validateCardDetails(card: CardDetails): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Card number validation (basic Luhn check)
    const cardNumber = card.cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cardNumber)) {
        errors.push('Invalid card number');
    } else if (!luhnCheck(cardNumber)) {
        errors.push('Invalid card number (failed checksum)');
    }

    // Expiry validation
    const month = parseInt(card.expiryMonth, 10);
    const year = parseInt(card.expiryYear, 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (month < 1 || month > 12) {
        errors.push('Invalid expiry month');
    }

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.push('Card has expired');
    }

    // CVV validation
    if (!/^\d{3,4}$/.test(card.cvv)) {
        errors.push('Invalid CVV');
    }

    // Cardholder name
    if (!card.cardholderName || card.cardholderName.trim().length < 3) {
        errors.push('Invalid cardholder name');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Luhn algorithm for card number validation
 */
function luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i], 10);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

/**
 * Detect card brand from card number
 */
export function detectCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');

    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'American Express';
    if (/^6(?:011|5)/.test(number)) return 'Discover';
    if (/^35/.test(number)) return 'JCB';
    if (/^(5018|5020|5038|6304|6759|676[1-3])/.test(number)) return 'Maestro';

    return 'Unknown';
}

/**
 * Tokenize card details with Stripe
 * 
 * @param cardDetails - Card information from user
 * @returns TokenizeResult with token or error
 */
export async function createCardToken(cardDetails: CardDetails): Promise<TokenizeResult> {
    try {
        // Validate card details first
        const validation = validateCardDetails(cardDetails);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.errors.join(', '),
            };
        }

        // Ensure Stripe.js is loaded
        await loadStripeScript();

        const Stripe = (window as any).Stripe;
        if (!Stripe) {
            throw new Error('Stripe.js not initialized');
        }

        // Initialize Stripe instance
        const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

        // Create payment method with Stripe
        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: 'card',
            card: {
                number: cardDetails.cardNumber.replace(/\s/g, ''),
                exp_month: parseInt(cardDetails.expiryMonth, 10),
                exp_year: parseInt(cardDetails.expiryYear, 10),
                cvc: cardDetails.cvv,
            },
            billing_details: {
                name: cardDetails.cardholderName,
            },
        });

        if (error) {
            return {
                success: false,
                error: error.message || 'Tokenization failed',
            };
        }

        return {
            success: true,
            token: paymentMethod.id, // pm_xxxxx
            cardLast4: paymentMethod.card.last4,
            cardBrand: paymentMethod.card.brand,
        };

    } catch (error: any) {
        console.error('Card tokenization error:', error);
        return {
            success: false,
            error: error.message || 'Failed to tokenize card',
        };
    }
}

/**
 * Format card number with spaces (for display)
 */
export function formatCardNumber(value: string): string {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
}

/**
 * Format expiry date (MM/YY)
 */
export function formatExpiryDate(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
        return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
}
