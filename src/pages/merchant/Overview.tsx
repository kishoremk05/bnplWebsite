import { useState, useEffect } from 'react';
import { MerchantLayout } from '@/components/dashboard/merchant/MerchantLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Users, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MerchantStats {
  totalRevenue: number;
  activePlans: number;
  totalCustomers: number;
  approvalRate: number;
  approvedToday: number;
  pendingReview: number;
  rejectedToday: number;
  revenueToday: number;
}

interface RecentApplication {
  id: string;
  purchase_amount: number;
  status: string;
  created_at: string;
  customer_profiles?: {
    users_extended?: {
      full_name: string;
    };
  };
}

export default function MerchantOverview() {
  const { merchantProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    if (merchantProfile?.id) {
      fetchDashboardData();
    }
  }, [merchantProfile?.id]);

  async function fetchDashboardData() {
    if (!merchantProfile?.id) return;
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch all applications for this merchant
      const { data: applications, error } = await supabase
        .from('bnpl_applications')
        .select(`
          *,
          customer_profiles (
            user_id,
            users_extended (full_name)
          )
        `)
        .eq('merchant_id', merchantProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const apps = applications || [];

      // Calculate stats
      const activeApps = apps.filter(a => a.status === 'active' || a.status === 'approved');
      const completedApps = apps.filter(a => a.status === 'completed');
      const pendingApps = apps.filter(a => a.status === 'pending');
      const rejectedApps = apps.filter(a => a.status === 'rejected');
      
      const totalRevenue = [...activeApps, ...completedApps].reduce(
        (sum, a) => sum + a.purchase_amount, 0
      );

      const approvedCount = apps.filter(a => 
        a.status === 'active' || a.status === 'approved' || a.status === 'completed'
      ).length;
      
      const approvalRate = apps.length > 0 
        ? Math.round((approvedCount / apps.length) * 100) 
        : 0;

      // Today's stats
      const todayApps = apps.filter(a => a.created_at?.startsWith(today));
      const approvedToday = todayApps.filter(a => 
        a.status === 'active' || a.status === 'approved'
      ).length;
      const rejectedToday = todayApps.filter(a => a.status === 'rejected').length;

      // Unique customers
      const uniqueCustomers = new Set(apps.map(a => a.customer_id)).size;

      // Revenue today
      const revenueToday = todayApps
        .filter(a => a.status === 'active' || a.status === 'approved')
        .reduce((sum, a) => sum + a.purchase_amount, 0);

      setStats({
        totalRevenue,
        activePlans: activeApps.length,
        totalCustomers: uniqueCustomers,
        approvalRate,
        approvedToday,
        pendingReview: pendingApps.length,
        rejectedToday,
        revenueToday,
      });

      // Recent applications (last 5)
      setRecentApplications(apps.slice(0, 5) as any);

      // Generate revenue chart data (last 7 days)
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayRevenue = apps
          .filter(a => 
            a.created_at?.startsWith(dateStr) && 
            (a.status === 'active' || a.status === 'approved' || a.status === 'completed')
          )
          .reduce((sum, a) => sum + a.purchase_amount, 0);
        
        chartData.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: dayRevenue,
        });
      }
      setRevenueData(chartData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-500">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MerchantLayout>
    );
  }

  const statsData = [
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue.toFixed(2) || '0.00'}`,
      change: `+$${stats?.revenueToday.toFixed(2) || '0.00'} today`,
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      title: 'Active BNPL Plans',
      value: String(stats?.activePlans || 0),
      change: `${stats?.approvedToday || 0} approved today`,
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    {
      title: 'Total Customers',
      value: String(stats?.totalCustomers || 0),
      change: 'Unique customers',
      icon: Users,
      color: 'text-purple-500',
    },
    {
      title: 'Approval Rate',
      value: `${stats?.approvalRate || 0}%`,
      change: `${stats?.pendingReview || 0} pending review`,
      icon: CheckCircle,
      color: 'text-orange-500',
    },
  ];

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your BNPL performance and metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Applications & Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent BNPL Applications</CardTitle>
              <CardDescription>
                Latest customer applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent applications</p>
                  <p className="text-sm">Customer applications will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {(app.customer_profiles as any)?.users_extended?.full_name || 'Customer'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${app.purchase_amount.toFixed(2)} • {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>
                Today's performance at a glance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-sm">Approved Today</span>
                </div>
                <span className="font-bold">{stats?.approvedToday || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10">
                    <Clock className="w-4 h-4 text-yellow-500" />
                  </div>
                  <span className="text-sm">Pending Review</span>
                </div>
                <span className="font-bold">{stats?.pendingReview || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-sm">Rejected Today</span>
                </div>
                <span className="font-bold">{stats?.rejectedToday || 0}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm font-medium">Revenue Today</span>
                <span className="text-lg font-bold text-green-500">
                  ${stats?.revenueToday.toFixed(2) || '0.00'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Daily revenue from BNPL transactions (last 7 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {revenueData.some(d => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                    contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No revenue data yet</p>
                  <p className="text-sm">Start accepting BNPL to see your analytics</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MerchantLayout>
  );
}
