# Regal Pay BNPL Platform - Setup Guide

Complete setup instructions for the Regal Pay Buy Now, Pay Later platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Installation](#installation)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Supabase Edge Functions Deployment](#supabase-edge-functions-deployment)
7. [Stripe Payment Integration](#stripe-payment-integration)
8. [Running the Application](#running-the-application)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up the Regal Pay platform, ensure you have the following installed:

### Required Software

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **bun** (optional, faster alternative)
- **Git** - [Download](https://git-scm.com/)
- **Supabase CLI** - [Installation Guide](https://supabase.com/docs/guides/cli)

### Required Accounts

- **Supabase Account** - [Sign up](https://supabase.com/)
- **Stripe Account** - [Sign up](https://stripe.com/) (for payment processing)

### System Requirements

- **OS**: Windows, macOS, or Linux
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 500MB free space

---

## Project Overview

**Regal Pay** is a Buy Now, Pay Later (BNPL) platform built with:

- **Frontend**: Vite + React + TypeScript
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth
- **Payment Processing**: Stripe (migrated from Ellacash)
- **State Management**: React Query (@tanstack/react-query)

### Architecture

```
┌─────────────────┐
│  React Frontend │
│   (Vite + TS)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Supabase     │
│  ┌───────────┐  │
│  │ PostgreSQL│  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │   Auth    │  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │Edge Funcs │──┼──► Stripe API
│  └───────────┘  │
└─────────────────┘
```

---

## Installation

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd regal-pay-main
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using bun (faster):
```bash
bun install
```

### 3. Install Supabase CLI

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Alternative (npm):**
```bash
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

---

## Environment Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

Or create a new `.env` file in the project root:

```bash
touch .env
```

### 2. Configure Environment Variables

Edit the `.env` file with your configuration:

```env
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"

# Stripe Configuration (Production)
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_xxxxx"
STRIPE_SECRET_KEY="sk_live_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

# Stripe Configuration (Test Mode - for development)
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_test_xxxxx"
```

### 3. Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (or create a new one)
3. Navigate to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project ID** → `VITE_SUPABASE_PROJECT_ID`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`
   - **Publishable key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

### 4. Get Stripe Credentials

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy the following:
   - **Publishable key** → `VITE_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY` (keep this secure!)
4. For webhook secret:
   - Navigate to **Developers** → **Webhooks**
   - Add endpoint or view existing endpoint
   - Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

> **⚠️ Security Warning**: Never commit `.env` file to version control. The `.gitignore` file should already exclude it.

---

## Database Setup

### 1. Link to Supabase Project

```bash
supabase login
supabase link --project-ref your-project-id
```

### 2. Run Database Migrations

The project includes several migration files in `supabase/migrations/`:

```bash
# Apply all migrations
supabase db push
```

Or apply migrations individually in order:

```bash
# 1. Initial schema
supabase db push supabase/migrations/20260113_initial_schema.sql

# 2. RLS policies
supabase db push supabase/migrations/20260113_rls_policies.sql

# 3. Seed data
supabase db push supabase/migrations/20260113_seed_data.sql

# 4. Payment defaults
supabase db push supabase/migrations/20260114_add_payment_defaults.sql

# 5. Payment methods
supabase db push supabase/migrations/20260114_add_payment_methods.sql

# 6. Capital & settlement
supabase db push supabase/migrations/20260114_capital_settlement.sql

# 7. Checkout integration
supabase db push supabase/migrations/20260114_checkout_integration.sql
```

### 3. Verify Database Schema

Check that all tables were created:

```bash
supabase db diff
```

Or use the Supabase Dashboard:
1. Go to **Table Editor**
2. Verify these tables exist:
   - `users_extended`
   - `customer_profiles`
   - `merchant_profiles`
   - `bnpl_applications`
   - `payment_schedules`
   - `payment_transactions`
   - `payment_methods`
   - `kyc_documents`
   - And others...

### 4. Set Up Storage Buckets

For KYC document uploads:

```bash
# Create storage bucket for KYC documents
supabase storage create kyc-documents --public false
```

Or via Supabase Dashboard:
1. Go to **Storage**
2. Create new bucket: `kyc-documents`
3. Set as **Private**
4. Configure RLS policies (see `database/setup-kyc-storage.sql`)

---

## Supabase Edge Functions Deployment

### 1. Configure Edge Function Environment Variables

Set secrets for Edge Functions:

```bash
# Stripe credentials
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx

# Supabase credentials (for Edge Functions)
supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> **Note**: Get the Service Role Key from Supabase Dashboard → Settings → API

### 2. Deploy Edge Functions

Deploy all Edge Functions:

```bash
# Deploy charge-payment function
supabase functions deploy charge-payment

# Deploy webhook-handler function
supabase functions deploy webhook-handler
```

### 3. Verify Deployment

Check function status:

```bash
supabase functions list
```

Test functions locally (optional):

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve charge-payment
```

### 4. Get Edge Function URLs

After deployment, note the function URLs:

```
https://your-project-id.supabase.co/functions/v1/charge-payment
https://your-project-id.supabase.co/functions/v1/webhook-handler
```

---

## Stripe Payment Integration

### Migration from Ellacash to Stripe

The project was originally built with Ellacash. Here's how to complete the Stripe migration:

### 1. Update Edge Functions for Stripe

#### Update `supabase/functions/_shared/stripe-backend.service.ts`

Create a new file for Stripe backend service:

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

export async function chargePayment(params: ChargePaymentParams) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(params.amount * 100), // Convert to cents
      currency: params.currency.toLowerCase(),
      payment_method: params.paymentMethodId,
      confirm: true,
      description: params.description,
      metadata: params.metadata,
    });

    return {
      success: paymentIntent.status === 'succeeded',
      transactionId: paymentIntent.id,
      status: paymentIntent.status,
      error: paymentIntent.status !== 'succeeded' ? 'Payment failed' : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
    };
  }
}

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
```

#### Update `charge-payment` Edge Function

Modify `supabase/functions/charge-payment/index.ts` to use Stripe instead of Ellacash.

#### Update `webhook-handler` Edge Function

Modify `supabase/functions/webhook-handler/index.ts` to handle Stripe webhooks.

### 2. Update Frontend Service

#### Create `src/services/stripe.service.ts`

```typescript
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null>;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

export async function createPaymentMethod(
  stripe: Stripe,
  elements: StripeElements
) {
  const { error, paymentMethod } = await stripe.createPaymentMethod({
    type: 'card',
    card: elements.getElement('card')!,
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

### 3. Install Stripe Dependencies

```bash
npm install @stripe/stripe-js
```

### 4. Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL: `https://your-project-id.supabase.co/functions/v1/webhook-handler`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `charge.dispute.created`
5. Copy the **Signing secret** and add to Supabase secrets

### 5. Update Environment Variables

Remove Ellacash variables and add Stripe:

```env
# Remove these:
# VITE_ELLACASH_PUBLIC_KEY=...
# ELLACASH_SECRET_KEY=...
# ELLACASH_WEBHOOK_SECRET=...

# Add these:
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx
```

---

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

Or with bun:

```bash
bun run dev
```

The application will be available at: `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

### Running with Local Supabase

For complete local development:

```bash
# Start local Supabase
supabase start

# In another terminal, start the app
npm run dev
```

---

## Troubleshooting

### Common Issues

#### 1. **Supabase Connection Error**

**Error**: `Failed to connect to Supabase`

**Solution**:
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- Check that the Supabase project is active
- Ensure environment variables are prefixed with `VITE_` for Vite

#### 2. **Database Migration Fails**

**Error**: `Migration failed: relation already exists`

**Solution**:
```bash
# Reset local database
supabase db reset

# Re-run migrations
supabase db push
```

#### 3. **Edge Function Deployment Fails**

**Error**: `Function deployment failed`

**Solution**:
- Check that you're logged in: `supabase login`
- Verify project link: `supabase link --project-ref your-project-id`
- Ensure all secrets are set: `supabase secrets list`

#### 4. **Stripe Payment Fails**

**Error**: `Payment processing failed`

**Solution**:
- Use Stripe test cards: `4242 4242 4242 4242`
- Verify `STRIPE_SECRET_KEY` is set in Supabase secrets
- Check Edge Function logs: `supabase functions logs charge-payment`

#### 5. **RLS Policy Errors**

**Error**: `Row-level security policy violation`

**Solution**:
- Ensure user is authenticated
- Check RLS policies in Supabase Dashboard → Authentication → Policies
- Temporarily disable RLS for testing (not recommended for production)

### Getting Help

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev

### Logs and Debugging

View Edge Function logs:
```bash
supabase functions logs charge-payment --tail
supabase functions logs webhook-handler --tail
```

View database logs:
```bash
supabase logs db
```

---

## Next Steps

After setup is complete:

1. ✅ Review the [TESTING.md](./TESTING.md) guide
2. ✅ Configure user roles and permissions
3. ✅ Set up monitoring and alerts
4. ✅ Review security best practices
5. ✅ Deploy to production

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Integration Guide](https://stripe.com/docs/payments/accept-a-payment)
- [React Query Documentation](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**Last Updated**: January 2026  
**Version**: 1.0.0
