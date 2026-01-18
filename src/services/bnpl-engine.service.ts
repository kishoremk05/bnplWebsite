// BNPL Engine Service - Plan Generation and Management
// Handles installment plan calculations, modifications, and lifecycle

import { supabase } from '@/integrations/supabase/client';
import { BNPLPlan, BNPLApplication, PaymentSchedule } from '@/types/database';

export interface PlanCalculation {
    purchaseAmount: number;
    downPayment: number;
    interestAmount: number;
    totalAmount: number;
    financedAmount: number;
    installmentAmount: number;
    installments: number;
    interestRate: number;
}

export interface InstallmentBreakdown {
    installmentNumber: number;
    amount: number;
    dueDate: Date;
    principalPortion: number;
    interestPortion: number;
}

/**
 * Calculate plan details for a given purchase amount
 */
export function calculatePlan(
    plan: BNPLPlan,
    purchaseAmount: number,
    downPayment: number = 0
): PlanCalculation {
    const interestAmount = (purchaseAmount * plan.interest_rate) / 100;
    const totalAmount = purchaseAmount + interestAmount;
    const financedAmount = totalAmount - downPayment;
    const installmentAmount = Math.round((financedAmount / plan.installments) * 100) / 100;

    return {
        purchaseAmount,
        downPayment,
        interestAmount,
        totalAmount,
        financedAmount,
        installmentAmount,
        installments: plan.installments,
        interestRate: plan.interest_rate,
    };
}

/**
 * Generate detailed installment breakdown
 */
export function generateInstallmentBreakdown(
    calculation: PlanCalculation,
    startDate: Date = new Date()
): InstallmentBreakdown[] {
    const breakdown: InstallmentBreakdown[] = [];
    const principalPerInstallment = calculation.purchaseAmount / calculation.installments;
    const interestPerInstallment = calculation.interestAmount / calculation.installments;

    for (let i = 1; i <= calculation.installments; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        // Last installment handles rounding differences
        const isLast = i === calculation.installments;
        const amount = isLast
            ? calculation.financedAmount - (calculation.installmentAmount * (calculation.installments - 1))
            : calculation.installmentAmount;

        breakdown.push({
            installmentNumber: i,
            amount,
            dueDate,
            principalPortion: principalPerInstallment,
            interestPortion: interestPerInstallment,
        });
    }

    return breakdown;
}

/**
 * Fetch available BNPL plans
 */
export async function getAvailablePlans(
    purchaseAmount?: number
): Promise<BNPLPlan[]> {
    let query = supabase
        .from('bnpl_plans')
        .select('*')
        .eq('is_active', true)
        .order('installments', { ascending: true });

    if (purchaseAmount) {
        query = query
            .lte('min_amount', purchaseAmount)
            .gte('max_amount', purchaseAmount);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching plans:', error);
        return [];
    }

    return data || [];
}

/**
 * Get customer's active BNPL applications
 */
