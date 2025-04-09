'use client'; // Use client for animations

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button"; // Standard button
import { ButtonColorful } from "@/components/ui/button-colorful"; // Colorful button

// Pricing Card Component
interface PricingCardProps {
  planName: string;
  price: string;
  frequency?: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  isFeatured?: boolean; // Optional flag for highlighting a plan
  isContact?: boolean; // Flag for contact button
  index: number; // For animation delay
}

const PricingCard: React.FC<PricingCardProps> = ({
  planName,
  price,
  frequency = "/ month",
  description,
  features,
  ctaText,
  ctaHref,
  isFeatured,
  isContact,
  index
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.15, // Stagger animation
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      className={`border rounded-xl p-8 flex flex-col h-full ${isFeatured ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-gray-900/30' : 'border-gray-700 bg-gray-900/60'}`}
    >
      <h3 className="text-2xl font-semibold text-white mb-2">{planName}</h3>
      <p className="text-gray-400 mb-6 h-12">{description}</p>
      <div className="mb-6">
        <span className="text-4xl font-bold text-white">{price}</span>
        {frequency && <span className="text-gray-400 text-sm ml-1">{frequency}</span>}
      </div>
      <ul className="space-y-3 text-gray-300 mb-8 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center">
            <CheckCircle className="w-5 h-5 text-indigo-400 mr-2 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {isContact ? (
        <ButtonColorful label={ctaText} className="w-full mt-auto" /> // Using colorful for contact
        // Link wrapping might depend on contact method (e.g., mailto: or contact page)
        // <Link href={ctaHref} className="mt-auto block w-full">
        //   <ButtonColorful label={ctaText} className="w-full" />
        // </Link>
      ) : (
        <Button asChild variant="outline" className="w-full mt-auto bg-gray-800 hover:bg-gray-700 border-gray-600 text-white">
          <Link href={ctaHref}>{ctaText}</Link>
        </Button>
      )}
    </motion.div>
  );
};

// Pricing Page Component
export default function PricingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const plans = [
    {
      planName: "Individual",
      price: "$5",
      frequency: "/ month",
      description: "Perfect for individual students wanting to enhance their learning.",
      features: [
        "Access to Socratic Tutor",
        "Explore various subjects",
        "Personal learning companion",
        "Standard support",
      ],
      ctaText: "Get Started Now",
      ctaHref: "/signin", // Or a specific signup link
      isFeatured: false,
      isContact: false,
    },
    {
      planName: "Schools & Districts",
      price: "Custom",
      frequency: "", // No frequency for custom
      description: "Tailored solutions for educational institutions, large or small.",
      features: [
        "All Individual features",
        "Admin dashboard & usage insights",
        "Integration with LMS (optional)",
        "Bulk licensing options",
        "Dedicated onboarding & support",
        "Customizable content filters",
      ],
      ctaText: "Contact Sales",
      ctaHref: "mailto:sales@principia.ai", // Example mailto link
      isFeatured: true, // Highlight this plan
      isContact: true,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-gray-100 py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Flexible Pricing</h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">Choose the plan that best fits your educational needs.</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch" // Use items-stretch for equal height
        >
          {plans.map((plan, index) => (
            <PricingCard key={plan.planName} {...plan} index={index} />
          ))}
        </motion.div>
      </div>
    </div>
  );
} 