import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/dashboard/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { getAuditLogs } from '@/services/audit-logger.service';
import { 
  Shield, FileText, AlertTriangle, Clock, CheckCircle, 
  Search, Download, Loader2, User, Calendar, ExternalLink 
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  third_party_provider?: string;
  compliance_category?: string;
  users_extended?: {
    full_name: string;
    role: string;
  };
}

// COMPLIANT: Replaced KYCDocument with PersonaVerification
interface PersonaVerification {
  id: string;
  customer_id: string;
  persona_inquiry_id: string;
  persona_verification_id: string | null;
  verification_status: string;
  verification_type: string | null;
  initiated_at: string;
  completed_at: string | null;
  customer_profiles?: {
    users_extended?: {
      full_name: string;
    };
  };
}

export default function AdminCompliance() {
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [verifications, setVerifications] = useState<PersonaVerification[]>([]);
  const [stats, setStats] = useState({
    verificationsInProgress: 0,
    complianceIssues: 0,
    auditCount: 0,
    defaultedAccounts: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    fetchComplianceData();
  }, []);

  async function fetchComplianceData() {
    setLoading(true);
    try {
      // Fetch audit logs
      const logs = await getAuditLogs({ limit: 50 });
      setAuditLogs(logs as any);

      // COMPLIANT: Fetch Persona verifications instead of KYC documents
      // Veridian does NOT store ID documents - only verification references
      const { data: personaVerifications } = await supabase
        .from('persona_verifications')
        .select(`
          *,
          customer_profiles (
            users_extended (full_name)
          )
        `)
        .in('verification_status', ['pending', 'in_progress', 'needs_review'])
        .order('created_at', { ascending: false });

      setVerifications((personaVerifications || []) as any);

      // Fetch stats - using persona_verifications instead of kyc_documents
      const { count: verificationsInProgress } = await supabase
        .from('persona_verifications')
        .select('*', { count: 'exact', head: true })
        .in('verification_status', ['pending', 'in_progress', 'needs_review']);

      const { count: defaulted } = await supabase
        .from('bnpl_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'defaulted');

      setStats({
        verificationsInProgress: verificationsInProgress || 0,
        complianceIssues: 0,
        auditCount: logs.length,
        defaultedAccounts: defaulted || 0,
      });

    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getActionBadge = (action: string) => {
    if (action.includes('approved')) return <Badge className="bg-green-500">{action}</Badge>;
    if (action.includes('rejected') || action.includes('declined')) return <Badge variant="destructive">{action}</Badge>;
    if (action.includes('created')) return <Badge variant="secondary">{action}</Badge>;
    if (action.includes('login')) return <Badge variant="outline">{action}</Badge>;
    return <Badge variant="outline">{action}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <Badge className="bg-green-500">{status}</Badge>;
      case 'declined':
      case 'failed':
        return <Badge variant="destructive">{status}</Badge>;
      case 'pending':
      case 'in_progress':
        return <Badge className="bg-yellow-500">{status}</Badge>;
      case 'needs_review':
        return <Badge className="bg-orange-500">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.users_extended?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = actionFilter === 'all' || log.action.includes(actionFilter);
    
    return matchesSearch && matchesFilter;
  });

  const exportAuditLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID', 'Provider', 'Category', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.created_at,
        log.users_extended?.full_name || 'System',
        log.action,
        log.resource_type,
        log.resource_id || 'N/A',
        log.third_party_provider || 'N/A',
        log.compliance_category || 'N/A',
        log.ip_address || 'N/A',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // COMPLIANT: Open Persona dashboard to review verification
  const openPersonaDashboard = (personaInquiryId: string) => {
    window.open(`https://app.withpersona.com/dashboard/inquiries/${personaInquiryId}`, '_blank');
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
          <h1 className="text-3xl font-bold tracking-tight">Compliance Monitoring</h1>
          <p className="text-muted-foreground">Monitor platform compliance, audit logs, and regulatory requirements</p>
        </div>

        {/* Compliance Notice */}
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-800">Data Compliance Active</p>
                <p className="text-sm text-emerald-700">
                  Veridian does not store ID documents, SSN, credit scores, or bank credentials. 
                  All identity verification is handled by Persona, credit checks by Experian, 
                  and bank verification by Plaid. We retain only verification references and decision outcomes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Verifications In Progress</CardTitle>
              <FileText className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verificationsInProgress}</div>
              <p className="text-xs text-muted-foreground">Pending Persona verifications</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Defaulted Accounts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.defaultedAccounts}</div>
              <p className="text-xs text-muted-foreground">Accounts in default status</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.auditCount}</div>
              <p className="text-xs text-muted-foreground">Last 50 events</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">Active</div>
              <p className="text-xs text-muted-foreground">Golden Rule compliant</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="audit-logs">
          <TabsList>
            <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
            <TabsTrigger value="verifications">
              Verifications ({stats.verificationsInProgress})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audit-logs" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="approved">Approvals</SelectItem>
                      <SelectItem value="rejected">Rejections</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="login">Logins</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={exportAuditLogs}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Audit Log Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Audit Logs</CardTitle>
                <CardDescription>Platform activity and compliance events</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No audit logs found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredLogs.map((log) => (
                      <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getActionBadge(log.action)}
                            <span className="text-sm text-muted-foreground">{log.resource_type}</span>
                            {log.third_party_provider && (
                              <Badge variant="outline" className="text-xs">
                                {log.third_party_provider}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.users_extended?.full_name || 'System'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {log.resource_id && (
                            <p>ID: {log.resource_id.slice(0, 8)}...</p>
                          )}
                          {log.ip_address && (
                            <p>IP: {log.ip_address}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Persona Verification Queue</CardTitle>
                <CardDescription>
                  Review customer identity verifications on Persona's secure platform. 
                  Veridian does not store ID documents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending verifications</p>
                    <p className="text-sm">All verifications have been processed</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {verifications.map((verification) => (
                      <div key={verification.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {(verification.customer_profiles as any)?.users_extended?.full_name || 'Unknown'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {verification.verification_type || 'Identity Verification'} • 
                              Inquiry: {verification.persona_inquiry_id.slice(0, 12)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(verification.verification_status)}
                          <p className="text-sm text-muted-foreground">
                            {new Date(verification.initiated_at).toLocaleDateString()}
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openPersonaDashboard(verification.persona_inquiry_id)}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Review on Persona
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compliance Info */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Verification Review Process</p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                      <li>Click "Review on Persona" to view verification details in Persona's secure dashboard</li>
                      <li>Approve or decline verifications directly in Persona</li>
                      <li>Webhook updates will automatically sync status to Veridian</li>
                      <li>No ID documents are stored or displayed in Veridian's system</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
