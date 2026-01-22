import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

const smoothEasing = [0.16, 1, 0.3, 1] as const;

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = {
    shoppers: [
      { q: "How does Veridian work?", a: "Veridian allows you to split your purchase into 4 equal, interest-free payments. Pay 25% at checkout, then the remaining 75% over 6 weeks." },
      { q: "Is there a credit check?", a: "We perform a soft credit check that won't affect your credit score. This helps us verify your eligibility without impacting your credit." },
      { q: "What do I need to sign up?", a: "You'll need to be 18+, have a valid ID, a US bank account, and a debit or credit card." },
      { q: "Are there any fees?", a: "No! Veridian is completely free for shoppers when you pay on time. There are no interest charges or hidden fees." },
      { q: "What happens if I miss a payment?", a: "We'll send you reminders before each payment is due. If you miss a payment, please contact us immediately to avoid any late fees." }
    ],
    merchants: [
      { q: "How much does it cost?", a: "Pricing starts at 2.9% per transaction with no setup fees or monthly minimums. Enterprise pricing is available for high-volume merchants." },
      { q: "How quickly can I get started?", a: "Most merchants are approved within 24 hours. Integration typically takes 1-2 days depending on your platform." },
      { q: "Do I get paid upfront?", a: "Yes! You receive the full payment amount upfront, minus our fee. We handle collections from the customer." },
      { q: "What if a customer doesn't pay?", a: "You're protected. We assume the risk of non-payment, so you always get paid regardless of whether the customer completes their payment plan." },
      { q: "Can I customize the payment experience?", a: "Yes! Enterprise customers can white-label the experience and customize branding to match their store." }
    ],
    security: [
      { q: "Is my data safe?", a: "Absolutely. We use bank-level encryption and work with industry-leading partners (Persona, Experian, Plaid) to protect your information." },
      { q: "What data does Veridian store?", a: "We only store verification results and transaction logs. Sensitive data like ID images, credit reports, and bank credentials are stored securely by our third-party partners." },
      { q: "How is my identity verified?", a: "We use Persona for identity verification. They securely store your ID images and personal information - we only receive a pass/fail result." },
      { q: "Can I delete my account?", a: "Yes. You can request account deletion at any time by contacting our support team at privacy@veridian.com." }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-amber-50/30 py-20 relative overflow-hidden">
          <motion.div 
            className="absolute top-20 right-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: smoothEasing }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mb-6 shadow-lg">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground mb-6">
                Frequently Asked <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-600 bg-clip-text text-transparent">Questions</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Find answers to common questions about Veridian
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* For Shoppers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="mb-16"
            >
              <h2 className="font-display text-3xl font-bold mb-8">For Shoppers</h2>
              <div className="space-y-4">
                {faqs.shoppers.map((faq, index) => (
                  <div key={index} className="bg-gradient-to-br from-emerald-50/50 to-amber-50/30 border border-emerald-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <button
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/50 transition-colors"
                    >
                      <span className="font-semibold">{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-emerald-600 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                    </button>
                    {openIndex === index && (
                      <div className="px-6 pb-4 bg-white/50">
                        <p className="text-muted-foreground">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* For Merchants */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="mb-16"
            >
              <h2 className="font-display text-3xl font-bold mb-8">For Merchants</h2>
              <div className="space-y-4">
                {faqs.merchants.map((faq, index) => {
                  const actualIndex = index + faqs.shoppers.length;
                  return (
                    <div key={actualIndex} className="bg-gradient-to-br from-emerald-50/50 to-amber-50/30 border border-emerald-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <button
                        onClick={() => setOpenIndex(openIndex === actualIndex ? null : actualIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/50 transition-colors"
                      >
                        <span className="font-semibold">{faq.q}</span>
                        <ChevronDown className={`w-5 h-5 text-emerald-600 transition-transform ${openIndex === actualIndex ? 'rotate-180' : ''}`} />
                      </button>
                      {openIndex === actualIndex && (
                        <div className="px-6 pb-4 bg-white/50">
                          <p className="text-muted-foreground">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Security & Privacy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
            >
              <h2 className="font-display text-3xl font-bold mb-8">Security & Privacy</h2>
              <div className="space-y-4">
                {faqs.security.map((faq, index) => {
                  const actualIndex = index + faqs.shoppers.length + faqs.merchants.length;
                  return (
                    <div key={actualIndex} className="bg-gradient-to-br from-emerald-50/50 to-amber-50/30 border border-emerald-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <button
                        onClick={() => setOpenIndex(openIndex === actualIndex ? null : actualIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/50 transition-colors"
                      >
                        <span className="font-semibold">{faq.q}</span>
                        <ChevronDown className={`w-5 h-5 text-emerald-600 transition-transform ${openIndex === actualIndex ? 'rotate-180' : ''}`} />
                      </button>
                      {openIndex === actualIndex && (
                        <div className="px-6 pb-4 bg-white/50">
                          <p className="text-muted-foreground">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 bg-gradient-to-br from-emerald-600 via-emerald-500 to-amber-600">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
            >
              <h2 className="font-display text-3xl font-bold mb-4 text-white">
                Still have questions?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Our support team is here to help
              </p>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-emerald-600 hover:bg-gray-100 font-semibold rounded-full transition-colors shadow-lg"
              >
                Contact Support
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
