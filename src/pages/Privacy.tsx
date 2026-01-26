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
                <h2 className="font-display text-2xl font-bold mb-4">INTRODUCTION</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Veridian Credit Systems ("Veridian," "we," "us," or "our") provides software that enables merchants to offer installment payment options using their own capital. We are committed to protecting your privacy and handling information responsibly. This Privacy Policy explains how we collect, use, disclose and safeguard information when you access or use our website, platform and related services.
                </p>
              </motion.div>

              {/* Scope */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">SCOPE</h2>
                <p className="text-muted-foreground leading-relaxed">
                  This Privacy Policy applies to information collected through our website, merchant platform and related services. It does not apply to information collected directly by merchants, payment processors or third-party service providers that operate independently from Veridian.
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
                <h2 className="font-display text-2xl font-bold mb-4">INFORMATION WE COLLECT</h2>
                
                <h3 className="font-bold text-lg mb-3">Information you provide directly</h3>
                <p className="text-muted-foreground mb-3">We may collect information that you choose to provide, including:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Business information</li>
                  <li>Communications submitted through forms or support requests</li>
                </ul>

                <h3 className="font-bold text-lg mb-3">Information collected through platform use</h3>
                <p className="text-muted-foreground mb-3">When our software is used as part of a transaction, we may collect:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>Transaction identifiers</li>
                  <li>Merchant identifiers</li>
                  <li>Eligibility decision outcomes</li>
                  <li>Timestamps and audit logs</li>
                  <li>Repayment status indicators</li>
                </ul>
                <p className="text-muted-foreground mb-6">
                  <strong>We do not collect or store</strong> full payment card numbers, bank login credentials, government ID images or full credit reports.
                </p>

                <h3 className="font-bold text-lg mb-3">Information processed by third-party providers</h3>
                <p className="text-muted-foreground">
                  Certain verification and eligibility services are performed by trusted third-party providers. These providers may collect and process sensitive information directly, including identity data, banking data or credit-related signals. Veridian receives only tokenized references, verification outcomes or high-level eligibility indicators.
                </p>
              </motion.div>

              {/* How We Use Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">HOW WE USE INFORMATION</h2>
                <p className="text-muted-foreground mb-3">We use information to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Operate and maintain our platform</li>
                  <li>Support merchant transaction workflows</li>
                  <li>Provide eligibility and fraud prevention tools</li>
                  <li>Maintain audit logs and compliance records</li>
                  <li>Respond to inquiries and support requests</li>
                  <li>Improve platform performance and security</li>
                </ul>
                <p className="text-muted-foreground">
                  <strong>We do not use personal information to make lending decisions, extend credit or market consumer financial products.</strong>
                </p>
              </motion.div>

              {/* How We Share Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">HOW WE SHARE INFORMATION</h2>
                <p className="text-muted-foreground mb-3">We may share information:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>With service providers that support our platform operations</li>
                  <li>With merchants in connection with transactions initiated through their systems</li>
                  <li>As required by law, regulation or legal process</li>
                  <li>To protect the rights, safety or integrity of Veridian and its users</li>
                </ul>
                <p className="text-muted-foreground">
                  <strong>We do not sell personal information.</strong>
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
                <h2 className="font-display text-2xl font-bold mb-4">DATA RETENTION</h2>
                <p className="text-muted-foreground">
                  We retain information only for as long as necessary to operate the platform, meet contractual obligations and comply with legal or regulatory requirements. Eligibility logs and transaction records may be retained for audit and compliance purposes.
                </p>
              </motion.div>

              {/* Data Security */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">DATA SECURITY</h2>
                <p className="text-muted-foreground">
                  We implement administrative, technical and organizational safeguards designed to protect information from unauthorized access, use or disclosure. While no system can guarantee absolute security, we take reasonable measures appropriate to the nature of our services.
                </p>
              </motion.div>

              {/* Your Choices */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">YOUR CHOICES</h2>
                <p className="text-muted-foreground">
                  You may contact us to request access to, correction of or deletion of certain information, subject to applicable legal and contractual limitations.
                </p>
              </motion.div>

              {/* Children's Privacy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">CHILDREN'S PRIVACY</h2>
                <p className="text-muted-foreground">
                  Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors.
                </p>
              </motion.div>

              {/* Third-Party Services */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">THIRD-PARTY SERVICES</h2>
                <p className="text-muted-foreground">
                  Our platform may integrate with or link to third-party services. This Privacy Policy does not govern the privacy practices of those third parties. We encourage you to review their privacy policies directly.
                </p>
              </motion.div>

              {/* Changes to Policy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">CHANGES TO THIS POLICY</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. Updates will be posted on our website with a revised effective date.
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
                  CONTACT US
                </h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions about this Privacy Policy or our data practices, contact us at:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>support@veridiancreditsystems.com</strong></p>
                  <p>Veridian Credit Systems</p>
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
