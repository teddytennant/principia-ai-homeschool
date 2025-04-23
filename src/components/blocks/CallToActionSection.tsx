"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import Link from 'next/link';

const CallToActionSection = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    // Animation variants for fade-in and slide-up effect
    const fadeInUp = {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    // Staggered animation for child elements
    const staggerChildren = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2
        }
      }
    };

    // Hover animation for CTA button
    const ctaHover = {
      scale: 1.05,
      boxShadow: "0 10px 30px -15px rgba(79, 70, 229, 0.5)",
      transition: { duration: 0.3 }
    };

    return (
      <div
        ref={ref}
        className={cn("max-w-4xl mx-auto px-4 text-center relative", className)}
        {...props}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.3)_0,_rgba(0,0,0,0)_70%)] opacity-60 animate-pulse-slow z-0"></div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={staggerChildren}
          className="relative z-10"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Revolutionize Learning Today?
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-200 mb-4 max-w-3xl mx-auto">
            Join a growing community of educators and students experiencing the future of education with Principia AI. Don't miss out on transforming the way knowledge is acquired.
          </motion.p>
          <motion.p variants={fadeInUp} className="text-md md:text-lg text-gray-300 mb-8 max-w-3xl mx-auto italic font-medium">
            "Empowering the next generation of critical thinkers through AI-driven guided dialogue."
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <motion.div
              whileHover={ctaHover}
              className="inline-block"
            >
              <Link href="/pricing" className="inline-flex items-center px-8 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-full shadow-xl shadow-indigo-500/40 transition-all duration-300">
                Get Started Now
                <Rocket className="h-6 w-6 ml-3" />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              className="inline-block"
            >
              <Link href="/how-it-works" className="inline-flex items-center px-8 py-5 bg-transparent border-2 border-indigo-400 hover:bg-indigo-900/20 text-indigo-200 font-bold text-lg rounded-full transition-all duration-300">
                Discover How It Works
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }
);

CallToActionSection.displayName = "CallToActionSection";

export { CallToActionSection };
