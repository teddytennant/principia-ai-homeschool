'use client'; // Mark as Client Component

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Enhanced CallToActionSection with animation
export const CallToActionSection = () => {
  const sectionVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={sectionVariants}
      className="py-16 md:py-24 bg-gradient-to-r from-gray-900 via-black to-gray-900"
    >
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
          Ready to Transform Learning?
        </h2>
        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          Empower your students with AI-driven Socratic learning. Get started today and see the difference.
        </p>
        {/* Uncomment the sign-in button and point to /chat */}
        <motion.div
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          className="inline-block" // Wrapper for button animation
        >
          <Link
            href="/chat" // Update href to /chat
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-white text-gray-900 hover:bg-gray-200 h-11 px-8 shadow-md"
          >
            Start Chatting Now {/* Update text */}
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}; 