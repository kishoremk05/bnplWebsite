// Audit Logger Service
// Automatic logging for compliance and regulatory tracking

import { supabase } from '@/integrations/supabase/client';

export type AuditAction =
    | 'user_registered'
    | 'user_login'
    | 'user_logout'
    | 'kyc_submitted'
    | 'kyc_approved'
    | 'kyc_rejected'
    | 'bnpl_application_created'
    | 'bnpl_application_approved'
    | 'bnpl_application_rejected'
    | 'bnpl_application_defaulted'
    | 'payment_processed'
    | 'payment_failed'
    | 'credit_limit_changed'
    | 'merchant_verified'
    | 'pos_connected'
    | 'admin_action';

export type ResourceType =
    | 'user'
    | 'customer_profile'
    | 'merchant_profile'
    | 'bnpl_application'
    | 'payment_schedule'
    | 'transaction'
    | 'kyc_document'
    | 'settings';

export interface AuditLogEntry {
    userId?: string;
    action: AuditAction;
    resourceType: ResourceType;
    resourceId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    metadata?: Record<string, any>;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
    try {
        // Get client IP (will be available in Edge Functions)
        const ipAddress = await getClientIP();

        await supabase.from('audit_logs').insert({
            user_id: entry.userId || null,
            action: entry.action,
            resource_type: entry.resourceType,
            resource_id: entry.resourceId || null,
            old_values: entry.oldValues || null,
            new_values: entry.newValues || null,
            ip_address: ipAddress,
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        });
    } catch (error) {
        // Don't throw - audit logging should not break main functionality
        console.error('Audit logging failed:', error);
    }
}

/**
 * Get client IP address
 */
async function getClientIP(): Promise<string | null> {
    try {
        // In browser, try to get IP from external service (optional)
        // In Edge Functions, this would come from request headers
        if (typeof window !== 'undefined') {
            return null; // Client-side can't reliably get IP
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Convenience wrappers for common audit events
 */

export async function logUserRegistration(
    userId: string,
    role: string
): Promise<void> {
    await logAuditEvent({
        userId,
        action: 'user_registered',
        resourceType: 'user',
        resourceId: userId,
        newValues: { role },
    });
}

export async function logUserLogin(userId: string): Promise<void> {
    await logAuditEvent({
        userId,
        action: 'user_login',
        resourceType: 'user',
        resourceId: userId,
    });
}

export async function logKYCSubmission(
    userId: string,
    customerId: string,
    documentType: string
): Promise<void> {
    await logAuditEvent({
        userId,
        action: 'kyc_submitted',
        resourceType: 'kyc_document',
        resourceId: customerId,
        newValues: { documentType },
    });
}

export async function logKYCDecision(
    adminId: string,
    customerId: string,
    decision: 'approved' | 'rejected',
    reason?: string
): Promise<void> {
    await logAuditEvent({
        userId: adminId,
        action: decision === 'approved' ? 'kyc_approved' : 'kyc_rejected',
        resourceType: 'customer_profile',
        resourceId: customerId,
        newValues: { decision, reason },
    });
}

export async function logBNPLApplication(
    customerId: string,
    applicationId: string,
    action: 'created' | 'approved' | 'rejected' | 'defaulted',
    details?: Record<string, any>
): Promise<void> {
    const actionMap = {
        created: 'bnpl_application_created',
        approved: 'bnpl_application_approved',
        rejected: 'bnpl_application_rejected',
        defaulted: 'bnpl_application_defaulted',
    } as const;

    await logAuditEvent({
        userId: customerId,
        action: actionMap[action],
        resourceType: 'bnpl_application',
        resourceId: applicationId,
        newValues: details,
    });
}

export async function logPayment(
    customerId: string,
    transactionId: string,
    success: boolean,
    amount: number,
    error?: string
): Promise<void> {
    await logAuditEvent({
        userId: customerId,
        action: success ? 'payment_processed' : 'payment_failed',
        resourceType: 'transaction',
        resourceId: transactionId,
        newValues: { amount, success, error },
    });
}

export async function logCreditLimitChange(
    adminId: string,
    customerId: string,
    oldLimit: number,
    newLimit: number,
    reason: string
): Promise<void> {
    await logAuditEvent({
        userId: adminId,
        action: 'credit_limit_changed',
        resourceType: 'customer_profile',
        resourceId: customerId,
        oldValues: { credit_limit: oldLimit },
        newValues: { credit_limit: newLimit, reason },
    });
}

export async function logMerchantVerification(
    adminId: string,
    merchantId: string,
    verified: boolean
): Promise<void> {
    await logAuditEvent({
        userId: adminId,
        action: 'merchant_verified',
        resourceType: 'merchant_profile',
        resourceId: merchantId,
        newValues: { is_verified: verified },
    });
}

export async function logPOSConnection(
    merchantUserId: string,
    merchantId: string,
    posSystem: string,
    success: boolean
): Promise<void> {
    await logAuditEvent({
        userId: merchantUserId,
        action: 'pos_connected',
        resourceType: 'merchant_profile',
        resourceId: merchantId,
        newValues: { pos_system: posSystem, connection_success: success },
    });
}

/**
 * Fetch audit logs with filters
 */
export async function getAuditLogs(filters?: {
    userId?: string;
    action?: AuditAction;
    resourceType?: ResourceType;
    resourceId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}): Promise<any[]> {
    let query = supabase
        .from('audit_logs')
        .select(`
      *,
      users_extended (
        full_name,
        role
      )
    `)
        .order('created_at', { ascending: false });

    if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
    }
    if (filters?.action) {
        query = query.eq('action', filters.action);
    }
    if (filters?.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
    }
    if (filters?.resourceId) {
        query = query.eq('resource_id', filters.resourceId);
    }
    if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
    }
    if (filters?.limit) {
        query = query.limit(filters.limit);
    }
    if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
    }

    return data || [];
}
