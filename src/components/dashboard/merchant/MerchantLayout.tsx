import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Receipt,
  FileCheck,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Store,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MerchantLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Overview', href: '/merchant/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/merchant/transactions', icon: Receipt },
  { name: 'BNPL Requests', href: '/merchant/requests', icon: FileCheck },
  { name: 'Analytics', href: '/merchant/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/merchant/settings', icon: Settings },
];

export function MerchantLayout({ children }: MerchantLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userExtended, merchantProfile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
            <img 
              src="/VeridianCreditSystemsLogo.jpg" 
              alt="Veridian" 
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="font-display text-xl font-bold">Veridian</span>
          </div>

          {/* Business info */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-4 h-4 text-muted-foreground" />
              <p className="font-medium text-sm">{merchantProfile?.business_name || 'Business'}</p>
            </div>
            <p className="text-xs text-muted-foreground">{userExtended?.full_name}</p>
            {merchantProfile && (
              <div className="mt-2 space-y-2">
                <span className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs",
                  merchantProfile.is_verified ? "bg-green-500/10 text-green-500" :
                  "bg-yellow-500/10 text-yellow-500"
                )}>
                  {merchantProfile.is_verified ? 'Verified' : 'Pending Verification'}
                </span>
                
                {/* Show rejection reason if exists */}
                {(merchantProfile as any).rejection_reason && (
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs">
                    <p className="font-medium text-red-500 mb-1">Verification Rejected</p>
                    <p className="text-red-400">{(merchantProfile as any).rejection_reason}</p>
                  </div>
                )}
                
                {!merchantProfile.is_verified && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={async () => {
                      try {
                        const { supabase } = await import('@/integrations/supabase/client');
                        const { useToast } = await import('@/hooks/use-toast');
                        
                        // Update to set verification_status to 'pending' for admin review
                        const { error } = await supabase
                          .from('merchant_profiles')
                          .update({ 
                            verification_status: 'pending',
                            is_verified: false,
                            verified_at: null,
                            rejection_reason: null,
                            rejected_at: null
                          })
                          .eq('id', merchantProfile.id);
                        
                        if (!error) {
                          // Show success message
                          const toastEvent = new CustomEvent('show-toast', {
                            detail: {
                              title: 'Verification Requested',
                              description: 'Your verification request has been sent to admin. You will be notified once reviewed.',
                            }
                          });
                          window.dispatchEvent(toastEvent);
                        } else {
                          throw error;
                        }
                      } catch (err: any) {
                        console.error('Error:', err);
                        const toastEvent = new CustomEvent('show-toast', {
                          detail: {
                            title: 'Error',
                            description: err.message || 'Failed to send verification request',
                            variant: 'destructive'
                          }
                        });
                        window.dispatchEvent(toastEvent);
                      }
                    }}
                  >
                    Request Verification
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sign out */}
          <div className="px-3 py-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center gap-4 px-4 py-3 bg-card border-b border-border lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <img 
            src="/VeridianCreditSystemsLogo.jpg" 
            alt="Veridian" 
            className="h-8 w-8 rounded-lg object-cover"
          />
          <span className="font-display text-lg font-bold">Veridian</span>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
