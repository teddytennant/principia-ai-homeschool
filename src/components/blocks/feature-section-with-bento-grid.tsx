"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import createGlobe from "cobe";
import { useRef } from "react";
import { motion } from "framer-motion";

export function FeaturesSectionWithBentoGrid() {
  const features = [
    {
      title: "Socratic Learning Method",
      description:
        "Our AI guides students through concepts by asking questions that promote critical thinking, rather than simply providing answers.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 md:col-span-4 lg:col-span-4 border-b md:border-r dark:border-neutral-800",
    },
    {
      title: "Subject Expertise",
      description:
        "Principia AI covers a wide range of subjects including math, science, history, literature, and more, tailored to K-12 curriculum standards.",
      skeleton: <SkeletonTwo />,
      className: "col-span-1 md:col-span-2 lg:col-span-2 border-b dark:border-neutral-800",
    },
    {
      title: "Teacher Dashboard",
      description:
        "Teachers can monitor student progress, identify learning gaps, and customize the AI's approach to match their teaching style and curriculum.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-r dark:border-neutral-800",
    },
    {
      title: "Safe for Schools",
      description:
        "Built with privacy and safety in mind, Principia AI complies with educational data protection standards and provides age-appropriate responses.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-none",
    },
  ];
  return (
    <div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
          Educational AI for the Modern Classroom
        </h4>

        <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
          Principia AI transforms how students learn by guiding them through concepts with
          questions that develop critical thinking skills and deeper understanding.
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 mt-12 xl:border rounded-md dark:border-neutral-800">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        scale: 1.05, 
        boxShadow: "0 15px 35px -10px rgba(79, 70, 229, 0.4)"
      }}
      whileTap={{ scale: 0.97, y: 3 }}
      transition={{ 
        type: "spring", 
        stiffness: 340, 
        damping: 22, 
        delay: 0.05 * (Math.random() * 3), // Refined stagger for entrance
        duration: 0.5 
      }}
      viewport={{ once: true, amount: 0.4 }}
      className={cn(
        `p-4 sm:p-8 relative overflow-hidden cursor-pointer group transition-all duration-400 ease-in-out
         shadow-xl hover:shadow-2xl hover:z-20
         bg-gradient-to-br from-white/90 via-neutral-100/70 to-indigo-100/50 dark:from-neutral-900 dark:via-neutral-800 dark:to-indigo-900/50
         rounded-2xl border border-transparent hover:border-indigo-400/80`,
        className
      )}
      style={{ transformStyle: "flat" }}
    >
      {/* Animated border glow on hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-600 rounded-2xl border border-indigo-400/60 blur-lg" />
      {/* Background overlay for dark mode hover effect */}
      {/* Removed dark mode hover overlay to improve text readability */}
      {children}
    </motion.div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="max-w-5xl mx-auto text-left tracking-tight text-black dark:text-white text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base max-w-4xl text-left mx-auto",
        "text-neutral-500 text-center font-normal dark:text-neutral-300",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

// --- Animated Icon for Bento Cards ---
function AnimatedCardIcon({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0, y: 20 }}
      whileInView={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.2, 
        rotate: 10, 
        boxShadow: "0 10px 20px rgba(79, 70, 229, 0.5)", 
        background: "linear-gradient(135deg, #818cf8, #a78bfa, #f472b6)" 
      }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 360, damping: 20, delay: 0.25 }}
      viewport={{ once: true }}
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-2 shadow-xl shadow-indigo-500/30 border border-indigo-400/40"
    >
      {children}
    </motion.div>
  );
}

// --- ENHANCE SKELETONS TO USE ANIMATED ICON ---
function SkeletonOne() {
  return <AnimatedCardIcon><></></AnimatedCardIcon>;
}
function SkeletonTwo() {
  return <AnimatedCardIcon><></></AnimatedCardIcon>;
}
function SkeletonThree() {
  return <AnimatedCardIcon><></></AnimatedCardIcon>;
}
function SkeletonFour() {
  return <AnimatedCardIcon><></></AnimatedCardIcon>;
}

export const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={className}
    />
  );
};
