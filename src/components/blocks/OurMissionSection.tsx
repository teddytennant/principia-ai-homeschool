'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, BookOpenCheck, DollarSign } from 'lucide-react';
import { cn } from "@/lib/utils";

// --- Animated Gradient Icon Wrapper ---
function AnimatedIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.18, rotate: 6 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-1.5 shadow-lg shadow-indigo-500/10 border border-indigo-400/20",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export const OurMissionSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
      className="py-16 md:py-24 bg-gray-900 text-gray-200"
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.div variants={itemVariants} className="flex flex-col gap-8">
          {/* Mission Content */}
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-white tracking-tight">Our Mission</h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-4">
              At Principia AI, we’re reimagining education with AI that teaches how to think, not what to think.
            </p>
            <p className="text-xl text-gray-300 leading-relaxed mb-4">
              We build Socratic tools that spark curiosity, challenge assumptions, and guide students to deeper understanding—never direct answers.
            </p>
            <p className="text-xl text-gray-300 leading-relaxed">
              For educators and districts, we offer transparent, FERPA/COPPA-compliant solutions that put academic integrity, student safety, and customization at the center.
            </p>
          </div>
          
          {/* Commitment Content */}
          <motion.div 
            variants={itemVariants}
            className="max-w-3xl mx-auto bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-700 hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-2xl font-semibold mb-6 text-white">What We Stand For</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start">
                <AnimatedIcon className="mr-3 mt-0.5"><ShieldCheck className="w-5 h-5 text-white" /></AnimatedIcon>
                <span>A safe, filter-first learning environment—no inappropriate content, ever.</span>
              </li>
              <li className="flex items-start">
                <AnimatedIcon className="mr-3 mt-0.5"><Target className="w-5 h-5 text-white" /></AnimatedIcon>
                <span>AI that asks questions, not gives answers—cheating stops here.</span>
              </li>
              <li className="flex items-start">
                <AnimatedIcon className="mr-3 mt-0.5"><BookOpenCheck className="w-5 h-5 text-white" /></AnimatedIcon>
                <span>Tools for teachers to track, guide, and customize student learning.</span>
              </li>
              <li className="flex items-start">
                <AnimatedIcon className="mr-3 mt-0.5"><DollarSign className="w-5 h-5 text-white" /></AnimatedIcon>
                <span>Clear, affordable pricing with zero hidden costs.</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};
