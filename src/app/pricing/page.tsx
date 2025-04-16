'use client'; // Use client for animations

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button"; // Standard button
import { ButtonColorful } from "@/components/ui/button-colorful"; // Colorful button
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  isContact
}) => {
  const cardVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0,
        duration: 0,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: "0 0 15px rgba(79, 70, 229, 0.5)",
        transition: { duration: 0.2 }
      }}
      className={`border rounded-xl p-6 flex flex-col shadow-lg transition-all duration-300 ${isFeatured ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-gradient-to-b from-gray-900/40 to-indigo-900/20 shadow-xl shadow-indigo-500/30' : 'border-gray-700 bg-gray-900/70 shadow-md shadow-gray-800/30'}`}
    >
      <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">{planName}</h3>
      <p className="text-gray-400 mb-4 h-8 text-sm leading-relaxed">{description}</p>
      <div className="mb-4">
        <span className="text-3xl font-bold text-white">{price}</span>
        {frequency && <span className="text-gray-400 text-xs ml-1">{frequency}</span>}
      </div>
      <ul className="space-y-2 text-gray-300 mb-6 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start">
            <CheckCircle className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      {isContact ? (
        <ButtonColorful label={ctaText} className="w-full mt-auto py-3 text-base rounded-full shadow-md shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all duration-300" onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))} />
      ) : (
        <Button asChild variant="outline" className="w-full mt-auto py-3 text-base bg-gray-800 hover:bg-gray-700 border-gray-600 text-white rounded-full transition-all duration-300">
          <Link href={ctaHref}>{ctaText}</Link>
        </Button>
      )}
    </motion.div>
  );
};

// Pricing Page Component
export default function PricingPage() {
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0
      }
    }
  };

  const plans = [
    {
      planName: "Schools & Districts",
      price: "Contact Us",
      frequency: "",
      description: "Tailored solutions for educational institutions.",
      features: [
        "Unlimited access to Socratic Tutor",
        "Admin dashboard & usage insights",
        "Integration with LMS (optional)",
        "Bulk licensing options",
        "Dedicated onboarding & support",
        "Customizable content filters",
      ],
      ctaText: "Contact Sales for Quote",
      ctaHref: "mailto:sales@principia.ai",
      isFeatured: true,
      isContact: true,
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('openContactModal', handleOpenModal);
    return () => window.removeEventListener('openContactModal', handleOpenModal);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle form submission, e.g., send data to an API
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-indigo-900/30 text-gray-100 py-20 md:py-28 px-4 overflow-hidden h-screen w-screen fixed top-0 left-0">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white tracking-tight">Flexible Pricing</h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto">Contact us to work out a plan that fits your needs.</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-10 items-stretch max-w-2xl mx-auto"
        >
          {plans.map((plan) => (
            <PricingCard key={plan.planName} {...plan} />
          ))}
        </motion.div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 p-8 rounded-xl max-w-md w-full shadow-xl shadow-indigo-500/20 border border-gray-700/50"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Contact Sales</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-6">Please fill out the form below, and our team will get back to you as soon as possible.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">District Email</label>
                <Input id="email" type="email" placeholder="your.district@email.com" required className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <Textarea id="message" placeholder="Tell us about your needs or inquiries..." required className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3" rows={5} />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md">Send Message</Button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
