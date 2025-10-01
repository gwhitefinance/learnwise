
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CallToAction() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    setTimeout(() => setIsSubscribed(false), 3000);
    setEmail("");
  };

  return (
    <section className="py-24">
      <div className="container text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white max-w-2xl mx-auto">
            Stay Ahead of the Curve
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">
            Get exclusive insights, study strategies, and feature updates delivered to your inbox weekly.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          onSubmit={handleSubscribe}
          className="max-w-md mx-auto"
        >
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                required
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="bg-white text-black hover:bg-gray-200 h-auto aspect-square"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          {isSubscribed && (
            <p className="text-green-400 text-center mt-4">Thanks for subscribing! 🎉</p>
          )}
        </motion.form>
      </div>
    </section>
  );
}
