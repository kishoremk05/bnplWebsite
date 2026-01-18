/**
 * CardForm Component
 * Secure card input form with real-time validation
 * Card data is tokenized directly with Stripe (never sent to our server)
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  createCardToken,
  validateCardDetails,
  formatCardNumber,
  formatExpiryDate,
  detectCardBrand,
  type CardDetails,
  type TokenizeResult,
} from '@/services/stripe.service';

interface CardFormProps {
  onTokenCreated: (result: TokenizeResult) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export default function CardForm({ onTokenCreated, onCancel, loading = false }: CardFormProps) {
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [tokenizing, setTokenizing] = useState(false);
  const [cardBrand, setCardBrand] = useState<string>('');

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    if (formatted.replace(/\s/g, '').length <= 19) {
      setCardDetails({ ...cardDetails, cardNumber: formatted });
      setCardBrand(detectCardBrand(formatted));
    }
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    if (formatted.length <= 5) {
      const [month, year] = formatted.split('/');
      setCardDetails({
        ...cardDetails,
        expiryMonth: month || '',
        expiryYear: year ? `20${year}` : '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validate card details
    const validation = validateCardDetails(cardDetails);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setTokenizing(true);

    try {
      // Tokenize card with Stripe
      const result = await createCardToken(cardDetails);

      if (result.success) {
        onTokenCreated(result);
      } else {
        setErrors([result.error || 'Failed to process card']);
      }
    } catch (error: any) {
      setErrors([error.message || 'An unexpected error occurred']);
    } finally {
      setTokenizing(false);
    }
  };

  const getCardIcon = () => {
    switch (cardBrand) {
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

  const isProcessing = tokenizing || loading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Add Payment Method
        </CardTitle>
        <CardDescription>
          Your card details are encrypted and securely processed by Stripe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="John Doe"
              value={cardDetails.cardholderName}
              onChange={(e) =>
                setCardDetails({ ...cardDetails, cardholderName: e.target.value })
              }
              disabled={isProcessing}
              required
            />
          </div>

          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="4242 4242 4242 4242"
                value={cardDetails.cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                disabled={isProcessing}
                required
                className="pr-12"
              />
              {cardBrand && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl">
                  {getCardIcon()}
                </div>
              )}
            </div>
            {cardBrand && cardBrand !== 'Unknown' && (
              <p className="text-xs text-muted-foreground">{cardBrand} detected</p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={
                  cardDetails.expiryMonth && cardDetails.expiryYear
                    ? `${cardDetails.expiryMonth}/${cardDetails.expiryYear.slice(-2)}`
                    : ''
                }
                onChange={(e) => handleExpiryChange(e.target.value)}
                disabled={isProcessing}
                required
                maxLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                type="password"
                value={cardDetails.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) {
                    setCardDetails({ ...cardDetails, cvv: value });
                  }
                }}
                disabled={isProcessing}
                required
                maxLength={4}
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Your card information is encrypted and sent directly to our payment processor.
              We never store your full card number.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isProcessing} className="flex-1">
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Add Card'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
