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
              
              {/* Introduction */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">1. Agreement to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using Veridian Credit Systems ("Veridian," "we," "us," or "our"), you agree to be bound 
                  by these Terms of Service. If you do not agree to these terms, please do not use our services.
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
                <h2 className="font-display text-2xl font-bold mb-4">2. Service Description</h2>
                <p className="text-muted-foreground mb-4">
                  Veridian provides a software platform that enables merchants to offer installment payment options to 
                  their customers. <strong>Veridian does not extend credit, underwrite consumers, or act as a lender.</strong>
                </p>
                <p className="text-muted-foreground">
                  Merchants use their own capital to fund installment plans. Veridian facilitates the verification, 
                  approval, and management of these payment arrangements.
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
                <h2 className="font-display text-2xl font-bold mb-4">3. Eligibility</h2>
                <p className="text-muted-foreground mb-4">
                  To use our services, you must:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Be at least 18 years of age</li>
                  <li>Have the legal capacity to enter into binding contracts</li>
                  <li>Provide accurate and complete information</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </motion.div>

              {/* User Accounts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">4. User Accounts</h2>
                <p className="text-muted-foreground mb-4">
                  You are responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized access</li>
                  <li>Ensuring your account information remains accurate and up-to-date</li>
                </ul>
              </motion.div>

              {/* Payment Terms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">5. Payment Terms</h2>
                <h3 className="font-bold text-lg mb-3">For Customers</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>Payment plans are subject to merchant approval</li>
                  <li>You agree to make payments according to the agreed schedule</li>
                  <li>Late or missed payments may result in fees or account restrictions</li>
                  <li>You authorize automatic payments from your designated payment method</li>
                </ul>

                <h3 className="font-bold text-lg mb-3">For Merchants</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Merchants fund installment plans using their own capital</li>
                  <li>Platform fees apply as outlined in your merchant agreement</li>
                  <li>Merchants are responsible for customer service and dispute resolution</li>
                </ul>
              </motion.div>

              {/* Verification & Third Parties */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">6. Verification Services</h2>
                <p className="text-muted-foreground mb-4">
                  We use third-party providers to verify identity, creditworthiness, and bank account information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Persona:</strong> Identity verification and KYC</li>
                  <li><strong>Experian:</strong> Credit checks (soft pull)</li>
                  <li><strong>Plaid:</strong> Bank account verification</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  By using our services, you authorize us to share necessary information with these providers and 
                  consent to their processing of your data according to their respective privacy policies.
                </p>
              </motion.div>

              {/* Prohibited Activities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">7. Prohibited Activities</h2>
                <p className="text-muted-foreground mb-4">
                  You may not:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Provide false or misleading information</li>
                  <li>Use the service for fraudulent or illegal purposes</li>
                  <li>Attempt to circumvent security measures</li>
                  <li>Interfere with the proper functioning of the platform</li>
                  <li>Use automated systems to access the service without authorization</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </motion.div>

              {/* Intellectual Property */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">8. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  All content, features, and functionality of the Veridian platform are owned by Veridian Credit Systems 
                  and are protected by copyright, trademark, and other intellectual property laws. You may not copy, 
                  modify, distribute, or create derivative works without our express written permission.
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
                <h2 className="font-display text-2xl font-bold mb-4">9. Disclaimers</h2>
                <p className="text-muted-foreground mb-4">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR 
                  IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                  OR NON-INFRINGEMENT.
                </p>
                <p className="text-muted-foreground">
                  We do not guarantee that the service will be uninterrupted, secure, or error-free.
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
                <h2 className="font-display text-2xl font-bold mb-4">10. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, VERIDIAN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                  SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED 
                  DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
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
                <h2 className="font-display text-2xl font-bold mb-4">11. Dispute Resolution</h2>
                <p className="text-muted-foreground mb-4">
                  Any disputes arising from these Terms or your use of the service shall be resolved through binding 
                  arbitration in accordance with the rules of the American Arbitration Association.
                </p>
                <p className="text-muted-foreground">
                  You waive your right to participate in class action lawsuits or class-wide arbitration.
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
                <h2 className="font-display text-2xl font-bold mb-4">12. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these Terms at any time. We will notify you of material changes by 
                  posting the updated Terms on our website. Your continued use of the service after such changes 
                  constitutes acceptance of the new Terms.
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
                <h2 className="font-display text-2xl font-bold mb-4">13. Contact Information</h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> legal@veridian.com</p>
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

export default Terms;
