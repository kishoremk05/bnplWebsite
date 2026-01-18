import { CustomerLayout } from '@/components/dashboard/customer/CustomerLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerOverview() {
  const { customerProfile } = useAuth();

  const stats = [
    {
      title: 'Available Credit',
      value: `$${customerProfile?.available_credit?.toFixed(2) || '0.00'}`,
      description: `of $${customerProfile?.credit_limit?.toFixed(2) || '0.00'} limit`,
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      title: 'Active Plans',
      value: '0',
      description: 'Currently active',
      icon: CreditCard,
      color: 'text-blue-500',
    },
    {
      title: 'Next Payment',
      value: 'None',
      description: 'No upcoming payments',
      icon: Calendar,
      color: 'text-orange-500',
    },
    {
      title: 'KYC Status',
      value: customerProfile?.kyc_status || 'pending',
      description: customerProfile?.kyc_status === 'approved' ? 'Verified' : 'Action required',
      icon: customerProfile?.kyc_status === 'approved' ? CheckCircle : AlertCircle,
      color: customerProfile?.kyc_status === 'approved' ? 'text-green-500' : 'text-yellow-500',
    },
  ];

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your account.
          </p>
        </div>

        {/* KYC Alert */}
        {customerProfile?.kyc_status !== 'approved' && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-500">
                <AlertCircle className="w-5 h-5" />
                Complete Your Verification
              </CardTitle>
              <CardDescription>
                To unlock BNPL features and increase your credit limit, please complete your KYC verification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/customer/kyc">Complete KYC Verification</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest BNPL applications and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Your BNPL applications and payments will appear here</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link to="/customer/plans">
                <CreditCard className="w-6 h-6" />
                <span>View My Plans</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link to="/customer/payments">
                <Calendar className="w-6 h-6" />
                <span>Manage Payments</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link to="/customer/profile">
                <CheckCircle className="w-6 h-6" />
                <span>Update Profile</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
