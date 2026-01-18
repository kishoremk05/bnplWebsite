import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const smoothEasing = [0.16, 1, 0.3, 1] as const;

export function HeroWithZoom() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Zoom IN effect as you scroll (diving into the image)
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.3]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [0.3, 0.5, 0.7]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-[#EAEAFF] to-[#E5E5FF]">
      {/* Zooming Background Image */}
      <motion.div 
        className="absolute inset-0 will-change-transform"
        style={{ scale, opacity: imageOpacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#EAEAFF]/80 via-[#E5E5FF]/60 to-[#EAEAFF]/80 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=90"
          alt="Shopping experience"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Content that fades out as you scroll */}
      <motion.div 
        className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full text-center"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: smoothEasing }}
          className="mb-6"
        >
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
            Pay later<br />where you want
          </h1>
        </motion.div>

        {/* Rating badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: smoothEasing }}
          className="flex justify-center gap-8 mb-12"
        >
          {[
            { rating: "4.9 ★", platform: "App Store" },
            { rating: "4.8 ★", platform: "Google Play" },
            { rating: "4.7 ★", platform: "Trustpilot" },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold text-purple-600">{item.rating}</p>
              <p className="text-sm text-gray-700">{item.platform}</p>
            </div>
          ))}
        </motion.div>

        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: smoothEasing }}
          className="relative inline-block"
        >
          <div className="w-72 sm:w-80 mx-auto bg-white rounded-[40px] p-3 shadow-2xl">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[32px] p-6 aspect-[9/18] relative overflow-hidden">
              {/* Phone content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <p className="text-sm mb-2">Hi there, Alex</p>
                <p className="text-xs text-white/70 mb-8">Pay a little upfront. The rest<br />as it suits you most easy.</p>
                
                {/* Store icons */}
                <div className="flex gap-3 mb-8">
                  {['amazon', 'walmart', 'target', 'bestbuy'].map((store, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm" />
                  ))}
                </div>

                {/* Sign up button */}
                <div className="w-full max-w-[200px] bg-gradient-to-r from-yellow-300 to-yellow-400 text-black rounded-full py-3 px-6 text-center font-bold">
                  Sign up
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
