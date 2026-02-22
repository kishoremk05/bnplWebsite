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
                Effective Date: [Insert Date]
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
                          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: smoothEasing }} className="mb-12">
                            <pre className="whitespace-pre-wrap text-muted-foreground text-base">
            {`
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
                  <li>Maintaining the confidentiality of account credentials.</li>
                  <li>All activity conducted through your account.</li>
                  <li>Promptly notifying Veridian of any unauthorized access.</li>
                  <li>Ensuring account information remains accurate and current.</li>
                </ul>
                <p className="text-muted-foreground">
                  Veridian may suspend or terminate access if account security is compromised or if misuse is suspected.
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
                  <li>Installment plans are offered and approved solely by merchants.</li>
                  <li>Payment schedules and terms are determined by merchants.</li>
                  <li>You agree to make payments according to the agreed schedule.</li>
                  <li>Failure to complete payments may result in merchant-imposed restrictions, including suspension of installment privileges, subject to applicable law.</li>
                  <li>Veridian does not collect interest and does not report to credit bureaus.</li>
                </ul>

                <h3 className="font-bold text-lg mb-3">For Merchants</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Merchants fund installment plans using their own capital.</li>
                  <li>Platform fees are governed by a separate merchant agreement.</li>
                  <li>Merchants are responsible for customer service, refunds and dispute resolution.</li>
                  <li>Veridian does not handle customer funds.</li>
                </ul>
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
                  <strong>Veridian receives limited verification outcomes and eligibility signals only. Veridian does not store bank login credentials, full credit reports or government identification images.</strong>
                </p>
              </motion.div>

              {/* No Financial or Legal Advice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">NO FINANCIAL OR LEGAL ADVICE</h2>
                <p className="text-muted-foreground">
                  The Services are provided for operational and transactional support only. Nothing provided by Veridian constitutes financial, legal, tax or regulatory advice. Merchants are solely responsible for determining their own compliance obligations and business practices.
                </p>
              </motion.div>

              {/* No Regulatory Approval */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">NO REGULATORY APPROVAL</h2>
                <p className="text-muted-foreground">
                  Use of the Services does not imply approval, endorsement or authorization by any governmental or regulatory authority. Merchants are solely responsible for ensuring compliance with applicable laws and regulations.
                </p>
              </motion.div>

              {/* Prohibited Use */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
                            </pre>
                          </motion.div>
                        </div>
                      </div>
                    </section>
                  </main>
                  <Footer />
                </div>
              );
              >
                <h2 className="font-display text-2xl font-bold mb-4">PROHIBITED USE</h2>
                <p className="text-muted-foreground mb-4">
                  You may not:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Provide false or misleading information.</li>
                  <li>Use the Services for unlawful or fraudulent purposes.</li>
                  <li>Attempt to bypass security controls.</li>
                  <li>Interfere with system integrity or availability.</li>
                  <li>Use automated tools without authorization.</li>
                  <li>Violate applicable laws or regulations.</li>
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
                  All software, content and materials provided through the Services are owned by Veridian Credit Systems, Inc. or its licensors and are protected by intellectual property laws. No rights are granted except as expressly stated. Unauthorized use is prohibited.
                </p>
              </motion.div>

              {/* Service Modification and Suspension */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">SERVICE MODIFICATION AND SUSPENSION</h2>
                <p className="text-muted-foreground">
                  Veridian may modify, suspend or discontinue any aspect of the Services at any time for operational, security, compliance or legal reasons, with or without notice.
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
                  THE SERVICES ARE PROVIDED AS IS AND AS AVAILABLE. VERIDIAN DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.
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
                  VERIDIAN'S TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNTS PAID TO VERIDIAN IN THE PRECEDING TWELVE MONTHS.
                </p>
              </motion.div>

              {/* Force Majeure */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">FORCE MAJEURE</h2>
                <p className="text-muted-foreground">
                  Veridian shall not be liable for delays or failures caused by events beyond its reasonable control, including governmental actions, regulatory changes, network outages or third-party service disruptions.
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

              {/* Governing Law */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-4">GOVERNING LAW</h2>
                <p className="text-muted-foreground">
                  These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to conflict of law principles.
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
                  Veridian may update these Terms from time to time. Material changes will be posted on the website. Continued use of the Services after changes constitutes acceptance of the revised Terms.
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
                <div className="space-y-2 text-muted-foreground">
                  <p>Veridian Credit Systems, Inc.</p>
                  <p>Email: <strong>support@veridiancreditsystems.com</strong></p>
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
