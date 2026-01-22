import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Search, BookOpen, MessageCircle, CreditCard, Users, Shield, Zap, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";

const smoothEasing = [0.16, 1, 0.3, 1] as const;

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: CreditCard,
      title: "Getting Started",
      description: "Learn the basics of using Veridian",
      articles: [
        "How to create an account",
        "Making your first purchase",
        "Understanding payment plans",
        "Setting up payment methods"
      ],
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Users,
      title: "For Merchants",
      description: "Everything you need to know as a merchant",
      articles: [
        "Merchant onboarding guide",
        "Integration options",
        "Managing customer applications",
        "Understanding payouts"
      ],
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "How we protect your information",
      articles: [
        "Data security measures",
        "Privacy policy explained",
        "Identity verification process",
        "Managing your data"
      ],
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Zap,
      title: "Troubleshooting",
      description: "Common issues and solutions",
      articles: [
        "Payment failed - what to do",
        "Account access issues",
        "Application declined reasons",
        "Updating payment information"
      ],
      color: "from-orange-500 to-red-600"
    }
  ];

  const popularArticles = [
    { title: "How does Veridian work?", views: "15.2K" },
    { title: "What are the eligibility requirements?", views: "12.8K" },
    { title: "How do I make a payment?", views: "10.5K" },
    { title: "What if I miss a payment?", views: "8.9K" },
    { title: "How to integrate Veridian as a merchant", views: "7.3K" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero with Search */}
        <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mb-6">
                How can we help you?
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Search our knowledge base or browse categories below
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for articles, guides, or FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-3 gap-4">
              <Link to="/faq" className="flex items-center gap-3 bg-white rounded-xl p-4 hover:shadow-lg transition-shadow">
                <BookOpen className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="font-semibold">Browse FAQs</h3>
                  <p className="text-sm text-muted-foreground">Quick answers</p>
                </div>
              </Link>
              <Link to="/contact" className="flex items-center gap-3 bg-white rounded-xl p-4 hover:shadow-lg transition-shadow">
                <MessageCircle className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="font-semibold">Contact Support</h3>
                  <p className="text-sm text-muted-foreground">Get in touch</p>
                </div>
              </Link>
              <Link to="/trust" className="flex items-center gap-3 bg-white rounded-xl p-4 hover:shadow-lg transition-shadow">
                <Shield className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="font-semibold">Trust & Security</h3>
                  <p className="text-sm text-muted-foreground">Learn more</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-4xl font-bold mb-4">Browse by Category</h2>
              <p className="text-xl text-muted-foreground">
                Find answers organized by topic
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {categories.map((category, index) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: smoothEasing }}
                  className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <category.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-2">{category.title}</h3>
                  <p className="text-muted-foreground mb-6">{category.description}</p>
                  <ul className="space-y-3">
                    {category.articles.map((article) => (
                      <li key={article} className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">→</span>
                        <a href="#" className="text-muted-foreground hover:text-emerald-600 transition-colors">
                          {article}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="py-20 bg-gray-50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">Popular Articles</h2>
              <p className="text-muted-foreground">
                Most viewed help articles this month
              </p>
            </motion.div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {popularArticles.map((article, index) => (
                <motion.a
                  key={article.title}
                  href="#"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: smoothEasing }}
                  className="flex items-center justify-between p-6 border-b border-gray-100 last:border-b-0 hover:bg-emerald-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium group-hover:text-emerald-600 transition-colors">
                      {article.title}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">{article.views} views</span>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-12 text-center text-white"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Still need help?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Our support team is here to assist you
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild size="lg" className="rounded-full px-8 bg-white text-emerald-600 hover:bg-gray-100">
                  <Link to="/contact">Contact Support</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-white text-white hover:bg-white/10">
                  <Link to="/faq">View All FAQs</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
