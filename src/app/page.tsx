import { HeroSection } from "@/components/blocks/hero-section-dark";
import { HowItWorksSection } from "@/components/blocks/HowItWorksSection";
import { CallToActionSection } from "@/components/blocks/CallToActionSection";
import { FeaturesSectionWithBentoGrid } from "@/components/blocks/feature-section-with-bento-grid";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <main className="flex-grow">
        <HeroSection
          title="Principia AI"
          subtitle={{
            regular: "AI-Powered Learning for ",
            gradient: "Schools"
          }}
          description="Principia AI is an AI-powered Socratic educational chatbot designed for school use. It helps students learn responsibly by guiding them with questions and encouraging critical thinking, rather than providing direct answers."
          ctaText="View Pricing"
          ctaHref="/pricing"
          bottomImage={{
            light: "https://placehold.co/1024x576/e2e8f0/cbd5e0?text=Platform+Preview+(Light)",
            dark: "https://placehold.co/1024x576/1a202c/2d3748?text=Platform+Preview+(Dark)"
          }}
        />
        <FeaturesSectionWithBentoGrid />

        <HowItWorksSection />
        <CallToActionSection />
      </main>
      <Footer />
    </div>
  );
}
