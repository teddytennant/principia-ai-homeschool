"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface ComparisonData {
  feature: string;
  principia: string;
  khanmigo: string;
  chatgpt: string;
  magicschool: string;
  diffit: string;
  traditional: string;
  principiaIcon: React.ReactNode;
  khanmigoIcon: React.ReactNode;
  chatgptIcon: React.ReactNode;
  magicschoolIcon: React.ReactNode;
  diffitIcon: React.ReactNode;
  traditionalIcon: React.ReactNode;
  [key: string]: string | React.ReactNode;
}

const comparisonData: ComparisonData[] = [
  {
    feature: "Personalization",
    principia: "Dynamic adaptation to each student’s learning style and pace",
    khanmigo: "No",
    chatgpt: "No",
    magicschool: "No",
    diffit: "No",
    traditional: "No",
    principiaIcon: <Check className="h-5 w-5 text-green-400" />,
    khanmigoIcon: <X className="h-5 w-5 text-red-400" />,
    chatgptIcon: <X className="h-5 w-5 text-red-400" />,
    magicschoolIcon: <X className="h-5 w-5 text-red-400" />,
    diffitIcon: <X className="h-5 w-5 text-red-400" />,
    traditionalIcon: <X className="h-5 w-5 text-red-400" />,
  },
  {
    feature: "Mastery-Gated Progressive Disclosure",
    principia: "Hints at 30%, examples at 60%, solutions at 90% mastery thresholds",
    khanmigo: "No",
    chatgpt: "No",
    magicschool: "No",
    diffit: "No",
    traditional: "No",
    principiaIcon: <Check className="h-5 w-5 text-green-400" />,
    khanmigoIcon: <X className="h-5 w-5 text-red-400" />,
    chatgptIcon: <X className="h-5 w-5 text-red-400" />,
    magicschoolIcon: <X className="h-5 w-5 text-red-400" />,
    diffitIcon: <X className="h-5 w-5 text-red-400" />,
    traditionalIcon: <X className="h-5 w-5 text-red-400" />,
  },
  {
    feature: "Curriculum Integration",
    principia: "Seamless alignment with school curricula and standards",
    khanmigo: "No",
    chatgpt: "No",
    magicschool: "No",
    diffit: "No",
    traditional: "No",
    principiaIcon: <Check className="h-5 w-5 text-green-400" />,
    khanmigoIcon: <X className="h-5 w-5 text-red-400" />,
    chatgptIcon: <X className="h-5 w-5 text-red-400" />,
    magicschoolIcon: <X className="h-5 w-5 text-red-400" />,
    diffitIcon: <X className="h-5 w-5 text-red-400" />,
    traditionalIcon: <X className="h-5 w-5 text-red-400" />,
  },
  {
    feature: "Teacher Control",
    principia: "Full customization of AI prompts and settings",
    khanmigo: "Limited",
    chatgpt: "Limited",
    magicschool: "Limited",
    diffit: "Limited",
    traditional: "None",
    principiaIcon: <Check className="h-5 w-5 text-green-400" />,
    khanmigoIcon: <X className="h-5 w-5 text-red-400" />,
    chatgptIcon: <X className="h-5 w-5 text-red-400" />,
    magicschoolIcon: <X className="h-5 w-5 text-red-400" />,
    diffitIcon: <X className="h-5 w-5 text-red-400" />,
    traditionalIcon: <X className="h-5 w-5 text-red-400" />,
  },
  {
    feature: "Real-Time Analytics",
    principia: "Built-in educator dashboard for metrics and feedback",
    khanmigo: "No",
    chatgpt: "No",
    magicschool: "No",
    diffit: "No",
    traditional: "No",
    principiaIcon: <Check className="h-5 w-5 text-green-400" />,
    khanmigoIcon: <X className="h-5 w-5 text-red-400" />,
    chatgptIcon: <X className="h-5 w-5 text-red-400" />,
    magicschoolIcon: <X className="h-5 w-5 text-red-400" />,
    diffitIcon: <X className="h-5 w-5 text-red-400" />,
    traditionalIcon: <X className="h-5 w-5 text-red-400" />,
  },
  {
    feature: "Transparent Logging",
    principia: "Merkle-chain audit logs for each unlock event",
    khanmigo: "No",
    chatgpt: "No",
    magicschool: "No",
    diffit: "No",
    traditional: "No",
    principiaIcon: <Check className="h-5 w-5 text-green-400" />,
    khanmigoIcon: <X className="h-5 w-5 text-red-400" />,
    chatgptIcon: <X className="h-5 w-5 text-red-400" />,
    magicschoolIcon: <X className="h-5 w-5 text-red-400" />,
    diffitIcon: <X className="h-5 w-5 text-red-400" />,
    traditionalIcon: <X className="h-5 w-5 text-red-400" />,
  },
  {
    feature: "Privacy-First Encryption",
    principia: "AES-encrypted tokens until mastery criteria are met",
    khanmigo: "No",
    chatgpt: "No",
    magicschool: "No",
    diffit: "No",
    traditional: "No",
    principiaIcon: <Check className="h-5 w-5 text-green-400" />,
    khanmigoIcon: <X className="h-5 w-5 text-red-400" />,
    chatgptIcon: <X className="h-5 w-5 text-red-400" />,
    magicschoolIcon: <X className="h-5 w-5 text-red-400" />,
    diffitIcon: <X className="h-5 w-5 text-red-400" />,
    traditionalIcon: <X className="h-5 w-5 text-red-400" />,
  },
  {
    feature: "Prevents Cheating",
    principia: "Scaffolded guidance prevents direct copying of solutions",
    khanmigo: "No",
    chatgpt: "No",
    magicschool: "No",
    diffit: "No",
    traditional: "No",
    principiaIcon: <Check className="h-5 w-5 text-green-400" />,
    khanmigoIcon: <X className="h-5 w-5 text-red-400" />,
    chatgptIcon: <X className="h-5 w-5 text-red-400" />,
    magicschoolIcon: <X className="h-5 w-5 text-red-400" />,
    diffitIcon: <X className="h-5 w-5 text-red-400" />,
    traditionalIcon: <X className="h-5 w-5 text-red-400" />,
  }
];