export async function getCustomerApplications(
    customerId: string,
    status?: string[]
): Promise<BNPLApplication[]> {
    let query = supabase
        .from('bnpl_applications')
        .select(`
      *,
      bnpl_plans (*),
      merchant_profiles (
        business_name
      )
    `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

    if (status && status.length > 0) {
        query = query.in('status', status);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching applications:', error);
        return [];
    }

    return data || [];
}

/**
 * Get payment schedule for an application
 */
export async function getPaymentSchedule(
    applicationId: string
): Promise<PaymentSchedule[]> {
    const { data, error } = await supabase
        .from('payment_schedules')
        .select('*')
        .eq('application_id', applicationId)
        .order('installment_number', { ascending: true });

    if (error) {
        console.error('Error fetching payment schedule:', error);
        return [];
    }

    return data || [];
}

/**
 * Get upcoming payments for a customer
 */
export async function getUpcomingPayments(
    customerId: string,
    limit: number = 5
): Promise<PaymentSchedule[]> {
    // Get all active applications for customer
    const { data: applications } = await supabase
        .from('bnpl_applications')
        .select('id')
        .eq('customer_id', customerId)
        .eq('status', 'active');

    if (!applications || applications.length === 0) {
        return [];
    }

    const applicationIds = applications.map(a => a.id);

    const { data, error } = await supabase
        .from('payment_schedules')
        .select(`
      *,
      bnpl_applications (
        merchant_profiles (
          business_name
        )
      )
    `)
        .in('application_id', applicationIds)
        .eq('status', 'scheduled')
        .gte('due_date', new Date().toISOString().split('T')[0])
        .order('due_date', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('Error fetching upcoming payments:', error);
        return [];
    }

    return data || [];
}

/**
 * Get overdue payments for a customer
 */
export async function getOverduePayments(
    customerId: string
): Promise<PaymentSchedule[]> {
    // Get all active applications for customer
    const { data: applications } = await supabase
        .from('bnpl_applications')
        .select('id')
        .eq('customer_id', customerId)
        .in('status', ['active', 'approved']);

    if (!applications || applications.length === 0) {
        return [];
    }

    const applicationIds = applications.map(a => a.id);
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('payment_schedules')
        .select(`
      *,
      bnpl_applications (
        merchant_profiles (
          business_name
        )
      )
    `)
        .in('application_id', applicationIds)
        .eq('status', 'scheduled')
        .lt('due_date', today)
        .order('due_date', { ascending: true });

    if (error) {
        console.error('Error fetching overdue payments:', error);
        return [];
    }

    return data || [];
}

/**
 * Calculate total outstanding balance for a customer
 */
export async function getOutstandingBalance(
    customerId: string
): Promise<{
    totalOutstanding: number;
    upcomingAmount: number;
    overdueAmount: number;
}> {
    // Get all active applications for customer
    const { data: applications } = await supabase
        .from('bnpl_applications')
        .select('id')
        .eq('customer_id', customerId)
        .in('status', ['active', 'approved']);

    if (!applications || applications.length === 0) {
        return { totalOutstanding: 0, upcomingAmount: 0, overdueAmount: 0 };
    }

    const applicationIds = applications.map(a => a.id);
    const today = new Date().toISOString().split('T')[0];

    const { data: schedules } = await supabase
        .from('payment_schedules')
        .select('amount, due_date, status')
        .in('application_id', applicationIds)
        .eq('status', 'scheduled');

    if (!schedules) {
        return { totalOutstanding: 0, upcomingAmount: 0, overdueAmount: 0 };
    }

    let totalOutstanding = 0;
    let upcomingAmount = 0;
    let overdueAmount = 0;

    for (const schedule of schedules) {
        totalOutstanding += schedule.amount;

        if (schedule.due_date < today) {
            overdueAmount += schedule.amount;
        } else {
            upcomingAmount += schedule.amount;
        }
    }

    return {
        totalOutstanding,
        upcomingAmount,
        overdueAmount,
    };
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
    applicationId: string,
    status: 'active' | 'completed' | 'defaulted',
    notes?: string
): Promise<boolean> {
    const { error } = await supabase
        .from('bnpl_applications')
        .update({
            status,
            approval_notes: notes,
        })
        .eq('id', applicationId);

    if (error) {
        console.error('Error updating application status:', error);
        return false;
    }

    // If completed, restore available credit
    if (status === 'completed') {
        const { data: application } = await supabase
            .from('bnpl_applications')
            .select('customer_id, purchase_amount')
            .eq('id', applicationId)
            .single();

        if (application) {
            const { data: profile } = await supabase
                .from('customer_profiles')
                .select('available_credit')
                .eq('id', application.customer_id)
                .single();

            if (profile) {
                await supabase
                    .from('customer_profiles')
                    .update({
                        available_credit: profile.available_credit + application.purchase_amount,
                    })
                    .eq('id', application.customer_id);
            }
        }
    }

    return true;
}

/**
 * Mark an application as defaulted if conditions are met
 */
export async function checkForDefault(
    applicationId: string
): Promise<{ isDefaulted: boolean; missedPayments: number }> {
    const { data: schedules } = await supabase
        .from('payment_schedules')
        .select('*')
        .eq('application_id', applicationId)
        .eq('status', 'scheduled')
        .lt('due_date', new Date().toISOString().split('T')[0]);

    const missedPayments = schedules?.length || 0;

    // Default threshold: 3 or more missed payments
    if (missedPayments >= 3) {
        await updateApplicationStatus(applicationId, 'defaulted', 'Automatically defaulted due to missed payments');
        return { isDefaulted: true, missedPayments };
    }

    return { isDefaulted: false, missedPayments };
}
