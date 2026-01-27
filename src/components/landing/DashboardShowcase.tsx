import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, TrendingUp, PieChart, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Premium easing
const smoothEasing = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: smoothEasing },
  },
};

export function DashboardShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Optimized parallax (reduced range)
  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 bg-white relative overflow-hidden">
      {/* Optimized parallax background with higher quality images */}
      <motion.div style={{ y: y1 }} className="absolute top-16 left-8 hidden lg:block opacity-10 will-change-transform">
        <div className="w-24 h-24 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=90"
            alt="Analytics"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </motion.div>

      <motion.div style={{ y: y2 }} className="absolute bottom-24 right-12 hidden lg:block opacity-10 will-change-transform">
        <div className="w-28 h-28 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=90"
            alt="Dashboard"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: smoothEasing }}
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Split up your payments
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5, ease: smoothEasing }}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Track your spending, manage payments, and stay in control of your finances.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Dashboard Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10, scale: 1.01, transition: { duration: 0.2, ease: smoothEasing } }}
            className="relative bg-pastel-blue rounded-[32px] p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Higher quality blended corner image */}
            <motion.div
              className="absolute -top-6 -right-6 w-32 h-32 rounded-2xl overflow-hidden shadow-lg"
              initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5, ease: smoothEasing }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200/70 via-indigo-200/50 to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&q=90"
                alt="Finance"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total payments</p>
                <motion.h3 
                  className="font-display text-4xl font-bold text-foreground"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.4, type: "spring", stiffness: 200 }}
                >
                  $6.4K
                </motion.h3>
              </div>
              <motion.div 
                className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.4, ease: smoothEasing }}
              >
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">+12%</span>
              </motion.div>
            </div>

            {/* Stats Grid with optimized shadows */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Assets", value: "$2.1K", icon: Wallet, color: "from-blue-500 to-indigo-600", delay: 0.35 },
                { label: "Spending", value: "$1.8K", icon: PieChart, color: "from-purple-500 to-violet-600", delay: 0.45 },
                { label: "Saved", value: "$2.5K", icon: TrendingUp, color: "from-emerald-500 to-green-600", delay: 0.55 },
              ].map((stat) => (
                <motion.div 
                  key={stat.label}
                  className="relative bg-white rounded-2xl p-4 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: stat.delay, duration: 0.4, ease: smoothEasing }}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Animated Chart */}
            <motion.div 
              className="bg-white rounded-2xl p-6 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.4, ease: smoothEasing }}
            >
              <h4 className="font-semibold text-foreground mb-4">Allocation</h4>
              <div className="flex items-center justify-center gap-6">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="45" fill="none" stroke="#E0F2FF" strokeWidth="16" />
                    <motion.circle
                      cx="56"
                      cy="56"
                      r="45"
                      fill="none"
                      stroke="url(#chartGradient)"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray="283"
                      initial={{ strokeDashoffset: 283 }}
                      whileInView={{ strokeDashoffset: 85 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.7, ease: smoothEasing }}
                    />
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-foreground">70%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-600" />
                    <span className="text-sm text-muted-foreground">Shopping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-200" />
                    <span className="text-sm text-muted-foreground">Savings</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Shop In-Store Card with higher quality blended image */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10, scale: 1.01, transition: { duration: 0.2, ease: smoothEasing } }}
            className="relative rounded-[32px] overflow-hidden min-h-[520px] shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            {/* Higher quality blended background image */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/75 to-gray-900/50 z-10" />
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=90"
                alt="Shopping in store"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="relative z-10 p-8 lg:p-10 h-full flex flex-col justify-between">
              <div>
                <motion.h3 
                  className="font-display text-2xl lg:text-3xl font-bold text-white mb-4 drop-shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5, ease: smoothEasing }}
                >
                  Shop in-store with Veridian Credit Systems!
                </motion.h3>
                <motion.p 
                  className="text-white/90 mb-8 max-w-sm text-lg drop-shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5, ease: smoothEasing }}
                >
                  Use Veridian Credit Systems at your favorite local dispensary. Split payments over time.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5, ease: smoothEasing }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    asChild 
                    className="rounded-full px-8 bg-white hover:bg-white/90 text-black font-semibold shadow-lg"
                  >
                    <Link to="/register">
                      Get the App
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}