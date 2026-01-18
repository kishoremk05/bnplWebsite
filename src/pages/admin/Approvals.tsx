import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/dashboard/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logBNPLApplication } from '@/services/audit-logger.service';
import { generatePaymentSchedule } from '@/services/underwriting.service';
import { 
  Clock, CheckCircle, XCircle, AlertTriangle, User, 
  Building, DollarSign, Calendar, Shield, Loader2 
} from 'lucide-react';

interface PendingApplication {
  id: string;
  purchase_amount: number;
  down_payment: number;
  total_amount: number;
  status: string;
  risk_score: number | null;
  created_at: string;
  customer_profiles?: {
    id: string;
    kyc_status: string;
    credit_limit: number;
    available_credit: number;
    users_extended?: {
      full_name: string;
      phone: string;
    };
  };
  merchant_profiles?: {
    business_name: string;
  };
  bnpl_plans?: {
    name: string;
    installments: number;
    interest_rate: number;
  };
}

export default function AdminApprovals() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApplication[]>([]);
  const [recentDecisions, setRecentDecisions] = useState<PendingApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<PendingApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setLoading(true);
    try {
      // Fetch pending applications
      const { data: pending, error: pendingError } = await supabase
        .from('bnpl_applications')
        .select(`
          *,
          customer_profiles (
            id,
            kyc_status,
            credit_limit,
            available_credit,
            users_extended (full_name, phone)
          ),
          merchant_profiles (business_name),
          bnpl_plans (name, installments, interest_rate)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (pendingError) throw pendingError;
      setPendingApprovals((pending || []) as any);

      // Fetch recent decisions
      const { data: recent, error: recentError } = await supabase
        .from('bnpl_applications')
        .select(`
          *,
          customer_profiles (
            id,
            kyc_status,
            users_extended (full_name)
          ),
          merchant_profiles (business_name)
        `)
        .in('status', ['approved', 'rejected', 'active'])
        .order('updated_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;
      setRecentDecisions((recent || []) as any);

    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!selectedApp || !user) return;
    
    setProcessing(true);
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('bnpl_applications')
        .update({
          status: 'approved',
          approval_notes: reviewNotes || 'Approved by admin review',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', selectedApp.id);

      if (updateError) throw updateError;

      // Generate payment schedule
      const plan = selectedApp.bnpl_plans;
      if (plan) {
        await generatePaymentSchedule(
          selectedApp.id,
          selectedApp.total_amount - selectedApp.down_payment,
          plan.installments
        );
      }

      // Update customer's available credit
      if (selectedApp.customer_profiles) {
        await supabase
          .from('customer_profiles')
          .update({
            available_credit: selectedApp.customer_profiles.available_credit - selectedApp.purchase_amount,
          })
          .eq('id', selectedApp.customer_profiles.id);
      }

      // Log audit event
      await logBNPLApplication(
        selectedApp.customer_profiles?.id || '',
        selectedApp.id,
        'approved',
        { notes: reviewNotes, approved_by: user.id }
      );

      toast({
        title: 'Application Approved',
        description: 'The BNPL application has been approved and payment schedule generated.',
      });

      setSelectedApp(null);
      setReviewNotes('');
      fetchApplications();

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve application',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!selectedApp || !user) return;
    
    if (!reviewNotes) {
      toast({
        title: 'Rejection reason required',
        description: 'Please provide a reason for rejecting this application',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('bnpl_applications')
        .update({
          status: 'rejected',
          rejected_reason: reviewNotes,
        })
        .eq('id', selectedApp.id);

      if (error) throw error;

      // Log audit event
      await logBNPLApplication(
        selectedApp.customer_profiles?.id || '',
        selectedApp.id,
        'rejected',
        { reason: reviewNotes, rejected_by: user.id }
      );

      toast({
        title: 'Application Rejected',
        description: 'The BNPL application has been rejected.',
      });

      setSelectedApp(null);
      setReviewNotes('');
      fetchApplications();

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject application',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  }

  const getRiskBadge = (score: number | null) => {
    if (score === null) return <Badge variant="outline">No Score</Badge>;
    if (score >= 70) return <Badge className="bg-green-500">Low Risk ({score})</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-500">Medium Risk ({score})</Badge>;
    return <Badge variant="destructive">High Risk ({score})</Badge>;
  };

  const getKYCBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><Shield className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'in_review':
        return <Badge variant="secondary">In Review</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">BNPL Approvals</h1>
          <p className="text-muted-foreground">Review and approve BNPL applications requiring manual review</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApprovals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingApprovals.filter(a => (a.risk_score || 0) < 40).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${pendingApprovals.reduce((sum, a) => sum + a.purchase_amount, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingApprovals.length})</TabsTrigger>
            <TabsTrigger value="recent">Recent Decisions</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending approvals</p>
                    <p className="text-sm">All applications have been reviewed</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              pendingApprovals.map((app) => (
                <Card key={app.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedApp(app)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">
                            {(app.customer_profiles as any)?.users_extended?.full_name || 'Unknown'}
                          </span>
                          {getKYCBadge((app.customer_profiles as any)?.kyc_status || 'pending')}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building className="h-4 w-4" />
                          {(app.merchant_profiles as any)?.business_name || 'Unknown Merchant'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(app.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-2xl font-bold">${app.purchase_amount.toFixed(2)}</p>
                        {getRiskBadge(app.risk_score)}
                        <p className="text-sm text-muted-foreground">
                          {(app.bnpl_plans as any)?.name} • {(app.bnpl_plans as any)?.installments} payments
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {recentDecisions.map((app) => (
              <Card key={app.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {(app.customer_profiles as any)?.users_extended?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(app.merchant_profiles as any)?.business_name} • ${app.purchase_amount.toFixed(2)}
                      </p>
                    </div>
                    <Badge variant={app.status === 'rejected' ? 'destructive' : 'default'}
                      className={app.status === 'approved' || app.status === 'active' ? 'bg-green-500' : ''}>
                      {app.status === 'active' ? 'Approved' : app.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Application</DialogTitle>
              <DialogDescription>
                Review the application details and make a decision
              </DialogDescription>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Customer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="font-medium">
                        {(selectedApp.customer_profiles as any)?.users_extended?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedApp.customer_profiles as any)?.users_extended?.phone || 'No phone'}
                      </p>
                      <div className="flex gap-2">
                        {getKYCBadge((selectedApp.customer_profiles as any)?.kyc_status)}
                        {getRiskBadge(selectedApp.risk_score)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Credit Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Credit Limit</span>
                        <span>${(selectedApp.customer_profiles as any)?.credit_limit || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Available</span>
                        <span>${(selectedApp.customer_profiles as any)?.available_credit || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Requested</span>
                        <span className="font-bold">${selectedApp.purchase_amount}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Application Details */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Application Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Merchant</p>
                        <p className="font-medium">{(selectedApp.merchant_profiles as any)?.business_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Plan</p>
                        <p className="font-medium">
                          {(selectedApp.bnpl_plans as any)?.name} ({(selectedApp.bnpl_plans as any)?.installments} payments)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-medium">${selectedApp.total_amount.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Review Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Review Notes</label>
                  <Textarea
                    placeholder="Add notes about this decision (required for rejections)"
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setSelectedApp(null)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleReject}
                    disabled={processing}
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Reject
                  </Button>
                  <Button 
                    onClick={handleApprove}
                    disabled={processing}
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Approve
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
