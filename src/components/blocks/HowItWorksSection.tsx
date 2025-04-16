'use client'; // Mark as Client Component

import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, MessageCircle, ClipboardList } from 'lucide-react'; // Example icons
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect"; // Import CORRECT component

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  icon: React.ElementType; // Add icon prop
  index: number; // For staggering animation
}

// Apply correct GlowingEffect
const StepCard: React.FC<StepCardProps> = ({ step, title, description, icon: Icon, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1, // Stagger animation
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      // Add relative positioning for the absolute effect
      className={cn(
        "relative bg-gray-800/60 border border-gray-700/40 p-6 rounded-xl shadow-md dark:shadow-lg flex flex-col items-center text-center h-full",
        "hover:shadow-lg dark:hover:shadow-xl hover:scale-[1.02] dark:hover:bg-gray-800/80 transition-all duration-300 ease-in-out"
      )}
    >
      {/* Add the GlowingEffect component inside */}
      <GlowingEffect 
        className="rounded-xl" // Match border radius
        disabled={false} // Enable the effect
        glow={true} // Show the glow on hover
      />
      
      {/* Original Card Content - Ensure it's above the effect with z-index */}
      <div className="relative z-10 mb-4">
        <div className="bg-indigo-500 dark:bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mb-2 absolute -mt-10 -ml-10 ring-4 ring-gray-900">{step}</div>
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-900/50 border border-indigo-500/20">
            <Icon className="h-8 w-8 text-indigo-400" />
        </div>
      </div>
      <h3 className="relative z-10 text-lg font-semibold mb-2 text-gray-100">{title}</h3>
      <p className="relative z-10 text-gray-400 text-sm flex-grow">{description}</p>
    </motion.div>
  );
};

// Enhanced HowItWorksSection with animations
export const HowItWorksSection = () => {
  const steps = [
    {
      step: 1,
      title: "Secure Sign In",
      description: "Use existing school Google Workspace or Microsoft Entra ID credentials for easy access.",
      icon: LogIn
    },
    {
      step: 2,
      title: "Engage & Learn",
      description: "Interact with the AI tutor through guided Socratic dialogue to explore subjects.",
      icon: MessageCircle
    },
    {
      step: 3,
      title: "Monitor Usage",
      description: "Administrators can access anonymized usage logs and summaries for oversight.",
      icon: ClipboardList
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="py-16 md:py-24 bg-white dark:bg-gray-900"
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.h2
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-800 dark:text-gray-50"
        >
          Simple Steps to Start
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <StepCard key={index} {...step} index={index} />
          ))}
        </div>
      </div>
    </motion.section>
  );
};
