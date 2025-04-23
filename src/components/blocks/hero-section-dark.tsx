"use client";

import * as React from "react"
import Link from 'next/link'
import Image from 'next/image'
import { cn } from "@/lib/utils"
import { ChevronRight, Brain } from "lucide-react"
import { motion } from 'framer-motion'
import { ButtonColorful } from "@/components/ui/button-colorful"

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: {
    regular: string
    gradient: string
  }
  description?: string
  ctaText?: string
  ctaHref?: string
  bottomImage?: {
    light: string
    dark: string
  }
  gridOptions?: {
    angle?: number
    cellSize?: number
    opacity?: number
    lightLineColor?: string
    darkLineColor?: string
  }
}

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.3,
  lightLineColor = "rgba(229, 231, 235, 0.5)",
  darkLineColor = "rgba(255, 255, 255, 0.08)",
}) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--light-line": lightLineColor,
    "--dark-line": darkLineColor,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
        `opacity-[var(--opacity)]`,
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent to-90% dark:from-black dark:to-transparent" />
    </div>
  )
}

// --- Animated Particle Background for Hero Section ---
import { useEffect, useRef } from "react";

function AnimatedParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosition = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId: number;
    const particles: { x: number; y: number; r: number; dx: number; dy: number; o: number }[] = [];
    const w = window.innerWidth;
    const h = canvas.parentElement?.offsetHeight || 800; // Use parent container height or a fallback
    canvas.width = w;
    canvas.height = h;
    for (let i = 0; i < 113; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.5 + Math.random() * 2.5,
        dx: -0.4 + Math.random() * 0.8,
        dy: -0.4 + Math.random() * 0.8,
        o: 0.2 + Math.random() * 0.3,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePosition.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        const dist = Math.sqrt(
          Math.pow(p.x - mousePosition.current.x, 2) + 
          Math.pow(p.y - mousePosition.current.y, 2)
        );
        const influenceRadius = 250;
        let newDx = p.dx;
        let newDy = p.dy;
        let newOpacity = p.o;

        if (dist < influenceRadius) {
          const angle = Math.atan2(p.y - mousePosition.current.y, p.x - mousePosition.current.x);
          const force = (1 - dist / influenceRadius) * 4;
          newDx += Math.cos(angle) * force;
          newDy += Math.sin(angle) * force;
          newOpacity = p.o + (1 - dist / influenceRadius) * 0.7;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(99,102,241,${newOpacity})`;
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
        p.x += newDx;
        p.y += newDy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      }
      animationFrameId = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full pointer-events-auto z-0" style={{ top: 0, left: 0, height: '100%' }} />
  );
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title = "Principia AI",
      subtitle = {
        regular: "Guided Learning, ",
        gradient: "AI-Powered",
      },
      description = "Guide students toward deeper understanding with our AI-powered guided tutor. Designed for responsible classroom use, we focus on teaching students how to think, not what to think.",
      ctaText = "Get Started Free",
      ctaHref = "/signin",
      bottomImage,
      gridOptions = {},
      ...props
    },
    ref,
  ) => {
    const line1 = subtitle.regular;
    const line2 = subtitle.gradient;

    // Container variant for staggering children
    const sentence = {
      hidden: { opacity: 1 }, // Container itself is visible
      visible: {
        opacity: 1,
        transition: {
          delayChildren: 0.4, // Start after title/description fade in
          staggerChildren: 0.06, // Stagger speed for letters
        },
      },
    };

    // Letter variant for individual animation
    const letter = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" },
      },
    };

    // Existing container for general section elements
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
      }
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
      }
    };

    // Hover animation for CTA button
    const ctaHover = {
      scale: 1.05,
      transition: { duration: 0.3 }
    };

    return (
      <div className={cn("relative overflow-hidden bg-gradient-to-br from-indigo-900 via-gray-900 to-black", className)} ref={ref} {...props}>
        <section className="relative max-w-full mx-auto z-1">
          {/* Animated Particle Background */}
          <AnimatedParticles />
          <RetroGrid {...gridOptions} darkLineColor="rgba(79, 70, 229, 0.1)" lightLineColor="rgba(79, 70, 229, 0.2)" opacity={0.5} />
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-screen-xl z-10 mx-auto px-4 py-24 md:py-32 gap-8 md:px-8"
          >
            {/* Image removed as per user request */}
            <div className="space-y-6 max-w-4xl mx-auto text-center">
              <motion.h1 variants={itemVariants} className="text-sm text-indigo-300 group font-geist mx-auto px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit shadow-sm shadow-indigo-500/20">
                {title}
                <ChevronRight className="inline w-4 h-4 ml-1 text-indigo-400 group-hover:translate-x-1 duration-300" />
              </motion.h1>

              {/* Animated Subtitle */}
              <motion.h2
                className="text-5xl tracking-tighter font-bold font-geist text-white mx-auto md:text-7xl"
                variants={sentence}
                initial="hidden"
                animate="visible"
              >
                {line1.split("").map((char, index) => (
                  <motion.span key={char + "-" + index} variants={letter}>
                    {char}
                  </motion.span>
                ))}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                  {line2.split("").map((char, index) => (
                    <motion.span key={char + "-" + index} variants={letter}>
                      {char}
                    </motion.span>
                  ))}
                </span>
              </motion.h2>

              <motion.p variants={itemVariants} className="max-w-3xl mx-auto text-gray-300 text-lg md:text-xl">
                {description}
              </motion.p>
              <motion.p variants={itemVariants} className="max-w-3xl mx-auto text-indigo-300 text-xl font-semibold italic mt-4">
                Teaching students how to think, not what to think.
              </motion.p>
              <motion.div 
                variants={itemVariants} 
                className="items-center justify-center pt-8"
                whileHover={ctaHover}
              >
                <Link href={ctaHref}>
                  <ButtonColorful label={ctaText} className="px-8 py-6 text-lg rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300" />
                </Link>
              </motion.div>
            </div>
            <motion.div 
              variants={itemVariants} 
              className="mt-16 md:mt-24 mx-auto max-w-5xl relative z-10"
            >
              <div className="bg-gray-800/90 p-6 rounded-2xl border border-indigo-700/20 shadow-xl shadow-indigo-900/10">
                <div className="relative overflow-hidden rounded-xl border border-indigo-700/30">
                  <div className="aspect-video bg-gradient-to-br from-indigo-900/50 to-gray-900/80 relative">
                    <div className="absolute inset-0 flex justify-center items-center">
                      <img 
                        src="/videos/ai-innovation.gif" 
                        alt="AI Innovation Demonstration" 
                        className="w-full h-full object-cover rounded-lg" 
                      />
                    </div>
                  </div>
                </div>
                <motion.p variants={itemVariants} className="text-center text-gray-300 mt-6">
                  Watch how Principia AI engages students with dynamic questions, adapting to their responses in real-time to foster critical thinking.
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>
    )
  },
)
HeroSection.displayName = "HeroSection"

export { HeroSection }
