import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  "No setup fees or monthly minimums",
  "Integrate in under 48 hours",
  "Dedicated compliance support",
  "24/7 merchant support",
];

export function CTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl gradient-hero p-8 sm:p-12 lg:p-16"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-2xl" />

          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground">
                Ready to Boost Your Sales?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80 max-w-lg">
                Join hundreds of cannabis retailers who've increased their revenue by offering flexible payment options to customers.
              </p>
              <ul className="mt-8 space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-primary-foreground">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary">
                      <Check className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center lg:items-end gap-6">
              <div className="w-full max-w-sm p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-lg border border-primary-foreground/20">
                <h3 className="font-display text-xl font-semibold text-primary-foreground mb-4">
                  Get Started Today
                </h3>
                <p className="text-sm text-primary-foreground/70 mb-6">
                  Schedule a demo or create your merchant account to start offering BNPL.
                </p>
                <div className="space-y-3">
                  <Button size="lg" variant="heroSecondary" className="w-full" asChild>
                    <Link to="/register">
                      Create Merchant Account
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="heroOutline" className="w-full" asChild>
                    <Link to="/contact">
                      Schedule a Demo
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}