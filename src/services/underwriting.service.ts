// Underwriting Service - Core BNPL Engine Component
// Handles customer eligibility, risk scoring, and credit decisions

import { supabase } from '@/integrations/supabase/client';
import { CustomerProfile, UserExtended, BNPLApplication } from '@/types/database';

// Risk factors and their weights for scoring
export const RISK_WEIGHTS = {
    KYC_STATUS: 25,          // Max 25 points - verified = full points
    PAYMENT_HISTORY: 30,     // Max 30 points - based on past payment behavior
    CREDIT_UTILIZATION: 20,  // Max 20 points - lower utilization = higher score
    ACCOUNT_AGE: 15,         // Max 15 points - older accounts score higher
    REQUESTED_AMOUNT: 10,    // Max 10 points - lower % of limit = higher score
};

// Risk thresholds for auto-approval
export const RISK_THRESHOLDS = {
    AUTO_APPROVE: 70,        // Scores >= 70 are auto-approved
    MANUAL_REVIEW: 40,       // Scores 40-69 need manual review
    AUTO_REJECT: 39,         // Scores < 40 are auto-rejected
};

// Credit limit tiers based on KYC status
export const CREDIT_LIMITS = {
    pending: 0,
    in_review: 0,
    approved: 1000,
    rejected: 0,
};

export interface UnderwritingResult {
    eligible: boolean;
    riskScore: number;
    decision: 'auto_approve' | 'manual_review' | 'auto_reject';
    creditLimit: number;
    availableCredit: number;
    reasons: string[];
    breakdown: RiskScoreBreakdown;
}

export interface RiskScoreBreakdown {
    kycScore: number;
    paymentHistoryScore: number;
    creditUtilizationScore: number;
    accountAgeScore: number;
    requestedAmountScore: number;
}

export interface ApplicationRequest {
    customerId: string;
    merchantId: string;
    planId: string;
    purchaseAmount: number;
    downPayment?: number;
    checkoutSessionId?: string; // For checkout integration
}

/**
 * Calculate risk score for a customer
 * Returns a score from 0-100 where higher is better (lower risk)
 */
