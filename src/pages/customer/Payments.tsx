import { useState, useEffect } from 'react';
import { CustomerLayout } from '@/components/dashboard/customer/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CreditCard, CheckCircle, Clock, AlertCircle, Loader2, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PaymentMethodManager } from '@/components/customer/PaymentMethodManager';
import { getUpcomingPayments, getOverduePayments } from '@/services/bnpl-engine.service';
import { useToast } from '@/hooks/use-toast';

interface PaymentScheduleItem {
  id: string;
  application_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: string;
  paid_amount: number;
  paid_at: string | null;
  bnpl_applications?: {
    merchant_profiles?: {
      business_name: string;
    };
  };
}

export default function CustomerPayments() {
  const { customerProfile } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [upcomingPayments, setUpcomingPayments] = useState<PaymentScheduleItem[]>([]);
  const [overduePayments, setOverduePayments] = useState<PaymentScheduleItem[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentScheduleItem[]>([]);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    if (customerProfile?.id) {
      fetchPayments();
    }
  }, [customerProfile?.id]);

  async function fetchPayments() {
    if (!customerProfile?.id) return;
    
    setLoading(true);
    try {
      // Fetch upcoming payments
      const upcoming = await getUpcomingPayments(customerProfile.id, 10);
      setUpcomingPayments(upcoming as any);

      // Fetch overdue payments
      const overdue = await getOverduePayments(customerProfile.id);
      setOverduePayments(overdue as any);

      // Fetch payment history (completed payments)
      const { data: applications } = await supabase
        .from('bnpl_applications')
        .select('id')
        .eq('customer_id', customerProfile.id);

      if (applications && applications.length > 0) {
        const applicationIds = applications.map(a => a.id);
        
        const { data: history } = await supabase
          .from('payment_schedules')
          .select(`
            *,
            bnpl_applications (
              merchant_profiles (business_name)
            )
          `)
          .in('application_id', applicationIds)
          .eq('status', 'completed')
          .order('paid_at', { ascending: false })
          .limit(20);

        setPaymentHistory((history || []) as any);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePayNow(scheduleId: string) {
    // Get default payment method
    const { data: paymentMethod } = await supabase
      .from('customer_payment_methods')
      .select('id')
      .eq('customer_id', customerProfile?.id)
      .eq('is_default', true)
      .single();

    if (!paymentMethod) {
      toast({
        title: 'No payment method',
        description: 'Please add a payment method first',
        variant: 'destructive',
      });
      return;
    }

    setProcessingPayment(scheduleId);
    try {
      // In production, this would call the payment processor
      // For now, simulate payment success
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update payment schedule
      await supabase
        .from('payment_schedules')
        .update({
          status: 'completed',
          paid_amount: upcomingPayments.find(p => p.id === scheduleId)?.amount || 0,
          paid_at: new Date().toISOString(),
        })
        .eq('id', scheduleId);

      toast({
        title: 'Payment successful',
        description: 'Your payment has been processed',
      });

      fetchPayments();
    } catch (error: any) {
      toast({
        title: 'Payment failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setProcessingPayment(null);
    }
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status === 'scheduled';
    
    if (isOverdue) {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
    }
    
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />Completed
        </Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Manage your payment schedule and view payment history
          </p>
        </div>

        {/* Overdue Payments Alert */}
        {overduePayments.length > 0 && (
          <Card className="border-destructive bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Overdue Payments ({overduePayments.length})
              </CardTitle>
              <CardDescription>
                Please make these payments as soon as possible to avoid late fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overduePayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-background"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Installment #{payment.installment_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(payment.due_date).toLocaleDateString()} • 
                          {(payment.bnpl_applications as any)?.merchant_profiles?.business_name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold">${payment.amount.toFixed(2)}</p>
                      <Button 
                        size="sm"
                        onClick={() => handlePayNow(payment.id)}
                        disabled={processingPayment === payment.id}
                      >
                        {processingPayment === payment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Pay Now'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
            <CardDescription>
              Your scheduled installments for active BNPL plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming payments</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Installment #{payment.installment_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(payment.due_date).toLocaleDateString()} • 
                          {(payment.bnpl_applications as any)?.merchant_profiles?.business_name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">${payment.amount.toFixed(2)}</p>
                        {getStatusBadge(payment.status, payment.due_date)}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePayNow(payment.id)}
                        disabled={processingPayment === payment.id}
                      >
                        {processingPayment === payment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Pay Early'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <PaymentMethodManager />

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              All your past payments and transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No payment history</p>
                <p className="text-sm">Your completed payments will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Installment #{payment.installment_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Paid: {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : 'N/A'} • 
                          {(payment.bnpl_applications as any)?.merchant_profiles?.business_name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${payment.paid_amount.toFixed(2)}</p>
                      <Badge variant="outline" className="border-green-500 text-green-500">
                        Completed
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
