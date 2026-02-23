import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Shop", href: "/#how-customers-pay" },
  { label: "For Business", href: "/#merchant-cta" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pilot Program", href: "/pilot" },
  { label: "Help", href: "/#features" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle navigation clicks, especially for hash links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const sectionId = href.substring(2); // Remove '/#' to get the section ID
      
      if (location.pathname !== '/') {
        // Navigate to home page first, then scroll after navigation
        navigate('/');
        // Use setTimeout to wait for navigation to complete
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      } else {
        // Already on home page, just scroll
        const element = document.getElementById(sectionId);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
      setIsOpen(false);
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/50" 
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/VeridianCreditSystemsLogo.jpg" 
              alt="Veridian Credit Systems, Inc." 
              className="h-10 w-10 rounded-xl object-cover"
            />
            <span className="font-bold text-xl text-slate-900 hidden sm:inline">
              Veridian Credit Systems, Inc.
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={cn(
                  "text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? "text-emerald-600"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Log in
            </Link>
            <Button 
              asChild 
              className="rounded-xl px-6 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
            >
              <Link to="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden mt-4"
            >
              <div className="py-4 space-y-1 bg-white rounded-2xl shadow-lg border border-slate-200 p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={cn(
                      "block px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      location.pathname === item.href
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 space-y-3 border-t border-slate-200 mt-4">
                  <Link 
                    to="/login" 
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    Log in
                  </Link>
                  <Button 
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium" 
                    asChild
                  >
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
