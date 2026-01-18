import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Plus, Trash2, Check, Loader2 } from 'lucide-react';

interface PaymentMethod {
  id: string;
  processor: string;
  token: string;
  last_four: string;
  card_type: string;
  expiry_month: number;
  expiry_year: number;
  cardholder_name: string;
  is_default: boolean;
}

export function PaymentMethodManager() {
  const { customerProfile } = useAuth();
  const { toast } = useToast();
  
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state for new card
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  useEffect(() => {
    fetchPaymentMethods();
  }, [customerProfile?.id]);

  async function fetchPaymentMethods() {
    if (!customerProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('customer_payment_methods')
        .select('*')
        .eq('customer_id', customerProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCard() {
    if (!customerProfile?.id) return;

    setSubmitting(true);
    try {
      // In production, this would call the payment processor to tokenize the card
      // For now, we'll create a mock token
      const mockToken = `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const lastFour = cardNumber.slice(-4);
      const cardType = getCardType(cardNumber);

      const { error } = await supabase
        .from('customer_payment_methods')
        .insert({
          customer_id: customerProfile.id,
          processor: 'ellacash', // Default processor
          token: mockToken,
          last_four: lastFour,
          card_type: cardType,
          expiry_month: parseInt(expiryMonth),
          expiry_year: parseInt(expiryYear),
          cardholder_name: cardholderName,
          is_default: methods.length === 0, // First card is default
        });

      if (error) throw error;

      toast({ title: 'Card added', description: 'Payment method added successfully' });
      setAddDialogOpen(false);
      resetForm();
      fetchPaymentMethods();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add card',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function setAsDefault(methodId: string) {
    if (!customerProfile?.id) return;

    try {
      // Remove default from all
      await supabase
        .from('customer_payment_methods')
        .update({ is_default: false })
        .eq('customer_id', customerProfile.id);

      // Set new default
      await supabase
        .from('customer_payment_methods')
        .update({ is_default: true })
        .eq('id', methodId);

      toast({ title: 'Default updated', description: 'Default payment method changed' });
      fetchPaymentMethods();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  async function deleteMethod(methodId: string) {
    try {
      const { error } = await supabase
        .from('customer_payment_methods')
        .delete()
        .eq('id', methodId);

      if (error) throw error;

      toast({ title: 'Card removed', description: 'Payment method deleted' });
      fetchPaymentMethods();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  function resetForm() {
    setCardNumber('');
    setExpiryMonth('');
    setExpiryYear('');
    setCvv('');
    setCardholderName('');
  }

  function getCardType(number: string): string {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    return 'other';
  }

  function formatCardNumber(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  }

  const getCardIcon = (type: string) => {
    // In production, you'd use actual card brand SVGs
    return <CreditCard className="h-6 w-6" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage your saved payment methods</CardDescription>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>
                  Add a new credit or debit card for payments
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Cardholder Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={cardholderName}
                    onChange={e => setCardholderName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Month</Label>
                    <Input
                      placeholder="MM"
                      value={expiryMonth}
                      onChange={e => setExpiryMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      placeholder="YYYY"
                      value={expiryYear}
                      onChange={e => setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input
                      placeholder="123"
                      type="password"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleAddCard}
                  disabled={
                    submitting ||
                    !cardNumber ||
                    !expiryMonth ||
                    !expiryYear ||
                    !cvv ||
                    !cardholderName
                  }
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Card'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {methods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No payment methods saved</p>
            <p className="text-sm">Add a card to make payments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {methods.map(method => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {getCardIcon(method.card_type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">
                        {method.card_type}
                      </span>
                      <span className="text-muted-foreground">
                        •••• {method.last_four}
                      </span>
                      {method.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expires {method.expiry_month}/{method.expiry_year}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAsDefault(method.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteMethod(method.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
