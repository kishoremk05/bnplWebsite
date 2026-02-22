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
                  By accessing or using the Veridian Credit Systems, Inc. website, software platform or related services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Services.
                </p>
              </motion.div>

              {/* Service Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 0.1 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">SERVICE DESCRIPTION</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Veridian Credit Systems, Inc. ("Veridian," "we," "us," or "our") provides a software platform that enables merchants to offer installment payment options to customers using merchant-controlled funds.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Veridian provides software only.</strong>
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">Veridian does not:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                  <li>Extend credit</li>
                  <li>Issue loans</li>
                  <li>Underwrite consumers</li>
                  <li>Determine creditworthiness</li>
                  <li>Act as a lender, bank or financial institution</li>
                  <li>Act as a payment processor</li>
                  <li>Hold, move, transmit or settle customer funds</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  All installment arrangements are established directly between the merchant and the customer. Merchants retain full control over funding decisions, eligibility criteria, payment schedules and customer terms.
                </p>
              </motion.div>

              {/* Eligibility */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 0.2 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">ELIGIBILITY</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">To use the Services, you must:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                  <li>Be at least the age of majority applicable to the transaction</li>
                  <li>Have legal capacity to enter into binding agreements</li>
                  <li>Provide accurate and complete information</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Use of the Services may also be subject to separate merchant agreements.
                </p>
              </motion.div>

              {/* User Accounts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 0.3 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">USER ACCOUNTS</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">You are responsible for:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                  <li>Maintaining the confidentiality of account credentials</li>
                  <li>All activities conducted through your account</li>
                  <li>Promptly notifying Veridian of unauthorized access</li>
                  <li>Ensuring account information remains accurate and current</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Veridian may suspend or terminate access where misuse, security compromise or violation of these Terms is reasonably suspected.
                </p>
              </motion.div>

              {/* Payment Terms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 0.4 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">PAYMENT TERMS</h2>
                
                <h3 className="font-display text-xl font-semibold mb-3 mt-6">For Customers</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Installment plans are offered and approved solely by merchants. Payment schedules and terms are determined by merchants. You agree to make payments according to the merchant's agreed schedule.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Failure to complete payments may result in merchant-imposed restrictions subject to applicable law.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Veridian does not collect interest, does not charge consumers interest and does not report consumer payment activity to credit bureaus.
                </p>

                <h3 className="font-display text-xl font-semibold mb-3 mt-6">For Merchants</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Merchants fund installment plans using their own capital. Platform fees are governed by separate merchant agreements. Merchants are responsible for customer service, refunds and dispute resolution.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Veridian does not handle, receive or settle customer funds.
                </p>
              </motion.div>

              {/* Verification and Third-Party Services */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 0.5 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">VERIFICATION AND THIRD-PARTY SERVICES</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  To support fraud prevention and transaction workflows, Veridian integrates with third-party providers, which may include identity verification providers, bank account verification services and soft credit presence check services.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  By using the Services, you authorize Veridian to share necessary information with these providers in connection with transaction workflows. Processing of information by third parties is governed by their respective privacy policies.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Veridian receives limited verification outcomes and tokenized identifiers only. Veridian does not store bank login credentials, full credit reports or government identification images.
                </p>
              </motion.div>

              {/* No Financial or Legal Advice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 0.6 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">NO FINANCIAL OR LEGAL ADVICE</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Services provide software functionality only. Nothing provided by Veridian constitutes financial, legal, tax or regulatory advice.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Merchants are solely responsible for determining their own compliance obligations, regulatory requirements and business practices.
                </p>
              </motion.div>

              {/* No Regulatory Approval */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 0.7 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">NO REGULATORY APPROVAL</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Use of the Services does not imply approval, endorsement or authorization by any governmental or regulatory authority.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Merchants are solely responsible for compliance with all applicable laws and regulations governing their business operations.
                </p>
              </motion.div>

              {/* Prohibited Use */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 0.8 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">PROHIBITED USE</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">You may not:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                  <li>Provide false or misleading information</li>
                  <li>Use the Services for unlawful or fraudulent purposes</li>
                  <li>Attempt to bypass security measures</li>
                  <li>Interfere with system integrity or availability</li>
                  <li>Use automated tools without authorization</li>
                  <li>Violate applicable laws or regulations</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Veridian may suspend or terminate access for violations.
                </p>
              </motion.div>

              {/* Intellectual Property */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 0.9 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">INTELLECTUAL PROPERTY</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All software, content, features and functionality provided through the Services are owned by Veridian Credit Systems, Inc. or its licensors and are protected by intellectual property laws.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  No license is granted except as expressly provided. Unauthorized use is prohibited.
                </p>
              </motion.div>

              {/* Service Modification or Suspension */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 1.0 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">SERVICE MODIFICATION OR SUSPENSION</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Veridian may modify, suspend or discontinue any aspect of the Services at any time for operational, security, legal or compliance reasons.
                </p>
              </motion.div>

              {/* Disclaimers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 1.1 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">DISCLAIMERS</h2>
                <p className="text-muted-foreground leading-relaxed mb-4 font-semibold uppercase">
                  The Services are provided as is and as available.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4 font-semibold uppercase">
                  Veridian disclaims all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Veridian does not guarantee uninterrupted availability or error-free operation.
                </p>
              </motion.div>

              {/* Limitation of Liability */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 1.2 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">LIMITATION OF LIABILITY</h2>
                <p className="text-muted-foreground leading-relaxed mb-4 font-semibold uppercase">
                  To the maximum extent permitted by law, Veridian shall not be liable for indirect, incidental, consequential, special or punitive damages, including lost profits, loss of data or business interruption.
                </p>
                <p className="text-muted-foreground leading-relaxed font-semibold uppercase">
                  Veridian's total liability shall not exceed the amounts paid to Veridian in the twelve months preceding the event giving rise to the claim.
                </p>
              </motion.div>

              {/* Indemnification */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 1.3 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">INDEMNIFICATION</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to indemnify and hold harmless Veridian from any claims, losses, liabilities or expenses arising from your misuse of the Services, violation of these Terms or non-compliance with applicable laws.
                </p>
              </motion.div>

              {/* Force Majeure */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 1.4 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">FORCE MAJEURE</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Veridian shall not be liable for delays or failures caused by events beyond its reasonable control, including governmental actions, regulatory changes, network failures or third-party service disruptions.
                </p>
              </motion.div>

              {/* Dispute Resolution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 1.5 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">DISPUTE RESOLUTION</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Any dispute arising under these Terms shall be resolved through binding arbitration administered by the American Arbitration Association on an individual basis.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Class actions and class arbitration are waived to the fullest extent permitted by law.
                </p>
              </motion.div>

              {/* Governing Law */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 1.6 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">GOVERNING LAW</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to conflict of law principles.
                </p>
              </motion.div>

              {/* Changes to Terms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 1.7 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">CHANGES TO TERMS</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Veridian may update these Terms from time to time. Updated versions will be posted on the website with a revised effective date. Continued use of the Services constitutes acceptance of the revised Terms.
                </p>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing, delay: 1.8 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">CONTACT INFORMATION</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  Veridian Credit Systems, Inc.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Email: <a href="mailto:support@veridiancreditsystems.com" className="text-emerald-600 hover:text-emerald-700 underline">support@veridiancreditsystems.com</a>
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
