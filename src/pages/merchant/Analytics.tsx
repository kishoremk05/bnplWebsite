import { MerchantLayout } from '@/components/dashboard/merchant/MerchantLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Users, Percent } from 'lucide-react';

export default function MerchantAnalytics() {
  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your BNPL performance</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Total Revenue', value: '$0', icon: DollarSign },
            { title: 'Avg Order Value', value: '$0', icon: TrendingUp },
            { title: 'Total Customers', value: '0', icon: Users },
            { title: 'Repayment Rate', value: '0%', icon: Percent },
          ].map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue from BNPL transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              <p>Chart will be implemented with Recharts</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MerchantLayout>
  );
}
