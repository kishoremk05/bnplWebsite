import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check, Sparkles, Zap, TrendingUp, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRef } from "react";

const smoothEasing = [0.16, 1, 0.3, 1] as const;

const Pricing = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const plans = [
    {
      name: "Single Store",
      price: "1.25",
      period: "per transaction",
      description: "Perfect for single merchant locations",
      features: [
        "Up to $50K monthly volume",
        "Standard verification",
        "Email support",
        "Basic analytics dashboard",
        "API access",
        "Same-day settlement"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Multiple Stores in One State",
      price: "1.25",
      period: "per transaction",
      description: "For merchants operating in one state",
      features: [
        "Up to $250K monthly volume",
        "Priority verification",
        "Priority email & chat support",
        "Advanced analytics + insights",
        "API access + webhooks",
        "Same-day settlement",
        "Custom branding options",
        "Dedicated account manager"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Multi State Operator",
      price: "1.25",
      period: "per transaction",
      description: "For multi-state merchant operations",
      features: [
        "Unlimited monthly volume",
        "White-label platform",
        "24/7 phone + email support",
        "Custom analytics & reporting",
        "Custom API integrations",
        "Instant settlement",
        "Multi-location support",
        "Dedicated success team"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const features = [
    { icon: Zap, title: "Instant Approval", description: "Get approved in minutes, not days" },
    { icon: Shield, title: "Built-in safeguards", description: "identity verification, fraud prevention and transaction monitoring" },
    { icon: TrendingUp, title: "Grow Revenue", description: "Increase sales by 30% on average" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24">
        {/* Hero Section with Emerald/Amber Gradient */}
        <section className="relative bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-amber-50/30 py-24 overflow-hidden">
          {/* Floating orbs - Emerald & Amber */}
          <motion.div 
            className="absolute top-20 right-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 left-20 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />

          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: smoothEasing }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-block mb-6 px-6 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-emerald-200 shadow-lg"
              >
                <span className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">Simple, Transparent Pricing</span>
              </motion.div>
              
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                Pricing that grows<br />
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-600 bg-clip-text text-transparent">
                  with your business
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
                No hidden fees. No surprises. Just straightforward pricing that scales.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Feature Pills */}
        <section className="py-12 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: smoothEasing }}
                  className="flex items-center gap-4 bg-gradient-to-br from-emerald-50 to-amber-50/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-emerald-100/50"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Cards - Emerald/Amber Theme */}
        <section ref={sectionRef} className="py-20 bg-gradient-to-b from-white to-emerald-50/30 relative overflow-hidden">
          {/* Background decoration */}
          <motion.div style={{ y }} className="absolute top-40 right-10 hidden lg:block">
            <div className="w-72 h-72 rounded-full bg-gradient-to-br from-amber-200/40 to-emerald-200/40" style={{ filter: 'blur(80px)' }} />
          </motion.div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: index * 0.15, ease: smoothEasing }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className={`relative rounded-[32px] p-8 ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-amber-50/30 border-2 border-emerald-300 shadow-2xl' 
                      : 'bg-white border border-gray-200 shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-emerald-600 to-amber-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                        <Sparkles className="w-4 h-4" />
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className="font-display text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                    
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
                        {plan.price}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.period}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    asChild 
                    className={`w-full rounded-full py-6 font-bold text-base ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 text-white shadow-lg' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <Link to={plan.cta === "Contact Sales" ? "/contact" : "/register"}>
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-4xl font-bold mb-4">Pricing FAQs</h2>
              <p className="text-muted-foreground">Common questions about our pricing</p>
            </motion.div>

            <div className="space-y-4">
              {[
                {
                  q: "Are there any setup fees or monthly minimums?",
                  a: "There are no setup fees. During the pilot, Veridian offers a discounted pilot license. Standard annual licensing applies after the pilot."
                },
                {
                  q: "When do I receive my funds?",
                  a: "You receive customer payments directly. Funds flow according to your existing payment setup and timing. Veridian does not hold, move or settle funds."
                },
                {
                  q: "What if a customer does not complete their payments?",
                  a: "You control the funding and the risk. Veridian provides eligibility tools, monitoring and audit logs."
                },
                {
                  q: "Can I switch plans later?",
                  a: "Yes. You can upgrade or change plans as your business needs evolve. Changes take effect at the start of the next billing period."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: smoothEasing }}
                  className="bg-gradient-to-br from-emerald-50/50 to-amber-50/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-emerald-100/50"
                >
                  <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Emerald/Amber Gradient */}
        <section className="py-20 bg-gradient-to-br from-emerald-600 via-emerald-500 to-amber-600 relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}
          />
          
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
            >
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
                Ready to grow your business?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join thousands of merchants offering flexible payments with Veridian
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-2 border-white text-white hover:bg-white/10 font-bold">
                  <Link to="/contact">Talk to Sales</Link>
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

export default Pricing;
