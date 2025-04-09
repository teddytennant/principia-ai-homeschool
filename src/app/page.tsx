import { HeroSection } from "@/components/blocks/hero-section-dark";
import { FeaturesSection } from "@/components/blocks/FeaturesSection";
import { HowItWorksSection } from "@/components/blocks/HowItWorksSection";
import { CallToActionSection } from "@/components/blocks/CallToActionSection";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <HeroSection
        title="Principia AI"
        subtitle={{
          regular: "AI-Powered Learning for ",
          gradient: "Schools"
        }}
        description="Principia AI is an AI-powered Socratic educational chatbot designed for school use. It helps students learn responsibly by guiding them with questions and encouraging critical thinking, rather than providing direct answers."
        ctaText="Get Started"
        ctaHref="/signin"
      />
      <FeaturesSection />
      <HowItWorksSection />
      <CallToActionSection />
    </main>
  );
}
