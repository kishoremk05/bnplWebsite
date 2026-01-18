import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getAvailablePlans, calculatePlan, generateInstallmentBreakdown } from '@/services/bnpl-engine.service';
import { checkEligibility, processApplication } from '@/services/underwriting.service';
import { BNPLPlan, MerchantProfile } from '@/types/database';

interface BNPLApplicationFormProps {
  onSuccess?: (applicationId: string) => void;
  onCancel?: () => void;
}

export function BNPLApplicationForm({ onSuccess, onCancel }: BNPLApplicationFormProps) {
  const { customerProfile, user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [merchants, setMerchants] = useState<MerchantProfile[]>([]);
  const [plans, setPlans] = useState<BNPLPlan[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [purchaseAmount, setPurchaseAmount] = useState<number>(0);
  const [downPayment, setDownPayment] = useState<number>(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch merchants on mount
  useEffect(() => {
    async function fetchMerchants() {
      const { data } = await supabase
        .from('merchant_profiles')
        .select('*')
        // Show all merchants, not just verified ones (for testing)
        .order('business_name');

      if (data) {
        setMerchants(data);
      }
    }
    fetchMerchants();
  }, []);

  // Fetch plans when purchase amount changes
  useEffect(() => {
    async function fetchPlans() {
      if (purchaseAmount > 0) {
        const availablePlans = await getAvailablePlans(purchaseAmount);
        setPlans(availablePlans);
        if (availablePlans.length > 0 && !selectedPlan) {
          setSelectedPlan(availablePlans[0].id);
        }
      } else {
        // Fetch all plans when no amount specified
        const allPlans = await getAvailablePlans();
        setPlans(allPlans);
      }
    }
    fetchPlans();
  }, [purchaseAmount]);

  // Check eligibility when amount or plan changes
  useEffect(() => {
    const checkUserEligibility = async () => {
      if (!customerProfile?.id || purchaseAmount <= 0) {
        setEligibilityResult(null);
        return;
      }

      setCheckingEligibility(true);
      try {
        const result = await checkEligibility(customerProfile.id, purchaseAmount);
        setEligibilityResult(result);
      } catch (error) {
        console.error('Eligibility check failed:', error);
      } finally {
        setCheckingEligibility(false);
      }
    };

    const debounce = setTimeout(checkUserEligibility, 500);
    return () => clearTimeout(debounce);
  }, [customerProfile?.id, purchaseAmount]);

  // Get selected plan details
  const selectedPlanData = plans.find(p => p.id === selectedPlan);
  const calculation = selectedPlanData
    ? calculatePlan(selectedPlanData, purchaseAmount, downPayment)
    : null;
  const installments = calculation
    ? generateInstallmentBreakdown(calculation)
    : [];

  const handleSubmit = async () => {
    if (!customerProfile?.id || !selectedMerchant || !selectedPlan || purchaseAmount <= 0) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await processApplication({
        customerId: customerProfile.id,
        merchantId: selectedMerchant,
        planId: selectedPlan,
        purchaseAmount,
        downPayment,
      });

      if (result.success) {
        toast({
          title: result.decision === 'approved' ? 'Application Approved!' : 'Application Submitted',
          description: result.message,
        });
        onSuccess?.(result.applicationId!);
      } else {
        toast({
          title: 'Application Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Eligibility Alert */}
      {eligibilityResult && (
        <Alert variant={eligibilityResult.eligible ? 'default' : 'destructive'}>
          {eligibilityResult.eligible ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle>
            {eligibilityResult.eligible
              ? eligibilityResult.decision === 'auto_approve'
                ? 'Pre-Approved!'
                : 'Eligible for Review'
              : 'Not Eligible'}
          </AlertTitle>
          <AlertDescription>
            {eligibilityResult.reasons.length > 0
              ? eligibilityResult.reasons.join('. ')
              : eligibilityResult.decision === 'auto_approve'
              ? 'You qualify for instant approval based on your credit profile.'
              : 'Your application will be reviewed by our team.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Credit Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Credit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Credit Limit</p>
              <p className="text-2xl font-bold">${customerProfile?.credit_limit || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Credit</p>
              <p className="text-2xl font-bold text-green-600">
                ${customerProfile?.available_credit || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle>Apply for BNPL</CardTitle>
          <CardDescription>
            Split your purchase into easy monthly payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Merchant Selection */}
          <div className="space-y-2">
            <Label>Select Merchant</Label>
            <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a merchant" />
              </SelectTrigger>
              <SelectContent>
                {merchants.map(merchant => (
                  <SelectItem key={merchant.id} value={merchant.id}>
                    {merchant.business_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Purchase Amount */}
          <div className="space-y-2">
            <Label>Purchase Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                min={0}
                step={1}
                placeholder="0"
                className="pl-9"
                value={purchaseAmount || ''}
                onChange={e => {
                  const value = parseFloat(e.target.value) || 0;
                  setPurchaseAmount(Math.round(value)); // Round to avoid decimal issues
                }}
              />
            </div>
            {customerProfile && purchaseAmount > (customerProfile.available_credit * 1.1) && (
              <p className="text-sm text-destructive">
                Amount significantly exceeds your available credit
              </p>
            )}
          </div>

          {/* Plan Selection */}
          {plans.length > 0 && purchaseAmount > 0 && (
            <div className="space-y-2">
              <Label>Payment Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.installments} payments
                      {plan.interest_rate > 0 && ` (${plan.interest_rate}% interest)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Down Payment */}
          {selectedPlanData && (
            <div className="space-y-2">
              <Label>Down Payment (Optional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min={0}
                  max={purchaseAmount}
                  step={0.01}
                  placeholder="0.00"
                  className="pl-9"
                  value={downPayment || ''}
                  onChange={e => setDownPayment(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          {/* Payment Summary */}
          {calculation && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchase Amount</span>
                  <span className="font-medium">${calculation.purchaseAmount.toFixed(2)}</span>
                </div>
                {calculation.downPayment > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Down Payment</span>
                    <span className="font-medium text-green-600">
                      -${calculation.downPayment.toFixed(2)}
                    </span>
                  </div>
                )}
                {calculation.interestAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest ({selectedPlanData?.interest_rate}%)</span>
                    <span className="font-medium">+${calculation.interestAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Total to Pay</span>
                  <span className="font-bold">${calculation.financedAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span className="font-medium">Monthly Payment</span>
                  <span className="font-bold text-lg">
                    ${calculation.installmentAmount.toFixed(2)} x {calculation.installments}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Installment Preview */}
          {installments.length > 0 && (
            <div className="space-y-2">
              <Label>Payment Schedule Preview</Label>
              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                {installments.map(inst => (
                  <div
                    key={inst.installmentNumber}
                    className="flex justify-between p-3 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Payment {inst.installmentNumber} - {inst.dueDate.toLocaleDateString()}
                    </span>
                    <span className="font-medium">${inst.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={
                submitting ||
                !selectedMerchant ||
                !selectedPlan ||
                purchaseAmount <= 0 ||
                (eligibilityResult && !eligibilityResult.eligible)
              }
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : eligibilityResult?.decision === 'auto_approve' ? (
                'Apply Now - Instant Approval'
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
