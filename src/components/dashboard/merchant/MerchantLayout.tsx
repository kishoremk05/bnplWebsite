import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  BarChart3,
  Wallet,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MerchantLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/merchant/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/merchant/transactions", icon: CreditCard },
  { name: "BNPL Requests", href: "/merchant/requests", icon: FileText },
  { name: "Analytics", href: "/merchant/analytics", icon: BarChart3 },
  { name: "Customers", href: "/merchant/customers", icon: Users },
  { name: "Payouts", href: "/merchant/payouts", icon: Wallet },
  { name: "Settings", href: "/merchant/settings", icon: Settings },
];

export function MerchantLayout({ children }: MerchantLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userExtended, merchantProfile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-emerald-950 to-[#071a15] border-r border-emerald-800/30 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-emerald-800/30">
            <img 
              src="/VeridianCreditSystemsLogo.jpg" 
              alt="Veridian" 
              className="h-10 w-10 rounded-xl object-cover"
            />
            <div>
              <span className="font-display text-xl font-bold text-white block">Veridian</span>
              <span className="text-amber-400/80 text-xs font-medium">Merchant Portal</span>
            </div>
          </div>

          {/* Merchant info */}
          <div className="px-6 py-5 border-b border-emerald-800/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                <span className="text-emerald-950 font-bold text-sm">
                  {merchantProfile?.business_name?.charAt(0) || "M"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate text-sm">
                  {merchantProfile?.business_name || "Merchant"}
                </p>
                <p className="text-emerald-400/70 text-xs">Business Account</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-400 border border-amber-500/20"
                      : "text-emerald-200/70 hover:bg-emerald-800/30 hover:text-white"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-amber-400" : "")} />
                  {item.name}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Sign out */}
          <div className="px-4 py-4 border-t border-emerald-800/30">
            <Button
              variant="ghost"
              className="w-full justify-start text-emerald-200/70 hover:text-white hover:bg-emerald-800/30"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center gap-4 px-4 py-4 bg-background/95 backdrop-blur-md border-b border-border lg:hidden">
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
          <span className="font-display text-lg font-bold">Merchant Portal</span>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
