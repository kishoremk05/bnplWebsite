import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Store, DollarSign, Calendar } from 'lucide-react';
import { getCheckoutSession, completeCheckoutSession } from '@/services/checkout.service';
import { getAvailablePlans, calculatePlan } from '@/services/bnpl-engine.service';
import { processApplication } from '@/services/underwriting.service';
import { sendCheckoutCompletedWebhook } from '@/services/webhook.service';
import { Tables } from '@/integrations/supabase/types';
import { BNPLPlan } from '@/types/database';

type CheckoutSession = Tables<'merchant_checkout_sessions'>;

export default function CheckoutPage() {
  const { sessionToken } = useParams<{ sessionToken: string }>();
  const navigate = useNavigate();
  const { customerProfile, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [plans, setPlans] = useState<BNPLPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadCheckoutSession();
  }, [sessionToken]);

  useEffect(() => {
    if (session) {
      loadPlans();
    }
  }, [session]);

  async function loadCheckoutSession() {
    if (!sessionToken) {
      setError('Invalid checkout session');
      setLoading(false);
      return;
    }

    try {
      const { session: sessionData, error: sessionError } = await getCheckoutSession(sessionToken);

      if (sessionError || !sessionData) {
        setError(sessionError || 'Session not found');
        setLoading(false);
        return;
      }

      setSession(sessionData);
      setMerchant((sessionData as any).merchant);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load checkout session');
      setLoading(false);
    }
  }

  async function loadPlans() {
    if (!session) return;

    try {
      const availablePlans = await getAvailablePlans(session.order_amount);
      setPlans(availablePlans);
      if (availablePlans.length > 0) {
        setSelectedPlan(availablePlans[0].id);
      }
    } catch (err) {
      console.error('Error loading plans:', err);
    }
  }

  async function handleApply() {
    if (!customerProfile || !session || !selectedPlan) return;

    setProcessing(true);
    try {
      // Submit BNPL application with checkout session ID
      const result = await processApplication({
        customerId: customerProfile.id,
        merchantId: session.merchant_id,
        planId: selectedPlan,
        purchaseAmount: session.order_amount,
        downPayment: 0,
        checkoutSessionId: session.id, // Pass session ID for order intent
      });

      if (!result.success) {
        setError(result.message || 'Application failed');
        setProcessing(false);
        return;
      }

      // Complete checkout session
      await completeCheckoutSession(session.id, result.applicationId!);

      // Order intent and webhook are handled automatically in processApplication
      
      // Redirect to success page
      navigate(`/checkout/success/${sessionToken}`, {
        state: {
          applicationId: result.applicationId,
          decision: result.decision,
          returnUrl: session.return_url,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to process application');
      setProcessing(false);
    }
  }

  function handleCancel() {
    if (session?.cancel_url) {
      window.location.href = session.cancel_url;
    } else {
      navigate('/');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Checkout Error</AlertTitle>
          <AlertDescription>{error || 'Session not found'}</AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);
  const calculation = selectedPlanData
    ? calculatePlan(selectedPlanData, session.order_amount, 0)
    : null;

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
        <p className="text-muted-foreground">
          Pay over time with Regal Pay - Simple, transparent installments
        </p>
      </div>

      {/* Merchant Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Store className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Shopping at</CardTitle>
              <CardDescription className="text-lg font-semibold text-foreground">
                {merchant?.business_name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Order Amount</span>
            <span className="text-2xl font-bold">${session.order_amount.toFixed(2)}</span>
          </div>
          {session.order_id && (
            <p className="text-sm text-muted-foreground mt-2">Order ID: {session.order_id}</p>
          )}
        </CardContent>
      </Card>

      {/* Plan Selection */}
      {plans.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Choose Your Payment Plan</CardTitle>
            <CardDescription>Select how you'd like to pay over time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {plans.map((plan) => {
              const calc = calculatePlan(plan, session.order_amount, 0);
              const isSelected = plan.id === selectedPlan;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ${calc.installmentAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{plan.installments} payments</span>
                    </div>
                    {plan.interest_rate > 0 && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{plan.interest_rate}% interest</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Payment Summary */}
      {calculation && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purchase Amount</span>
              <span className="font-medium">${calculation.purchaseAmount.toFixed(2)}</span>
            </div>
            {calculation.interestAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest</span>
                <span className="font-medium">+${calculation.interestAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold">Total to Pay</span>
              <span className="font-bold text-lg">${calculation.financedAmount.toFixed(2)}</span>
            </div>
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-center text-sm">
                <span className="font-semibold">{calculation.installments} monthly payments</span>{' '}
                of{' '}
                <span className="font-bold text-primary text-lg">
                  ${calculation.installmentAmount.toFixed(2)}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleCancel} className="flex-1" disabled={processing}>
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          className="flex-1"
          disabled={processing || !selectedPlan || !customerProfile}
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Apply Now'
          )}
        </Button>
      </div>

      {!customerProfile && (
        <Alert className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Login Required</AlertTitle>
          <AlertDescription>
            Please log in or create an account to continue with your purchase.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
