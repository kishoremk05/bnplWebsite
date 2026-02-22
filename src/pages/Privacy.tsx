import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { FileText, Mail } from "lucide-react";

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
                Effective Date: [Insert Date]
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="prose prose-slate max-w-none">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: smoothEasing }}
                    className="mb-12"
                  >
                    <h2 className="font-display text-2xl font-bold mb-4">INTRODUCTION</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Veridian Credit Systems, Inc. (“Veridian,” “we,” “us,” or “our”) provides software that enables merchants to offer installment payment options using merchant-controlled funds. Veridian is a financial technology software provider and does not act as a lender, bank, payment processor or financial institution.
                      We are committed to protecting privacy and handling information responsibly. This Privacy Policy explains how we collect, use, disclose and safeguard information when you access or use our website, platform and related services.
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
                <p className="text-muted-foreground leading-relaxed mb-4">
                  This Privacy Policy applies to information collected through our website, merchant platform and related services. It does not apply to information collected directly by merchants, payment processors or third-party service providers that operate independently from Veridian.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Depending on the context, Veridian acts as a data controller for information collected through its website and as a data processor when processing information on behalf of merchants through the platform.
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
                
                <h3 className="font-bold text-lg mb-3">Information You Provide Directly</h3>
                <p className="text-muted-foreground mb-3">We may collect information you choose to provide, including:</p>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Name</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Email address</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Phone number</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Business or merchant information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Communications submitted through forms or support requests</span>
                  </li>
                </ul>

                <h3 className="font-bold text-lg mb-3">Information Collected Through Platform Use</h3>
                <p className="text-muted-foreground mb-3">When our software is used as part of a transaction, we may collect or generate:</p>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Transaction identifiers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Merchant identifiers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Eligibility decision outcomes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Timestamps and audit logs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Repayment status indicators provided by merchants or generated through platform workflows</span>
                  </li>
                </ul>
                <p className="text-muted-foreground mb-6">
                  <strong>We do not collect or store</strong> full payment card numbers, bank login credentials, government identification images or full credit reports.
                </p>

                <h3 className="font-bold text-lg mb-3">Information Processed by Third-Party Providers</h3>
                <p className="text-muted-foreground">
                  Certain verification and eligibility services are performed by trusted third-party providers. These providers may collect and process sensitive information directly, including identity data, banking data or credit-related signals. Veridian receives only limited verification outcomes, tokenized references or high-level eligibility indicators from these providers.
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
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Operate and maintain the platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Support merchant transaction workflows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Provide eligibility and fraud prevention tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Maintain audit logs and compliance records</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Respond to inquiries and support requests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Improve platform performance, reliability and security</span>
                  </li>
                </ul>
                <p className="text-muted-foreground">
                  <strong>Veridian does not use personal information to make lending decisions, extend credit, underwrite consumers or market consumer financial products.</strong>
                </p>
              </motion.div>

              {/* Legal Basis for Processing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">LEGAL BASIS FOR PROCESSING</h2>
                <p className="text-muted-foreground">
                  We process information based on contractual necessity, legitimate business interests, compliance with legal obligations and user consent where applicable.
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
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>With service providers that support platform operations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>With merchants in connection with transactions initiated through their systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>As required by law, regulation or legal process</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>To protect the rights, safety or integrity of Veridian, merchants or users</span>
                  </li>
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
                  We retain information only for as long as necessary to operate the platform, meet contractual obligations and comply with legal or regulatory requirements. Transaction records, eligibility logs and audit data may be retained for compliance and recordkeeping purposes.
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
                  We implement administrative, technical and organizational safeguards designed to protect information from unauthorized access, use or disclosure. No system can guarantee absolute security, but we take reasonable measures appropriate to the nature of our services and the information processed.
                </p>
              </motion.div>

              {/* Your Privacy Rights and Choices */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">YOUR PRIVACY RIGHTS AND CHOICES</h2>
                <p className="text-muted-foreground">
                  You may request access to, correction of or deletion of certain information by contacting us. Requests are subject to identity verification and applicable legal, contractual or regulatory limitations. Certain information may not be eligible for immediate deletion due to compliance or recordkeeping obligations.
                </p>
              </motion.div>

              {/* State Privacy Rights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">STATE PRIVACY RIGHTS</h2>
                <p className="text-muted-foreground">
                  Residents of certain U.S. states may have additional rights regarding their personal information, including rights to access, correct or delete information, subject to applicable law. Veridian will respond to verified requests in accordance with applicable privacy laws.
                </p>
              </motion.div>

              {/* International Users */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">INTERNATIONAL USERS</h2>
                <p className="text-muted-foreground">
                  Our services are intended for use in the United States. We do not knowingly target or market services to individuals outside the United States.
                </p>
              </motion.div>

              {/* Data Transfers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">DATA TRANSFERS</h2>
                <p className="text-muted-foreground">
                  Information may be processed and stored in the United States and other jurisdictions where Veridian or its service providers operate.
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

              {/* Changes to This Privacy Policy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">CHANGES TO THIS PRIVACY POLICY</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. Updates will be posted on our website with a revised effective date. Continued use of the services after changes constitutes acceptance of the updated policy.
                </p>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="bg-slate-50 rounded-2xl p-8"
              >
                <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
                  <Mail className="w-6 h-6 text-slate-600" />
                  CONTACT INFORMATION
                </h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>Veridian Credit Systems, Inc.</p>
                  <p>Email: <strong>privacy@veridiancreditsystems.com</strong></p>
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
