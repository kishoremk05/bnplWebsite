import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone, MapPin, Twitter, Linkedin, Instagram, Facebook } from "lucide-react";

const footerLinks = {
  product: [
    { label: "How It Works", href: "/#how-it-works" },
    { label: "For Merchants", href: "/merchants" },
    { label: "Pricing", href: "/pricing" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Pilot Program", href: "/pilot" },
    { label: "Trust & Compliance", href: "/trust" },
    { label: "Contact", href: "/contact" },
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "Help Center", href: "/help" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com" },
  { icon: Linkedin, href: "https://linkedin.com" },
  { icon: Instagram, href: "https://instagram.com" },
  { icon: Facebook, href: "https://facebook.com" },
];

export function Footer() {
  return (
    <footer className="bg-slate-900">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Stay in the loop
              </h3>
              <p className="text-slate-400">
                Get the latest updates about new features and promotions.
              </p>
            </div>
            <div className="flex gap-4 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-80 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2">
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img 
                src="/VeridianCreditSystemsLogo.jpg" 
                alt="Veridian Credit Systems" 
                className="h-12 w-12 rounded-xl object-cover"
              />
              <span className="font-bold text-xl text-white">
                Veridian
              </span>
            </Link>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Making flexible payments simple and accessible. 
              Shop now, pay later with zero interest.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a href="mailto:support@veridiancreditsystems.com" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm">
                <Mail className="w-4 h-4" />
                support@veridiancreditsystems.com
              </a>
              <a href="tel:1-800-VERIDIAN" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm">
                <Phone className="w-4 h-4" />
                1-800-VERIDIAN
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Compliance Disclaimer */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center max-w-4xl mx-auto leading-relaxed">
            Veridian Credit Systems provides software that enables merchants to offer installment payment options using their own capital. Veridian does not extend credit, underwrite consumers or act as a lender.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-center items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Veridian Credit Systems. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
