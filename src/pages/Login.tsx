import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate("/customer/dashboard");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to sign in";
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
            Welcome Back to<br />
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
              Financial Freedom
            </span>
          </h1>
          
          <p className="text-emerald-200/70 text-lg max-w-md">
            Access your account to manage payments, view your credit, 
            and enjoy seamless financial flexibility.
          </p>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center gap-6">
            {["256-bit SSL", "PCI Compliant", "GDPR Ready"].map((badge, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-emerald-200/60 text-sm">{badge}</span>
              </div>
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
              Sign In
            </h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-veridian-gold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 text-white font-semibold shadow-lg transition-all duration-300"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className="text-veridian-gold font-semibold hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>

          {/* Admin link */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link 
              to="/admin/login" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin Portal →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
