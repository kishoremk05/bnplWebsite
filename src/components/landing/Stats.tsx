import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Users, CreditCard, Clock, TrendingUp } from "lucide-react";

// Premium easing
const smoothEasing = [0.16, 1, 0.3, 1] as const;

const stats = [
  { 
    value: "500K+", 
    label: "Happy Customers", 
    icon: Users,
    color: "from-emerald-500 to-emerald-700",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=90",
  },
  { 
    value: "$10M+", 
    label: "Transactions", 
    icon: CreditCard,
    color: "from-emerald-600 to-teal-600",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=90",
  },
  { 
    value: "<30s", 
    label: "Approval Time", 
    icon: Clock,
    color: "from-emerald-500 to-green-600",
    image: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=400&q=90",
  },
  { 
    value: "99.1%", 
    label: "Satisfaction Rate", 
    icon: TrendingUp,
    color: "from-amber-500 to-orange-600",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=90",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: smoothEasing },
  },
};

export function Stats() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} className="py-32 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Premium background */}
      <motion.div style={{ y }} className="absolute top-10 right-16 hidden lg:block">
        <div className="w-72 h-72 rounded-full bg-gradient-to-br from-emerald-200/30 to-amber-200/30" style={{ filter: 'blur(100px)' }} />
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Premium header */}
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
              Trusted Worldwide
            </span>
          </motion.div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
            By the numbers
          </h2>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ 
                y: -12, 
                scale: 1.03,
                transition: { duration: 0.3, ease: smoothEasing } 
              }}
              className="group relative"
            >
              <div className="relative flex flex-col items-center p-8 bg-white rounded-3xl text-center overflow-hidden transition-all duration-500 shadow-lg hover:shadow-2xl border border-gray-100">
                {/* Premium background image on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-700">
                  <img 
                    src={stat.image}
                    alt={stat.label}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Premium icon */}
                <motion.div 
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-6 shadow-xl relative`}
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.6, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <stat.icon className="w-9 h-9 text-white relative z-10" />
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-md opacity-50`} />
                </motion.div>

                {/* Animated value with counter effect */}
                <motion.div 
                  className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.6, type: "spring", stiffness: 200 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>

                {/* Premium hover glow */}
                <div className={`absolute inset-0 bg-gradient-to-t ${stat.color.replace('from-', 'from-').replace('to-', 'to-')}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none`} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}