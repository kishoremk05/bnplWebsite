import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowRight, CheckCircle2, ShoppingBag, Store, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const smoothEasing = [0.16, 1, 0.3, 1] as const;

const customerBenefits = [
  "Zero interest on all purchases",
  "Instant approval in seconds",
  "Split payments into 4 installments",
  "No hidden fees, ever",
];

const merchantBenefits = [
  "Increase sales by 30%",
  "Zero risk for you",
  "Easy integration",
];

type UserRole = 'customer' | 'merchant';

export default function Register() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select an account type.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName, selectedRole);
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
      navigate("/login");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create account";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const benefits = selectedRole === 'merchant' ? merchantBenefits : customerBenefits;
  const leftPanelTitle = selectedRole === 'merchant' 
    ? "Grow Your Business" 
    : "Start Your Journey to";
  const leftPanelSubtitle = selectedRole === 'merchant'
    ? "Smart Payments"
    : "Smarter Spending";

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-950 via-[#0d3d30] to-emerald-950 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <img 
              src="/VeridianCreditSystemsLogo.jpg" 
              alt="Veridian Credit Systems" 
              className="h-16 w-16 rounded-2xl object-cover shadow-lg"
            />
          </Link>
          
          <h1 className="font-serif-heading text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {leftPanelTitle}<br />
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
              {leftPanelSubtitle}
            </span>
          </h1>
          
          <p className="text-emerald-200/70 text-lg max-w-md mb-10">
            {selectedRole === 'merchant' 
              ? "Join thousands of merchants offering flexible payments with Veridian Credit Systems."
              : "Join thousands of customers who trust Veridian Credit Systems for flexible, interest-free payments."
            }
          </p>

          {/* Benefits list */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2, ease: smoothEasing }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                </div>
                <span className="text-emerald-100">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: smoothEasing }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-3 mb-8 lg:hidden">
            <img 
              src="/VeridianCreditSystemsLogo.jpg" 
              alt="Veridian Credit Systems" 
              className="h-12 w-12 rounded-xl object-cover"
            />
            <span className="font-display text-xl font-bold">Veridian</span>
          </Link>

          {!selectedRole ? (
            // Role Selection
            <>
              <div className="mb-8">
                <h2 className="font-serif-heading text-3xl font-bold text-foreground mb-2">
                  Choose Account Type
                </h2>
                <p className="text-muted-foreground">
                  Select how you want to use Veridian
                </p>
              </div>

              <div className="grid gap-4">
                {/* Customer Card */}
                <motion.button
                  onClick={() => setSelectedRole('customer')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative rounded-2xl p-6 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-200/50 transition-all duration-300 text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold text-emerald-900 mb-1">
                        I'm a Customer
                      </h3>
                      <p className="text-sm text-emerald-700 mb-3">
                        Shop now, pay later with zero interest
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Instant approval</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>4 interest-free payments</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>

                {/* Merchant Card */}
                <motion.button
                  onClick={() => setSelectedRole('merchant')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative rounded-2xl p-6 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 hover:from-amber-100 hover:to-amber-200/50 transition-all duration-300 text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Store className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold text-amber-900 mb-1">
                        I'm a Merchant
                      </h3>
                      <p className="text-sm text-amber-700 mb-3">
                        Offer flexible payments and grow sales
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-amber-600">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Increase conversions</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="text-veridian-gold font-semibold hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          ) : (
            // Registration Form
            <>
              <div className="mb-8">
                <button
                  onClick={() => setSelectedRole(null)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Change account type</span>
                </button>
                <h2 className="font-serif-heading text-3xl font-bold text-foreground mb-2">
                  Create {selectedRole === 'merchant' ? 'Merchant' : 'Customer'} Account
                </h2>
                <p className="text-muted-foreground">
                  {selectedRole === 'merchant' 
                    ? "Start offering flexible payments to your customers"
                    : "Get started with flexible, interest-free payments"
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-12 rounded-xl border-border focus:border-veridian-gold focus:ring-veridian-gold"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl border-border focus:border-veridian-gold focus:ring-veridian-gold"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="h-12 rounded-xl border-border focus:border-veridian-gold focus:ring-veridian-gold pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <Link to="/terms" className="text-veridian-gold hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-veridian-gold hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-emerald-950 font-semibold shadow-gold transition-all duration-300"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="text-veridian-gold font-semibold hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
