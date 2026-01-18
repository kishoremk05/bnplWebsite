import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ShoppingCart, UserCheck, CalendarCheck, CreditCard } from "lucide-react";

// Premium easing
const smoothEasing = [0.16, 1, 0.3, 1] as const;

const steps = [
  {
    icon: ShoppingCart,
    step: "01",
    title: "Shop and select Regal Pay",
    description: "Choose Regal Pay at checkout and select your preferred payment plan.",
    bgClass: "bg-pastel-peach",
    color: "from-orange-500 to-amber-600",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&q=80",
  },
  {
    icon: UserCheck,
    step: "02",
    title: "Get instant approval",
    description: "Our system verifies your identity in seconds with minimal friction.",
    bgClass: "bg-pastel-blue",
    color: "from-blue-500 to-indigo-600",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&q=80",
  },
  {
    icon: CalendarCheck,
    step: "03",
    title: "Pay in 4 installments",
    description: "Split your purchase into 4 equal, interest-free payments.",
    bgClass: "bg-pastel-green",
    color: "from-emerald-500 to-green-600",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&q=80",
  },
  {
    icon: CreditCard,
    step: "04",
    title: "Enjoy your purchase",
    description: "Receive your order immediately and pay over time comfortably.",
    bgClass: "bg-lavender",
    color: "from-purple-500 to-indigo-600",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80",
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

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: smoothEasing },
  },
};

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const lineScale = useTransform(scrollYProgress, [0.15, 0.5], [0, 1]);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 sm:py-32 bg-white relative overflow-hidden">
      {/* Parallax decorations */}
      <motion.div style={{ y }} className="absolute top-24 left-10 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: smoothEasing }}
          className="w-24 h-24 rounded-2xl overflow-hidden"
        >
          <img 
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=80"
            alt="Decoration"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: smoothEasing }}
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            How Regal Pay Works
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: smoothEasing }}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            A seamless checkout experience that lets you buy now and pay later with ease.
          </motion.p>
        </motion.div>

        {/* Animated connection line */}
        <div className="hidden lg:block absolute top-[340px] left-[12%] right-[12%] h-0.5 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-orange-300 via-blue-300 via-green-300 to-purple-300"
            style={{ scaleX: lineScale, transformOrigin: "left" }}
          />
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              variants={cardVariants}
              whileHover={{ 
                y: -12, 
                scale: 1.02,
                transition: { duration: 0.3, ease: smoothEasing } 
              }}
              className="group"
            >
              <div className={`relative p-6 rounded-2xl ${step.bgClass} overflow-hidden min-h-[300px] transition-shadow duration-500 hover:shadow-2xl`}>
                {/* Step number badge */}
                <motion.span 
                  className={`absolute top-4 left-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${step.color} text-white text-sm font-bold shadow-lg`}
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.12, duration: 0.5, type: "spring" }}
                >
                  {step.step}
                </motion.span>

                {/* Floating image */}
                <motion.div
                  className="absolute -top-4 -right-4 w-24 h-24 rounded-2xl overflow-hidden shadow-xl"
                  initial={{ opacity: 0, scale: 0.5, rotate: 15 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: smoothEasing }}
                >
                  <img 
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
                </motion.div>

                {/* Icon */}
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mt-12 mb-4 shadow-md"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <step.icon className="w-6 h-6 text-foreground" />
                </motion.div>

                {/* Content */}
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
