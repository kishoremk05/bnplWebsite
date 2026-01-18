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
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Building2,
  MapPin,
  Globe,
  FileText,
  Search,
  RefreshCw,
} from 'lucide-react';
import {
  getMerchantSubmissions,
  approveMerchant,
  rejectMerchant,
  MerchantSubmission,
} from '@/services/merchant-admin.service';

export default function AdminMerchantApproval() {
  const { toast } = useToast();
  const [merchants, setMerchants] = useState<MerchantSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantSubmission | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadMerchants = async () => {
    setLoading(true);
    const data = await getMerchantSubmissions(filter);
    setMerchants(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMerchants();
  }, [filter]);

  const handleApprove = async () => {
    if (!selectedMerchant) return;

    setProcessing(true);
    const { success, error } = await approveMerchant(selectedMerchant.id);
    setProcessing(false);

    if (success) {
      toast({
        title: 'Merchant Approved',
        description: `${selectedMerchant.business_name} has been verified.`,
      });
      setShowReviewModal(false);
      loadMerchants();
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to approve merchant',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedMerchant || !rejectionReason.trim()) return;

    setProcessing(true);
    const { success, error } = await rejectMerchant(selectedMerchant.id, rejectionReason.trim());
    setProcessing(false);

    if (success) {
      toast({
        title: 'Merchant Rejected',
        description: `${selectedMerchant.business_name} verification has been rejected.`,
      });
      setShowRejectModal(false);
      setShowReviewModal(false);
      setRejectionReason('');
      loadMerchants();
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to reject merchant',
        variant: 'destructive',
      });
    }
  };

  const filteredMerchants = merchants.filter(
    (m) =>
      m.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (merchant: MerchantSubmission) => {
    if (merchant.is_verified) {
      return (
        <Badge variant="default" className="gap-1 bg-green-500">
          <CheckCircle className="w-3 h-3" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="w-3 h-3" />
        Pending
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Merchant Approvals</h1>
            <p className="text-muted-foreground">
              Review and approve merchant verification requests
            </p>
          </div>
          <Button variant="outline" onClick={loadMerchants} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({merchants.filter((m) => !m.is_verified).length})
            </TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by business or owner name..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Merchants List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading merchants...
              </CardContent>
            </Card>
          ) : filteredMerchants.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No merchants found
              </CardContent>
            </Card>
          ) : (
            filteredMerchants.map((merchant) => (
              <Card key={merchant.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{merchant.business_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Owner: {merchant.full_name}
                          </p>
                        </div>
                        {getStatusBadge(merchant)}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
                        {merchant.business_type && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {merchant.business_type}
                          </span>
                        )}
                        {merchant.city && merchant.state && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {merchant.city}, {merchant.state}
                          </span>
                        )}
                        {merchant.website && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            {merchant.website}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedMerchant(merchant);
                        setShowReviewModal(true);
                      }}
                    >
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Merchant</DialogTitle>
            <DialogDescription>
              {selectedMerchant?.business_name} - Registered{' '}
              {selectedMerchant && new Date(selectedMerchant.created_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          {/* Business Information */}
          <div className="mt-3 space-y-3">
            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Business Name</Label>
                <p className="font-medium">{selectedMerchant?.business_name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Business Type</Label>
                <p className="font-medium">{selectedMerchant?.business_type || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Owner</Label>
                <p className="font-medium">{selectedMerchant?.full_name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Website</Label>
                <p className="font-medium">{selectedMerchant?.website || 'Not provided'}</p>
              </div>
            </div>

            {/* License & Tax Info */}
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Tax ID</Label>
                <p className="font-medium">{selectedMerchant?.tax_id || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">License Number</Label>
                <p className="font-medium">{selectedMerchant?.license_number || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">License State</Label>
                <p className="font-medium">{selectedMerchant?.license_state || 'Not provided'}</p>
              </div>
            </div>

            {/* Address */}
            <div className="text-sm">
              <Label className="text-xs text-muted-foreground">Business Address</Label>
              <p className="font-medium">
                {selectedMerchant?.address_line1
                  ? `${selectedMerchant.address_line1}, ${selectedMerchant.city}, ${selectedMerchant.state} ${selectedMerchant.zip_code}`
                  : 'Not provided'}
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReviewModal(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            {selectedMerchant?.is_verified ? (
              <Button 
                variant="destructive" 
                onClick={() => setShowRejectModal(true)} 
                disabled={processing}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Revoke Verification
              </Button>
            ) : (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowRejectModal(true)} 
                  disabled={processing}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={handleApprove} disabled={processing}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {processing ? 'Processing...' : 'Approve Merchant'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Merchant Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedMerchant?.business_name}'s verification.
              This will be shown to the merchant.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              placeholder="e.g., Missing required business license documentation..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              <XCircle className="w-4 h-4 mr-2" />
              {processing ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
