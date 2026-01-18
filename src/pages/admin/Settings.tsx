import { AdminLayout } from '@/components/dashboard/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground">Configure platform-wide settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>BNPL Plan Configuration</CardTitle>
            <CardDescription>Manage available BNPL plans</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Configure default BNPL plans, interest rates, and installment options</p>
            <Button>Manage Plans</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Settings</CardTitle>
            <CardDescription>Configure approval thresholds and risk scoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Minimum Credit Score</Label>
              <Input type="number" defaultValue="600" />
            </div>
            <div className="space-y-2">
              <Label>Maximum Credit Limit</Label>
              <Input type="number" defaultValue="5000" />
            </div>
            <Button>Save Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Configure automated email templates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Manage email templates for payment reminders, approvals, and notifications</p>
            <Button>Configure Templates</Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
