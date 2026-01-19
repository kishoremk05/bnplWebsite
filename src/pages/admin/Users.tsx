import { AdminLayout } from '@/components/dashboard/admin/AdminLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2, User, Building2, Mail, Phone, Calendar, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Customer {
  id: string;
  user_id: string;
  credit_limit: number | null;
  available_credit: number | null;
  kyc_status: string | null;
  created_at: string;
  users_extended: {
    full_name: string;
    phone: string | null;
  } | null;
}

interface Merchant {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string | null;
  city: string | null;
  state: string | null;
  is_verified: boolean;
  verification_status: string | null;
  created_at: string;
  users_extended: {
    full_name: string;
    phone: string | null;
  } | null;
}

export default function AdminUsers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerSearch, setCustomerSearch] = useState('');
  const [merchantSearch, setMerchantSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customer_profiles')
        .select(`
          id,
          user_id,
          credit_limit,
          available_credit,
          kyc_status,
          created_at,
          users_extended (full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (customersError) {
        console.error('Error fetching customers:', customersError);
      } else {
        setCustomers(customersData || []);
      }

      // Fetch merchants
      const { data: merchantsData, error: merchantsError } = await supabase
        .from('merchant_profiles')
        .select(`
          id,
          user_id,
          business_name,
          business_type,
          city,
          state,
          is_verified,
          verification_status,
          created_at,
          users_extended (full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (merchantsError) {
        console.error('Error fetching merchants:', merchantsError);
      } else {
        setMerchants(merchantsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = customerSearch.toLowerCase();
    const name = (customer.users_extended as any)?.full_name?.toLowerCase() || '';
    const phone = (customer.users_extended as any)?.phone?.toLowerCase() || '';
    return name.includes(searchLower) || phone.includes(searchLower);
  });

  const filteredMerchants = merchants.filter(merchant => {
    const searchLower = merchantSearch.toLowerCase();
    const name = (merchant.users_extended as any)?.full_name?.toLowerCase() || '';
    const businessName = merchant.business_name?.toLowerCase() || '';
    const city = merchant.city?.toLowerCase() || '';
    return name.includes(searchLower) || businessName.includes(searchLower) || city.includes(searchLower);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getKycBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Not Started</Badge>;
    }
  };

  const getVerificationBadge = (status: string | null, isVerified: boolean) => {
    if (isVerified || status === 'approved') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
    }
    if (status === 'rejected') {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
    if (status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
    return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Not Requested</Badge>;
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage customers and merchants</p>
        </div>

        <Tabs defaultValue="customers">
          <TabsList>
            <TabsTrigger value="customers">
              <User className="w-4 h-4 mr-2" />
              Customers ({customers.length})
            </TabsTrigger>
            <TabsTrigger value="merchants">
              <Building2 className="w-4 h-4 mr-2" />
              Merchants ({merchants.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search customers by name or phone..." 
                    className="pl-10" 
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading customers...</span>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    {customerSearch ? 'No customers match your search' : 'No customers yet'}
                  </p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Credit Limit</TableHead>
                          <TableHead>Available Credit</TableHead>
                          <TableHead>KYC Status</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {(customer.users_extended as any)?.full_name || 'Unknown'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    ID: {customer.id.slice(0, 8)}...
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {(customer.users_extended as any)?.phone || 'No phone'}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(customer.credit_limit)}
                            </TableCell>
                            <TableCell className="font-medium text-green-600">
                              {formatCurrency(customer.available_credit)}
                            </TableCell>
                            <TableCell>
                              {getKycBadge(customer.kyc_status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {formatDate(customer.created_at)}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="merchants" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search merchants by name, business, or city..." 
                    className="pl-10"
                    value={merchantSearch}
                    onChange={(e) => setMerchantSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading merchants...</span>
                  </div>
                ) : filteredMerchants.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    {merchantSearch ? 'No merchants match your search' : 'No merchants yet'}
                  </p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Merchant</TableHead>
                          <TableHead>Business</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Verification</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMerchants.map((merchant) => (
                          <TableRow key={merchant.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Building2 className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {(merchant.users_extended as any)?.full_name || 'Unknown'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    ID: {merchant.id.slice(0, 8)}...
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{merchant.business_name || 'N/A'}</p>
                                {merchant.business_type && (
                                  <p className="text-xs text-muted-foreground">{merchant.business_type}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {merchant.city && merchant.state 
                                  ? `${merchant.city}, ${merchant.state}` 
                                  : merchant.city || merchant.state || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {(merchant.users_extended as any)?.phone || 'No phone'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getVerificationBadge(merchant.verification_status, merchant.is_verified)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {formatDate(merchant.created_at)}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
