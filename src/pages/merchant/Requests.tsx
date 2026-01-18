import { useState, useEffect } from 'react';
import { MerchantLayout } from '@/components/dashboard/merchant/MerchantLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Application {
  id: string;
  customer_id: string;
  purchase_amount: number;
  status: string;
  created_at: string;
  customer_profiles?: {
    users_extended?: {
      full_name: string;
    };
  };
  bnpl_plans?: {
    name: string;
  };
}

export default function MerchantRequests() {
  const { merchantProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (merchantProfile?.id) {
      fetchApplications();
    }
  }, [merchantProfile?.id]);

  async function fetchApplications() {
    if (!merchantProfile?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bnpl_applications')
        .select(`
          *,
          customer_profiles (
            user_id,
            users_extended (full_name)
          ),
          bnpl_plans (name)
        `)
        .eq('merchant_id', merchantProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(applicationId: string) {
    try {
      // Get application details
      const { data: application, error: appError } = await supabase
        .from('bnpl_applications')
        .select(`
          *,
          bnpl_plans (*)
        `)
        .eq('id', applicationId)
        .single();

      if (appError || !application) throw new Error('Application not found');

      // Charge down payment via Stripe if amount > 0
      if (application.down_payment > 0) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          // For testing: Use Stripe test card token
          // This will create a payment method on-the-fly
          const testPaymentMethod = 'pm_card_visa';
          
          console.log('Charging down payment:', {
            amount: application.down_payment,
            customer_id: application.customer_id,
            application_id: application.id,
          });
          
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/charge-payment`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`,
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({
                payment_method_token: testPaymentMethod,
                amount: application.down_payment,
                currency: 'usd',
                customer_id: application.customer_id,
                application_id: application.id,
                transaction_type: 'down_payment',
              }),
            }
          );

          console.log('Edge Function response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Edge Function error:', response.status, errorText);
            
            let errorMessage = `Server error (${response.status})`;
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorJson.error || errorText;
            } catch {
              errorMessage = errorText;
            }
            
            toast({
              title: 'Payment Failed',
              description: errorMessage,
              variant: 'destructive',
            });
            return;
          }

          const paymentResult = await response.json();
          console.log('Payment result:', paymentResult);

          if (!paymentResult.success) {
            toast({
              title: 'Payment Failed',
              description: `Down payment charge failed: ${paymentResult.error || 'Unknown error'}`,
              variant: 'destructive',
            });
            return;
          }

          console.log('✅ Down payment charged successfully:', paymentResult);
        } catch (paymentError) {
          console.error('Error charging down payment:', paymentError);
          toast({
            title: 'Payment Error',
            description: `Failed to process down payment: ${paymentError.message}`,
            variant: 'destructive',
          });
          return;
        }
      }

      // Update application status to approved
      const { error: updateError } = await supabase
        .from('bnpl_applications')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Create payment schedule
      const plan = application.bnpl_plans as any;
      const installmentAmount = Math.round((application.total_amount / plan.installments) * 100) / 100;
      const schedules = [];

      for (let i = 1; i <= plan.installments; i++) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (i * 14)); // Every 2 weeks

        // Last installment handles rounding
        const amount = i === plan.installments
          ? application.total_amount - (installmentAmount * (plan.installments - 1))
          : installmentAmount;

        schedules.push({
          application_id: applicationId,
          installment_number: i,
          amount: amount,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'scheduled',
          paid_amount: 0,
        });
      }

      // Insert payment schedules
      const { error: scheduleError } = await supabase
        .from('payment_schedules')
        .insert(schedules);

      if (scheduleError) throw scheduleError;

      toast({
        title: 'Application Approved',
        description: application.down_payment > 0 
          ? `Payment schedule created and down payment of $${application.down_payment} charged successfully`
          : 'Payment schedule has been created for the customer',
      });

      fetchApplications();
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve application',
        variant: 'destructive',
      });
    }
  }

  async function handleReject(applicationId: string) {
    try {
      const { error } = await supabase
        .from('bnpl_applications')
        .update({ 
          status: 'rejected',
          rejected_reason: 'Rejected by merchant',
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: 'Application Rejected',
        description: 'The BNPL application has been rejected',
      });

      fetchApplications();
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject application',
        variant: 'destructive',
      });
    }
  }

  const pendingRequests = applications.filter(a => a.status === 'pending');
  const approvedRequests = applications.filter(a => a.status === 'approved' || a.status === 'active');
  const rejectedRequests = applications.filter(a => a.status === 'rejected');

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">BNPL Requests</h1>
          <p className="text-muted-foreground">Review and manage customer BNPL applications</p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending requests</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map((req) => (
                <Card key={req.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>
                          {(req.customer_profiles as any)?.users_extended?.full_name || 'Customer'}
                        </CardTitle>
                        <CardDescription>
                          Applied: {new Date(req.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-2xl font-bold">${req.purchase_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Plan</p>
                        <p className="text-lg font-semibold">{req.bnpl_plans?.name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReject(req.id)}
                      >
                        Reject
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApprove(req.id)}
                      >
                        Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No approved requests</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              approvedRequests.map((req) => (
                <Card key={req.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>
                          {(req.customer_profiles as any)?.users_extended?.full_name || 'Customer'}
                        </CardTitle>
                        <CardDescription>
                          Approved: {new Date(req.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-500">Approved</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-2xl font-bold">${req.purchase_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Plan</p>
                        <p className="text-lg font-semibold">{req.bnpl_plans?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <XCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No rejected requests</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              rejectedRequests.map((req) => (
                <Card key={req.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>
                          {(req.customer_profiles as any)?.users_extended?.full_name || 'Customer'}
                        </CardTitle>
                        <CardDescription>
                          Rejected: {new Date(req.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="destructive">Rejected</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-2xl font-bold">${req.purchase_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Plan</p>
                        <p className="text-lg font-semibold">{req.bnpl_plans?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MerchantLayout>
  );
}
