import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { FileText, Shield, Eye, Database, Mail } from "lucide-react";

const smoothEasing = [0.16, 1, 0.3, 1] as const;

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-amber-50/30 py-16 relative overflow-hidden">
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
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Privacy <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-600 bg-clip-text text-transparent">Policy</span>
              </h1>
              <p className="text-muted-foreground">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="prose prose-slate max-w-none">
              
              {/* Introduction */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Veridian Credit Systems ("Veridian," "we," "us," or "our") is committed to protecting your privacy. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                  use our platform and services.
                </p>
              </motion.div>

              {/* Data Handling Disclosure */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="bg-emerald-50 border-l-4 border-emerald-600 p-6 rounded-r-xl mb-12"
              >
                <h3 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  Our Data Commitment
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Veridian retains only the minimum data required to operate the platform, including verification 
                  results, eligibility signals, and transaction logs. Sensitive identity, banking, and credit data 
                  are processed and stored by third-party providers.
                </p>
              </motion.div>

              {/* Information We Collect */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">Information We Collect</h2>
                
                <h3 className="font-bold text-lg mb-3">1. Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>Account information (name, email address, phone number)</li>
                  <li>Transaction details and payment history</li>
                  <li>Communication preferences</li>
                </ul>

                <h3 className="font-bold text-lg mb-3">2. Information from Third Parties</h3>
                <p className="text-muted-foreground mb-4">
                  We work with trusted third-party providers who handle sensitive data on our behalf:
                </p>
                <div className="space-y-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Eye className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold mb-1">Persona (Identity Verification)</h4>
                        <p className="text-sm text-muted-foreground">
                          Handles identity verification, KYC processes, and stores ID images and government ID numbers.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Database className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold mb-1">Experian (Credit Checks)</h4>
                        <p className="text-sm text-muted-foreground">
                          Performs soft credit checks and stores credit reports and scores.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold mb-1">Plaid (Bank Verification)</h4>
                        <p className="text-sm text-muted-foreground">
                          Verifies bank accounts and stores bank credentials and transaction histories.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-3">3. Automatically Collected Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Device information and IP address</li>
                  <li>Browser type and version</li>
                  <li>Usage data and analytics</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </motion.div>

              {/* How We Use Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>To provide and maintain our services</li>
                  <li>To process transactions and manage payment plans</li>
                  <li>To verify eligibility for installment payments</li>
                  <li>To communicate with you about your account</li>
                  <li>To improve our platform and user experience</li>
                  <li>To comply with legal obligations</li>
                  <li>To prevent fraud and ensure security</li>
                </ul>
              </motion.div>

              {/* Data Sharing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">How We Share Information</h2>
                <p className="text-muted-foreground mb-4">
                  We may share your information with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Merchants:</strong> To facilitate transactions and payment plans</li>
                  <li><strong>Service Providers:</strong> Persona, Experian, and Plaid for verification services</li>
                  <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We do not sell your personal information to third parties.
                </p>
              </motion.div>

              {/* Data Retention */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your information only as long as necessary to provide our services and comply with legal 
                  obligations. Verification results and transaction logs are retained for regulatory compliance purposes. 
                  Sensitive data stored by third-party providers is subject to their respective retention policies.
                </p>
              </motion.div>

              {/* Your Rights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">Your Privacy Rights</h2>
                <p className="text-muted-foreground mb-4">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Opt-Out:</strong> Opt out of marketing communications</li>
                  <li><strong>Data Portability:</strong> Request transfer of your data</li>
                </ul>
              </motion.div>

              {/* Security */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect your information against 
                  unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over 
                  the internet or electronic storage is 100% secure.
                </p>
              </motion.div>

              {/* Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="bg-slate-50 rounded-2xl p-8"
              >
                <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
                  <Mail className="w-6 h-6 text-slate-600" />
                  Contact Us
                </h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> privacy@veridian.com</p>
                  <p><strong>Address:</strong> [Company Address]</p>
                </div>
              </motion.div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
