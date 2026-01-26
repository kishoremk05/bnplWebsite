import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const smoothEasing = [0.16, 1, 0.3, 1] as const;

const Trust = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-amber-50/30 py-20 relative overflow-hidden">
          <motion.div 
            className="absolute top-20 right-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl"
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
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
                Trust & <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-600 bg-clip-text text-transparent">Compliance</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your data security and privacy are our top priorities
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Disclosure */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-amber-50/30 border-l-4 border-emerald-600 p-8 rounded-r-2xl shadow-lg"
            >
              <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-emerald-600" />
                Our Data Commitment
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Veridian retains only the minimum data required to operate the platform, 
                including verification results, eligibility signals and transaction logs. 
                Sensitive identity, banking and credit data are processed and stored 
                by third-party providers.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What We Store vs What We Don't */}
        <section className="py-16 bg-gradient-to-b from-white to-emerald-50/30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-4xl font-bold text-center mb-12">
              Data We Handle
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* What We Store */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold">What We Store</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Verification IDs (references only)",
                    "Approval/rejection results",
                    "Transaction timestamps",
                    "Internal transaction IDs",
                    "High-level status flags"
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* What We Never Store */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-red-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold">What We Never Store</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "ID images or selfies",
                    "Government ID numbers (SSN, etc.)",
                    "Credit scores or full reports",
                    "Bank account credentials",
                    "Account or routing numbers"
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Third-Party Partners */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-bold text-center mb-12">
              Our Trusted Partners
            </h2>
            
            <div className="space-y-6">
              {[
                { icon: Eye, title: "Persona", subtitle: "Identity Verification", description: "Handles identity verification and KYC processes. All ID images, selfies, and government ID numbers are securely stored by Persona.", result: "Verification ID + Pass/Fail result", color: "from-blue-500 to-blue-600" },
                { icon: Database, title: "Experian", subtitle: "Credit Checks", description: "Performs soft credit checks to verify credit file existence. Full credit reports and scores remain with Experian.", result: "Check ID + Eligibility signal", color: "from-purple-500 to-purple-600" },
                { icon: Lock, title: "Plaid", subtitle: "Bank Verification", description: "Verifies bank account stability and cash flow. Bank credentials, account numbers, and transaction histories are stored by Plaid.", result: "Connection ID + Stability status", color: "from-green-500 to-green-600" }
              ].map((partner, index) => (
                <motion.div
                  key={partner.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: smoothEasing }}
                  className="bg-gradient-to-br from-emerald-50/50 to-amber-50/30 border border-emerald-100 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${partner.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <partner.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold mb-1">{partner.title}</h3>
                      <p className="text-sm text-emerald-600 font-semibold mb-2">{partner.subtitle}</p>
                      <p className="text-muted-foreground mb-3">{partner.description}</p>
                      <div className="bg-white rounded-lg p-3 border border-emerald-200">
                        <p className="text-sm font-medium text-emerald-700">
                          Veridian only receives: {partner.result}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Measures */}
        <section className="py-16 bg-gradient-to-b from-white to-emerald-50/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-bold text-center mb-12">
              Security Measures
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: "Encryption", description: "All data in transit is encrypted using industry-standard TLS protocols" },
                { title: "Access Control", description: "Strict role-based access controls limit data access to authorized personnel only" },
                { title: "Audit Logs", description: "Comprehensive logging of all system access and data operations" },
                { title: "Regular Audits", description: "Periodic security assessments and compliance reviews" }
              ].map((measure, index) => (
                <motion.div
                  key={measure.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: smoothEasing }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-lg mb-2 text-emerald-700">{measure.title}</h3>
                  <p className="text-muted-foreground text-sm">{measure.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-br from-emerald-600 via-emerald-500 to-amber-600">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
            >
              <h2 className="font-display text-3xl font-bold text-white mb-4">
                Have questions about our data practices?
              </h2>
              <p className="text-white/90 mb-8 text-lg">
                Read our full privacy policy or contact our team
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild size="lg" className="rounded-full px-8 bg-white text-emerald-600 hover:bg-gray-100 font-bold">
                  <Link to="/privacy">Privacy Policy</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-2 border-white text-white hover:bg-white/10 font-bold">
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Trust;
