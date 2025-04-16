'use client'; // Mark as Client Component

import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, ShieldCheck, Plug } from 'lucide-react'; // Example icons
import { cn } from "@/lib/utils"; // Assuming utils for cn

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType; // Add icon prop
  index: number; // For staggering animation
}

// Enhanced FeatureCard with icon and animation
const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, index }) => {
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
      className={cn(
        "bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/40 p-6 rounded-xl shadow-md dark:shadow-lg", // Slightly adjusted styles
        "hover:shadow-lg dark:hover:shadow-xl hover:scale-[1.02] dark:hover:bg-gray-800/80 transition-all duration-300 ease-in-out"
      )}
    >
      <div className="mb-4 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50">
        <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </motion.div>
  );
};

// Enhanced FeaturesSection with animations
export const FeaturesSection = () => {
  const features = [
    {
      title: "Socratic Learning Method",
      description: "Engages students through guided questions, fostering critical thinking instead of providing direct answers.",
      icon: BrainCircuit
    },
    {
      title: "Responsible & Safe AI",
      description: "Built with ethical safeguards and content filtering to ensure appropriate and safe educational interactions.",
      icon: ShieldCheck
    },
    {
      title: "Seamless School Integration",
      description: "Integrates easily with Google Workspace for Education and Microsoft Entra ID for simple deployment.",
      icon: Plug // Use Plug icon
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1 // Ensures children animate after container
      }
    }
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }} // Trigger animation when 20% visible
      variants={containerVariants}
      className="py-16 md:py-24 bg-gray-50 dark:bg-black"
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-800 dark:text-gray-50"
        >
          Why Principia AI?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}; 