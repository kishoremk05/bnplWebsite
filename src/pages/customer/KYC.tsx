import { useState } from 'react';
import { CustomerLayout } from '@/components/dashboard/customer/CustomerLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  FileText,
  Clock,
  XCircle
} from 'lucide-react';

export default function CustomerKYC() {
  const { customerProfile, refreshProfile, user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [personalInfo, setPersonalInfo] = useState({
    date_of_birth: customerProfile?.date_of_birth || '',
    ssn_last_4: customerProfile?.ssn_last_4 || '',
    address_line1: customerProfile?.address_line1 || '',
    address_line2: customerProfile?.address_line2 || '',
    city: customerProfile?.city || '',
    state: customerProfile?.state || '',
    zip_code: customerProfile?.zip_code || '',
  });

  const kycStatus = customerProfile?.kyc_status || 'pending';

  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/50',
      title: 'Verification Pending',
      description: 'Please upload the required documents to complete your verification.',
    },
    in_review: {
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/50',
      title: 'Under Review',
      description: 'Your documents are being reviewed. This usually takes 1-2 business days.',
    },
    approved: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/50',
      title: 'Verified',
      description: 'Your identity has been verified. You can now use all BNPL features.',
    },
    rejected: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/50',
      title: 'Verification Failed',
      description: 'There was an issue with your documents. Please re-upload clear copies.',
    },
  };

  const config = statusConfig[kycStatus as keyof typeof statusConfig];
  const StatusIcon = config.icon;

  const documentTypes = [
    {
      id: 'id_front',
      label: 'Government ID (Front)',
      description: 'Driver\'s license, passport, or state ID',
      required: true,
    },
    {
      id: 'id_back',
      label: 'Government ID (Back)',
      description: 'Back side of your ID',
      required: true,
    },
    {
      id: 'proof_of_address',
      label: 'Proof of Address',
      description: 'Utility bill, bank statement (within 3 months)',
      required: true,
    },
    {
      id: 'selfie',
      label: 'Selfie with ID',
      description: 'Clear photo of you holding your ID',
      required: true,
    },
  ];

  const handleFileUpload = async (documentType: string, file: File) => {
    if (!user || !customerProfile) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // Import KYC service
      const { uploadKYCDocument, saveDocumentMetadata } = await import('@/services/kyc.service');

      // Upload file to Supabase Storage
      const { filePath, error: uploadError } = await uploadKYCDocument(
        user.id,
        documentType,
        file
      );

      if (uploadError) {
        throw new Error(uploadError);
      }

      // Save document metadata to database
      const { success, error: metadataError } = await saveDocumentMetadata(
        customerProfile.id,
        documentType,
        filePath,
        file.name,
        file.size,
        file.type
      );

      if (!success || metadataError) {
        throw new Error(metadataError || 'Failed to save document metadata');
      }

      // Update uploaded docs state
      setUploadedDocs((prev) => ({ ...prev, [documentType]: true }));

      toast({
        title: 'Document uploaded',
        description: `${file.name} has been uploaded successfully.`,
      });

      await refreshProfile();
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSavePersonalInfo = async () => {
    if (!user) return;

    try {
      const { updatePersonalInfo } = await import('@/services/kyc.service');
      const { success, error } = await updatePersonalInfo(user.id, personalInfo);

      if (!success || error) {
        throw new Error(error || 'Failed to save personal information');
      }

      toast({
        title: 'Information saved',
        description: 'Your personal information has been updated.',
      });

      await refreshProfile();
    } catch (error: any) {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSubmitVerification = async () => {
    if (!user) return;

    // Validate required fields
    const requiredFields = ['date_of_birth', 'ssn_last_4', 'address_line1', 'city', 'state', 'zip_code'];
    const missingFields = requiredFields.filter((field) => !personalInfo[field as keyof typeof personalInfo]);

    if (missingFields.length > 0) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required personal information fields before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      // First, save personal info to database
      const { updatePersonalInfo } = await import('@/services/kyc.service');
      const { success: infoSaved, error: infoError } = await updatePersonalInfo(user.id, personalInfo);

      if (!infoSaved || infoError) {
        throw new Error(infoError || 'Failed to save personal information');
      }

      // Then submit for verification
      const { submitForVerification } = await import('@/services/kyc.service');
      const { success, error } = await submitForVerification(user.id);

      if (!success || error) {
        throw new Error(error || 'Failed to submit for verification');
      }

      toast({
        title: 'Submitted successfully',
        description: 'Your KYC documents have been submitted for review. This usually takes 1-2 business days.',
      });

      await refreshProfile();
    } catch (error: any) {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KYC Verification</h1>
          <p className="text-muted-foreground">
            Complete your identity verification to unlock BNPL features
          </p>
        </div>

        {/* Status Card */}
        <Card className={`${config.borderColor} ${config.bgColor}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${config.color}`}>
              <StatusIcon className="w-5 h-5" />
              {config.title}
            </CardTitle>
            <CardDescription className="text-foreground/80">
              {config.description}
            </CardDescription>
          </CardHeader>
          {customerProfile?.verified_at && (
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verified on: {new Date(customerProfile.verified_at).toLocaleDateString()}
              </p>
            </CardContent>
          )}
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Ensure your information is accurate for verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={personalInfo.date_of_birth}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, date_of_birth: e.target.value })}
                  disabled={kycStatus === 'approved'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ssn">SSN (Last 4 digits)</Label>
                <Input
                  id="ssn"
                  type="text"
                  maxLength={4}
                  placeholder="****"
                  value={personalInfo.ssn_last_4}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, ssn_last_4: e.target.value })}
                  disabled={kycStatus === 'approved'}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={personalInfo.address_line1}
                onChange={(e) => setPersonalInfo({ ...personalInfo, address_line1: e.target.value })}
                disabled={kycStatus === 'approved'}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={personalInfo.city}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                  disabled={kycStatus === 'approved'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={personalInfo.state}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                  disabled={kycStatus === 'approved'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={personalInfo.zip_code}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, zip_code: e.target.value })}
                  disabled={kycStatus === 'approved'}
                />
              </div>
            </div>
            {kycStatus !== 'approved' && (
              <Button onClick={handleSavePersonalInfo}>Save Information</Button>
            )}
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
            <CardDescription>
              Upload clear, legible copies of the following documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {documentTypes.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      {doc.label}
                      {doc.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                      {uploadedDocs[doc.id] && (
                        <Badge variant="default" className="text-xs bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Uploaded
                        </Badge>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                  </div>
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="mt-4">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(doc.id, file);
                    }}
                    disabled={uploading || kycStatus === 'approved'}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Button */}
        {kycStatus === 'pending' && (
          <Card>
            <CardContent className="pt-6">
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleSubmitVerification}
                disabled={uploading || submitting}
              >
                <Upload className="w-4 h-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit for Verification'}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                By submitting, you confirm that all information provided is accurate
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </CustomerLayout>
  );
}
