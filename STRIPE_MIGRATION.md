# Stripe Migration Guide

Complete guide for migrating the Regal Pay BNPL platform from Ellacash to Stripe.

## Table of Contents

1. [Migration Overview](#migration-overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Update Environment Variables](#step-1-update-environment-variables)
4. [Step 2: Install Stripe Dependencies](#step-2-install-stripe-dependencies)
5. [Step 3: Create Stripe Backend Service](#step-3-create-stripe-backend-service)
6. [Step 4: Update Edge Functions](#step-4-update-edge-functions)
7. [Step 5: Create Stripe Frontend Service](#step-5-create-stripe-frontend-service)
8. [Step 6: Update Payment Components](#step-6-update-payment-components)
9. [Step 7: Configure Stripe Webhooks](#step-7-configure-stripe-webhooks)
10. [Step 8: Update Database Schema](#step-8-update-database-schema)
11. [Step 9: Testing](#step-9-testing)
12. [Step 10: Deployment](#step-10-deployment)

---

## Migration Overview

This guide will help you migrate from Ellacash to Stripe payment processing.

### What Will Change

- ✅ Payment tokenization (Ellacash → Stripe Elements)
- ✅ Payment processing (Ellacash API → Stripe API)
- ✅ Webhook handling (Ellacash webhooks → Stripe webhooks)
- ✅ Frontend payment forms (Ellacash.js → Stripe.js)

### What Won't Change

- ✅ Database schema (minimal changes)
- ✅ User flows and UI
- ✅ Business logic
- ✅ Authentication

---

## Prerequisites

- ✅ Stripe account (test mode for development)
- ✅ Stripe API keys (publishable and secret)
- ✅ Backup of current database
- ✅ Access to Supabase project

---

## Step 1: Update Environment Variables

### 1.1 Update `.env` File

Remove Ellacash variables and add Stripe:

```env
# Remove these Ellacash variables
# VITE_ELLACASH_PUBLIC_KEY=pk_sandbox_test
# ELLACASH_SECRET_KEY=sk_sandbox_test
# ELLACASH_WEBHOOK_SECRET=whsec_sandbox_test
# ELLACASH_API_URL=https://sandbox-api.ellacash.com

# Add Stripe variables (Test Mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx
STRIPE_SECRET_KEY=sk_test_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 1.2 Update Supabase Secrets

```bash
# Remove Ellacash secrets
supabase secrets unset ELLACASH_SECRET_KEY
supabase secrets unset ELLACASH_WEBHOOK_SECRET

# Add Stripe secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_51xxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## Step 2: Install Stripe Dependencies

### 2.1 Install Frontend Stripe Library

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2.2 Verify Installation

Check `package.json`:

```json
{
  "dependencies": {
    "@stripe/stripe-js": "^2.4.0",
    "@stripe/react-stripe-js": "^2.4.0"
  }
}
```

---

## Step 3: Create Stripe Backend Service

### 3.1 Create Stripe Service for Edge Functions

Create file: `supabase/functions/_shared/stripe-backend.service.ts`

```typescript
// supabase/functions/_shared/stripe-backend.service.ts
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

export interface ChargePaymentParams {
  paymentMethodId: string;
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface ChargePaymentResult {
  success: boolean;
  transactionId?: string;
  status?: string;
  error?: string;
  errorCode?: string;
}

/**
 * Charge a payment using Stripe
 */
export async function chargePayment(
  params: ChargePaymentParams
): Promise<ChargePaymentResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(params.amount * 100), // Convert to cents
      currency: params.currency.toLowerCase(),
      payment_method: params.paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      description: params.description,
      metadata: params.metadata || {},
    });

    return {
      success: paymentIntent.status === 'succeeded',
      transactionId: paymentIntent.id,
      status: paymentIntent.status,
      error: paymentIntent.status !== 'succeeded' 
        ? `Payment ${paymentIntent.status}` 
        : undefined,
    };
  } catch (error: any) {
    console.error('Stripe charge error:', error);
    return {
      success: false,
      error: error.message || 'Payment failed',
      errorCode: error.code,
    };
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    stripe.webhooks.constructEvent(payload, signature, secret);
    return true;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

/**
 * Create a payment method from token
 */
export async function createPaymentMethod(token: string) {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: { token },
    });

    return {
      success: true,
      paymentMethodId: paymentMethod.id,
      cardLast4: paymentMethod.card?.last4,
      cardBrand: paymentMethod.card?.brand,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
```

### 3.2 Create Deno Configuration

Create file: `supabase/functions/charge-payment/deno.json`

```json
{
  "imports": {
    "stripe": "https://esm.sh/stripe@14.11.0?target=deno"
  },
  "compilerOptions": {
    "lib": ["deno.window"],
    "types": ["https://deno.land/x/edge_runtime@v1.0.0/index.d.ts"]
  }
}
```

Create file: `supabase/functions/webhook-handler/deno.json`

```json
{
  "imports": {
    "stripe": "https://esm.sh/stripe@14.11.0?target=deno"
  },
  "compilerOptions": {
    "lib": ["deno.window"],
    "types": ["https://deno.land/x/edge_runtime@v1.0.0/index.d.ts"]
  }
}
```

---

## Step 4: Update Edge Functions

### 4.1 Update `charge-payment` Function

Update `supabase/functions/charge-payment/index.ts`:

```typescript
// supabase/functions/charge-payment/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { chargePayment } from '../_shared/stripe-backend.service.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const {
            payment_method_id,
            amount,
            currency = 'USD',
            application_id,
            payment_schedule_id,
            transaction_type = 'down_payment',
            customer_id,
            metadata = {},
        } = await req.json();

        if (!payment_method_id || !amount || !customer_id) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Create pending transaction
        const { data: transaction, error: txnError } = await supabaseClient
            .from('payment_transactions')
            .insert({
                customer_id,
                application_id,
                payment_schedule_id,
                transaction_type,
                amount,
                currency,
                status: 'processing',
                payment_method_token: payment_method_id,
                metadata,
            })
            .select()
            .single();

        if (txnError) {
            throw new Error(`Failed to create transaction: ${txnError.message}`);
        }

        // Charge via Stripe
        const chargeResult = await chargePayment({
            paymentMethodId: payment_method_id,
            amount,
            currency,
            description: `${transaction_type} for application ${application_id || 'N/A'}`,
            metadata: {
                ...metadata,
                transaction_id: transaction.id,
                customer_id,
            },
        });

        // Update transaction
        const updateData: any = {
            processed_at: new Date().toISOString(),
        };

        if (chargeResult.success) {
            updateData.status = 'success';
            updateData.stripe_transaction_id = chargeResult.transactionId;
        } else {
            updateData.status = 'failed';
            updateData.error_message = chargeResult.error;
            updateData.error_code = chargeResult.errorCode;
        }

        await supabaseClient
            .from('payment_transactions')
            .update(updateData)
            .eq('id', transaction.id);

        // Update application if down payment
        if (chargeResult.success && transaction_type === 'down_payment' && application_id) {
            await supabaseClient
                .from('bnpl_applications')
                .update({
                    status: 'active',
                    down_payment_paid: true,
                    down_payment_date: new Date().toISOString(),
                })
                .eq('id', application_id);
        }

        // Update payment schedule if installment
        if (chargeResult.success && transaction_type === 'installment' && payment_schedule_id) {
            await supabaseClient
                .from('payment_schedules')
                .update({
                    status: 'paid',
                    paid_date: new Date().toISOString(),
                })
                .eq('id', payment_schedule_id);
        }

        return new Response(
            JSON.stringify({
                success: chargeResult.success,
                transaction_id: transaction.id,
                stripe_transaction_id: chargeResult.transactionId,
                status: chargeResult.success ? 'success' : 'failed',
                error: chargeResult.error,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Charge payment error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
```

### 4.2 Update `webhook-handler` Function

Update `supabase/functions/webhook-handler/index.ts`:

```typescript
// supabase/functions/webhook-handler/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyWebhookSignature } from '../_shared/stripe-backend.service.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const payload = await req.text();
        const signature = req.headers.get('stripe-signature') || '';
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

        // Verify signature
        const isValid = verifyWebhookSignature(payload, signature, webhookSecret);

        // Log webhook
        const { data: webhookLog } = await supabaseClient
            .from('webhook_logs')
            .insert({
                event_type: 'unknown',
                payload: JSON.parse(payload),
                signature,
                verified: isValid,
            })
            .select()
            .single();

        if (!isValid) {
            return new Response(
                JSON.stringify({ error: 'Invalid signature' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const event = JSON.parse(payload);
        const eventType = event.type;

        // Update webhook log
        await supabaseClient
            .from('webhook_logs')
            .update({ event_type: eventType })
            .eq('id', webhookLog.id);

        // Handle events
        switch (eventType) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(supabaseClient, event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentFailed(supabaseClient, event.data.object);
                break;
            case 'charge.refunded':
                await handleRefund(supabaseClient, event.data.object);
                break;
            default:
                console.log(`Unhandled event: ${eventType}`);
        }

        // Mark as processed
        await supabaseClient
            .from('webhook_logs')
            .update({
                processed: true,
                processed_at: new Date().toISOString(),
            })
            .eq('id', webhookLog.id);

        return new Response(
            JSON.stringify({ received: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Webhook error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

async function handlePaymentSuccess(supabase: any, paymentIntent: any) {
    const { data: transaction } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('stripe_transaction_id', paymentIntent.id)
        .single();

    if (transaction) {
        await supabase
            .from('payment_transactions')
            .update({
                status: 'success',
                webhook_received: true,
            })
            .eq('id', transaction.id);
    }
}

async function handlePaymentFailed(supabase: any, paymentIntent: any) {
    const { data: transaction } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('stripe_transaction_id', paymentIntent.id)
        .single();

    if (transaction) {
        await supabase
            .from('payment_transactions')
            .update({
                status: 'failed',
                error_message: paymentIntent.last_payment_error?.message,
                webhook_received: true,
            })
            .eq('id', transaction.id);
    }
}

async function handleRefund(supabase: any, charge: any) {
    // Handle refund logic
    console.log('Refund processed:', charge.id);
}
```

---

## Step 5: Create Stripe Frontend Service

### 5.1 Create Stripe Service

Create file: `src/services/stripe.service.ts`

```typescript
// src/services/stripe.service.ts
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null>;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

export async function createPaymentMethod(
  stripe: Stripe,
  elements: StripeElements
) {
  const cardElement = elements.getElement('card');
  
  if (!cardElement) {
    return { success: false, error: 'Card element not found' };
  }

  const { error, paymentMethod } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    paymentMethodId: paymentMethod!.id,
    cardLast4: paymentMethod!.card!.last4,
    cardBrand: paymentMethod!.card!.brand,
  };
}
```

---

## Step 6: Update Payment Components

### 6.1 Update Payment Method Form

Update `src/components/customer/PaymentMethodManager.tsx` to use Stripe Elements instead of Ellacash.

### 6.2 Replace Ellacash Service Calls

Find and replace all instances of:
- `ellacash.service.ts` → `stripe.service.ts`
- `createCardToken` → `createPaymentMethod`
- `ellacash_transaction_id` → `stripe_transaction_id`

---

## Step 7: Configure Stripe Webhooks

### 7.1 Add Webhook Endpoint in Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. Enter URL: `https://your-project-id.supabase.co/functions/v1/webhook-handler`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `charge.dispute.created`
5. Copy **Signing secret**

### 7.2 Update Supabase Secret

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## Step 8: Update Database Schema

### 8.1 Add Stripe Transaction ID Column

Create migration: `supabase/migrations/20260115_add_stripe_fields.sql`

```sql
-- Add Stripe transaction ID column
ALTER TABLE payment_transactions 
ADD COLUMN IF NOT EXISTS stripe_transaction_id TEXT;

-- Add index
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_id 
ON payment_transactions(stripe_transaction_id);

-- Rename old Ellacash column (optional, for backward compatibility)
ALTER TABLE payment_transactions 
RENAME COLUMN ellacash_transaction_id TO legacy_transaction_id;
```

Apply migration:

```bash
supabase db push supabase/migrations/20260115_add_stripe_fields.sql
```

---

## Step 9: Testing

### 9.1 Test Payment Processing

Use Stripe test cards:

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
```

### 9.2 Test Webhooks

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:54321/functions/v1/webhook-handler

# Trigger test event
stripe trigger payment_intent.succeeded
```

### 9.3 Verify Database

```sql
SELECT * FROM payment_transactions 
WHERE stripe_transaction_id IS NOT NULL 
ORDER BY created_at DESC LIMIT 10;
```

---

## Step 10: Deployment

### 10.1 Deploy Edge Functions

```bash
supabase functions deploy charge-payment
supabase functions deploy webhook-handler
```

### 10.2 Update Production Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx --project-ref your-project-id
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_live_xxxxx --project-ref your-project-id
```

### 10.3 Deploy Frontend

```bash
npm run build
# Deploy to your hosting provider
```

---

## Rollback Plan

If migration fails:

1. Revert environment variables to Ellacash
2. Restore database backup
3. Redeploy old Edge Functions
4. Revert frontend code changes

---

## Migration Checklist

- [ ] Backup database
- [ ] Update environment variables
- [ ] Install Stripe dependencies
- [ ] Create Stripe backend service
- [ ] Update Edge Functions
- [ ] Create Stripe frontend service
- [ ] Update payment components
- [ ] Configure webhooks
- [ ] Update database schema
- [ ] Test payments
- [ ] Test webhooks
- [ ] Deploy to production
- [ ] Monitor for errors

---

**Last Updated**: January 2026  
**Version**: 1.0.0
