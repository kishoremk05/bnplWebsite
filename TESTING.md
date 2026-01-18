# Regal Pay BNPL Platform - Testing Guide

Complete testing instructions for the Regal Pay Buy Now, Pay Later platform.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Prerequisites](#prerequisites)
3. [Manual Testing](#manual-testing)
4. [Payment Testing with Stripe](#payment-testing-with-stripe)
5. [Database Testing](#database-testing)
6. [Edge Functions Testing](#edge-functions-testing)
7. [End-to-End Testing Scenarios](#end-to-end-testing-scenarios)
8. [Security Testing](#security-testing)
9. [Performance Testing](#performance-testing)
10. [Troubleshooting Tests](#troubleshooting-tests)

---

## Testing Overview

The Regal Pay platform requires thorough testing across multiple layers:

- **Frontend Testing**: UI components and user flows
- **Backend Testing**: Database operations and business logic
- **Integration Testing**: Supabase Edge Functions and Stripe payments
- **Security Testing**: Authentication, authorization, and RLS policies
- **E2E Testing**: Complete user journeys

---

## Prerequisites

### Required Tools

- ✅ Project setup complete (see [SETUP.md](./SETUP.md))
- ✅ Development server running (`npm run dev`)
- ✅ Supabase project linked and configured
- ✅ Stripe test account with test API keys

### Test Accounts

Create test accounts for different user roles:

1. **Customer Account**
   - Email: `customer@test.com`
   - Password: `TestPassword123!`

2. **Merchant Account**
   - Email: `merchant@test.com`
   - Password: `TestPassword123!`

3. **Admin Account**
   - Email: `admin@test.com`
   - Password: `TestPassword123!`

### Test Data

Ensure seed data is loaded:

```bash
supabase db push supabase/migrations/20260113_seed_data.sql
```

---

## Manual Testing

### 1. User Registration & Authentication

#### Test Customer Registration

1. Navigate to `http://localhost:5173`
2. Click **Sign Up**
3. Fill in registration form:
   - Full Name: `Test Customer`
   - Email: `customer@test.com`
   - Password: `TestPassword123!`
   - Role: `Customer`
4. Click **Create Account**

**Expected Result**: ✅ User is registered and redirected to customer dashboard

#### Test Merchant Registration

1. Click **Sign Up**
2. Fill in registration form:
   - Full Name: `Test Merchant`
   - Email: `merchant@test.com`
   - Password: `TestPassword123!`
   - Role: `Merchant`
   - Business Name: `Test Dispensary`
3. Click **Create Account**

**Expected Result**: ✅ Merchant is registered and redirected to merchant dashboard

#### Test Login

1. Navigate to login page
2. Enter credentials:
   - Email: `customer@test.com`
   - Password: `TestPassword123!`
3. Click **Sign In**

**Expected Result**: ✅ User is logged in and redirected to appropriate dashboard

#### Test Logout

1. Click user profile menu
2. Click **Logout**

**Expected Result**: ✅ User is logged out and redirected to login page

### 2. Customer KYC Verification

#### Upload KYC Documents

1. Log in as customer
2. Navigate to **Profile** → **KYC Verification**
3. Upload documents:
   - ID Front: Upload image
   - ID Back: Upload image
   - Proof of Address: Upload PDF/image
   - Selfie: Upload image
4. Click **Submit for Review**

**Expected Result**: ✅ Documents uploaded successfully, status shows "Pending Review"

#### Verify Storage

Check Supabase Storage:
1. Go to Supabase Dashboard → **Storage** → `kyc-documents`
2. Verify files are uploaded

**Expected Result**: ✅ All 4 documents visible in storage bucket

### 3. BNPL Application Flow

#### Create BNPL Application (Customer)

1. Log in as customer
2. Navigate to **Apply for Loan**
3. Fill in application:
   - Purchase Amount: `$500`
   - Select Plan: `4 installments`
   - Merchant: Select from dropdown
4. Click **Submit Application**

**Expected Result**: ✅ Application created with status "Pending"

#### Review Application (Merchant)

1. Log in as merchant
2. Navigate to **Applications**
3. Find pending application
4. Click **Review**
5. Click **Approve** or **Reject**

**Expected Result**: ✅ Application status updated

#### View Payment Schedule (Customer)

1. Log in as customer
2. Navigate to **My Loans**
3. Click on approved application
4. View **Payment Schedule**

**Expected Result**: ✅ Payment schedule shows all installments with due dates

### 4. Payment Method Management

#### Add Payment Method

1. Log in as customer
2. Navigate to **Payment Methods**
3. Click **Add Payment Method**
4. Enter card details (use Stripe test card):
   - Card Number: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
   - Name: `Test Customer`
5. Click **Save**

**Expected Result**: ✅ Payment method saved and tokenized via Stripe

#### Set Default Payment Method

1. In **Payment Methods** page
2. Click **Set as Default** on a payment method

**Expected Result**: ✅ Payment method marked as default

#### Delete Payment Method

1. Click **Delete** on a payment method
2. Confirm deletion

**Expected Result**: ✅ Payment method removed

---

## Payment Testing with Stripe

### Stripe Test Cards

Use these test cards for different scenarios:

| Card Number | Scenario | Expected Result |
|-------------|----------|-----------------|
| `4242 4242 4242 4242` | Successful payment | ✅ Payment succeeds |
| `4000 0000 0000 9995` | Declined card | ❌ Payment fails (insufficient funds) |
| `4000 0000 0000 0002` | Declined card | ❌ Payment fails (card declined) |
| `4000 0025 0000 3155` | Requires authentication | 🔐 3D Secure challenge |

### Test Down Payment

1. Log in as customer
2. Navigate to approved BNPL application
3. Click **Pay Down Payment**
4. Select payment method
5. Click **Pay Now**

**Expected Result**: ✅ Payment processed successfully, application status changes to "Active"

#### Verify in Database

```sql
-- Check payment transaction
SELECT * FROM payment_transactions 
WHERE customer_id = '<customer-id>' 
ORDER BY created_at DESC LIMIT 1;

-- Check application status
SELECT status, down_payment_paid 
FROM bnpl_applications 
WHERE id = '<application-id>';
```

**Expected Result**: 
- ✅ Transaction status: `success`
- ✅ Application status: `active`
- ✅ `down_payment_paid`: `true`

### Test Installment Payment

1. Log in as customer
2. Navigate to **Payments**
3. Find due installment
4. Click **Pay Now**
5. Confirm payment

**Expected Result**: ✅ Installment marked as paid

#### Verify Payment Schedule Update

```sql
SELECT * FROM payment_schedules 
WHERE application_id = '<application-id>' 
ORDER BY installment_number;
```

**Expected Result**: ✅ Paid installment has `status = 'paid'` and `paid_date` set

### Test Failed Payment

1. Use declined test card: `4000 0000 0000 0002`
2. Attempt payment
3. Observe error handling

**Expected Result**: ❌ Payment fails with appropriate error message

#### Verify Failed Transaction

```sql
SELECT status, error_message 
FROM payment_transactions 
WHERE customer_id = '<customer-id>' 
ORDER BY created_at DESC LIMIT 1;
```

**Expected Result**: 
- ✅ Transaction status: `failed`
- ✅ Error message populated

### Test Stripe Webhooks

#### Trigger Webhook Event

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click on your webhook endpoint
3. Click **Send test webhook**
4. Select event: `payment_intent.succeeded`
5. Send event

**Expected Result**: ✅ Webhook received and processed

#### Verify Webhook Logs

```sql
SELECT * FROM webhook_logs 
ORDER BY created_at DESC LIMIT 10;
```

**Expected Result**: ✅ Webhook logged with `verified = true` and `processed = true`

#### Check Edge Function Logs

```bash
supabase functions logs webhook-handler --tail
```

**Expected Result**: ✅ Logs show successful webhook processing

---

## Database Testing

### Test RLS Policies

#### Customer Can Only See Own Data

```sql
-- Set role to customer
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "<customer-user-id>", "role": "customer"}';

-- Try to query all applications (should only see own)
SELECT * FROM bnpl_applications;
```

**Expected Result**: ✅ Only returns applications for the authenticated customer

#### Merchant Can Only See Own Applications

```sql
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "<merchant-user-id>", "role": "merchant"}';

SELECT * FROM bnpl_applications;
```

**Expected Result**: ✅ Only returns applications for the authenticated merchant

### Test Database Triggers

#### Test Auto-Create Profile Trigger

```sql
-- Insert new user (simulating Supabase Auth)
INSERT INTO auth.users (id, email) 
VALUES (gen_random_uuid(), 'newuser@test.com');

-- Check if profile was auto-created
SELECT * FROM users_extended WHERE email = 'newuser@test.com';
```

**Expected Result**: ✅ User profile automatically created in `users_extended`

#### Test Updated_At Trigger

```sql
-- Update a record
UPDATE customer_profiles 
SET credit_limit = 5000 
WHERE user_id = '<user-id>';

-- Check updated_at timestamp
SELECT updated_at FROM customer_profiles WHERE user_id = '<user-id>';
```

**Expected Result**: ✅ `updated_at` timestamp is updated to current time

### Test Payment Schedule Creation

```sql
-- Call the payment schedule creation function
SELECT create_payment_schedule('<application-id>');

-- Verify schedules created
SELECT * FROM payment_schedules 
WHERE application_id = '<application-id>' 
ORDER BY installment_number;
```

**Expected Result**: ✅ Correct number of installments created with proper amounts and due dates

---

## Edge Functions Testing

### Test Locally with Supabase CLI

#### Start Local Supabase

```bash
supabase start
```

#### Serve Edge Functions Locally

```bash
supabase functions serve charge-payment
```

#### Test charge-payment Function

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/charge-payment' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "payment_method_token": "pm_card_visa",
    "amount": 100,
    "currency": "USD",
    "customer_id": "test-customer-id",
    "transaction_type": "down_payment"
  }'
```

**Expected Result**: ✅ Returns success response with transaction ID

#### Test webhook-handler Function

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/webhook-handler' \
  --header 'Content-Type: application/json' \
  --header 'stripe-signature: test-signature' \
  --data '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_123",
        "status": "succeeded"
      }
    }
  }'
```

**Expected Result**: ✅ Returns `{"received": true}`

### Test Deployed Edge Functions

#### Test Production charge-payment

```bash
curl -i --location --request POST 'https://your-project-id.supabase.co/functions/v1/charge-payment' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "payment_method_token": "pm_card_visa",
    "amount": 100,
    "currency": "USD",
    "customer_id": "test-customer-id",
    "transaction_type": "down_payment"
  }'
```

**Expected Result**: ✅ Payment processed successfully

---

## End-to-End Testing Scenarios

### Scenario 1: Complete BNPL Journey (Happy Path)

1. **Customer Registration**
   - Register new customer account
   - ✅ Account created successfully

2. **KYC Verification**
   - Upload all required documents
   - ✅ Documents uploaded
   - Admin approves KYC
   - ✅ Customer KYC status: "Approved"

3. **Apply for BNPL**
   - Submit application for $500, 4 installments
   - ✅ Application created

4. **Merchant Approval**
   - Merchant reviews and approves application
   - ✅ Application status: "Approved"
   - ✅ Payment schedule created

5. **Add Payment Method**
   - Add Stripe payment method
   - ✅ Card tokenized and saved

6. **Pay Down Payment**
   - Pay required down payment
   - ✅ Payment successful
   - ✅ Application status: "Active"

7. **Pay Installments**
   - Pay each installment on due date
   - ✅ All payments successful
   - ✅ Application status: "Completed"

**Overall Expected Result**: ✅ Complete BNPL journey successful

### Scenario 2: Failed Payment Recovery

1. Customer attempts payment with declined card
   - ✅ Payment fails with error message
2. Customer updates payment method
   - ✅ New card added
3. Customer retries payment
   - ✅ Payment successful

### Scenario 3: Late Payment

1. Customer misses payment due date
   - ✅ Payment status: "Overdue"
2. Late fee applied
   - ✅ Late fee transaction created
3. Customer pays overdue amount + late fee
   - ✅ Payment successful

### Scenario 4: Application Rejection

1. Customer applies for BNPL
2. Merchant rejects application
   - ✅ Application status: "Rejected"
   - ✅ Customer notified
3. Customer cannot proceed with payment

---

## Security Testing

### Test Authentication

#### Unauthenticated Access

1. Log out
2. Try to access protected routes:
   - `/customer/dashboard`
   - `/merchant/dashboard`
   - `/admin/dashboard`

**Expected Result**: ✅ Redirected to login page

#### Role-Based Access Control

1. Log in as customer
2. Try to access merchant routes: `/merchant/dashboard`

**Expected Result**: ✅ Access denied or redirected

### Test RLS Policies

#### Customer Cannot Access Other Customer Data

```sql
-- As customer A, try to access customer B's data
SELECT * FROM bnpl_applications WHERE customer_id = '<other-customer-id>';
```

**Expected Result**: ✅ No results returned (RLS blocks access)

#### Merchant Cannot Modify Customer Data

```sql
-- As merchant, try to update customer profile
UPDATE customer_profiles 
SET credit_limit = 10000 
WHERE user_id = '<customer-id>';
```

**Expected Result**: ❌ Update blocked by RLS policy

### Test API Security

#### Invalid API Key

```bash
curl -i --location --request POST 'https://your-project-id.supabase.co/functions/v1/charge-payment' \
  --header 'Authorization: Bearer INVALID_KEY' \
  --header 'Content-Type: application/json' \
  --data '{}'
```

**Expected Result**: ❌ 401 Unauthorized

---

## Performance Testing

### Test Payment Processing Speed

1. Record timestamp before payment
2. Process payment
3. Record timestamp after payment
4. Calculate duration

**Expected Result**: ✅ Payment processed in < 3 seconds

### Test Database Query Performance

```sql
EXPLAIN ANALYZE 
SELECT * FROM bnpl_applications 
WHERE customer_id = '<customer-id>' 
ORDER BY created_at DESC;
```

**Expected Result**: ✅ Query uses index, execution time < 100ms

---

## Troubleshooting Tests

### Common Test Failures

#### Payment Test Fails

**Issue**: Payment always fails

**Solutions**:
- Verify Stripe test keys are set correctly
- Check Edge Function logs: `supabase functions logs charge-payment`
- Ensure `STRIPE_SECRET_KEY` is set in Supabase secrets
- Use correct Stripe test card numbers

#### RLS Policy Test Fails

**Issue**: Customer can see other customers' data

**Solutions**:
- Verify RLS is enabled on tables
- Check RLS policies in Supabase Dashboard
- Ensure JWT claims are set correctly
- Run: `supabase db push supabase/migrations/20260113_rls_policies.sql`

#### Edge Function Not Responding

**Issue**: Edge Function returns 500 error

**Solutions**:
- Check function logs: `supabase functions logs <function-name>`
- Verify all secrets are set: `supabase secrets list`
- Redeploy function: `supabase functions deploy <function-name>`

### Viewing Logs

#### Application Logs

```bash
# Frontend logs
# Check browser console (F12)

# Edge Function logs
supabase functions logs charge-payment --tail
supabase functions logs webhook-handler --tail

# Database logs
supabase logs db
```

#### Stripe Logs

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/logs)
2. View recent API requests
3. Check for errors

---

## Test Checklist

Use this checklist to ensure all tests are completed:

### Authentication & Authorization
- [ ] Customer registration
- [ ] Merchant registration
- [ ] Login/logout
- [ ] Role-based access control
- [ ] RLS policies

### KYC Verification
- [ ] Document upload
- [ ] Document review (admin)
- [ ] KYC approval/rejection

### BNPL Application
- [ ] Create application
- [ ] Merchant review
- [ ] Application approval
- [ ] Application rejection
- [ ] Payment schedule creation

### Payment Processing
- [ ] Add payment method (Stripe)
- [ ] Down payment
- [ ] Installment payments
- [ ] Failed payment handling
- [ ] Payment retry

### Webhooks
- [ ] Stripe webhook reception
- [ ] Webhook signature verification
- [ ] Webhook processing

### Database
- [ ] RLS policies
- [ ] Triggers
- [ ] Data integrity

### Edge Functions
- [ ] charge-payment function
- [ ] webhook-handler function

### Security
- [ ] Authentication
- [ ] Authorization
- [ ] Data isolation

---

## Next Steps

After testing is complete:

1. ✅ Document any bugs found
2. ✅ Create tickets for issues
3. ✅ Perform load testing (if needed)
4. ✅ Set up monitoring and alerts
5. ✅ Deploy to production

---

## Additional Resources

- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Supabase Testing Best Practices](https://supabase.com/docs/guides/testing)
- [PostgreSQL Testing](https://www.postgresql.org/docs/current/regress.html)

---

**Last Updated**: January 2026  
**Version**: 1.0.0
