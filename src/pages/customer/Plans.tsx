import { useState, useEffect } from 'react';
import { CustomerLayout } from '@/components/dashboard/customer/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Clock, CheckCircle, XCircle, Plus, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BNPLApplicationForm } from '@/components/customer/BNPLApplicationForm';
import { getCustomerApplications, getPaymentSchedule } from '@/services/bnpl-engine.service';

interface ApplicationWithDetails {
  id: string;
  purchase_amount: number;
  total_amount: number;
  down_payment: number;
  status: string;
  created_at: string;
  approved_at: string | null;
  merchant_profiles?: { business_name: string };
  bnpl_plans?: { name: string; installments: number };
  paidAmount?: number;
  remainingAmount?: number;
  nextPaymentDate?: string;
  progressPercent?: number;
}

export default function CustomerPlans() {
  const { customerProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  useEffect(() => {
    if (customerProfile?.id) {
      fetchApplications();
    }
  }, [customerProfile?.id]);

  async function fetchApplications() {
    if (!customerProfile?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bnpl_applications')
        .select(`
          *,
          bnpl_plans (name, installments),
          merchant_profiles (business_name)
        `)
        .eq('customer_id', customerProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch payment schedules for each application to calculate amounts
      const appsWithDetails = await Promise.all(
        (data || []).map(async (app) => {
          const schedules = await getPaymentSchedule(app.id);
          const completedPayments = schedules.filter(s => s.status === 'completed');
          const paidAmount = completedPayments.reduce((sum, s) => sum + s.paid_amount, 0);
          const remainingAmount = app.total_amount - paidAmount - app.down_payment;
          const scheduledPayments = schedules.filter(s => s.status === 'scheduled');
          const nextPayment = scheduledPayments.sort((a, b) => 
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          )[0];

          return {
            ...app,
            paidAmount,
            remainingAmount,
            nextPaymentDate: nextPayment?.due_date,
            progressPercent: app.total_amount > 0 
              ? ((paidAmount + app.down_payment) / app.total_amount) * 100 
              : 0,
          };
        })
      );

      setApplications(appsWithDetails);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }

  const activePlans = applications.filter(a => a.status === 'active' || a.status === 'approved');
  const pendingPlans = applications.filter(a => a.status === 'pending');
  const completedPlans = applications.filter(a => a.status === 'completed');
  const rejectedPlans = applications.filter(a => a.status === 'rejected' || a.status === 'defaulted');

  const EmptyState = ({ icon: Icon, title, description }: any) => (
    <div className="text-center py-12 text-muted-foreground">
      <Icon className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />Completed
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'defaulted':
        return <Badge variant="destructive">Defaulted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My BNPL Plans</h1>
            <p className="text-muted-foreground">
              View and manage all your Buy Now, Pay Later plans
            </p>
          </div>
          <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Apply for BNPL
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Apply for BNPL Financing</DialogTitle>
              </DialogHeader>
              <BNPLApplicationForm
                onSuccess={(id) => {
                  setApplyDialogOpen(false);
                  fetchApplications();
                }}
                onCancel={() => setApplyDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activePlans.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingPlans.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedPlans.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activePlans.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <EmptyState
                    icon={CreditCard}
                    title="No Active Plans"
                    description="You don't have any active BNPL plans. Click 'Apply for BNPL' to get started!"
                  />
                </CardContent>
              </Card>
            ) : (
              activePlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {plan.merchant_profiles?.business_name || 'Unknown Merchant'}
                        </CardTitle>
                        <CardDescription>
                          {plan.bnpl_plans?.name} • {plan.bnpl_plans?.installments} payments
                        </CardDescription>
                      </div>
                      {getStatusBadge(plan.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-2xl font-bold">${plan.total_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Paid</p>
                        <p className="text-2xl font-bold text-green-500">
                          ${((plan.paidAmount || 0) + plan.down_payment).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <p className="text-2xl font-bold">${(plan.remainingAmount || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next Payment</p>
                        <p className="text-lg font-semibold">
                          {plan.nextPaymentDate 
                            ? new Date(plan.nextPaymentDate).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Payment Progress</span>
                        <span>{Math.round(plan.progressPercent || 0)}%</span>
                      </div>
                      <Progress value={plan.progressPercent || 0} />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingPlans.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <EmptyState
                    icon={Clock}
                    title="No Pending Applications"
                    description="You don't have any pending BNPL applications awaiting approval."
                  />
                </CardContent>
              </Card>
            ) : (
              pendingPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Application for {plan.merchant_profiles?.business_name}</CardTitle>
                        <CardDescription>
                          Submitted: {new Date(plan.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {getStatusBadge(plan.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Requested Amount</p>
                        <p className="text-xl font-bold">${plan.purchase_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Plan</p>
                        <p className="text-lg">{plan.bnpl_plans?.name}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Your application is being reviewed. You'll be notified once a decision is made.
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedPlans.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <EmptyState
                    icon={CheckCircle}
                    title="No Completed Plans"
                    description="Plans you've fully paid off will appear here."
                  />
                </CardContent>
              </Card>
            ) : (
              completedPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{plan.merchant_profiles?.business_name}</CardTitle>
                        <CardDescription>
                          Completed: {plan.approved_at ? new Date(plan.approved_at).toLocaleDateString() : 'N/A'}
                        </CardDescription>
                      </div>
                      {getStatusBadge(plan.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                        <p className="text-xl font-bold text-green-500">${plan.total_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Plan</p>
                        <p className="text-lg">{plan.bnpl_plans?.name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  );
}
