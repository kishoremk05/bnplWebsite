import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Premium easing
const smoothEasing = [0.16, 1, 0.3, 1] as const;

const features = [
  {
    title: "Brands & discounts you love",
    description: "Access exclusive deals and discounts from your favorite brands when you pay with Regal Pay.",
    badge: "Recommended",
    bgClass: "bg-pastel-peach",
    image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=400&q=80",
  },
  {
    title: "Smooth, secure registration",
    description: "Get approved in seconds with our secure verification process. No complex paperwork needed.",
    badge: "10x Faster",
    bgClass: "bg-pastel-blue",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80",
  },
  {
    title: "No late fees, hassle-free",
    description: "Enjoy flexible payments without worrying about late fees. We've got your back.",
    badge: null,
    bgClass: "bg-pastel-green",
    hasAction: true,
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.7, 
      ease: smoothEasing,
    },
  },
};

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section id="features" ref={sectionRef} className="py-24 sm:py-32 bg-white relative overflow-hidden">
      {/* Parallax floating images */}
      <motion.div style={{ y }} className="absolute top-20 left-8 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.15, scale: 1 }}
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

      <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [40, -80]) }} className="absolute bottom-32 right-12 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.15, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: smoothEasing }}
          className="w-20 h-20 rounded-xl overflow-hidden"
        >
          <img 
            src="https://images.unsplash.com/photo-1556742400-b5b7c512f252?w=200&q=80"
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
            Flexible, hassle-free payments
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: smoothEasing }}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Split your purchases into 4 interest-free payments. Simple, transparent, and designed for you.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ 
                y: -12, 
                scale: 1.02,
                transition: { duration: 0.3, ease: smoothEasing } 
              }}
              className="group"
            >
              <div className={`relative p-8 rounded-[32px] ${feature.bgClass} overflow-hidden min-h-[380px] transition-shadow duration-500 hover:shadow-2xl`}>
                {/* Floating image */}
                <motion.div
                  className="absolute -top-6 -right-6 w-28 h-28 rounded-2xl overflow-hidden shadow-xl"
                  initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: smoothEasing }}
                >
                  <img 
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>

                {/* Badge */}
                {feature.badge && (
                  <motion.div 
                    className="absolute top-6 left-6"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.5, ease: smoothEasing }}
                  >
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-foreground shadow-sm">
                      ✨ {feature.badge}
                    </span>
                  </motion.div>
                )}

                {/* Content */}
                <div className="mt-20 relative z-10">
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Action Button */}
                  {feature.hasAction && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button 
                        asChild 
                        className="rounded-full px-6 bg-black hover:bg-black/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Link to="/register">
                          Get the App
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </motion.div>
                  )}
                </div>

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px] pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
