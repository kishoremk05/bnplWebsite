import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, QrCode, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

// Premium easing function (Expo.out style)
const smoothEasing = [0.16, 1, 0.3, 1] as const;

// Animation variants with premium timing
const fadeSlideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.7, 
      delay,
      ease: smoothEasing,
    },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.6, 
      delay,
      ease: smoothEasing,
    },
  }),
};

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Subtle parallax for depth (not sticky)
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -30]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="gradient-lavender rounded-[48px] p-10 sm:p-14 lg:p-20 relative overflow-hidden shadow-[0_30px_90px_rgb(0,0,0,0.12)]">
          {/* Premium blended background image with parallax */}
          <motion.div 
            style={{ y: y1 }}
            className="absolute inset-0 opacity-30 will-change-transform"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#EAEAFF] via-[#E5E5FF]/70 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=90"
              alt="Shopping experience"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </motion.div>

          {/* Premium glow effects */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-white/50 to-purple-200/30 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" style={{ filter: 'blur(100px)' }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/30 to-white/40 rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" style={{ filter: 'blur(80px)' }} />

          <div className="relative grid lg:grid-cols-2 gap-16 items-center z-10">
            {/* Left Content - Enhanced */}
            <div>
              {/* Premium rating badge */}
              <motion.div
                variants={fadeSlideUp}
                initial="hidden"
                animate="visible"
                custom={0}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/95 backdrop-blur-md rounded-full mb-8 shadow-xl border border-white/50"
              >
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm font-bold text-foreground">4.9 Rating</span>
                <span className="text-xs text-muted-foreground">• 50K+ reviews</span>
              </motion.div>

              {/* Premium headline with gradient */}
              <motion.h1
                variants={fadeSlideUp}
                initial="hidden"
                animate="visible"
                custom={0.1}
                className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] text-balance mb-8"
              >
                Elevate your{" "}
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  shopping experience
                </span>
              </motion.h1>

              {/* Enhanced subheadline */}
              <motion.p
                variants={fadeSlideUp}
                initial="hidden"
                animate="visible"
                custom={0.2}
                className="text-xl sm:text-2xl text-muted-foreground max-w-xl mb-10 leading-relaxed font-light"
              >
                Get more flexibility to shop the things you love—and split your payments into 4 smaller installments with Veridian Credit Systems.
              </motion.p>

              {/* Premium CTA Buttons */}
              <motion.div
                variants={fadeSlideUp}
                initial="hidden"
                animate="visible"
                custom={0.3}
                className="flex flex-wrap gap-4 mb-12"
              >
                <Button 
                  size="lg" 
                  asChild 
                  className="rounded-full px-10 py-7 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.3)] hover:scale-[1.02] text-base font-bold"
                >
                  <Link to="/register">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  asChild 
                  className="rounded-full px-10 py-7 hover:scale-[1.02] bg-white/90 backdrop-blur-md border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-lg text-base font-semibold"
                >
                  <Link to="/#how-it-works">
                    Learn More
                  </Link>
                </Button>
              </motion.div>

              {/* Premium QR Code Section */}
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                custom={0.5}
                className="relative inline-flex items-center gap-4 p-5 bg-white/95 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-white/50"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <QrCode className="w-11 h-11 text-white" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">Scan to download</p>
                  <p className="text-sm text-muted-foreground">Get the Veridian Credit Systems app instantly</p>
                </div>
              </motion.div>
            </div>

            {/* Right Content - Enhanced Phone Mockup */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              custom={0.3}
              className="flex justify-center lg:justify-end perspective-1000 relative"
            >
              <motion.div 
                style={{ y: y2 }}
                className="relative w-80 sm:w-96 will-change-transform"
                whileHover={{ scale: 1.02, rotate: 1 }}
                transition={{ duration: 0.3, ease: smoothEasing }}
              >
                {/* Premium multi-layer shadow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-[48px] -z-10" style={{ filter: 'blur(50px)' }} />
                <div className="absolute inset-0 bg-purple-400/10 rounded-[48px] -z-20 scale-110" style={{ filter: 'blur(60px)' }} />
                
                {/* Premium Phone Frame */}
                <div className="bg-white rounded-[48px] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.2)] border-4 border-white/50">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[40px] p-8 aspect-[9/18] flex flex-col overflow-hidden relative">
                    {/* Premium blended background */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent z-10" />
                      <img 
                        src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=90"
                        alt="Shopping"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Phone Header */}
                    <div className="relative flex items-center justify-between mb-8">
                      <span className="text-white text-base font-semibold">Veridian Credit Systems</span>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/60" />
                      </div>
                    </div>
                    
                    {/* Phone Content */}
                    <div className="relative flex-1 flex flex-col justify-center items-center text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.7, type: "spring", stiffness: 200 }}
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-5 shadow-2xl relative"
                      >
                        <span className="text-white text-3xl font-bold">4x</span>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full blur-lg opacity-50 -z-10" />
                      </motion.div>
                      <h3 className="text-white text-2xl font-bold mb-2">Pay in 4</h3>
                      <p className="text-white/80 text-base mb-8">Split into 4 interest-free payments</p>
                      
                      {/* Premium Payment Steps */}
                      <div className="w-full space-y-3">
                        {[1, 2, 3, 4].map((num) => (
                          <motion.div 
                            key={num} 
                            className="flex items-center gap-4 bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/10"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ 
                              duration: 0.4, 
                              delay: 0.8 + num * 0.1,
                              ease: smoothEasing,
                            }}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${num === 1 ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' : 'bg-white/25 text-white'}`}>
                              {num === 1 ? <Check className="w-5 h-5" /> : num}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-white text-sm font-semibold">Payment {num}</div>
                              <div className="text-white/70 text-xs">$25.00</div>
                            </div>
                            <div className={`text-sm font-semibold ${num === 1 ? 'text-green-300' : 'text-white/60'}`}>
                              {num === 1 ? 'Paid' : `Week ${num}`}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Premium Confirm Button */}
                    <motion.div 
                      className="relative mt-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 1.3, ease: smoothEasing }}
                    >
                      <div className="bg-white text-black rounded-full py-4 px-8 text-center font-bold shadow-xl">
                        Confirm Purchase
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Premium Floating notification */}
                <motion.div
                  style={{ y: y3 }}
                  initial={{ opacity: 0, scale: 0.8, x: -50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.4, ease: smoothEasing }}
                  className="absolute -left-8 top-1/3 bg-white rounded-3xl shadow-2xl p-4 hidden sm:block border-4 border-white/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-4 ring-green-100">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=90"
                        alt="User"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground flex items-center gap-1">
                        Approved! 
                        <span className="text-green-600 text-lg">✓</span>
                      </p>
                      <p className="text-xs text-muted-foreground">Just now</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
