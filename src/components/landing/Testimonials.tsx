import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";

// Premium easing
const smoothEasing = [0.16, 1, 0.3, 1] as const;

const testimonials = [
  {
    quote: "Regal Pay made it so easy to manage my purchases. I love the flexibility of paying in 4 installments!",
    author: "Sarah Chen",
    role: "Product Designer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=90",
    rating: 5,
  },
  {
    quote: "The approval process was instant. No complicated forms, no waiting. Just quick and easy payments.",
    author: "Marcus Rodriguez",
    role: "Software Engineer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=90",
    rating: 5,
  },
  {
    quote: "I've recommended Regal Pay to all my friends. The app is beautiful and incredibly user-friendly.",
    author: "Emily Watson",
    role: "Marketing Manager",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=90",
    rating: 5,
  },
  {
    quote: "Finally, a BNPL service that doesn't charge hidden fees. Transparent and trustworthy.",
    author: "James Park",
    role: "Business Owner",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=90",
    rating: 5,
  },
  {
    quote: "The customer support team is amazing. They helped me set everything up in minutes.",
    author: "Lisa Thompson",
    role: "Freelance Designer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=90",
    rating: 5,
  },
  {
    quote: "I use Regal Pay for all my online shopping now. It's become an essential part of my routine.",
    author: "David Kim",
    role: "Content Creator",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=90",
    rating: 5,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
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

export function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} className="py-32 bg-gradient-to-b from-white via-purple-50/30 to-white relative overflow-hidden">
      {/* Premium background decoration */}
      <motion.div style={{ y }} className="absolute top-20 right-10 hidden lg:block">
        <div className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-200/40 to-pink-200/40" style={{ filter: 'blur(80px)' }} />
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Premium header */}
        <motion.div 
          className="text-center mb-20"
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
            className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full"
          >
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Customer Love
            </span>
          </motion.div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
            Customer testimonials
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: smoothEasing }}
            className="text-xl text-muted-foreground"
          >
            We love and grow with our clients 💙
          </motion.p>
        </motion.div>

        {/* Premium Masonry Grid */}
        <motion.div 
          className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              variants={cardVariants}
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                transition: { duration: 0.3, ease: smoothEasing } 
              }}
              className="break-inside-avoid group"
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden">
                {/* Premium gradient overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Premium rating */}
                <motion.div 
                  className="flex gap-1.5 mb-6"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.4, ease: smoothEasing }}
                >
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 + index * 0.05 + i * 0.05, duration: 0.4, type: "spring", stiffness: 200 }}
                    >
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Quote */}
                <blockquote className="text-foreground text-lg leading-relaxed mb-8 relative">
                  <span className="text-5xl text-purple-200 absolute -top-4 -left-2 font-serif">"</span>
                  <span className="relative">{testimonial.quote}</span>
                </blockquote>

                {/* Premium author section */}
                <div className="flex items-center gap-4 relative">
                  <motion.div 
                    className="relative w-14 h-14 rounded-full overflow-hidden shadow-lg ring-4 ring-purple-100 group-hover:ring-purple-200 transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img 
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <div>
                    <div className="font-semibold text-foreground text-lg">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>

                {/* Quote decoration */}
                <div className="absolute bottom-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="currentColor" className="text-purple-500">
                    <path d="M15 30C15 21.716 21.716 15 30 15V9C18.402 9 9 18.402 9 30V51H27V30H15ZM39 30C39 21.716 45.716 15 54 15V9C42.402 9 33 18.402 33 30V51H51V30H39Z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
