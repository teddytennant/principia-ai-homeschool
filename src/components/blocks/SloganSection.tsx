"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HTMLMotionProps } from "framer-motion";

interface SloganSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<'section'>> { // Omit motion props from HTMLAttributes
  slogan?: string;
}

const SloganSection = React.forwardRef<HTMLDivElement, SloganSectionProps & HTMLMotionProps<'section'>>( // Combine types
  ({ className, slogan = "Teaching students how to think, not what to think.", ...restProps }, ref) => {
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.8, ease: "easeOut" },
      },
    };

    return (
      <motion.section
        ref={ref}
        className={cn(
          "py-16 md:py-24 bg-gradient-to-b from-black via-gray-900/50 to-black", // Subtle gradient background
          className
        )}
        initial="hidden"
        whileInView="visible" // Animate when in view
        viewport={{ once: true, amount: 0.3 }} // Trigger animation once when 30% visible
        variants={containerVariants}
        {...restProps} // Spread the remaining standard HTML attributes
      >
        <div className="max-w-screen-md mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold font-geist tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-500 italic">
            &ldquo;{slogan}&rdquo;
          </h2>
        </div>
      </motion.section>
    );
  }
);

SloganSection.displayName = "SloganSection";

export { SloganSection };