const ComparisonSection = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
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

    // Hover animation for table rows with glowing effect and scale
    const rowHover = {
      backgroundColor: "rgba(79, 70, 229, 0.2)",
      boxShadow: "0 0 15px rgba(79, 70, 229, 0.4)",
      scale: 1.01,
      transition: { duration: 0.3, ease: "easeOut" }
    };

    return (
      <div
        ref={ref}
        className={cn("max-w-5xl mx-auto px-4", className)}
        {...props}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
          className="text-center mb-12"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-6">
            Principia AI vs. Traditional AI Tools
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-gray-300 max-w-3xl mx-auto">
            See how Principia AI stands out with its education-focused design compared to generic AI chatbots.
          </motion.p>
        </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerChildren}
            className="overflow-hidden rounded-xl border border-gray-700/60 shadow-xl shadow-indigo-500/30 relative bg-gray-800/80"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-indigo-500/0 opacity-0 animate-glow-in" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.2)_0,_rgba(79,70,229,0)_70%)] opacity-30"></div>
            <table className="w-full border-collapse">
              <thead>
                <motion.tr variants={fadeInUp} className="bg-gradient-to-r from-gray-800/95 to-gray-700/95 border-b border-gray-700/60">
                  <th className="w-1/4 py-5 px-6 text-left text-gray-300 font-semibold text-lg">Feature</th>
                  <th className="w-1/4 py-5 px-6 text-center text-indigo-300 font-bold text-xl relative">
                    Principia AI
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-indigo-400 rounded-full"></div>
                  </th>
                  <th className="w-1/2 py-5 px-6 text-center text-red-400 font-bold text-lg">Competitors (Khanmigo, ChatGPT Plus, MagicSchool AI, Diffit, Traditional AI)</th>
                </motion.tr>
              </thead>
              <tbody>
                {comparisonData.map((item, index) => (
                  <motion.tr
                    key={index}
                    variants={fadeInUp}
                    className={cn(
                      "border-t border-gray-700/40 relative",
                      index % 2 === 0 ? "bg-gray-800/60" : "bg-gray-800/40"
                    )}
                    whileHover={rowHover}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 } }}
                  >
                    <td className="py-5 px-6 text-left text-gray-300 font-medium relative z-10">{item.feature}</td>
                    <td className="py-5 px-6 text-center relative z-10">
                      <div className="flex items-center justify-center space-x-3 max-w-xs mx-auto">
                        <motion.div whileHover={{ scale: 1.2, transition: { duration: 0.2 } }}>
                          {item.principiaIcon}
                        </motion.div>
                        <span className="text-sm leading-relaxed text-gray-100">{item.principia}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center relative z-10">
                      <div className="flex items-center justify-center space-x-3 max-w-xs mx-auto">
                        <motion.div whileHover={{ scale: 1.2, transition: { duration: 0.2 } }}>
                          <X className="h-5 w-5 text-red-400" />
                        </motion.div>
                        <span className="text-sm leading-relaxed text-red-100">No</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                <tr>
                  <td colSpan={3} className="text-xs text-gray-400 text-center py-4 border-t border-gray-700/60">
                    All information is based on publicly available sources as of April 23, 2025.
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>
      </div>
    );
  }
);

ComparisonSection.displayName = "ComparisonSection";

export { ComparisonSection };
