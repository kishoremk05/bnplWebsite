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

