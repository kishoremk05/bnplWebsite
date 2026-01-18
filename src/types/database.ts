// Database types generated from Supabase schema
export type UserRole = 'customer' | 'merchant' | 'admin';
export type KYCStatus = 'pending' | 'in_review' | 'approved' | 'rejected';
export type BNPLStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentStatus = 'scheduled' | 'processing' | 'completed' | 'failed' | 'skipped';

export interface UserExtended {
    id: string;
    role: UserRole;
    full_name: string;
    phone: string | null;
    created_at: string;
    updated_at: string;
}

export interface CustomerProfile {
    id: string;
    user_id: string;
    kyc_status: KYCStatus;
    credit_limit: number;
    available_credit: number;
    date_of_birth: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    ssn_last_4: string | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface MerchantProfile {
    id: string;
    user_id: string;
    business_name: string;
    business_type: string | null;
    tax_id: string | null;
    license_number: string | null;
    license_state: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    website: string | null;
    pos_system: string | null;
    pos_api_key: string | null;
    is_verified: boolean;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface MerchantLocation {
    id: string;
    merchant_id: string;
    location_name: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    zip_code: string;
    phone: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface BNPLPlan {
    id: string;
    name: string;
    description: string | null;
    installments: number;
    interest_rate: number;
    min_amount: number;
    max_amount: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface BNPLApplication {
    id: string;
    customer_id: string;
    merchant_id: string;
    plan_id: string;
    purchase_amount: number;
    down_payment: number;
    total_amount: number;
    status: BNPLStatus;
    risk_score: number | null;
    approval_notes: string | null;
    approved_by: string | null;
    approved_at: string | null;
    rejected_reason: string | null;
    merchant_order_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface PaymentSchedule {
    id: string;
    application_id: string;
    installment_number: number;
    amount: number;
    due_date: string;
    status: PaymentStatus;
    paid_amount: number;
    paid_at: string | null;
    transaction_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: string;
    application_id: string | null;
    customer_id: string;
    merchant_id: string | null;
    amount: number;
    transaction_type: string;
    status: TransactionStatus;
    payment_method: string | null;
    payment_processor: string | null;
    processor_transaction_id: string | null;
    error_message: string | null;
    metadata: Record<string, any> | null;
    created_at: string;
    updated_at: string;
}

export interface KYCDocument {
    id: string;
    customer_id: string;
    document_type: string;
    file_path: string;
    file_name: string;
    file_size: number | null;
    mime_type: string | null;
    status: KYCStatus;
    reviewed_by: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
}

export interface AuditLog {
    id: string;
    user_id: string | null;
    action: string;
    resource_type: string;
    resource_id: string | null;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

// Extended types with relations
export interface BNPLApplicationWithRelations extends BNPLApplication {
    customer?: CustomerProfile;
    merchant?: MerchantProfile;
    plan?: BNPLPlan;
    payment_schedules?: PaymentSchedule[];
}

export interface PaymentScheduleWithTransaction extends PaymentSchedule {
    transaction?: Transaction;
}

export interface CustomerProfileWithUser extends CustomerProfile {
    user?: UserExtended;
}

export interface MerchantProfileWithUser extends MerchantProfile {
    user?: UserExtended;
}
