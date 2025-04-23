"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const comparisonData = [
  {
    feature: "Learning Approach",
    principia: "Uses guided questioning to foster deep critical thinking and independent problem-solving skills",
    traditional: "Provides direct answers with minimal encouragement for independent thought or deeper understanding",
    principiaIcon: <Check className="h-5 w-5 text-green-400" />,
    traditionalIcon: <X className="h-5 w-5 text-red-400" />,
  },
  {
    feature: "Personalization",
    principia: "Adapts dynamically to each student's learning pace, style, and needs for a tailored educational experience",
    traditional: "Delivers generic, one-size-fits-all responses without adapting to individual student differences",
    principiaIcon: <Check className="h-5 w-5 text-green-400" />,
    traditionalIcon: <X className="h-5 w-5 text-red-400" />,
  },
  {
    feature: "Prevents Cheating",
    principia: "Promotes academic integrity by guiding students through the learning process without giving direct answers",
    traditional: "Poses a high risk for cheating by readily providing complete solutions that students can copy",
    principiaIcon: <Check className="h-5 w-5 text-green-400" />,
    traditionalIcon: <X className="h-5 w-5 text-red-400" />,
  },
  {
    feature: "Curriculum Integration",
    principia: "Seamlessly aligns with school curricula to reinforce classroom lessons and learning objectives",
    traditional: "Offers disconnected, generic content that often lacks relevance to specific educational standards",
    principiaIcon: <Check className="h-5 w-5 text-green-400" />,
    traditionalIcon: <X className="h-5 w-5 text-red-400" />,
  },
  {
    feature: "Teacher Control",
    principia: "Empowers educators with customization options to tailor AI interactions to specific classroom goals",
    traditional: "Lacks customization features, offering no control for teachers to adapt to their teaching methods",
    principiaIcon: <Check className="h-5 w-5 text-green-400" />,
    traditionalIcon: <X className="h-5 w-5 text-red-400" />,
  },
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
                  <th className="w-1/3 py-5 px-6 text-left text-gray-300 font-semibold text-lg">Feature</th>
                  <th className="w-1/3 py-5 px-6 text-center text-indigo-300 font-bold text-xl relative">
                    Principia AI
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-indigo-400 rounded-full"></div>
                  </th>
                  <th className="w-1/3 py-5 px-6 text-center text-gray-400 font-semibold text-lg">Traditional AI</th>
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
                        <span className="text-gray-100 text-sm leading-relaxed">{item.principia}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center relative z-10">
                      <div className="flex items-center justify-center space-x-3 max-w-xs mx-auto">
                        <motion.div whileHover={{ scale: 1.2, transition: { duration: 0.2 } }}>
                          {item.traditionalIcon}
                        </motion.div>
                        <span className="text-gray-400 text-sm leading-relaxed">{item.traditional}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
      </div>
    );
  }
);

ComparisonSection.displayName = "ComparisonSection";

export { ComparisonSection };
