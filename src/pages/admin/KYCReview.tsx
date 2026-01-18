import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/dashboard/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  User,
  MapPin,
  Calendar,
  Search,
  RefreshCw,
} from 'lucide-react';
import {
  getKYCSubmissions,
  approveKYC,
  rejectKYC,
  getDocumentSignedUrls,
  KYCSubmission,
  KYCDocumentInfo,
} from '@/services/kyc-admin.service';

export default function AdminKYCReview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('in_review');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadSubmissions = async () => {
    setLoading(true);
    const data = await getKYCSubmissions(filter);
    setSubmissions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSubmissions();
  }, [filter]);

  const handleViewDocuments = async (submission: KYCSubmission) => {
    setSelectedSubmission(submission);
    const urls = await getDocumentSignedUrls(submission.documents);
    setDocumentUrls(urls);
    setShowReviewModal(true);
  };

  const handleApprove = async () => {
    if (!selectedSubmission || !user) return;

    setProcessing(true);
    const { success, error } = await approveKYC(selectedSubmission.id, user.id);
    setProcessing(false);

    if (success) {
      toast({
        title: 'KYC Approved',
        description: `${selectedSubmission.full_name}'s KYC has been approved.`,
      });
      setShowReviewModal(false);
      loadSubmissions();
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to approve KYC',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !user || !rejectionReason.trim()) return;

    setProcessing(true);
    const { success, error } = await rejectKYC(
      selectedSubmission.id,
      user.id,
      rejectionReason.trim()
    );
    setProcessing(false);

    if (success) {
      toast({
        title: 'KYC Rejected',
        description: `${selectedSubmission.full_name}'s KYC has been rejected.`,
      });
      setShowRejectModal(false);
      setShowReviewModal(false);
      setRejectionReason('');
      loadSubmissions();
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to reject KYC',
        variant: 'destructive',
      });
    }
  };

  const filteredSubmissions = submissions.filter((s) =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'in_review':
        return (
          <Badge variant="outline" className="gap-1 border-blue-500 text-blue-500">
            <Eye className="w-3 h-3" />
            In Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="gap-1 bg-green-500">
            <CheckCircle className="w-3 h-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const documentTypeLabels: Record<string, string> = {
    id_front: 'Government ID (Front)',
    id_back: 'Government ID (Back)',
    proof_of_address: 'Proof of Address',
    selfie: 'Selfie with ID',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">KYC Review</h1>
            <p className="text-muted-foreground">
              Review and approve customer identity verification
            </p>
          </div>
          <Button variant="outline" onClick={loadSubmissions} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="in_review">
              In Review ({submissions.filter((s) => s.kyc_status === 'in_review').length})
            </TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading submissions...
              </CardContent>
            </Card>
          ) : filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No KYC submissions found
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{submission.full_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted {new Date(submission.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(submission.kyc_status)}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
                        {submission.address_line1 && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {submission.city}, {submission.state}
                          </span>
                        )}
                        {submission.date_of_birth && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            DOB: {submission.date_of_birth}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {submission.documents.length} documents
                        </span>
                      </div>
                    </div>

                    <Button onClick={() => handleViewDocuments(submission)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review KYC Documents</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.full_name} - Submitted{' '}
              {selectedSubmission && new Date(selectedSubmission.created_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          {/* Personal Information */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="font-medium">{selectedSubmission?.full_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Date of Birth</Label>
                <p className="font-medium">{selectedSubmission?.date_of_birth || 'Not provided'}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">Address</Label>
                <p className="font-medium">
                  {selectedSubmission?.address_line1
                    ? `${selectedSubmission.address_line1}, ${selectedSubmission.city}, ${selectedSubmission.state} ${selectedSubmission.zip_code}`
                    : 'Not provided'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {selectedSubmission?.documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        {documentTypeLabels[doc.document_type] || doc.document_type}
                      </h4>
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{doc.file_name}</p>
                    {documentUrls[doc.document_type] ? (
                      <a
                        href={documentUrls[doc.document_type]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Eye className="w-4 h-4" />
                        View Document
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReviewModal(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            {selectedSubmission?.kyc_status !== 'rejected' && (
              <Button
                variant="destructive"
                onClick={() => setShowRejectModal(true)}
                disabled={processing}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            )}
            {selectedSubmission?.kyc_status !== 'approved' && (
              <Button onClick={handleApprove} disabled={processing}>
                <CheckCircle className="w-4 h-4 mr-2" />
                {processing ? 'Processing...' : 'Approve KYC'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this KYC submission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Document is blurry, ID has expired, Address doesn't match..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || processing}
            >
              {processing ? 'Processing...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
