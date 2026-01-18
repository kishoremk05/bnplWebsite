import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { cancelCheckoutSession, getCheckoutSession } from '@/services/checkout.service';

export default function CheckoutCancel() {
  const { sessionToken } = useParams<{ sessionToken: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Cancel the session when this page loads
    if (sessionToken) {
      handleCancelSession();
    }
  }, [sessionToken]);

  async function handleCancelSession() {
    if (!sessionToken) return;

    try {
      const { session } = await getCheckoutSession(sessionToken);
      if (session) {
        await cancelCheckoutSession(session.id);
        // Redirect to merchant cancel URL after a brief delay
        if (session.cancel_url) {
          setTimeout(() => {
            window.location.href = session.cancel_url!;
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Checkout Cancelled</h1>
        <p className="text-muted-foreground">
          Your BNPL application has been cancelled
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What Happened?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You chose to cancel your Buy Now, Pay Later application. No charges have been made to
            your account.
          </p>
          <p className="text-muted-foreground">
            If you change your mind, you can return to the merchant and start a new checkout.
          </p>
        </CardContent>
      </Card>

      <div className="text-center mt-6">
        <Button onClick={() => navigate('/')} variant="outline">
          Return Home
        </Button>
      </div>
    </div>
  );
}
