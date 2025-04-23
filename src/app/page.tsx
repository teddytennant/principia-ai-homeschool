"use client";

import { HeroSection } from "@/components/blocks/hero-section-dark";
import { HowItWorksSection } from "@/components/blocks/HowItWorksSection";
import { CallToActionSection } from "@/components/blocks/CallToActionSection";
import { FeaturesSectionWithBentoGrid } from "@/components/blocks/feature-section-with-bento-grid";
import { ComparisonSection } from "@/components/blocks/ComparisonSection";
import { OurMissionSection } from "@/components/blocks/OurMissionSection";
import { Footer } from "@/components/layout/Footer";
import { Header } from '@/components/layout/Header';
import { motion } from 'framer-motion';

export default function Home() {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  const cardHover = {
    scale: 1.05,
    boxShadow: "0 15px 30px -10px rgba(79, 70, 229, 0.3)",
    transition: { duration: 0.3 }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen bg-black overflow-hidden relative">
        {/* Global background overlay for depth with subtle animation */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.3)_0,_rgba(0,0,0,0)_70%)] z-0 pointer-events-none animate-pulse-slow"></div>
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxwYXRoIGQ9Ik01MDAgNTAwQzI1MCA1MDAgMCA3NTAgMCAxMDAwQzAgMTI1MCAyNTAgMTUwMCA1MDAgMTUwMEM3NTAgMTUwMCAxMDAwIDEyNTAgMTAwMCAxMDAwQzEwMDAgNzUwIDc1MCA1MDAgNTAwIDUwMFoiIGZpbGw9InJnbGEoNzksIDcwLCAyMjksIDAuMTgpIi8+PHBhdGggZD0iTTUwMCA1MDBDNzUwIDUwMCAxMDAwIDc1MCAxMDAwIDEwMDBDMTAwMCAxMjUwIDc1MCAxNTAwIDUwMCAxNTAwQzI1MCAxNTAwIDAgMTI1MCAwIDEwMDBDMCA3NTAgMjUwIDUwMCA1MDAgNTAwWiIgZmlsbD0icmdiYSg3OSwgNzAsIDIyOSwgMC4xKSIvPjwvc3ZnPg==')] bg-repeat opacity-15 z-0 pointer-events-none animate-bg-shift-slow"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.2),transparent_60%)] opacity-20 z-0 pointer-events-none animate-pulse"></div>
        <main className="flex-grow z-10">
          {/* Hero Section with dynamic background */}
      <div className="relative bg-gradient-to-br from-indigo-900/95 via-gray-900/98 to-black overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxwYXRoIGQ9Ik01MDAgNTAwQzI1MCA1MDAgMCA3NTAgMCAxMDAwQzAgMTI1MCAyNTAgMTUwMCA1MDAgMTUwMEM3NTAgMTUwMCAxMDAwIDEyNTAgMTAwMCAxMDAwQzEwMDAgNzUwIDc1MCA1MDAgNTAwIDUwMFoiIGZpbGw9InJnbGEoNzksIDcwLCAyMjksIDAuMTgpIi8+PHBhdGggZD0iTTUwMCA1MDBDNzUwIDUwMCAxMDAwIDc1MCAxMDAwIDEwMDBDMTAwMCAxMjUwIDc1MCAxNTAwIDUwMCAxNTAwQzI1MCAxNTAwIDAgMTI1MCAwIDEwMDBDMCA3NTAgMjUwIDUwMCA1MDAgNTAwWiIgZmlsbD0icmdiYSg3OSwgNzAsIDIyOSwgMC4xKSIvPjwvc3ZnPg==')] bg-repeat opacity-12 animate-bg-shift"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(79,70,229,0.3),rgba(147,51,234,0.15))] opacity-50 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(79,70,229,0.35),transparent_60%)] opacity-35 animate-pulse-slow"></div>
        <div className="absolute inset-0 flex justify-center items-center z-0 overflow-hidden">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src="/videos/ai-innovation.gif" type="video/mp4" />
          </video>
        </div>
        <HeroSection
          title="Principia AI"
          subtitle={{
            regular: "Revolutionizing Education ",
            gradient: "Through AI Innovation"
          }}
          description="Experience the future of learning with Principia AI, a cutting-edge platform designed for schools. Our advanced AI engages students with dynamic, thought-provoking questions, cultivating critical thinking and profound understanding."
          ctaText="Join the Revolution"
          ctaHref="/pricing"
          bottomImage={{
            light: "/videos/ai-innovation.gif",
            dark: "/videos/ai-innovation.gif"
          }}
        />
      </div>
          {/* Slogan integrated into HeroSection */}
          {/* Our Mission Section with unique background */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            className="py-20 md:py-32 bg-gray-900/98 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.3),transparent_70%)] opacity-70 z-0 pointer-events-none animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxwYXRoIGQ9Ik01MDAgNTAwQzI1MCA1MDAgMCA3NTAgMCAxMDAwQzAgMTI1MCAyNTAgMTUwMCA1MDAgMTUwMEM3NTAgMTUwMCAxMDAwIDEyNTAgMTAwMCAxMDAwQzEwMDAgNzUwIDc1MCA1MDAgNTAwIDUwMFoiIGZpbGw9InJnbGEoNzksIDcwLCAyMjksIDAuMSkiLz48cGF0aCBkPSJNNTAwIDUwMEM3NTAgNTAwIDEwMDAgNzUwIDEwMDAgMTAwMEMxMDAwIDEyNTAgNzUwIDE1MDAgNTAwIDE1MDBDMjUwIDE1MDAgMCAxMjUwIDAgMTAwMEMwIDc1MCAyNTAgNTAwIDUwMCA1MDBaIiBmaWxsPSJyZ2JhKDc5LCA3MCwgMjI5LCAwLjA1KSIvPjwvc3ZnPg==')] bg-repeat opacity-10 z-0 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 z-0 pointer-events-none animate-grid-shift-slow"></div>
            <motion.div 
              className="absolute top-10 left-10 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl z-0"
              initial={{ x: -50, y: -50, opacity: 0.3 }}
              animate={{ x: 100, y: 100, opacity: 0.6 }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            ></motion.div>
            <motion.div 
              className="absolute bottom-20 right-20 w-20 h-20 bg-purple-500/20 rounded-full blur-xl z-0"
              initial={{ x: 50, y: 50, opacity: 0.3 }}
              animate={{ x: -100, y: -100, opacity: 0.6 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
            ></motion.div>
            <OurMissionSection />
          </motion.div>
          {/* Features Section with vibrant background */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            className="py-20 md:py-32 bg-gray-900/98 relative"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.3),transparent_70%)] opacity-70 z-0 pointer-events-none animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxwYXRoIGQ9Ik01MDAgNTAwQzI1MCA1MDAgMCA3NTAgMCAxMDAwQzAgMTI1MCAyNTAgMTUwMCA1MDAgMTUwMEM3NTAgMTUwMCAxMDAwIDEyNTAgMTAwMCAxMDAwQzEwMDAgNzUwIDc1MCA1MDAgNTAwIDUwMFoiIGZpbGw9InJnbGEoNzksIDcwLCAyMjksIDAuMSkiLz48cGF0aCBkPSJNNTAwIDUwMEM3NTAgNTAwIDEwMDAgNzUwIDEwMDAgMTAwMEMxMDAwIDEyNTAgNzUwIDE1MDAgNTAwIDE1MDBDMjUwIDE1MDAgMCAxMjUwIDAgMTAwMEMwIDc1MCAyNTAgNTAwIDUwMCA1MDBaIiBmaWxsPSJyZ2JhKDc5LCA3MCwgMjI5LCAwLjA1KSIvPjwvc3ZnPg==')] bg-repeat opacity-10 z-0 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 z-0 pointer-events-none animate-grid-shift-slow"></div>
            <motion.div 
              className="absolute top-10 left-10 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl z-0"
              initial={{ x: -50, y: -50, opacity: 0.3 }}
              animate={{ x: 100, y: 100, opacity: 0.6 }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            ></motion.div>
            <motion.div 
              className="absolute bottom-20 right-20 w-20 h-20 bg-purple-500/20 rounded-full blur-xl z-0"
              initial={{ x: 50, y: 50, opacity: 0.3 }}
              animate={{ x: -100, y: -100, opacity: 0.6 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
            ></motion.div>
            <FeaturesSectionWithBentoGrid />
          </motion.div>
          {/* How It Works Section with subtle pattern */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            className="py-20 md:py-32 bg-gray-900/98 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.3),transparent_70%)] opacity-70 z-0 pointer-events-none animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxwYXRoIGQ9Ik01MDAgNTAwQzI1MCA1MDAgMCA3NTAgMCAxMDAwQzAgMTI1MCAyNTAgMTUwMCA1MDAgMTUwMEM3NTAgMTUwMCAxMDAwIDEyNTAgMTAwMCAxMDAwQzEwMDAgNzUwIDc1MCA1MDAgNTAwIDUwMFoiIGZpbGw9InJnbGEoNzksIDcwLCAyMjksIDAuMSkiLz48cGF0aCBkPSJNNTAwIDUwMEM3NTAgNTAwIDEwMDAgNzUwIDEwMDAgMTAwMEMxMDAwIDEyNTAgNzUwIDE1MDAgNTAwIDE1MDBDMjUwIDE1MDAgMCAxMjUwIDAgMTAwMEMwIDc1MCAyNTAgNTAwIDUwMCA1MDBaIiBmaWxsPSJyZ2JhKDc5LCA3MCwgMjI5LCAwLjA1KSIvPjwvc3ZnPg==')] bg-repeat opacity-10 z-0 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 z-0 pointer-events-none animate-grid-shift-slow"></div>
            <motion.div 
              className="absolute top-10 left-10 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl z-0"
              initial={{ x: -50, y: -50, opacity: 0.3 }}
              animate={{ x: 100, y: 100, opacity: 0.6 }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            ></motion.div>
            <motion.div 
              className="absolute bottom-20 right-20 w-20 h-20 bg-purple-500/20 rounded-full blur-xl z-0"
              initial={{ x: 50, y: 50, opacity: 0.3 }}
              animate={{ x: -100, y: -100, opacity: 0.6 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
            ></motion.div>
            <HowItWorksSection />
          </motion.div>
          {/* Comparison Section with contrasting background */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            className="py-20 md:py-32 bg-gray-900/98 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.3),transparent_70%)] opacity-70 z-0 pointer-events-none animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxwYXRoIGQ9Ik01MDAgNTAwQzI1MCA1MDAgMCA3NTAgMCAxMDAwQzAgMTI1MCAyNTAgMTUwMCA1MDAgMTUwMEM3NTAgMTUwMCAxMDAwIDEyNTAgMTAwMCAxMDAwQzEwMDAgNzUwIDc1MCA1MDAgNTAwIDUwMFoiIGZpbGw9InJnbGEoNzksIDcwLCAyMjksIDAuMSkiLz48cGF0aCBkPSJNNTAwIDUwMEM3NTAgNTAwIDEwMDAgNzUwIDEwMDAgMTAwMEMxMDAwIDEyNTAgNzUwIDE1MDAgNTAwIDE1MDBDMjUwIDE1MDAgMCAxMjUwIDAgMTAwMEMwIDc1MCAyNTAgNTAwIDUwMCA1MDBaIiBmaWxsPSJyZ2JhKDc5LCA3MCwgMjI5LCAwLjA1KSIvPjwvc3ZnPg==')] bg-repeat opacity-10 z-0 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 z-0 pointer-events-none animate-grid-shift-slow"></div>
            <motion.div 
              className="absolute top-10 left-10 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl z-0"
              initial={{ x: -50, y: -50, opacity: 0.3 }}
              animate={{ x: 100, y: 100, opacity: 0.6 }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            ></motion.div>
            <motion.div 
              className="absolute bottom-20 right-20 w-20 h-20 bg-purple-500/20 rounded-full blur-xl z-0"
              initial={{ x: 50, y: 50, opacity: 0.3 }}
              animate={{ x: -100, y: -100, opacity: 0.6 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
            ></motion.div>
            <ComparisonSection />
          </motion.div>
          {/* Showcase/Testimonial Section with advanced design */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            className="py-20 md:py-32 bg-gray-900/98 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.3),transparent_70%)] opacity-70 z-0 pointer-events-none animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxwYXRoIGQ9Ik01MDAgNTAwQzI1MCA1MDAgMCA3NTAgMCAxMDAwQzAgMTI1MCAyNTAgMTUwMCA1MDAgMTUwMEM3NTAgMTUwMCAxMDAwIDEyNTAgMTAwMCAxMDAwQzEwMDAgNzUwIDc1MCA1MDAgNTAwIDUwMFoiIGZpbGw9InJnbGEoNzksIDcwLCAyMjksIDAuMSkiLz48cGF0aCBkPSJNNTAwIDUwMEM3NTAgNTAwIDEwMDAgNzUwIDEwMDAgMTAwMEMxMDAwIDEyNTAgNzUwIDE1MDAgNTAwIDE1MDBDMjUwIDE1MDAgMCAxMjUwIDAgMTAwMEMwIDc1MCAyNTAgNTAwIDUwMCA1MDBaIiBmaWxsPSJyZ2JhKDc5LCA3MCwgMjI5LCAwLjA1KSIvPjwvc3ZnPg==')] bg-repeat opacity-10 z-0 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 z-0 pointer-events-none animate-grid-shift-slow"></div>
            <motion.div 
              className="absolute top-10 left-10 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl z-0"
              initial={{ x: -50, y: -50, opacity: 0.3 }}
              animate={{ x: 100, y: 100, opacity: 0.6 }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            ></motion.div>
            <motion.div 
              className="absolute bottom-20 right-20 w-20 h-20 bg-purple-500/20 rounded-full blur-xl z-0"
              initial={{ x: 50, y: 50, opacity: 0.3 }}
              animate={{ x: -100, y: -100, opacity: 0.6 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
            ></motion.div>
            <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
              <motion.h2 variants={sectionVariants} className="text-3xl md:text-5xl font-bold text-white mb-12">
                Transforming Education Worldwide
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div 
                  className="bg-gray-800/80 p-8 rounded-2xl border border-indigo-700/30 shadow-xl shadow-indigo-900/20"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } }}
                >
                  <p className="text-gray-300 italic text-lg mb-4">"Principia AI has revolutionized how my students approach learning. The depth of engagement is unparalleled."</p>
                  <p className="text-indigo-300 font-semibold">- Dr. Sarah Mitchell, Ed.D., High School Principal</p>
                </motion.div>
                <motion.div 
                  className="bg-gray-800/80 p-8 rounded-2xl border border-indigo-700/30 shadow-xl shadow-indigo-900/20"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.4 } }}
                >
                  <p className="text-gray-300 italic text-lg mb-4">"As a student, I feel challenged and supported. It's like having a personal tutor who understands me."</p>
                  <p className="text-indigo-300 font-semibold">- Emily Chen, 10th Grade Student</p>
                </motion.div>
              </div>
              <motion.div 
                className="mt-12 bg-gradient-to-br from-indigo-900/70 to-gray-900/80 p-6 rounded-xl border border-indigo-700/40 shadow-lg shadow-indigo-900/10"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 1, delay: 0.6 } }}
              >
                <h3 className="text-xl font-bold text-white mb-4">Advanced AI Technology</h3>
                <p className="text-gray-300">Our platform leverages state-of-the-art machine learning algorithms, based off of vast educational datasets, to deliver personalized learning experiences with unprecedented precision.</p>
              </motion.div>
            </div>
          </motion.div>
          {/* Call to Action Section with impactful background */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            className="py-20 md:py-32 bg-gray-900/98 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.3),transparent_70%)] opacity-70 z-0 pointer-events-none animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxwYXRoIGQ9Ik01MDAgNTAwQzI1MCA1MDAgMCA3NTAgMCAxMDAwQzAgMTI1MCAyNTAgMTUwMCA1MDAgMTUwMEM3NTAgMTUwMCAxMDAwIDEyNTAgMTAwMCAxMDAwQzEwMDAgNzUwIDc1MCA1MDAgNTAwIDUwMFoiIGZpbGw9InJnbGEoNzksIDcwLCAyMjksIDAuMSkiLz48cGF0aCBkPSJNNTAwIDUwMEM3NTAgNTAwIDEwMDAgNzUwIDEwMDAgMTAwMEMxMDAwIDEyNTAgNzUwIDE1MDAgNTAwIDE1MDBDMjUwIDE1MDAgMCAxMjUwIDAgMTAwMEMwIDc1MCAyNTAgNTAwIDUwMCA1MDBaIiBmaWxsPSJyZ2JhKDc5LCA3MCwgMjI5LCAwLjA1KSIvPjwvc3ZnPg==')] bg-repeat opacity-10 z-0 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 z-0 pointer-events-none animate-grid-shift-slow"></div>
            <motion.div 
              className="absolute top-10 left-10 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl z-0"
              initial={{ x: -50, y: -50, opacity: 0.3 }}
              animate={{ x: 100, y: 100, opacity: 0.6 }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            ></motion.div>
            <motion.div 
              className="absolute bottom-20 right-20 w-20 h-20 bg-purple-500/20 rounded-full blur-xl z-0"
              initial={{ x: 50, y: 50, opacity: 0.3 }}
              animate={{ x: -100, y: -100, opacity: 0.6 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
            ></motion.div>
            <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerChildren}>
                <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
                  Shape the Future of Learning
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
                  Be a part of the educational revolution with Principia AI's innovative platform.
                </motion.p>
                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4">
                  <motion.div whileHover={cardHover} className="inline-block">
                    <a href="/pricing" className="inline-flex items-center px-8 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-full shadow-xl shadow-indigo-500/40 transition-all duration-300">
                      Start Your Journey
                    </a>
                  </motion.div>
                  <motion.div 
                    whileHover={{ opacity: 0.9, transition: { duration: 0.4, ease: "easeOut" } }} 
                    whileTap={{ opacity: 0.8, transition: { duration: 0.2 } }}
                    className="inline-block"
                  >
                    <a href="/how-it-works" className="inline-flex items-center px-8 py-5 bg-transparent border-2 border-indigo-500 hover:bg-indigo-500/20 text-white font-bold text-lg rounded-full transition-all duration-400 ease-out antialiased">
                      Learn How It Works
                    </a>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </main>
        <div className="bg-gray-900/98 border-t border-gray-700/50 py-8 text-gray-300 relative z-10">
          <Footer />
        </div>
      </div>
    </>
  );
}
