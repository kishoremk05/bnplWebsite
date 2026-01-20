import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Key,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Code,
} from 'lucide-react';
import {
  getMerchantApiKeys,
  createMerchantApiKey,
  deactivateApiKey,
} from '@/services/checkout.service';
import { Tables } from '@/integrations/supabase/types';

type MerchantApiKey = Tables<'merchant_api_keys'>;

export default function MerchantIntegration() {
  const { merchantProfile } = useAuth();
  const { toast } = useToast();

  const [apiKeys, setApiKeys] = useState<MerchantApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnvironment, setNewKeyEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [newKeyDomains, setNewKeyDomains] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<MerchantApiKey | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (merchantProfile?.id) {
      loadApiKeys();
    }
  }, [merchantProfile]);

  async function loadApiKeys() {
    if (!merchantProfile?.id) return;
    
    setLoading(true);
    try {
      const keys = await getMerchantApiKeys(merchantProfile.id);
      setApiKeys(keys);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateKey() {
    if (!merchantProfile?.id || !newKeyName.trim()) return;

    setCreating(true);
    try {
      const domains = newKeyDomains
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);

      const result = await createMerchantApiKey(
        merchantProfile.id,
        newKeyName,
        domains.length > 0 ? domains : undefined,
        newKeyEnvironment
      );

      if (result.success && result.apiKey) {
        setNewlyCreatedKey(result.apiKey);
        setApiKeys([result.apiKey, ...apiKeys]);
        setNewKeyName('');
        setNewKeyDomains('');
        toast({
          title: 'API Key Created',
          description: 'Save your API secret now - it will not be shown again!',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create API key',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create API key',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleDeactivateKey(keyId: string) {
    if (!confirm('Are you sure you want to deactivate this API key?')) return;

    try {
      const result = await deactivateApiKey(keyId);
      if (result.success) {
        setApiKeys(apiKeys.map(k => k.id === keyId ? { ...k, is_active: false } : k));
        toast({
          title: 'API Key Deactivated',
          description: 'The API key has been deactivated',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deactivate API key',
        variant: 'destructive',
      });
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  }

  function toggleSecretVisibility(keyId: string) {
    setVisibleSecrets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Merchant Integration</h1>
        <p className="text-muted-foreground">
          Integrate Veridian Credit Systems into your checkout flow
        </p>
      </div>

      {/* Newly Created Key Alert */}
      {newlyCreatedKey && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">API Key Created Successfully!</AlertTitle>
          <AlertDescription className="text-green-800">
            <p className="mb-2">
              Save your API secret now - this is the only time it will be displayed:
            </p>
            <div className="bg-white border border-green-300 rounded p-3 font-mono text-sm flex items-center justify-between">
              <span className="text-green-900">{newlyCreatedKey.api_secret}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(newlyCreatedKey.api_secret, 'API Secret')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setNewlyCreatedKey(null)}
            >
              I've saved it
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="keys">
        <TabsList>
          <TabsTrigger value="keys">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="docs">
            <Code className="h-4 w-4 mr-2" />
            Integration Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
          {/* Create New Key */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New API Key
              </CardTitle>
              <CardDescription>
                Generate a new API key for your integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g., Production Website"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <Select
                    value={newKeyEnvironment}
                    onValueChange={(value: 'sandbox' | 'production') => setNewKeyEnvironment(value)}
                  >
                    <SelectTrigger id="environment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="domains">Allowed Domains (optional)</Label>
                <Input
                  id="domains"
                  placeholder="example.com, shop.example.com"
                  value={newKeyDomains}
                  onChange={(e) => setNewKeyDomains(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Comma-separated list of domains allowed to use this key (CORS)
                </p>
              </div>
              <Button onClick={handleCreateKey} disabled={creating || !newKeyName.trim()}>
                {creating ? 'Creating...' : 'Create API Key'}
              </Button>
            </CardContent>
          </Card>

          {/* API Keys List */}
          <Card>
            <CardHeader>
              <CardTitle>Your API Keys</CardTitle>
              <CardDescription>
                Manage your Veridian Credit Systems API keys
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : apiKeys.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No API keys yet. Create one to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{key.key_name}</h3>
                            <Badge variant={key.is_active ? 'default' : 'secondary'}>
                              {key.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant={key.environment === 'production' ? 'destructive' : 'outline'}>
                              {key.environment}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(key.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {key.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivateKey(key.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">API Key</Label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                              {key.api_key}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(key.api_key, 'API Key')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">API Secret</Label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                              {visibleSecrets.has(key.id)
                                ? key.api_secret
                                : '••••••••••••••••••••••••••••••••'}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleSecretVisibility(key.id)}
                            >
                              {visibleSecrets.has(key.id) ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {key.allowed_domains && key.allowed_domains.length > 0 && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Allowed Domains</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {key.allowed_domains.map((domain, i) => (
                                <Badge key={i} variant="outline">
                                  {domain}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Integration Guide</CardTitle>
              <CardDescription>
                How to integrate Veridian Credit Systems into your website
              </CardDescription>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h3>Quick Start</h3>
              <p>Add the following code to your checkout page:</p>
              
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{`<!-- Include Veridian Credit Systems SDK -->
<script src="${window.location.origin}/sdk/veridian-credit-systems.js"></script>

<!-- Veridian Credit Systems Button Container -->
<div id="veridian-credit-systems-button"></div>

<script>
  // Initialize Veridian Credit Systems with your API key
  const veridianCreditSystems = new VeridianCreditSystems('YOUR_API_KEY');

  // Create checkout button
  veridianCreditSystems.createButton({
    amount: 500.00,
    orderId: 'order_123',
    containerId: 'veridian-credit-systems-button',
    onSuccess: (data) => {
      console.log('Payment approved:', data);
      // Redirect to order confirmation
    },
    onCancel: () => {
      console.log('Payment cancelled');
    },
    onError: (error) => {
      console.error('Payment error:', error);
    }
  });
</script>`}</code>
              </pre>

              <h3>Webhook Integration</h3>
              <p>Add a webhook URL to receive payment notifications:</p>
              
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{`<!-- Add webhook meta tag -->
<meta name="veridian-webhook" content="https://yoursite.com/webhook/veridian">`}</code>
              </pre>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Always verify webhook signatures using your API secret to ensure authenticity.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
