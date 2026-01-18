import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, QrCode, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

// Premium easing
const smoothEasing = [0.16, 1, 0.3, 1];

const footerLinks = {
  shoppers: [
    { label: "Products", href: "/products" },
    { label: "Request a demo", href: "/demo" },
    { label: "Case study", href: "/case-studies" },
    { label: "Blog", href: "/blog" },
  ],
  business: [
    { label: "Merchant Support", href: "/merchants/support" },
    { label: "Sell with Regal Pay", href: "/merchants" },
    { label: "Developers portal", href: "/developers" },
    { label: "Operational status", href: "/status" },
    { label: "Platforms and partners", href: "/partners" },
    { label: "Partner program", href: "/partner-program" },
  ],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: smoothEasing },
  },
};

export function Footer() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 1]);

  return (
    <footer ref={sectionRef} className="py-16 sm:py-24 relative overflow-hidden">
      {/* Parallax background image */}
      <motion.div style={{ y }} className="absolute top-16 left-8 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.08, scale: 1 }}
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
        {/* Footer Container */}
        <motion.div 
          className="gradient-footer rounded-[40px] p-8 sm:p-12 lg:p-16 relative overflow-hidden"
          style={{ opacity }}
          initial={{ y: 60 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: smoothEasing }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-200 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-blue-200 rounded-full blur-3xl" />
          </div>

          {/* Success image decoration */}
          <motion.div
            className="absolute top-8 right-12 w-20 h-20 rounded-2xl overflow-hidden shadow-lg hidden lg:block"
            initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
            whileInView={{ opacity: 0.8, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease: smoothEasing }}
          >
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&q=80"
              alt="Happy customers"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            className="relative text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: smoothEasing }}
          >
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Become one of our success stories
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.6, ease: smoothEasing }}
              className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg"
            >
              Join thousands of happy customers who are already enjoying flexible, interest-free payments.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, duration: 0.5, ease: smoothEasing }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg" 
                asChild 
                className="rounded-full px-8 bg-black hover:bg-black/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link to="/register">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Divider */}
          <motion.div 
            className="h-px bg-black/10 mb-12"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: smoothEasing }}
          />

          {/* Links Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 relative"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* For Shoppers */}
            <motion.div variants={itemVariants}>
              <h3 className="font-bold text-sm text-foreground mb-4">For Shoppers</h3>
              <ul className="space-y-3">
                {footerLinks.shoppers.map((link, i) => (
                  <motion.li 
                    key={link.label}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: smoothEasing }}
                  >
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 inline-block transition-all duration-300"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* For Business */}
            <motion.div variants={itemVariants}>
              <h3 className="font-bold text-sm text-foreground mb-4">For Business</h3>
              <ul className="space-y-3">
                {footerLinks.business.map((link, i) => (
                  <motion.li 
                    key={link.label}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.05, duration: 0.4, ease: smoothEasing }}
                  >
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 inline-block transition-all duration-300"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* QR Code */}
            <motion.div 
              className="flex flex-col items-start md:items-end"
              variants={itemVariants}
            >
              <motion.div 
                className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.3, ease: smoothEasing }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Scan to download</p>
                  <p className="text-xs text-muted-foreground">the Regal Pay app</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-black/10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6, ease: smoothEasing }}
          >
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: "https://instagram.com", hoverColor: "hover:bg-pink-100 hover:text-pink-600" },
                { icon: Twitter, href: "https://twitter.com", hoverColor: "hover:bg-blue-100 hover:text-blue-500" },
                { icon: Linkedin, href: "https://linkedin.com", hoverColor: "hover:bg-indigo-100 hover:text-indigo-600" },
              ].map((social, index) => (
                <motion.a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full bg-white flex items-center justify-center text-muted-foreground ${social.hoverColor} transition-all duration-300 shadow-sm hover:shadow-md`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.4, type: "spring" }}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Regal Pay. All Rights Reserved.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
