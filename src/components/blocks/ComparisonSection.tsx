'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ComparisonFeature {
  feature: string;
  principia: React.ReactNode;
  chatGPT: React.ReactNode;
  khanmigo: React.ReactNode;
  magicSchool: React.ReactNode;
}

// Helper for cell content
const CellContent: React.FC<{ icon: React.ReactNode, text: string }> = ({ icon, text }) => (
  <div className="flex items-start text-left"> {/* items-start for top alignment */} 
    <span className="mr-2 mt-0.5 flex-shrink-0">{icon}</span>
    <span className="text-xs text-gray-300">{text}</span>
  </div>
);

// --- Animated Check/X Icon ---
function AnimatedCheck({ className }: { className?: string }) {
  return (
    <motion.span initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1.1, opacity: 1 }} transition={{ type: "spring", stiffness: 250, damping: 12 }}>
      <Check className={className || "text-green-400 w-4 h-4"} />
    </motion.span>
  );
}
function AnimatedX({ className }: { className?: string }) {
  return (
    <motion.span initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1.1, opacity: 1 }} transition={{ type: "spring", stiffness: 250, damping: 12 }}>
      <X className={className || "text-red-400 w-4 h-4"} />
    </motion.span>
  );
}

// Updated data using CellContent helper
const comparisonData: ComparisonFeature[] = [
  {
    feature: "Socratic Responses",
    principia: <CellContent icon={<AnimatedCheck />} text="Yes (only asks guiding questions; no direct answers)" />, 
    chatGPT: <CellContent icon={<AnimatedX />} text="No (will directly solve problems if asked)" />, 
    khanmigo: <CellContent icon={<AnimatedCheck />} text="Somewhat (better than ChatGPT, but can still slip up)" />, 
    magicSchool: <CellContent icon={<AnimatedX />} text="No (focuses on teacher lesson creation, not Socratic Q&A)" />
  },
  {
    feature: "Safe for Student Use",
    principia: <CellContent icon={<AnimatedCheck />} text="Yes (designed for minors, filtering & no adult content)" />,
    chatGPT: <CellContent icon={<AnimatedX />} text="Potentially Risky (wide-ranging content, not locked to school environment)" />,
    khanmigo: <CellContent icon={<AnimatedCheck />} text="Decent (limited to Khan Academy content but not fully tested outside that)" />,
    magicSchool: <CellContent icon={<AnimatedX />} text="(Primarily teacher-oriented; no robust student safety checks)" />
  },
  {
    feature: "No Cheating / Homework Solving",
    principia: <CellContent icon={<AnimatedCheck />} text="Strictly Prevented (built-in guardrails block direct answers)" />,
    chatGPT: <CellContent icon={<AnimatedX />} text="Encourages Cheating (literally can solve any homework)" />,
    khanmigo: <CellContent icon={<AnimatedCheck />} text="Tries to encourage reasoning (still can provide solutions at times)" />,
    magicSchool: <CellContent icon={<AnimatedX />} text="Not Student-Facing (so it's basically irrelevant for cheating)" />
  },
  {
    feature: "Admin/Teacher Oversight",
    principia: <CellContent icon={<AnimatedCheck />} text="Full (usage logs, transcript review, custom filters)" />,
    chatGPT: <CellContent icon={<AnimatedX />} text="None (not built for K-12 oversight)" />,
    khanmigo: <CellContent icon={<span className="text-gray-400 text-lg">~</span>} text="Limited (teachers can see some data via Khan Academy dashboards)" />,
    magicSchool: <CellContent icon={<span className="text-gray-400 text-lg">~</span>} text="Some (teacher dashboards, but not robust student conversation logs)" />
  },
  {
    feature: "Customizable Behavior",
    principia: <CellContent icon={<AnimatedCheck />} text="Yes (edit system prompts, safety rules, tone)" />,
    chatGPT: <CellContent icon={<span className="text-gray-400 text-lg">~</span>} text="ChatGPT offers custom GPTs but lacks centralized classroom oversight." />,
    khanmigo: <CellContent icon={<AnimatedX />} text="Limited (Khan Academy controls, not you)" />,
    magicSchool: <CellContent icon={<AnimatedCheck />} text="Some (focuses on teacher content generation, not student Q&A)" />
  },
];

