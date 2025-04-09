"use client";

import * as React from "react"
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
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

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title = "Principia AI",
      subtitle = {
        regular: "Socratic Learning, ",
        gradient: "AI-Powered",
      },
      description = "Guide students toward deeper understanding with our AI-powered Socratic tutor. Designed for responsible classroom use.",
      ctaText = "Get Started Free",
      ctaHref = "/signin",
      bottomImage,
      gridOptions = {},
      ...props
    },
    ref,
  ) => {
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

    return (
      <div className={cn("relative overflow-hidden bg-black", className)} ref={ref} {...props}>
        <section className="relative max-w-full mx-auto z-1">
          <RetroGrid {...gridOptions} darkLineColor="rgba(255, 255, 255, 0.06)" />
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-screen-xl z-10 mx-auto px-4 py-32 md:py-40 gap-12 md:px-8"
          >
            <div className="space-y-8 max-w-3xl mx-auto text-center">
              <motion.h1 variants={itemVariants} className="text-sm text-gray-300 group font-geist mx-auto px-4 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-full w-fit shadow-sm">
                {title}
                <ChevronRight className="inline w-4 h-4 ml-1 text-gray-400 group-hover:translate-x-1 duration-300" />
              </motion.h1>
              <motion.h2 variants={itemVariants} className="text-4xl tracking-tighter font-bold font-geist text-gray-50 mx-auto md:text-6xl">
                {subtitle.regular}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
                  {subtitle.gradient}
                </span>
              </motion.h2>
              <motion.p variants={itemVariants} className="max-w-xl mx-auto text-gray-400 text-lg md:text-xl">
                {description}
              </motion.p>
              <motion.div variants={itemVariants} className="items-center justify-center pt-6">
                <Link href={ctaHref}>
                  <ButtonColorful label={ctaText} />
                </Link>
              </motion.div>
            </div>
            {bottomImage && (
              <motion.div variants={itemVariants} className="mt-24 md:mt-32 mx-auto max-w-4xl relative z-10">
                <img
                  src={bottomImage.light}
                  className="w-full rounded-lg border border-gray-200 shadow-xl dark:hidden"
                  alt="Product preview light mode"
                />
                <img
                  src={bottomImage.dark}
                  className="w-full rounded-lg border border-gray-800 shadow-xl dark:block"
                  alt="Product preview dark mode"
                />
              </motion.div>
            )}
          </motion.div>
        </section>
      </div>
    )
  },
)
HeroSection.displayName = "HeroSection"

export { HeroSection }
