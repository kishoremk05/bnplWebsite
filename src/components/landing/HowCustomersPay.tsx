import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ShoppingBag, Plane, Receipt, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const smoothEasing = [0.16, 1, 0.3, 1] as const;

const categories = [
  { 
    id: "bills", 
    label: "Bills", 
    icon: Receipt,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1000&q=90",
    amount: "$90.00",
    description: "Service upgrade",
  },
  { 
    id: "travel", 
    label: "Travel", 
    icon: Plane,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1000&q=90",
    amount: "$450.00",
    description: "Weekend getaway",
  },
  { 
    id: "groceries", 
    label: "Groceries", 
    icon: ShoppingBag,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&q=90",
    amount: "$120.00",
    description: "Weekly shopping",
  },
  { 
    id: "shopping", 
    label: "Shopping", 
    icon: Store,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&q=90",
    amount: "$280.00",
    description: "New wardrobe",
  },
];

export function HowCustomersPay() {
  const [activeTab, setActiveTab] = useState("bills");
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const activeCategory = categories.find(c => c.id === activeTab) || categories[0];
  const paymentAmount = parseFloat(activeCategory.amount.replace('$', ''));
  const installment = (paymentAmount / 4).toFixed(2);

  return (
    <section ref={sectionRef} className="py-32 bg-gradient-to-b from-white via-[#FAFAFA] to-white relative overflow-hidden">
      {/* Premium background decorations */}
      <motion.div style={{ y }} className="absolute top-20 right-10 hidden lg:block">
        <div className="w-64 h-64 rounded-full bg-gradient-to-br from-emerald-200/40 to-amber-200/40" style={{ filter: 'blur(80px)' }} />
      </motion.div>
      <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [-30, 30]) }} className="absolute bottom-20 left-10 hidden lg:block">
        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-emerald-200/30 to-teal-200/30" style={{ filter: 'blur(60px)' }} />
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Premium Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: smoothEasing }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: smoothEasing }}
            className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-emerald-100 to-amber-100 rounded-full"
          >
            <span className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
              Payment Flexibility
            </span>
          </motion.div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            How customers are paying<br />with Veridian Credit Systems
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your category and see how easy it is to split payments
          </p>
        </motion.div>

        {/* Premium Tab Navigation */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: smoothEasing }}
        >
          <div className="inline-flex bg-white/80 backdrop-blur-xl rounded-full p-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`relative px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === category.id
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {activeTab === category.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 rounded-full shadow-lg"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <category.icon className="w-4 h-4" />
                  {category.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Premium Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Premium Payment Card */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: smoothEasing }}
            className="relative"
          >
            <div className="bg-white rounded-[32px] p-10 shadow-[0_20px_60px_rgb(0,0,0,0.08)] border border-gray-100 hover:shadow-[0_30px_80px_rgb(0,0,0,0.12)] transition-all duration-500">
              {/* Service Info */}
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                <motion.div 
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <activeCategory.icon className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{activeCategory.description}</p>
                  <p className="text-3xl font-bold text-foreground">{activeCategory.amount}</p>
                </div>
              </div>

              {/* Payment Schedule */}
              <p className="text-sm text-gray-500 mb-2">4 bi-weekly payments of</p>
              <motion.p 
                className="text-4xl font-bold text-foreground mb-8"
                key={`amount-${activeTab}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
              >
                ${installment}
              </motion.p>

              {/* Premium Payment Timeline */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((num) => (
                  <motion.div 
                    key={num} 
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: num * 0.1, duration: 0.4 }}
                  >
                    <div className="relative mb-3">
                      <div className={`w-full h-3 rounded-full ${num === 1 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gray-200'} shadow-sm`} />
                      {num === 1 && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground">${installment}</p>
                    <p className="text-xs text-gray-500">{num === 1 ? 'Today' : `${num} weeks`}</p>
                  </motion.div>
                ))}
              </div>

              {/* Premium CTA Button */}
              <Button 
                asChild
                className="w-full rounded-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 hover:from-yellow-500 hover:via-yellow-400 hover:to-yellow-500 text-black font-bold py-7 text-base shadow-[0_8px_30px_rgba(250,204,21,0.4)] hover:shadow-[0_12px_40px_rgba(250,204,21,0.6)] transition-all duration-300"
              >
                <Link to="/register">
                  <span className="relative z-10">Sign up now</span>
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Right: Premium Lifestyle Image */}
          <motion.div
            key={`image-${activeTab}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: smoothEasing }}
            className="relative h-[600px] rounded-[40px] overflow-hidden shadow-[0_30px_80px_rgb(0,0,0,0.15)] group"
          >
            <motion.img 
              src={activeCategory.image}
              alt={activeCategory.label}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl"
            >
              <p className="text-sm text-gray-600">Popular choice</p>
              <p className="text-2xl font-bold text-foreground">{activeCategory.label}</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}