// Adjusted ToolHeader styling with gradients and shadow
const ToolHeader: React.FC<{ name: string; isFeatured?: boolean }> = ({ name, isFeatured }) => (
  <div className={`py-4 px-4 text-center ${isFeatured ? 'bg-gradient-to-b from-indigo-700 to-indigo-800 shadow-md' : 'bg-gradient-to-b from-gray-800 to-gray-900/80 shadow-sm'} border-b border-gray-700 transition-all duration-300`}>
    <h4 className={`font-semibold text-sm md:text-base ${isFeatured ? 'text-white' : 'text-gray-200'} tracking-wide`}>{name}</h4>
  </div>
);

// Adjusted FeatureCell styling for left alignment, padding, and zebra striping
const FeatureCell: React.FC<{ children: React.ReactNode; isFeatured?: boolean; index?: number }> = ({ children, isFeatured, index }) => (
  <div className={cn(
    "flex items-start text-left min-h-[4.5rem] px-4 py-3 transition-all duration-200 hover:bg-opacity-80", // items-start, increased padding/min-height
    "border-t border-gray-700/50", 
    isFeatured ? "bg-indigo-900/20" : index && index % 2 === 0 ? "bg-gray-800/50" : "bg-gray-800/30" // Zebra striping with subtle variation
  )}>
    {children}
  </div>
);

export const ComparisonSection = () => {
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
      className="py-16 md:py-24 bg-black text-gray-200"
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
            How Principia AI Stands Out
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            While many AI tools offer power, they often lack guardrails. Principia AI is built from the ground up for safe, effective Socratic learning in schools, avoiding pitfalls like enabling cheating or lacking student-centric safety.
          </p>
        </motion.div>

        {/* Comparison Grid - Refined Styling */}
        <motion.div variants={itemVariants} className="overflow-x-auto rounded-lg shadow-md border border-gray-700/80">
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] min-w-[750px] md:min-w-full"> {/* Use auto for first column */} 
            {/* Header Row - Adjusted Styling */}
            <div className="py-4 px-4 font-semibold text-left sticky left-0 bg-gray-900 border-b border-gray-700 rounded-tl-lg">Feature</div>
            <ToolHeader name="Principia AI" isFeatured />
            <ToolHeader name="ChatGPT" />
            <ToolHeader name="Khanmigo" />
            <ToolHeader name="MagicSchool" />

            {/* Data Rows - Adjusted Styling */}
            {comparisonData.map((item, index) => (
              <React.Fragment key={index}>
                {/* Sticky Feature Column */}
                <div className={cn(
                  "flex items-start text-left min-h-[4.5rem] px-4 py-3 font-medium text-sm transition-all duration-200 hover:bg-gray-800",
                  "sticky left-0", 
                  "border-t border-gray-700/50",
                  "bg-gray-900/90 shadow-sm" // Match header bg with subtle shadow
                )}>
                  {item.feature}
                </div>
                {/* Other Cells */}
                <FeatureCell isFeatured index={index}>{item.principia}</FeatureCell>
                <FeatureCell index={index}>{item.chatGPT}</FeatureCell>
                <FeatureCell index={index}>{item.khanmigo}</FeatureCell>
                <FeatureCell index={index}>{item.magicSchool}</FeatureCell>
              </React.Fragment>
            ))}
          </div>
        </motion.div>
         <motion.p variants={itemVariants} className="text-center text-sm text-gray-500 mt-4">
            *All information is based on publicly available data  and typical usage scenarios as of April 9th 2025; actual functionality may differ.
        </motion.p>
      </div>
    </motion.section>
  );
};
