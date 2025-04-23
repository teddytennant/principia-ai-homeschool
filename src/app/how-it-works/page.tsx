"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle, Brain, BookOpenCheck, Users } from "lucide-react";

// Animation variants
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

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "AI-Powered Guided Dialogue",
      description: "Our AI engages students with thought-provoking questions, using guided dialogue to deepen understanding and critical thinking.",
      icon: <Brain className="h-12 w-12 text-indigo-400" />,
      details: [
        "Adapts to each student's learning pace",
        "Encourages exploration over rote memorization",
        "Fosters a deeper grasp of complex concepts"
      ]
    },
    {
      title: "Curriculum Integration",
      description: "Teachers can upload their curriculum, and Principia AI tailors interactions to align with specific learning objectives and subjects.",
      icon: <BookOpenCheck className="h-12 w-12 text-indigo-400" />,
      details: [
        "Seamlessly integrates with existing lesson plans",
        "Supports diverse subjects from math to humanities",
        "Customizable to meet classroom goals"
      ]
    },
    {
      title: "Real-Time Student Monitoring",
      description: "Educators gain insights into student progress through real-time activity monitoring, enabling targeted support and feedback.",
      icon: <Users className="h-12 w-12 text-indigo-400" />,
      details: [
        "Track engagement and comprehension levels",
        "Identify areas where students need assistance",
        "Enhance teaching effectiveness with data-driven insights"
      ]
    }
  ];

  const handleStepClick = (index: number) => {
    setActiveStep(index);
  };

  return (
    <>
      <Header />
        <div className="flex flex-col min-h-screen bg-black overflow-hidden relative">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.3)_0,_rgba(0,0,0,0)_70%)] z-0 pointer-events-none animate-pulse-slow"></div>
        <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxwYXRoIGQ9Ik01MDAgNTAwQzI1MCA1MDAgMCA3NTAgMCAxMDAwQzAgMTI1MCAyNTAgMTUwMCA1MDAgMTUwMEM3NTAgMTUwMCAxMDAwIDEyNTAgMTAwMCAxMDAwQzEwMDAgNzUwIDc1MCA1MDAgNTAwIDUwMFoiIGZpbGw9InJnbGEoNzksIDcwLCAyMjksIDAuMTgpIi8+PHBhdGggZD0iTTUwMCA1MDBDNzUwIDUwMCAxMDAwIDc1MCAxMDAwIDEwMDBDMTAwMCAxMjUwIDc1MCAxNTAwIDUwMCAxNTAwQzI1MCAxNTAwIDAgMTI1MCAwIDEwMDBDMCA3NTAgMjUwIDUwMCA1MDAgNTAwWiIgZmlsbD0icmdiYSg3OSwgNzAsIDIyOSwgMC4xKSIvPjwvc3ZnPg==')] bg-repeat opacity-15 z-0 pointer-events-none animate-bg-shift-slow"></div>
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.2),transparent_60%)] opacity-20 z-0 pointer-events-none animate-pulse"></div>
        <main className="flex-grow z-10">
          <section className="py-20 md:py-32 bg-gradient-to-b from-indigo-900/90 via-gray-900/95 to-black relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxwYXRoIGQ9Ik01MDAgNTAwQzI1MCA1MDAgMCA3NTAgMCAxMDAwQzAgMTI1MCAyNTAgMTUwMCA1MDAgMTUwMEM3NTAgMTUwMCAxMDAwIDEyNTAgMTAwMCAxMDAwQzEwMDAgNzUwIDc1MCA1MDAgNTAwIDUwMFoiIGZpbGw9InJnbGEoNzksIDcwLCAyMjksIDAuMTgpIi8+PHBhdGggZD0iTTUwMCA1MDBDNzUwIDUwMCAxMDAwIDc1MCAxMDAwIDEwMDBDMTAwMCAxMjUwIDc1MCAxNTAwIDUwMCAxNTAwQzI1MCAxNTAwIDAgMTI1MCAwIDEwMDBDMCA3NTAgMjUwIDUwMCA1MDAgNTAwWiIgZmlsbD0icmdiYSg3OSwgNzAsIDIyOSwgMC4xKSIvPjwvc3ZnPg==')] bg-repeat opacity-15 animate-bg-shift"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(79,70,229,0.35),transparent_60%)] opacity-40 animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(147,51,234,0.25),transparent_50%)] opacity-30 animate-pulse"></div>
            <motion.div 
              className="absolute inset-0 flex justify-center items-center z-0"
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 0.2, scale: 1 }}
              transition={{ duration: 3, ease: "easeOut" }}
            >
              <div className="w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl"></div>
            </motion.div>
            <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
              <motion.div initial="hidden" animate="visible" variants={staggerChildren}>
                <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-bold text-white mb-6">
                  How Principia AI Works
                </motion.h1>
                <motion.p variants={fadeInUp} className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Discover how our innovative platform transforms education through AI-driven dialogue and personalized learning experiences.
                </motion.p>
              </motion.div>
            </div>
          </section>

          <section className="py-20 md:py-32 bg-gradient-to-b from-gray-900/98 to-gray-800/98 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.22)_1px,transparent_1px)] bg-[size:30px_30px] opacity-35 animate-grid-shift"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxjaXJjbGUgY3g9IjUwMCIgY3k9IjUwMCIgcj0iNDAwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoNzksIDcwLCAyMjksIDAuMTUpIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSI1MDAiIGN5PSI1MDAiIHI9IjMwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDc5LCA3MCwgMjI5LCAwLjEyKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iNTAwIiBjeT0iNTAwIiByPSIyMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg3OSwgNzAsIDIyOSwgMC4wOSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==')] bg-repeat opacity-15 z-0 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(79,70,229,0.28),transparent_50%)] opacity-50 animate-pulse"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.25),transparent_50%)] opacity-30 animate-pulse-slow"></div>
            <div className="max-w-5xl mx-auto px-4 relative z-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerChildren}>
                <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                  Our Process
                </motion.h2>
                <motion.div variants={fadeInUp} className="flex flex-col md:flex-row justify-center gap-6 md:gap-12 mb-12">
                  {steps.map((step, index) => (
                    <motion.div
                      key={index}
                      className={`cursor-pointer text-center p-6 rounded-xl relative overflow-hidden ${activeStep === index ? "bg-indigo-700/60 border-2 border-indigo-500 shadow-lg shadow-indigo-500/30" : "bg-gray-800/60 border border-gray-700"}`}
                      onClick={() => handleStepClick(index)}
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(79, 70, 229, 0.3)", transition: { duration: 0.2 } }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent opacity-0 ${activeStep === index ? "opacity-100" : ""} transition-opacity duration-300`}></div>
                      <div className="mb-4 flex justify-center relative z-10">{step.icon}</div>
                      <h3 className="text-xl font-semibold text-white mb-2 relative z-10">{step.title}</h3>
                      <p className="text-gray-400 relative z-10">{step.description}</p>
                      <motion.div 
                        className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-500/20 rounded-full blur-lg opacity-0"
                        animate={{ opacity: activeStep === index ? 0.7 : 0, scale: activeStep === index ? 1.2 : 0.8 }}
                        transition={{ duration: 0.5 }}
                      ></motion.div>
                      <motion.div 
                        className="absolute -top-2 -left-2 w-12 h-12 bg-indigo-500/20 rounded-full blur-lg opacity-0"
                        animate={{ opacity: activeStep === index ? 0.7 : 0, scale: activeStep === index ? 1.2 : 0.8 }}
                        transition={{ duration: 0.5 }}
                      ></motion.div>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div variants={fadeInUp} className="mb-12 bg-gray-800/80 p-8 rounded-2xl border border-indigo-700/30">
                  <h3 className="text-2xl font-bold text-white mb-4">{steps[activeStep].title}</h3>
                  <ul className="space-y-3">
                    {steps[activeStep].details.map((detail, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-indigo-400 mr-3 mt-0.5" />
                        <span className="text-gray-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
                <motion.div variants={fadeInUp} className="bg-gray-800/90 p-6 rounded-2xl border border-indigo-700/25 shadow-xl shadow-indigo-900/15 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.15),transparent_70%)] opacity-30 animate-pulse-slow"></div>
                  <h3 className="text-2xl font-bold text-white mb-6 text-center relative z-10">See {steps[activeStep].title} In Action</h3>
                  <div className="relative overflow-hidden rounded-xl border border-indigo-700/35 shadow-lg shadow-indigo-700/10">
                    <div className="aspect-video bg-gradient-to-br from-indigo-900/60 to-gray-900/85 relative">
                      <motion.div 
                        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxwYXRoIGQ9Ik01MDAgNTAwQzI1MCA1MDAgMCA3NTAgMCAxMDAwQzAgMTI1MCAyNTAgMTUwMCA1MDAgMTUwMEM3NTAgMTUwMCAxMDAwIDEyNTAgMTAwMCAxMDAwQzEwMDAgNzUwIDc1MCA1MDAgNTAwIDUwMFoiIGZpbGw9InJnbGEoNzksIDcwLCAyMjksIDAuMDgpIi8+PHBhdGggZD0iTTUwMCA1MDBDNzUwIDUwMCAxMDAwIDc1MCAxMDAwIDEwMDBDMTAwMCAxMjUwIDc1MCAxNTAwIDUwMCAxNTAwQzI1MCAxNTAwIDAgMTI1MCAwIDEwMDBDMCA3NTAgMjUwIDUwMCA1MDAgNTAwWiIgZmlsbD0icmdiYSg3OSwgNzAsIDIyOSwgMC4wNCkiLz48L3N2Zz4=')] bg-repeat opacity-20 animate-bg-shift-slow"></motion.div>
                      <motion.div
                        className="absolute inset-0 flex flex-col justify-center items-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        key={activeStep}
                      >
                        <div className="text-center p-6 bg-indigo-600/20 rounded-lg backdrop-blur-sm w-3/4">
                          {steps[activeStep].icon}
                          <p className="text-xl font-semibold text-white mt-4">{steps[activeStep].title}</p>
                          <div className="text-gray-300 mt-2 text-left">
                            {activeStep === 0 && (
                              <div>
                                <p className="mb-2"><strong>Step 1:</strong> Student interacts with AI tutor.</p>
                                <p className="mb-2"><strong>Step 2:</strong> AI asks probing questions like, "Why do you think this historical event had such a lasting impact?"</p>
                                <p><strong>Step 3:</strong> Student responds, and AI adapts follow-up questions to deepen understanding.</p>
                              </div>
                            )}
                            {activeStep === 1 && (
                              <div>
                                <p className="mb-2"><strong>Step 1:</strong> Teacher uploads curriculum content.</p>
                                <p className="mb-2"><strong>Step 2:</strong> AI analyzes material and aligns questions with lesson goals, e.g., "Let's explore how this concept applies to your current lesson on ecosystems."</p>
                                <p><strong>Step 3:</strong> Students receive personalized guidance based on the curriculum.</p>
                              </div>
                            )}
                            {activeStep === 2 && (
                              <div>
                                <p className="mb-2"><strong>Step 1:</strong> Teacher views real-time dashboard of student activity.</p>
                                <p className="mb-2"><strong>Step 2:</strong> AI highlights engagement levels and areas of struggle.</p>
                                <p><strong>Step 3:</strong> Teacher provides targeted support based on data insights.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                      <div className="absolute bottom-4 left-4 right-4 bg-gray-800/75 p-3 rounded-lg backdrop-blur-sm shadow-md shadow-indigo-900/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                            <span className="text-white text-sm font-medium">{activeStep === 2 ? "Teacher Monitoring" : "Student Engaged"}</span>
                          </div>
                          <motion.div
                            className="text-indigo-300 text-sm font-medium"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            {activeStep === 2 ? "Updating Insights..." : "Thinking..."}
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <motion.p variants={fadeInUp} className="text-center text-gray-300 mt-6">
                    {activeStep === 0 && "Watch how Principia AI engages students with dynamic questions, adapting to their responses in real-time to foster critical thinking."}
                    {activeStep === 1 && "See how Principia AI integrates with uploaded curricula, tailoring questions to align with specific learning objectives."}
                    {activeStep === 2 && "Observe how educators can monitor student engagement and comprehension, providing targeted support based on real-time data."}
                  </motion.p>
                </motion.div>
              </motion.div>
            </div>
          </section>


          <section className="py-20 md:py-32 bg-gradient-to-br from-indigo-900/95 via-purple-900/85 to-black relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.4),transparent_70%)] opacity-70 animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxwYXRoIGQ9Ik01MDAgNTAwQzI1MCA1MDAgMCA3NTAgMCAxMDAwQzAgMTI1MCAyNTAgMTUwMCA1MDAgMTUwMEM3NTAgMTUwMCAxMDAwIDEyNTAgMTAwMCAxMDAwQzEwMDAgNzUwIDc1MCA1MDAgNTAwIDUwMFoiIGZpbGw9InJnbGEoMTQ3LCA5MSwgMjU1LCAwLjE1KSIvPjxwYXRoIGQ9Ik01MDAgNTAwQzc1MCA1MDAgMTAwMCA3NTAgMTAwMCAxMDAwQzEwMDAgMTI1MCA3NTAgMTUwMCA1MDAgMTUwMEMyNTAgMTUwMCAwIDEyNTAgMCAxMDAwQzAgNzUwIDI1MCA1MDAgNTAwIDUwMFoiIGZpbGw9InJnYmEoMTQ3LCA5MSwgMjU1LCAwLjEpIi8+PC9zdmc+')] bg-repeat opacity-18 z-0 pointer-events-none animate-bg-shift"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(79,70,229,0.3),transparent_50%)] opacity-40 animate-pulse"></div>
            <motion.div 
              className="absolute top-1/2 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl z-0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 0.3, x: 0 }}
              transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
            ></motion.div>
            <motion.div 
              className="absolute bottom-1/3 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl z-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 0.3, x: 0 }}
              transition={{ duration: 2, ease: "easeOut", delay: 0.8 }}
            ></motion.div>
            <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerChildren}>
                <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
                  Ready to Transform Education?
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                  Join us today and experience the future of learning with Principia AI.
                </motion.p>
                <motion.div variants={fadeInUp} whileHover={cardHover} className="inline-block">
                  <a href="/pricing" className="inline-flex items-center px-8 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-full shadow-xl shadow-indigo-500/40 transition-all duration-300">
                    Get Started Now
                  </a>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </main>
        <div className="bg-gray-900/98 border-t border-gray-700/50 py-8 text-gray-300 relative z-10">
          <Footer />
        </div>
      </div>
    </>
  );
}
