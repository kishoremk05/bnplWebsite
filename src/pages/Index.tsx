import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Stats } from "@/components/landing/Stats";
import { Testimonials } from "@/components/landing/Testimonials";
import { DashboardShowcase } from "@/components/landing/DashboardShowcase";
import { HowCustomersPay } from "@/components/landing/HowCustomersPay";
import { MerchantCTA } from "@/components/landing/MerchantCTA";

const Index = () => {
  // Handle hash-based navigation for smooth scrolling to sections
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          const id = hash.replace('#', '');
          const element = document.getElementById(id);
          if (element) {
            const headerOffset = 80; // Account for fixed navbar
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    };

    // Handle on mount and hash changes
    handleHashScroll();
    window.addEventListener('hashchange', handleHashScroll);
    
    return () => window.removeEventListener('hashchange', handleHashScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowCustomersPay />
        <DashboardShowcase />
        <MerchantCTA />
        <Stats />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

