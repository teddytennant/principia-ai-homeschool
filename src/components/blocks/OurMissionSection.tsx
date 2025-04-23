"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

const OurMissionSection = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
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

    return (
      <div
        ref={ref}
        className={cn("max-w-4xl mx-auto text-center px-4", className)}
        {...props}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={staggerChildren}
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-6">
            Our Mission
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-gray-300 mb-8">
            At Principia AI, we are dedicated to revolutionizing education through artificial intelligence. Our goal is to foster critical thinking and deeper understanding by guiding students with thought-provoking questions, rather than simply providing answers.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="relative inline-block"
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
          >
            <a href="/pricing" className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-lg shadow-indigo-500/30 transition-all duration-300">
              Join Us in Transforming Education
            </a>
          </motion.div>
        </motion.div>
      </div>
    );
  }
);

OurMissionSection.displayName = "OurMissionSection";

export { OurMissionSection };
