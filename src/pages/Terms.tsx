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
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
                  By accessing or using the Veridian Credit Systems platform, website, or related services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, you may not access or use the Services.
                </p>
              </motion.div>

              {/* Service Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">SERVICE DESCRIPTION</h2>
                <p className="text-muted-foreground mb-4">
                  Veridian Credit Systems ("Veridian," "we," "us," or "our") provides a software platform that enables merchants to offer installment payment options to their customers using merchant-controlled funds.
                </p>
                <p className="text-muted-foreground">
                  <strong>Veridian does not extend credit, issue loans, underwrite consumers, determine creditworthiness or act as a lender, bank or payment processor.</strong> Merchants retain full control over funding, eligibility criteria and customer payment terms.
                </p>
              </motion.div>

              {/* Eligibility */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">ELIGIBILITY</h2>
                <p className="text-muted-foreground mb-4">
                  To use the Services, you must:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Be at least 21 years of age</li>
                  <li>Have the legal capacity to enter into binding agreements</li>
                  <li>Provide accurate and complete information</li>
                  <li>Comply with all applicable laws, regulations and merchant policies</li>
                </ul>
                <p className="text-muted-foreground">
                  Use of the Services may be subject to additional merchant terms.
                </p>
              </motion.div>

              {/* User Accounts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">USER ACCOUNTS</h2>
                <p className="text-muted-foreground mb-4">
                  You are responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Maintaining the confidentiality of account credentials</li>
                  <li>All activity conducted through your account</li>
                  <li>Promptly notifying Veridian Credit Systems of unauthorized access</li>
                  <li>Ensuring information associated with your account remains accurate</li>
                </ul>
                <p className="text-muted-foreground">
                  Veridian may suspend or terminate access if account security is compromised.
                </p>
              </motion.div>

              {/* Payment Terms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">PAYMENT TERMS</h2>
                
                <h3 className="font-bold text-lg mb-3">For Customers</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>Installment plans are offered and approved by merchants</li>
                  <li>Payment schedules and terms are set by merchants</li>
                  <li>You agree to make payments as scheduled</li>
                  <li>Failure to complete payments may result in merchant-imposed restrictions</li>
                  <li>Veridian does not collect interest and does not report to credit bureaus</li>
                </ul>

                <h3 className="font-bold text-lg mb-3">For Merchants</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Merchants fund installment plans using their own capital</li>
                  <li>Platform fees are governed by a separate merchant agreement</li>
                  <li>Merchants are responsible for customer service, refunds and disputes</li>
                </ul>
                <p className="text-muted-foreground">
                  <strong>Veridian does not hold, move, or settle customer funds.</strong>
                </p>
              </motion.div>

              {/* Verification and Eligibility Services */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">VERIFICATION AND ELIGIBILITY SERVICES</h2>
                <p className="text-muted-foreground mb-4">
                  To support fraud prevention and transaction eligibility, Veridian may integrate with third-party providers, including identity verification, soft credit presence checks and bank account verification services.
                </p>
                <p className="text-muted-foreground mb-4">
                  By using the Services, you authorize Veridian to share necessary information with these providers and acknowledge that their processing of data is governed by their respective privacy policies.
                </p>
                <p className="text-muted-foreground">
                  <strong>Veridian receives verification outcomes and eligibility signals only and does not store bank login credentials, full credit reports or government identification images.</strong>
                </p>
              </motion.div>

              {/* Prohibited Use */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">PROHIBITED USE</h2>
                <p className="text-muted-foreground mb-4">
                  You may not:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Provide false or misleading information</li>
                  <li>Use the Services for unlawful or fraudulent purposes</li>
                  <li>Attempt to bypass security controls</li>
                  <li>Interfere with system integrity or availability</li>
                  <li>Use automated tools without authorization</li>
                  <li>Violate applicable laws or regulations</li>
                </ul>
                <p className="text-muted-foreground">
                  Veridian may suspend or terminate access for violations.
                </p>
              </motion.div>

              {/* Intellectual Property */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">INTELLECTUAL PROPERTY</h2>
                <p className="text-muted-foreground">
                  All software, content and materials provided through the Services are owned by Veridian Credit Systems or its licensors and are protected by intellectual property laws. No rights are granted except as expressly stated. Unauthorized use is prohibited.
                </p>
              </motion.div>

              {/* Disclaimers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">DISCLAIMERS</h2>
                <p className="text-muted-foreground mb-4">
                  THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE." VERIDIAN DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.
                </p>
                <p className="text-muted-foreground">
                  Veridian does not guarantee uninterrupted availability or error-free operation.
                </p>
              </motion.div>

              {/* Limitation of Liability */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">LIMITATION OF LIABILITY</h2>
                <p className="text-muted-foreground mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, VERIDIAN SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS OR DATA, ARISING FROM OR RELATED TO USE OF THE SERVICES.
                </p>
                <p className="text-muted-foreground">
                  Veridian's total liability shall not exceed amounts paid to Veridian in the preceding twelve months.
                </p>
              </motion.div>

              {/* Dispute Resolution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">DISPUTE RESOLUTION</h2>
                <p className="text-muted-foreground mb-4">
                  Any dispute arising from these Terms or the Services shall be resolved through binding arbitration administered by the American Arbitration Association. Arbitration shall be conducted on an individual basis. Class actions and class arbitration are waived to the extent permitted by law.
                </p>
              </motion.div>

              {/* Changes to Terms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">CHANGES TO TERMS</h2>
                <p className="text-muted-foreground">
                  Veridian may update these Terms from time to time. Material changes will be posted on our website. Continued use of the Services after changes constitutes acceptance of the revised Terms.
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
                <h2 className="font-display text-2xl font-bold mb-4">CONTACT INFORMATION</h2>
                <p className="text-muted-foreground mb-4">
                  Questions regarding these Terms may be directed to:
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

export default Terms;
