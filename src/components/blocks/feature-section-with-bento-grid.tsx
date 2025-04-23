"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { CheckCircle, Brain, Users, Zap, Globe, BookOpen, Shield, ChevronRight } from 'lucide-react';

const features = [
  {
    title: "Guided Learning Approach",
    description: "Encourages critical thinking through thoughtful questions, helping students discover answers independently.",
    icon: <Brain className="h-6 w-6 text-indigo-400" />,
    size: "large",
  },
  {
    title: "Personalized for Every Student",
    description: "Adapts to individual learning styles and paces, ensuring no student is left behind.",
    icon: <Users className="h-6 w-6 text-indigo-400" />,
    size: "small",
  },
  {
    title: "Prevents Cheating",
    description: "Designed to promote learning integrity by guiding students through thought processes instead of providing direct answers.",
    icon: <Shield className="h-6 w-6 text-indigo-400" />,
    size: "small",
  },
  {
    title: "Lightning-Fast Responses",
    description: "Instant feedback and guidance, keeping students engaged and learning efficiently.",
    icon: <Zap className="h-6 w-6 text-indigo-400" />,
    size: "small",
  },
  {
    title: "Curriculum-Aligned Content",
    description: "Tailored to match school curricula, ensuring relevance to classroom learning objectives.",
    icon: <BookOpen className="h-6 w-6 text-indigo-400" />,
    size: "large",
  },
  {
    title: "Safe & Secure Environment",
    description: "Designed with student privacy in mind, adhering to strict data protection standards.",
    icon: <Globe className="h-6 w-6 text-indigo-400" />,
    size: "small",
  },
];

const FeaturesSectionWithBentoGrid = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
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
          staggerChildren: 0.1
        }
      }
    };

    // Hover animation for feature cards with glowing effect
    const cardHover = {
      scale: 1.03,
      boxShadow: "0 10px 30px -15px rgba(79, 70, 229, 0.5), 0 0 15px rgba(79, 70, 229, 0.3)",
      transition: { duration: 0.3 }
    };

    return (
      <div
        ref={ref}
        className={cn("max-w-6xl mx-auto px-4", className)}
        {...props}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-6">
            Innovative Features for Modern Education
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-gray-300 max-w-3xl mx-auto">
            Principia AI combines cutting-edge technology with educational expertise to create a transformative learning experience.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className={cn(
                "bg-gray-800/80 border border-gray-700/50 rounded-xl p-6 flex flex-col items-start shadow-lg relative overflow-hidden",
                feature.size === "large" ? "md:col-span-2 h-64" : "h-64"
              )}
              whileHover={cardHover}
            >
              <div className="mb-4 p-3 bg-indigo-500/10 rounded-lg relative z-10">
                {feature.icon}
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/10 opacity-0 animate-glow-in" style={{ animationDelay: `${index * 0.1}s` }}></div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
              <motion.div
                className="mt-auto text-indigo-400 text-sm flex items-center"
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                Learn more <ChevronRight className="h-4 w-4 ml-1" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }
);

FeaturesSectionWithBentoGrid.displayName = "FeaturesSectionWithBentoGrid";

export { FeaturesSectionWithBentoGrid };
