/**
 * Payment Methods Page
 * Customer page to manage saved payment cards
 */

import { useState, useEffect } from 'react';
import { CustomerLayout } from '@/components/dashboard/customer/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, Plus, Trash2, CheckCircle, Loader2, Star, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CardForm from '@/components/payment/CardForm';
import {
  getPaymentMethods,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  savePaymentMethod,
  formatCardDisplay,
  isCardExpiringSoon,
  type PaymentMethod,
} from '@/services/payment-methods.service';
import type { TokenizeResult } from '@/services/ellacash.service';

export default function CustomerPaymentMethods() {
  const { customerProfile } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (customerProfile?.id) {
      loadPaymentMethods();
    }
  }, [customerProfile?.id]);

  const loadPaymentMethods = async () => {
    if (!customerProfile?.id) return;

    setLoading(true);
    const { success, paymentMethods: methods, error } = await getPaymentMethods(customerProfile.id);

    if (success && methods) {
      setPaymentMethods(methods);
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to load payment methods',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleTokenCreated = async (result: TokenizeResult) => {
    if (!customerProfile?.id || !result.success || !result.token) return;

    setProcessing(true);

    const { success, error } = await savePaymentMethod({
      customerId: customerProfile.id,
      token: result.token,
      cardLast4: result.cardLast4 || '',
      cardBrand: result.cardBrand || 'Unknown',
      expiryMonth: 12, // TODO: Get from form
      expiryYear: 2025, // TODO: Get from form
      setAsDefault: paymentMethods.length === 0, // First card is default
    });

    setProcessing(false);

    if (success) {
      toast({
        title: 'Card Added',
        description: 'Your payment method has been saved securely.',
      });
      setShowAddCard(false);
      loadPaymentMethods();
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to save payment method',
        variant: 'destructive',
      });
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    if (!customerProfile?.id) return;

    const { success, error } = await setDefaultPaymentMethod(customerProfile.id, paymentMethodId);

    if (success) {
      toast({
        title: 'Default Updated',
        description: 'Your default payment method has been updated.',
      });
      loadPaymentMethods();
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to update default payment method',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;

    const { success, error } = await deletePaymentMethod(paymentMethodId);

    if (success) {
      toast({
        title: 'Card Removed',
        description: 'Your payment method has been removed.',
      });
      loadPaymentMethods();
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to remove payment method',
        variant: 'destructive',
      });
    }
  };

  const getCardIcon = (brand: string | null) => {
    switch (brand) {
      case 'Visa':
        return '💳';
      case 'Mastercard':
        return '💳';
      case 'American Express':
        return '💳';
      default:
        return '💳';
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
            <p className="text-muted-foreground">Manage your saved payment cards</p>
          </div>
          <Button onClick={() => setShowAddCard(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>

        {/* Payment Methods List */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading payment methods...</p>
            </CardContent>
          </Card>
        ) : paymentMethods.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">No Payment Methods</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add a payment method to make purchases
              </p>
              <Button onClick={() => setShowAddCard(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Card
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {paymentMethods.map((method) => {
              const expiringSoon =
                method.card_exp_month && method.card_exp_year
                  ? isCardExpiringSoon(method.card_exp_month, method.card_exp_year)
                  : false;

              return (
                <Card key={method.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{getCardIcon(method.card_brand)}</div>
                        <div>
                          <p className="font-semibold">
                            {formatCardDisplay(method.card_brand, method.card_last_4)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expires {method.card_exp_month}/{method.card_exp_year}
                          </p>
                        </div>
                      </div>
                      {method.is_default && (
                        <Badge variant="default" className="gap-1">
                          <Star className="w-3 h-3" />
                          Default
                        </Badge>
                      )}
                    </div>

                    {expiringSoon && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          This card is expiring soon. Please update your payment method.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2">
                      {!method.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                          className="flex-1"
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(method.id)}
                        className={method.is_default ? 'flex-1' : ''}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Security Notice */}
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Your payment information is secure</p>
              <p className="text-xs text-muted-foreground">
                We use industry-standard encryption and never store your full card number. All
                payments are processed securely through Ellacash.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Card Dialog */}
      <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new card to use for BNPL payments
            </DialogDescription>
          </DialogHeader>
          <CardForm
            onTokenCreated={handleTokenCreated}
            onCancel={() => setShowAddCard(false)}
            loading={processing}
          />
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
