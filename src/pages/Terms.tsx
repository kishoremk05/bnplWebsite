import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Scale } from "lucide-react";

const smoothEasing = [0.16, 1, 0.3, 1] as const;

const Terms = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-amber-50/30 py-16 relative overflow-hidden">
          <motion.div 
            className="absolute top-20 right-20 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mb-6 shadow-lg">
                <Scale className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Terms of <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-600 bg-clip-text text-transparent">Service</span>
              </h1>
              <p className="text-muted-foreground">
                Effective Date: March 1, 2026
              </p>
            </motion.div>
          </div>
        </section>
        {/* Content */}
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="prose prose-slate max-w-none">
              {/* Agreement to Terms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">AGREEMENT TO TERMS</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using the Veridian Credit Systems platform, website or related services, collectively the Services, you agree to be bound by these Terms of Service. If you do not agree to these Terms, you may not access or use the Services.
                </p>
              </motion.div>
              {/* ...existing code... */}
};

export default Terms;
