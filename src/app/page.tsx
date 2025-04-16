import { HeroSection } from "@/components/blocks/hero-section-dark";
import { HowItWorksSection } from "@/components/blocks/HowItWorksSection";
import { CallToActionSection } from "@/components/blocks/CallToActionSection";
import { FeaturesSectionWithBentoGrid } from "@/components/blocks/feature-section-with-bento-grid";

import { ComparisonSection } from "@/components/blocks/ComparisonSection";
import { OurMissionSection } from "@/components/blocks/OurMissionSection";
import { Footer } from "@/components/layout/Footer";
import { Header } from '@/components/layout/Header';

export default function Home() {
  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen bg-black overflow-hidden">
        <main className="flex-grow">
          <HeroSection
            title="Principia AI"
            subtitle={{
              regular: "Revolutionizing Education with ",
              gradient: "AI"
            }}
            description="Experience the future of education with Principia AI, a state-of-the-art Socratic chatbot crafted for schools. It inspires students to excel by posing insightful questions, nurturing critical thinking, and cultivating profound understanding."
            ctaText="Discover Plans"
            ctaHref="/pricing"
            bottomImage={{
              light: "/Screenshot 2025-04-11 at 5.24.13 PM.png",
              dark: "/Screenshot 2025-04-11 at 5.24.13 PM.png"
            }}
          />
          {/* Slogan integrated into HeroSection */}
          <div className="py-16 md:py-24 bg-gray-900/95">
            <OurMissionSection />
          </div>
          <div className="py-16 md:py-24 bg-gray-900/95">
            <FeaturesSectionWithBentoGrid />
          </div>
          <div className="py-16 md:py-24 bg-gradient-to-b from-gray-900 to-black">
            <HowItWorksSection />
          </div>
          <div className="py-16 md:py-24 bg-gray-800/90">
            <ComparisonSection />
          </div>
          <div className="py-16 md:py-24 bg-gradient-to-br from-indigo-900/80 to-black">
            <CallToActionSection />
          </div>
        </main>
        <div className="bg-gray-900/98 border-t border-gray-700/50 py-8 text-gray-300">
          <Footer />
        </div>
      </div>
    </>
  );
}
