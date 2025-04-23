"use client";

import { HeroSection } from "@/components/blocks/hero-section-dark";
import { HowItWorksSection } from "@/components/blocks/HowItWorksSection";
import { CallToActionSection } from "@/components/blocks/CallToActionSection";
import { FeaturesSectionWithBentoGrid } from "@/components/blocks/feature-section-with-bento-grid";
import { ComparisonSection } from "@/components/blocks/ComparisonSection";
import { OurMissionSection } from "@/components/blocks/OurMissionSection";
import { Footer } from "@/components/layout/Footer";
import { Header } from '@/components/layout/Header';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

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
  const slideInLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };
  const slideInRight = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };
  const scaleUp = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const heroRef = useRef(null);
  const missionRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const comparisonRef = useRef(null);
  const testimonialRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-50px" });
  const missionInView = useInView(missionRef, { once: true, margin: "-50px" });
  const featuresInView = useInView(featuresRef, { once: true, margin: "-50px" });
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-50px" });
  const comparisonInView = useInView(comparisonRef, { once: true, margin: "-50px" });
  const testimonialInView = useInView(testimonialRef, { once: true, margin: "-50px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-50px" });

  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen bg-black overflow-hidden relative">
        {/* Global background overlay with linear gradient and subtle animation */}
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/30 via-gray-900/20 to-black/10 z-0 pointer-events-none animate-gradient-shift-slow"></div>
        <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-15 z-0 pointer-events-none animate-grid-shift-slow"></div>
        <motion.div 
          className="fixed inset-0 z-0 pointer-events-none"
          style={{ 
            background: "radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.15), transparent 50%)",
            opacity: 0.5
          }}
          animate={{
            background: [
              "radial-gradient(circle at 30% 30%, rgba(79, 70, 229, 0.15), transparent 50%)",
              "radial-gradient(circle at 70% 70%, rgba(79, 70, 229, 0.15), transparent 50%)",
              "radial-gradient(circle at 30% 70%, rgba(79, 70, 229, 0.15), transparent 50%)",
              "radial-gradient(circle at 70% 30%, rgba(79, 70, 229, 0.15), transparent 50%)",
              "radial-gradient(circle at 30% 30%, rgba(79, 70, 229, 0.15), transparent 50%)"
            ]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        ></motion.div>
        <main className="flex-grow z-10">
          {/* Hero Section with linear gradient background */}
          <div className="relative bg-gradient-to-br from-indigo-900/95 via-gray-900/98 to-black overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 to-gray-900/20 opacity-30 animate-gradient-shift-slow"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 animate-grid-shift-slow"></div>
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
            <motion.div
              ref={heroRef}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              variants={staggerChildren}
            >
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
            </motion.div>
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
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-gray-900/15 to-transparent opacity-50 z-0 pointer-events-none animate-gradient-shift-slow"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 z-0 pointer-events-none animate-grid-shift-slow"></div>
            <motion.div 
              className="absolute top-10 left-10 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl z-0"
              initial={{ x: -50, y: -50, opacity: 0.3 }}
              animate={{ x: 100, y: 100, opacity: 0.6 }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            >
            </motion.div>
            <motion.div 
              className="absolute bottom-20 right-20 w-20 h-20 bg-purple-500/20 rounded-full blur-xl z-0"
              initial={{ x: 50, y: 50, opacity: 0.3 }}
              animate={{ x: -100, y: -100, opacity: 0.6 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
            >
            </motion.div>
            <motion.div
              ref={missionRef}
              initial="hidden"
              animate={missionInView ? "visible" : "hidden"}
              variants={slideInLeft}
            >
              <OurMissionSection />
            </motion.div>
          </motion.div>
          {/* Features Section with vibrant background */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            className="py-20 md:py-32 bg-gray-900/98 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-gray-900/15 to-transparent opacity-50 z-0 pointer-events-none animate-gradient-shift-slow"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 z-0 pointer-events-none animate-grid-shift-slow"></div>
            <motion.div 
              className="absolute top-10 left-10 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl z-0"
              initial={{ x: -50, y: -50, opacity: 0.3 }}
              animate={{ x: 100, y: 100, opacity: 0.6 }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            >
            </motion.div>
            <motion.div 
              className="absolute bottom-20 right-20 w-20 h-20 bg-purple-500/20 rounded-full blur-xl z-0"
              initial={{ x: 50, y: 50, opacity: 0.3 }}
              animate={{ x: -100, y: -100, opacity: 0.6 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
            >
            </motion.div>
            <motion.div
              ref={featuresRef}
              initial="hidden"
              animate={featuresInView ? "visible" : "hidden"}
              variants={slideInRight}
            >
              <FeaturesSectionWithBentoGrid />
            </motion.div>
          </motion.div>
          {/* How It Works Section with subtle pattern */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            className="py-20 md:py-32 bg-gray-900/98 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-gray-900/15 to-transparent opacity-50 z-0 pointer-events-none animate-gradient-shift-slow"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 z-0 pointer-events-none animate-grid-shift-slow"></div>
            <motion.div 
              className="absolute top-10 left-10 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl z-0"
              initial={{ x: -50, y: -50, opacity: 0.3 }}
              animate={{ x: 100, y: 100, opacity: 0.6 }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            >
            </motion.div>
            <motion.div 
              className="absolute bottom-20 right-20 w-20 h-20 bg-purple-500/20 rounded-full blur-xl z-0"
              initial={{ x: 50, y: 50, opacity: 0.3 }}
              animate={{ x: -100, y: -100, opacity: 0.6 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
            >
            </motion.div>
            <motion.div
              ref={howItWorksRef}
              initial="hidden"
              animate={howItWorksInView ? "visible" : "hidden"}
              variants={scaleUp}
            >
              <HowItWorksSection />
            </motion.div>
          </motion.div>
          {/* Comparison Section with contrasting background */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            className="py-20 md:py-32 bg-gray-900/98 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-gray-900/15 to-transparent opacity-50 z-0 pointer-events-none animate-gradient-shift-slow"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 z-0 pointer-events-none animate-grid-shift-slow"></div>
            <motion.div 
              className="absolute top-10 left-10 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl z-0"
              initial={{ x: -50, y: -50, opacity: 0.3 }}
              animate={{ x: 100, y: 100, opacity: 0.6 }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            >
            </motion.div>
            <motion.div 
              className="absolute bottom-20 right-20 w-20 h-20 bg-purple-500/20 rounded-full blur-xl z-0"
              initial={{ x: 50, y: 50, opacity: 0.3 }}
              animate={{ x: -100, y: -100, opacity: 0.6 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
            >
            </motion.div>
            <motion.div
              ref={comparisonRef}
              initial="hidden"
              animate={comparisonInView ? "visible" : "hidden"}
              variants={slideInLeft}
            >
              <ComparisonSection />
            </motion.div>
          </motion.div>
          {/* Showcase/Testimonial Section with advanced design */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            className="py-20 md:py-32 bg-gray-900/98 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-gray-900/15 to-transparent opacity-50 z-0 pointer-events-none animate-gradient-shift-slow"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 z-0 pointer-events-none animate-grid-shift-slow"></div>
            <motion.div 
              className="absolute top-10 left-10 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl z-0"
              initial={{ x: -50, y: -50, opacity: 0.3 }}
              animate={{ x: 100, y: 100, opacity: 0.6 }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            >
            </motion.div>
            <motion.div 
              className="absolute bottom-20 right-20 w-20 h-20 bg-purple-500/20 rounded-full blur-xl z-0"
              initial={{ x: 50, y: 50, opacity: 0.3 }}
              animate={{ x: -100, y: -100, opacity: 0.6 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
            >
            </motion.div>
            <motion.div
              ref={testimonialRef}
              initial="hidden"
              animate={testimonialInView ? "visible" : "hidden"}
              variants={staggerChildren}
              className="max-w-5xl mx-auto px-4 text-center relative z-10"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-12">
                Transforming Education Worldwide
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div 
                  variants={fadeInUp}
                  className="bg-gray-800/80 p-8 rounded-2xl border border-indigo-700/30 shadow-xl shadow-indigo-900/20"
                >
                  <p className="text-gray-300 italic text-lg mb-4">"Principia AI has revolutionized how my students approach learning. The depth of engagement is unparalleled."</p>
                  <p className="text-indigo-300 font-semibold">- Dr. Sarah Mitchell, Ed.D., High School Principal</p>
                </motion.div>
                <motion.div 
                  variants={fadeInUp}
                  className="bg-gray-800/80 p-8 rounded-2xl border border-indigo-700/30 shadow-xl shadow-indigo-900/20"
                >
                  <p className="text-gray-300 italic text-lg mb-4">"As a student, I feel challenged and supported. It's like having a personal tutor who understands me."</p>
                  <p className="text-indigo-300 font-semibold">- Emily Chen, 10th Grade Student</p>
                </motion.div>
              </div>
              <motion.div 
                variants={fadeInUp}
                className="mt-12 bg-gradient-to-br from-indigo-900/70 to-gray-900/80 p-6 rounded-xl border border-indigo-700/40 shadow-lg shadow-indigo-900/10"
              >
                <h3 className="text-xl font-bold text-white mb-4">Advanced AI Technology</h3>
                <p className="text-gray-300">Our platform leverages state-of-the-art machine learning algorithms, based off of vast educational datasets, to deliver personalized learning experiences with unprecedented precision.</p>
              </motion.div>
            </motion.div>
          </motion.div>
          {/* Call to Action Section with impactful background */}
          <motion.div 
            ref={ctaRef}
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            variants={scaleUp}
            className="py-20 md:py-32 bg-gray-900/98 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-gray-900/15 to-transparent opacity-50 z-0 pointer-events-none animate-gradient-shift-slow"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 z-0 pointer-events-none animate-grid-shift-slow"></div>
            <motion.div 
              className="absolute top-10 left-10 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl z-0"
              initial={{ x: -50, y: -50, opacity: 0.3 }}
              animate={{ x: 100, y: 100, opacity: 0.6 }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            >
            </motion.div>
            <motion.div 
              className="absolute bottom-20 right-20 w-20 h-20 bg-purple-500/20 rounded-full blur-xl z-0"
              initial={{ x: 50, y: 50, opacity: 0.3 }}
              animate={{ x: -100, y: -100, opacity: 0.6 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
            >
            </motion.div>
            <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
              <motion.div variants={staggerChildren}>
                <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
                  Shape the Future of Learning
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
                  Be a part of the educational revolution with Principia AI's innovative platform.
                </motion.p>
                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4">
                  <motion.div 
                    whileHover={{ 
                      scale: 1.1, 
                      boxShadow: "0 0 20px rgba(79, 70, 229, 0.7), 0 15px 30px -10px rgba(79, 70, 229, 0.5)",
                      transition: { duration: 0.3 }
                    }} 
                    whileTap={{ scale: 0.95, transition: { duration: 0.2 } }}
                    className="inline-block relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 hover:opacity-30 transition-opacity duration-300 rounded-full"></div>
                    <a href="/pricing" className="inline-flex items-center px-10 py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-full shadow-xl shadow-indigo-500/40 transition-all duration-300 relative z-10">
                      Start Your Journey
                    </a>
                  </motion.div>
                  <motion.div 
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 0 15px rgba(79, 70, 229, 0.5)",
                      background: "rgba(79, 70, 229, 0.3)",
                      transition: { duration: 0.3 }
                    }} 
                    whileTap={{ scale: 0.95, transition: { duration: 0.2 } }}
                    className="inline-block relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
                    <a href="/how-it-works" className="inline-flex items-center px-8 py-5 bg-transparent border-2 border-indigo-500 hover:bg-indigo-500/20 text-white font-bold text-lg rounded-full transition-all duration-400 ease-out antialiased relative z-10">
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
