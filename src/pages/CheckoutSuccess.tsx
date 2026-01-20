import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function CheckoutSuccess() {
  const { sessionToken } = useParams<{ sessionToken: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  const { applicationId, decision, returnUrl } = location.state || {};

  useEffect(() => {
    if (!returnUrl) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = returnUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [returnUrl]);

  function handleReturnNow() {
    if (returnUrl) {
      window.location.href = returnUrl;
    } else {
      navigate('/customer/dashboard');
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {decision === 'auto_approve' ? 'Application Approved!' : 'Application Submitted!'}
        </h1>
        <p className="text-muted-foreground">
          {decision === 'auto_approve'
            ? 'Your payment plan has been approved instantly'
            : 'Your application is being reviewed'}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {decision === 'auto_approve' ? (
            <>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Complete Your Order</h3>
                  <p className="text-sm text-muted-foreground">
                    Return to the merchant to finalize your purchase
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">First Payment Due</h3>
                  <p className="text-sm text-muted-foreground">
                    Your first installment will be charged in 30 days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Track Your Payments</h3>
                  <p className="text-sm text-muted-foreground">
                    View your payment schedule in your Veridian Credit Systems dashboard
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Under Review</h3>
                  <p className="text-sm text-muted-foreground">
                    We're reviewing your application and will notify you shortly
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Check Your Email</h3>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an email with the decision within 24 hours
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {returnUrl && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Returning to merchant in</p>
                <p className="text-2xl font-bold">{countdown}s</p>
              </div>
              <Button onClick={handleReturnNow} className="gap-2">
                Return Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!returnUrl && (
        <div className="text-center">
          <Button onClick={() => navigate('/customer/dashboard')} className="gap-2">
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {applicationId && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          Application ID: {applicationId}
        </p>
      )}
    </div>
  );
}
