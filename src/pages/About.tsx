import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Target, Heart, Shield, Users, TrendingUp, Award } from "lucide-react";

const smoothEasing = [0.16, 1, 0.3, 1] as const;

const About = () => {
  const values = [
    { icon: Target, title: "Customer-First", description: "We believe everyone deserves access to flexible payment options", color: "from-emerald-500 to-emerald-600" },
    { icon: Shield, title: "Trust & Transparency", description: "We're committed to protecting your data and being transparent about how we operate", color: "from-amber-500 to-amber-600" },
    { icon: Heart, title: "Merchant Success", description: "Your growth is our success. We're here to help you thrive", color: "from-emerald-600 to-teal-600" },
    { icon: Users, title: "Partnership", description: "We work with industry-leading partners to provide the best service possible", color: "from-amber-600 to-orange-600" }
  ];

  const stats = [
    { value: "Early access", label: "Merchants", icon: Users },
    { value: "Transaction activity", label: "Monitored", icon: TrendingUp },
    { value: "Built for", label: "Reliability", icon: Award }
  ];

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
              <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground mb-6">
                About <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-600 bg-clip-text text-transparent">Veridian Credit Systems</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Payment flexibility, built for regulated retail
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
            >
              <h2 className="font-display text-3xl font-bold mb-6 text-center">Our Mission</h2>
              <div className="bg-gradient-to-br from-emerald-50/50 to-amber-50/30 rounded-2xl p-8 border border-emerald-100">
                <p className="text-lg text-muted-foreground leading-relaxed text-center">
                  Veridian Credit Systems empowers merchants in regulated industries to offer flexible installment 
                  payments with clarity and control. We deliver software that supports responsible payment options 
                  while keeping funding, risk and compliance in the hands of the merchant.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-20 bg-gradient-to-b from-white to-emerald-50/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-6 text-center">What We Do</h2>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-100"
              >
                <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  Software Platform, Not a Lender
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Veridian Credit Systems provides software that enables merchants to offer installment payment 
                  options using their own capital. <strong>We do not extend credit, underwrite consumers or act as a lender.</strong>
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Instead, we provide the technology infrastructure that allows merchants to manage payment plans, 
                  verify customer eligibility and process transactions seamlessly.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1, ease: smoothEasing }}
                className="bg-gradient-to-br from-emerald-50/50 to-amber-50/30 rounded-2xl p-8 border border-emerald-100"
              >
                <h3 className="font-display text-xl font-bold mb-4">Trusted Partners</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We work with industry-leading partners to ensure security and compliance:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Persona</strong> for identity verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Experian</strong> for credit checks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Plaid</strong> for bank verification</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">Our Values</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: smoothEasing }}
                  className="bg-gradient-to-br from-emerald-50/50 to-amber-50/30 border border-emerald-100 rounded-2xl p-8 hover:shadow-lg transition-shadow"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-gradient-to-br from-emerald-600 via-emerald-500 to-amber-600">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 text-center text-white">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: smoothEasing }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
                >
                  <stat.icon className="w-12 h-12 mx-auto mb-4 text-white" />
                  <div className="text-5xl font-bold mb-2">{stat.value}</div>
                  <div className="text-white/90">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
