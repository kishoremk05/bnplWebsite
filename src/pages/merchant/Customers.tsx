import { useState, useEffect } from 'react';
import { MerchantLayout } from '@/components/dashboard/merchant/MerchantLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, Loader2, Phone, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  user_id: string;
  kyc_status: string;
  credit_limit: number;
  available_credit: number;
  created_at: string;
  users_extended?: {
    full_name: string;
    phone?: string;
  };
  applications_count?: number;
  total_amount?: number;
}

export default function MerchantCustomers() {
  const { merchantProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (merchantProfile?.id) {
      fetchCustomers();
    }
  }, [merchantProfile?.id]);

  async function fetchCustomers() {
    if (!merchantProfile?.id) return;

    setLoading(true);
    try {
      // Step 1: Get all applications for this merchant
      const { data: applications, error: appError } = await supabase
        .from('bnpl_applications')
        .select('customer_id, purchase_amount, status')
        .eq('merchant_id', merchantProfile.id);

      if (appError) throw appError;

      if (!applications || applications.length === 0) {
        setCustomers([]);
        setLoading(false);
        return;
      }

      // Get unique customer IDs
      const customerIds = [...new Set(applications.map(app => app.customer_id))];

      // Step 2: Fetch customer profiles for these customer IDs
      const { data: profiles, error: profileError } = await supabase
        .from('customer_profiles')
        .select(`
          id,
          user_id,
          kyc_status,
          credit_limit,
          available_credit,
          created_at
        `)
        .in('id', customerIds);

      if (profileError) throw profileError;

      // Step 3: Fetch user details for these profiles
      const userIds = profiles?.map(p => p.user_id).filter(Boolean) || [];
      const { data: users, error: usersError } = await supabase
        .from('users_extended')
        .select('id, full_name, phone')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Create a map of user_id to user details
      const userMap = new Map(users?.map(u => [u.id, u]) || []);

      // Aggregate customer data
      const customerMap = new Map<string, Customer & { applications_count: number; total_amount: number }>();
      
      applications?.forEach((app: any) => {
        const profile = profiles?.find(p => p.id === app.customer_id);
        if (profile) {
          const existing = customerMap.get(profile.id);
          const userDetails = userMap.get(profile.user_id);
          
          if (existing) {
            existing.applications_count += 1;
            if (app.status === 'approved' || app.status === 'active') {
              existing.total_amount += app.purchase_amount;
            }
          } else {
            customerMap.set(profile.id, {
              id: profile.id,
              user_id: profile.user_id,
              kyc_status: profile.kyc_status,
              credit_limit: profile.credit_limit,
              available_credit: profile.available_credit,
              created_at: profile.created_at,
              users_extended: userDetails ? {
                full_name: userDetails.full_name,
                phone: userDetails.phone,
              } : undefined,
              applications_count: 1,
              total_amount: (app.status === 'approved' || app.status === 'active') ? app.purchase_amount : 0,
            });
          }
        }
      });

      setCustomers(Array.from(customerMap.values()));
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const name = customer.users_extended?.full_name?.toLowerCase() || '';
    const phone = customer.users_extended?.phone?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || phone.includes(query);
  });

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
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">View and manage your BNPL customers</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            {customers.length} Customers
          </Badge>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>
              All customers who have used BNPL at your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No customers found</p>
                <p className="text-sm">
                  {customers.length === 0
                    ? "You don't have any BNPL customers yet"
                    : 'No customers match your search criteria'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                            {customer.users_extended?.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium">
                              {customer.users_extended?.full_name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {customer.users_extended?.phone ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {customer.users_extended.phone}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No phone</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={customer.kyc_status === 'verified' ? 'default' : customer.kyc_status === 'pending' ? 'secondary' : 'destructive'}
                        >
                          {customer.kyc_status || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{customer.applications_count}</span>
                        <span className="text-muted-foreground"> applications</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-semibold text-green-600">
                          <DollarSign className="w-4 h-4" />
                          {customer.total_amount?.toFixed(2) || '0.00'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(customer.created_at).toLocaleDateString()}
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
