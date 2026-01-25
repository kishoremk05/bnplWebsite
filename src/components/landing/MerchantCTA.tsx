import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const smoothEasing = [0.16, 1, 0.3, 1] as const;

export function MerchantCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Subtle zoom effect
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1, 0.98]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.9]);

  return (
    <section id="merchant-cta" ref={sectionRef} className="py-32 bg-white relative overflow-hidden">
      {/* Premium background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/30 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="relative rounded-[48px] overflow-hidden min-h-[600px] shadow-[0_30px_90px_rgb(0,0,0,0.15)] border-4 border-emerald-200/50"
          style={{ scale, opacity }}
        >
          {/* Premium Background Image */}
          <div className="absolute inset-0">
            <motion.img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=90"
              alt="Boost your business"
              className="w-full h-full object-cover"
              style={{ scale: useTransform(scrollYProgress, [0, 1], [1.1, 1]) }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          </div>

          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 3) * 20}%`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Premium Content */}
          <div className="relative z-10 flex items-center min-h-[600px] p-12 sm:p-16 lg:p-20">
            <div className="max-w-2xl">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-8 border border-white/20"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-semibold text-white">For Merchants</span>
              </motion.div>

              <motion.h2
                className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1]"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: smoothEasing }}
              >
                Boost your business with Veridian Credit Systems
              </motion.h2>
              
              <motion.p
                className="text-xl sm:text-2xl text-white/90 mb-10 leading-relaxed font-light"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2, ease: smoothEasing }}
              >
                Grow your customers and Boost your sales and drive customer preference when you offer the convenience of paying over time.
              </motion.p>

              {/* Premium stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3, ease: smoothEasing }}
                className="grid grid-cols-3 gap-6 mb-10"
              >
                {[
                  { value: "Up to 1.3x", label: "Higher conversion" },
                  { value: "Up to 25%", label: "Larger baskets" },
                  { value: "Up to 30%", label: "Higher repeat purchases" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-sm text-white/70">{stat.label}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4, ease: smoothEasing }}
              >
                <Button 
                  asChild
                  size="lg"
                  className="rounded-full px-10 py-7 bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-lg shadow-[0_12px_40px_rgba(217,175,55,0.4)] hover:shadow-[0_16px_50px_rgba(217,175,55,0.6)] transition-all duration-300"
                >
                  <Link to="/merchants">
                    Become a Merchant
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Premium gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}