import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Rocket, CheckCircle, Lock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const smoothEasing = [0.16, 1, 0.3, 1] as const;

const Pilot = () => {
  const benefits = [
    "Early access to new features",
    "Dedicated onboarding support",
    "Discounted pricing during pilot period",
    "Direct line to product team",
    "Influence product roadmap",
    "Priority technical support"
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-amber-50/30 py-20 relative overflow-hidden">
          <motion.div 
            className="absolute top-20 right-20 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: smoothEasing }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full mb-6 shadow-lg">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
                <Lock className="w-4 h-4" />
                Invitation Only
              </div>
              <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground mb-6">
                Veridian <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-600 bg-clip-text text-transparent">Pilot Program</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Be among the first merchants to experience the future of flexible payments
              </p>
            </motion.div>
          </div>
        </section>

        {/* Program Details */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-amber-50/30 border-2 border-amber-300 rounded-3xl p-8 mb-12 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-6 h-6 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <h2 className="font-display text-3xl font-bold mb-6 text-center">
                What is the Pilot Program?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-2xl mx-auto">
                Our pilot program gives select merchants exclusive early access to Veridian's platform. 
                You'll help shape the future of our product while enjoying special benefits and pricing.
              </p>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="mb-12"
            >
              <h3 className="font-display text-2xl font-bold mb-8 text-center">
                Pilot Program Benefits
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1, ease: smoothEasing }}
                    className="flex items-start gap-3 bg-gradient-to-br from-emerald-50/50 to-amber-50/30 rounded-xl p-4 border border-emerald-100 shadow-sm"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="bg-white border border-emerald-100 rounded-2xl p-8 mb-12 shadow-lg"
            >
              <h3 className="font-display text-2xl font-bold mb-6">
                Pilot Requirements
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Active, licensed retail dispensaries with a minimum revenue of $300,000 annually</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Single store operators preferred</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Willingness to provide regular feedback on platform features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Commitment to 3-month pilot period</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Technical capability to integrate with our API or platform</span>
                </li>
              </ul>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="mb-12"
            >
              <h3 className="font-display text-2xl font-bold mb-8 text-center">
                Program Timeline
              </h3>
              <div className="space-y-6">
                {[
                  { phase: "Week 1", title: "Onboarding & Setup", description: "Complete setup with dedicated support team", color: "from-emerald-500 to-emerald-600" },
                  { phase: "Week 2-7", title: "Active Testing", description: "Process transactions and provide feedback", color: "from-amber-500 to-amber-600" },
                  { phase: "Week 8-12", title: "Optimization", description: "Fine-tune integration and prepare for full launch", color: "from-emerald-600 to-teal-600" }
                ].map((item, index) => (
                  <div key={index} className="flex gap-6">
                    <div className={`flex-shrink-0 w-24 h-24 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white font-bold shadow-lg`}>
                      {item.phase}
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-emerald-50/50 to-amber-50/30 rounded-xl p-6 border border-emerald-100">
                      <h4 className="font-bold mb-1 text-lg">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: smoothEasing }}
              className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-amber-600 rounded-3xl p-12 text-center text-white shadow-2xl"
            >
              <h3 className="font-display text-3xl font-bold mb-4">
                Interested in Joining?
              </h3>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                If you've received an invitation to our pilot program, we'd love to have you on board. 
                Contact your Veridian representative or reach out to our team.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild size="lg" className="rounded-full px-8 bg-white text-emerald-600 hover:bg-gray-100 font-bold shadow-lg">
                  <Link to="/contact">Contact Us</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-2 border-white text-white hover:bg-white/10 font-bold">
                  <Link to="/merchants">Learn More</Link>
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

export default Pilot;
