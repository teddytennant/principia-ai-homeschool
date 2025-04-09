import * as React from "react"
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import { motion } from 'framer-motion'

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
        regular: "AI-Powered Learning for ",
        gradient: "Schools",
      },
      description = "An AI-powered Socratic educational chatbot guiding students with questions, encouraging critical thinking responsibly.",
      ctaText = "Start Chatting",
      ctaHref = "/chat",
      bottomImage,
      gridOptions = {},
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("relative overflow-hidden", className)} ref={ref} {...props}>
        <div className="absolute top-0 z-[-1] h-screen w-screen bg-white dark:bg-black" />
        <section className="relative max-w-full mx-auto z-1">
          <RetroGrid {...gridOptions} />
          <div className="max-w-screen-xl z-10 mx-auto px-4 py-28 md:py-36 gap-12 md:px-8">
            <div className="space-y-6 max-w-3xl mx-auto text-center">
              <h1 className="text-sm text-gray-700 dark:text-gray-300 group font-geist mx-auto px-4 py-1.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-full w-fit shadow-sm">
                {title}
                <ChevronRight className="inline w-4 h-4 ml-1 text-gray-500 dark:text-gray-400 group-hover:translate-x-1 duration-300" />
              </h1>
              <h2 className="text-4xl tracking-tighter font-bold font-geist text-gray-900 dark:text-gray-50 mx-auto md:text-6xl">
                {subtitle.regular}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  {subtitle.gradient}
                </span>
              </h2>
              <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-lg">
                {description}
              </p>
              <div className="items-center justify-center pt-4">
                <Link
                  href={ctaHref}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 h-11 px-8 shadow-sm"
                >
                  {ctaText}
                </Link>
              </div>
            </div>
            {bottomImage && (
              <div className="mt-24 md:mt-32 mx-auto max-w-4xl relative z-10">
                <img
                  src={bottomImage.light}
                  className="w-full rounded-lg border border-gray-200 shadow-xl dark:hidden"
                  alt="Product preview light mode"
                />
                <img
                  src={bottomImage.dark}
                  className="hidden w-full rounded-lg border border-gray-800 shadow-xl dark:block"
                  alt="Product preview dark mode"
                />
              </div>
            )}
          </div>
        </section>
      </div>
    )
  },
)
HeroSection.displayName = "HeroSection"

export { HeroSection }
