import { useState, useEffect } from 'react';
import { MerchantLayout } from '@/components/dashboard/merchant/MerchantLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, Calendar, DollarSign, Loader2, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  merchant_id: string;
  customer_id: string;
  application_id: string;
  amount: number;
  transaction_type: string;
  status: string;
  payment_method?: string;
  created_at: string;
}

export default function MerchantPayouts() {
  const { merchantProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (merchantProfile?.id) {
      fetchTransactions();
    }
  }, [merchantProfile?.id]);

  async function fetchTransactions() {
    if (!merchantProfile?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('merchant_id', merchantProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transaction information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const completedTransactions = transactions.filter(t => t.status === 'completed' || t.status === 'success');
  const pendingTransactions = transactions.filter(t => t.status === 'pending' || t.status === 'processing');
  const totalCompleted = completedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPending = pendingTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
            <p className="text-muted-foreground">Track your settlement payments and payout schedule</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Wallet className="w-4 h-4 mr-2" />
            {transactions.length} Transactions
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPending.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {pendingTransactions.length} pending transaction{pendingTransactions.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Payouts</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCompleted.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {completedTransactions.length} completed transaction{completedTransactions.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Settlements</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalPending + totalCompleted).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                All-time settlement amount
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Settlements Table */}
        <Card>
          <CardHeader>
            <CardTitle>Settlement History</CardTitle>
            <CardDescription>
              Your payout schedule and settlement history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No transactions yet</p>
                <p className="text-sm">
                  Transactions will appear here once customers make payments
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.transaction_type || 'payment'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-semibold text-green-600">
                          <DollarSign className="w-4 h-4" />
                          {Number(transaction.amount).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={transaction.status === 'completed' || transaction.status === 'success' ? 'default' : transaction.status === 'pending' ? 'secondary' : 'destructive'}
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MerchantLayout>
  );
}
