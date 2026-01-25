import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { TrendingUp, Users, Zap, Shield, BarChart3, CreditCard, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const smoothEasing = [0.16, 1, 0.3, 1] as const;

const Merchants = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Up to 1.3x Higher Conversion",
      description: "Customers are more likely to complete purchases when flexible payment options are available.",
      stat: "Up to 1.3x",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: BarChart3,
      title: "Up to 25% Larger Baskets",
      description: "Shoppers spend more when they can split payments into manageable installments.",
      stat: "Up to 25%",
      color: "from-amber-500 to-amber-600"
    },
    {
      icon: Users,
      title: "Up to 30% Higher Repeat Purchases",
      description: "Build loyalty with customers who appreciate flexible payment options.",
      stat: "Up to 30%",
      color: "from-emerald-600 to-teal-600"
    }
  ];

  const features = [
    { icon: Zap, title: "Instant Integration", description: "Get started in minutes with our simple API or POS integrations" },
    { icon: Shield, title: "Risk-Free for You", description: "We handle verification and fraud prevention using industry-leading partners" },
    { icon: CreditCard, title: "Your Capital, Your Control", description: "Fund installment plans with your own capital and maintain full control" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-amber-50/30 py-20 relative overflow-hidden">
          <motion.div 
            className="absolute top-20 right-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: smoothEasing }}
              >
                <div className="inline-block mb-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-emerald-200 shadow-sm">
                  <span className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">For Merchants</span>
                </div>
                <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Boost Your Sales with{" "}
                  <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-600 bg-clip-text text-transparent">
                    Flexible Payments
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Offer your customers the convenience of paying over time and watch your conversion rates soar.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="rounded-full px-8 bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 text-white font-bold shadow-lg">
                    <Link to="/register">
                      Apply Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold">
                    <Link to="/contact">Contact Sales</Link>
                  </Button>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: smoothEasing }}
                className="relative"
              >
                <div className="bg-white rounded-3xl p-8 shadow-2xl border border-emerald-100">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-medium">Monthly Revenue</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">+30%</span>
                    </div>
                    <div className="h-48 bg-gradient-to-t from-emerald-100 to-amber-50/30 rounded-xl flex items-end justify-around p-4 gap-2">
                      {[40, 55, 70, 85, 95].map((height, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                          className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg shadow-lg"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl font-bold mb-4">Why Merchants Choose Veridian</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of merchants who are growing their business with flexible payment options
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: smoothEasing }}
                  className="bg-gradient-to-br from-emerald-50/50 to-amber-50/30 border border-emerald-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <benefit.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent mb-2">
                    {benefit.stat}
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gradient-to-b from-white to-emerald-50/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl font-bold mb-4">How Veridian Works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Simple integration, powerful results
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: smoothEasing }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Process */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl font-bold mb-4">Get Started in 3 Steps</h2>
            </motion.div>

            <div className="space-y-8">
              {[
                { step: "1", title: "Apply & Get Approved", description: "Complete our simple merchant application. Most merchants are approved within 24 hours." },
                { step: "2", title: "Integrate Your Platform", description: "Choose from our API or POS integrations. Our team will guide you through setup." },
                { step: "3", title: "Start Offering Flexible Payments", description: "Your customers can now split payments into 4 interest-free installments at checkout." }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: smoothEasing }}
                  className="flex gap-6 items-start"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-600 to-amber-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                    {item.step}
                  </div>
                  <div className="flex-1 bg-gradient-to-br from-emerald-50/50 to-amber-50/30 rounded-xl p-6 border border-emerald-100">
                    <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-emerald-600 via-emerald-500 to-amber-600">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
            >
              <h2 className="font-display text-4xl font-bold text-white mb-6">
                Ready to Grow Your Business?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join thousands of merchants offering flexible payments with Veridian
              </p>
              <Button asChild size="lg" className="rounded-full px-8 bg-white text-emerald-600 hover:bg-gray-100 font-bold shadow-lg">
                <Link to="/register">Apply to Become a Merchant</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Merchants;