export async function calculateRiskScore(
    customerProfile: CustomerProfile,
    userExtended: UserExtended,
    requestedAmount: number
): Promise<{ score: number; breakdown: RiskScoreBreakdown }> {
    const breakdown: RiskScoreBreakdown = {
        kycScore: 0,
        paymentHistoryScore: 0,
        creditUtilizationScore: 0,
        accountAgeScore: 0,
        requestedAmountScore: 0,
    };

    // 1. KYC Status Score (0-25 points)
    switch (customerProfile.kyc_status) {
        case 'approved':
            breakdown.kycScore = 25;
            break;
        case 'in_review':
            breakdown.kycScore = 10;
            break;
        case 'pending':
            breakdown.kycScore = 5;
            break;
        case 'rejected':
            breakdown.kycScore = 0;
            break;
    }

    // 2. Payment History Score (0-30 points)
    // Fetch past payment performance
    const paymentHistory = await getPaymentHistory(customerProfile.id);
    breakdown.paymentHistoryScore = calculatePaymentHistoryScore(paymentHistory);

    // 3. Credit Utilization Score (0-20 points)
    const utilizationRatio = customerProfile.credit_limit > 0
        ? (customerProfile.credit_limit - customerProfile.available_credit) / customerProfile.credit_limit
        : 0;

    if (utilizationRatio <= 0.3) {
        breakdown.creditUtilizationScore = 20;
    } else if (utilizationRatio <= 0.5) {
        breakdown.creditUtilizationScore = 15;
    } else if (utilizationRatio <= 0.7) {
        breakdown.creditUtilizationScore = 10;
    } else if (utilizationRatio <= 0.9) {
        breakdown.creditUtilizationScore = 5;
    } else {
        breakdown.creditUtilizationScore = 0;
    }

    // 4. Account Age Score (0-15 points)
    const accountCreated = new Date(userExtended.created_at);
    const accountAgeMonths = Math.floor(
        (Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    if (accountAgeMonths >= 12) {
        breakdown.accountAgeScore = 15;
    } else if (accountAgeMonths >= 6) {
        breakdown.accountAgeScore = 12;
    } else if (accountAgeMonths >= 3) {
        breakdown.accountAgeScore = 8;
    } else if (accountAgeMonths >= 1) {
        breakdown.accountAgeScore = 5;
    } else {
        breakdown.accountAgeScore = 2;
    }

    // 5. Requested Amount Score (0-10 points)
    const requestedRatio = customerProfile.credit_limit > 0
        ? requestedAmount / customerProfile.credit_limit
        : 1;

    if (requestedRatio <= 0.25) {
        breakdown.requestedAmountScore = 10;
    } else if (requestedRatio <= 0.5) {
        breakdown.requestedAmountScore = 8;
    } else if (requestedRatio <= 0.75) {
        breakdown.requestedAmountScore = 5;
    } else if (requestedRatio <= 1) {
        breakdown.requestedAmountScore = 2;
    } else {
        breakdown.requestedAmountScore = 0; // Over limit
    }

    const totalScore =
        breakdown.kycScore +
        breakdown.paymentHistoryScore +
        breakdown.creditUtilizationScore +
        breakdown.accountAgeScore +
        breakdown.requestedAmountScore;

    return { score: totalScore, breakdown };
}

/**
 * Get payment history statistics for a customer
 */
async function getPaymentHistory(customerId: string): Promise<{
    totalPayments: number;
    onTimePayments: number;
    latePayments: number;
    missedPayments: number;
}> {
    try {
        // Fetch all payment schedules for this customer's applications
        const { data: applications } = await supabase
            .from('bnpl_applications')
            .select('id')
            .eq('customer_id', customerId);

        if (!applications || applications.length === 0) {
            return { totalPayments: 0, onTimePayments: 0, latePayments: 0, missedPayments: 0 };
        }

        const applicationIds = applications.map(a => a.id);

        const { data: payments } = await supabase
            .from('payment_schedules')
            .select('*')
            .in('application_id', applicationIds)
            .in('status', ['completed', 'failed', 'skipped']);

        if (!payments) {
            return { totalPayments: 0, onTimePayments: 0, latePayments: 0, missedPayments: 0 };
        }

        let onTimePayments = 0;
        let latePayments = 0;
        let missedPayments = 0;

        for (const payment of payments) {
            if (payment.status === 'completed' && payment.paid_at) {
                const dueDate = new Date(payment.due_date);
                const paidDate = new Date(payment.paid_at);

                if (paidDate <= dueDate) {
                    onTimePayments++;
                } else {
                    latePayments++;
                }
            } else if (payment.status === 'failed' || payment.status === 'skipped') {
                missedPayments++;
            }
        }

        return {
            totalPayments: payments.length,
            onTimePayments,
            latePayments,
            missedPayments,
        };
    } catch (error) {
        console.error('Error fetching payment history:', error);
        return { totalPayments: 0, onTimePayments: 0, latePayments: 0, missedPayments: 0 };
    }
}

/**
 * Calculate payment history score based on past behavior
 */
function calculatePaymentHistoryScore(history: {
    totalPayments: number;
    onTimePayments: number;
    latePayments: number;
    missedPayments: number;
}): number {
    // New customers with no history get a neutral score
    if (history.totalPayments === 0) {
        return 15; // 50% of max points
    }

    const onTimeRatio = history.onTimePayments / history.totalPayments;
    const missedRatio = history.missedPayments / history.totalPayments;

    // Deduct heavily for missed payments
    if (missedRatio > 0.2) {
        return 0;
    } else if (missedRatio > 0.1) {
        return 5;
    } else if (missedRatio > 0) {
        return 10;
    }

    // Score based on on-time payment ratio
    if (onTimeRatio >= 0.95) {
        return 30;
    } else if (onTimeRatio >= 0.85) {
        return 25;
    } else if (onTimeRatio >= 0.75) {
        return 20;
    } else {
        return 15;
    }
}

/**
 * Check customer eligibility for BNPL
 */
export async function checkEligibility(
    customerId: string,
    requestedAmount: number
): Promise<UnderwritingResult> {
    const reasons: string[] = [];

    // Fetch customer profile
    const { data: customerProfile, error: profileError } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', customerId)
        .single();

    if (profileError || !customerProfile) {
        return {
            eligible: false,
            riskScore: 0,
            decision: 'auto_reject',
            creditLimit: 0,
            availableCredit: 0,
            reasons: ['Customer profile not found'],
            breakdown: {
                kycScore: 0,
                paymentHistoryScore: 0,
                creditUtilizationScore: 0,
                accountAgeScore: 0,
                requestedAmountScore: 0,
            },
        };
    }

    // Fetch user extended info
    const { data: userExtended, error: userError } = await supabase
        .from('users_extended')
        .select('*')
        .eq('id', customerProfile.user_id)
        .single();

    if (userError || !userExtended) {
        return {
            eligible: false,
            riskScore: 0,
            decision: 'auto_reject',
            creditLimit: 0,
            availableCredit: 0,
            reasons: ['User information not found'],
            breakdown: {
                kycScore: 0,
                paymentHistoryScore: 0,
                creditUtilizationScore: 0,
                accountAgeScore: 0,
                requestedAmountScore: 0,
            },
        };
    }

    // Check KYC status
    if (customerProfile.kyc_status === 'rejected') {
        reasons.push('KYC verification rejected');
    } else if (customerProfile.kyc_status === 'pending') {
        reasons.push('KYC verification pending');
    }

    // Check available credit
    if (requestedAmount > customerProfile.available_credit) {
        reasons.push(`Requested amount ($${requestedAmount}) exceeds available credit ($${customerProfile.available_credit})`);
    }

    // Calculate risk score
    const { score: riskScore, breakdown } = await calculateRiskScore(
        customerProfile,
        userExtended,
        requestedAmount
    );

    // Determine decision based on risk score
    let decision: 'auto_approve' | 'manual_review' | 'auto_reject';
    let eligible = true;

    if (riskScore >= RISK_THRESHOLDS.AUTO_APPROVE) {
        decision = 'auto_approve';
    } else if (riskScore >= RISK_THRESHOLDS.MANUAL_REVIEW) {
        decision = 'manual_review';
        reasons.push('Application requires manual review due to moderate risk score');
    } else {
        decision = 'auto_reject';
        eligible = false;
        reasons.push('Application denied due to low risk score');
    }

    // Override decision if hard requirements not met
    if (customerProfile.kyc_status === 'rejected') {
        decision = 'auto_reject';
        eligible = false;
    }

    if (requestedAmount > customerProfile.available_credit) {
        decision = 'auto_reject';
        eligible = false;
    }

    return {
        eligible,
        riskScore,
        decision,
        creditLimit: customerProfile.credit_limit,
        availableCredit: customerProfile.available_credit,
        reasons,
        breakdown,
    };
}

/**
 * Process a BNPL application
 */
export async function processApplication(
    request: ApplicationRequest
): Promise<{
    success: boolean;
    applicationId?: string;
    decision: 'approved' | 'pending_review' | 'rejected';
    message: string;
}> {
    // Check eligibility first
    const eligibility = await checkEligibility(request.customerId, request.purchaseAmount);

    if (!eligibility.eligible) {
        return {
            success: false,
            decision: 'rejected',
            message: eligibility.reasons.join('. '),
        };
    }

    // Fetch plan details
    const { data: plan, error: planError } = await supabase
        .from('bnpl_plans')
        .select('*')
        .eq('id', request.planId)
        .single();

    if (planError || !plan) {
        return {
            success: false,
            decision: 'rejected',
            message: 'Selected plan not found',
        };
    }

    // Validate amount against plan limits
    if (request.purchaseAmount < plan.min_amount || request.purchaseAmount > plan.max_amount) {
        return {
            success: false,
            decision: 'rejected',
            message: `Purchase amount must be between $${plan.min_amount} and $${plan.max_amount} for this plan`,
        };
    }

    // Calculate total amount with interest
    const interestAmount = (request.purchaseAmount * plan.interest_rate) / 100;
    const totalAmount = request.purchaseAmount + interestAmount;
    const downPayment = request.downPayment || 0;

    // Force all applications to pending for merchant approval
    // This ensures Stripe payment is charged when merchant approves
    const status: 'pending' = 'pending';
    const approvalNotes = eligibility.decision === 'auto_approve'
        ? 'Pre-approved - awaiting merchant confirmation and down payment'
        : null;

    // Create the application
    const { data: application, error: appError } = await supabase
        .from('bnpl_applications')
        .insert({
            customer_id: request.customerId,
            merchant_id: request.merchantId,
            plan_id: request.planId,
            purchase_amount: request.purchaseAmount,
            down_payment: downPayment,
            total_amount: totalAmount,
            status,
            risk_score: eligibility.riskScore,
            approval_notes: approvalNotes,
            approved_at: null,
        })
        .select()
        .single();

    if (appError || !application) {
        console.error('Error creating application:', appError);
        return {
            success: false,
            decision: 'rejected',
            message: 'Failed to create application. Please try again.',
        };
    }

    // All applications go to pending for merchant approval
    const message = eligibility.decision === 'auto_approve'
        ? 'Your application has been pre-approved! The merchant will review and process your down payment.'
        : 'Your application is under review. We will notify you once a decision is made.';

    return {
        success: true,
        applicationId: application.id,
        decision: 'pending_review',
        message,
    };
}

/**
 * Generate payment schedule for an approved application
 */
export async function generatePaymentSchedule(
    applicationId: string,
    totalAmount: number,
    installments: number
): Promise<boolean> {
    const installmentAmount = Math.round((totalAmount / installments) * 100) / 100;
    const today = new Date();

    const schedules = [];

    for (let i = 1; i <= installments; i++) {
        const dueDate = new Date(today);
        dueDate.setMonth(dueDate.getMonth() + i);

        // Adjust for last installment to handle rounding
        const amount = i === installments
            ? totalAmount - (installmentAmount * (installments - 1))
            : installmentAmount;

        schedules.push({
            application_id: applicationId,
            installment_number: i,
            amount,
            due_date: dueDate.toISOString().split('T')[0],
            status: 'scheduled' as const,
            paid_amount: 0,
        });
    }

    const { error } = await supabase
        .from('payment_schedules')
        .insert(schedules);

    if (error) {
        console.error('Error creating payment schedule:', error);
        return false;
    }

    return true;
}

/**
 * Update credit limit based on KYC status
 */
export async function updateCreditLimitForKYC(
    customerId: string,
    kycStatus: 'pending' | 'in_review' | 'approved' | 'rejected'
): Promise<void> {
    const creditLimit = CREDIT_LIMITS[kycStatus];

    await supabase
        .from('customer_profiles')
        .update({
            credit_limit: creditLimit,
            available_credit: creditLimit, // Reset available credit to full limit
        })
        .eq('id', customerId);
}
