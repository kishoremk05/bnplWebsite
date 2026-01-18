import { useState } from 'react';
import { MerchantLayout } from '@/components/dashboard/merchant/MerchantLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function MerchantSettings() {
  const { merchantProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      toast({ title: 'Settings saved', description: 'Your settings have been updated successfully.' });
      await refreshProfile();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your business profile and integrations</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Update your business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input defaultValue={merchantProfile?.business_name} />
              </div>
              <div className="space-y-2">
                <Label>Business Type</Label>
                <Input defaultValue={merchantProfile?.business_type || ''} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tax ID</Label>
                <Input defaultValue={merchantProfile?.tax_id || ''} />
              </div>
              <div className="space-y-2">
                <Label>License Number</Label>
                <Input defaultValue={merchantProfile?.license_number || ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input type="url" defaultValue={merchantProfile?.website || ''} />
            </div>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>POS Integration</CardTitle>
            <CardDescription>Connect your point-of-sale system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>POS System</Label>
              <Select defaultValue={merchantProfile?.pos_system || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select POS system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flowhub">Flowhub</SelectItem>
                  <SelectItem value="cova">Cova POS</SelectItem>
                  <SelectItem value="indicaonline">IndicaOnline</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" placeholder="Enter your POS API key" />
            </div>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save Integration
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Locations</CardTitle>
                <CardDescription>Manage your business locations</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No locations added</p>
              <p className="text-sm">Add your business locations to get started</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MerchantLayout>
  );
}
