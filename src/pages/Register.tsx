import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const benefits = [
  "Zero interest on all purchases",
  "Instant approval in seconds",
  "Split payments into 4 installments",
  "No hidden fees, ever",
];

export default function Register() {
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

    setLoading(true);

    try {
      await signUp(email, password, fullName, "customer");
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
            Start Your Journey to<br />
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
              Smarter Spending
            </span>
          </h1>
          
          <p className="text-emerald-200/70 text-lg max-w-md mb-10">
            Join thousands of customers who trust Veridian Credit Systems 
            for flexible, interest-free payments.
          </p>

          {/* Benefits list */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
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
          transition={{ duration: 0.5 }}
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

          <div className="mb-8">
            <h2 className="font-serif-heading text-3xl font-bold text-foreground mb-2">
              Create Account
            </h2>
            <p className="text-muted-foreground">
              Get started with flexible, interest-free payments
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

          {/* Merchant link */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link 
              to="/merchants/register" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Register as a Merchant →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
