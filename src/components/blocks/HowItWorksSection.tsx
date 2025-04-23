"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { User, MessageSquare, Award } from 'lucide-react';

const steps = [
  {
    title: "Sign Up & Set Up",
    description: "Teachers and students can sign up easily. Teachers customize the AI with curriculum materials and learning preferences.",
    icon: <User className="h-6 w-6 text-indigo-400" />,
  },
  {
    title: "Ask & Interact",
    description: "Students ask questions, and Principia AI responds with thought-provoking guidance tailored to their grade level and subject.",
    icon: <MessageSquare className="h-6 w-6 text-indigo-400" />,
  },
  {
    title: "Learn & Grow",
    description: "Through guided dialogue, students develop critical thinking skills, achieving deeper understanding and academic growth.",
    icon: <Award className="h-6 w-6 text-indigo-400" />,
  },
];

const HowItWorksSection = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
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

    // Hover animation for step cards
    const cardHover = {
      scale: 1.03,
      boxShadow: "0 10px 30px -15px rgba(79, 70, 229, 0.3)",
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
            How Principia AI Works
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-gray-300 max-w-3xl mx-auto">
            A seamless integration of AI technology into the classroom, designed to enhance learning through guided discovery.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-gray-800/80 border border-gray-700/50 rounded-xl p-6 flex flex-col items-center text-center shadow-lg h-full"
              whileHover={cardHover}
            >
              <div className="mb-4 p-3 bg-indigo-500/10 rounded-lg">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-gray-300 flex-grow">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }
);

HowItWorksSection.displayName = "HowItWorksSection";

export { HowItWorksSection };
