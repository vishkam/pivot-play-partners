import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { LogoMarquee } from "@/components/LogoMarquee";
import { Mission } from "@/components/Mission";
import { HowItWorks } from "@/components/HowItWorks";
import { MatchEngine } from "@/components/MatchEngine";
import { ForBrands } from "@/components/ForBrands";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pegasus — Where women athletes meet the brands that believe in them" },
      {
        name: "description",
        content:
          "Pegasus is the AI-powered marketplace connecting women athletes with values-aligned brands for authentic, fairly priced partnerships.",
      },
      { property: "og:title", content: "Pegasus — Partnership infrastructure for women's sports" },
      {
        property: "og:description",
        content:
          "The two-sided marketplace pairing women athletes with values-led brands. Verified profiles, AI matching, transparent contracts.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="bg-background">
      <Navbar />
      <Hero />
      <LogoMarquee />
      <Mission />
      <HowItWorks />
      <MatchEngine />
      <ForBrands />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
