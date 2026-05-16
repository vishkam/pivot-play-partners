import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { LogoMarquee } from "@/components/LogoMarquee";
import { Mission } from "@/components/Mission";
import { HowItWorks } from "@/components/HowItWorks";
import { MatchEngine } from "@/components/MatchEngine";
import { AISponsorshipTeam } from "@/components/AISponsorshipTeam";
import { PlatformActivity } from "@/components/PlatformActivity";
import { ForBrands } from "@/components/ForBrands";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pegasus — AI sponsorship infrastructure for women's sports" },
      {
        name: "description",
        content:
          "Pegasus is the AI-powered sponsorship platform for women athletes and values-aligned brands — intelligent matching, proposals, contracts, payments and growth strategy in one infrastructure layer.",
      },
      { property: "og:title", content: "Pegasus — Your AI sponsorship manager for women's sports" },
      {
        property: "og:description",
        content:
          "AI matching, proposal generation, legal + escrow, and growth strategy for elite women athletes and values-led brands.",
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
      <AISponsorshipTeam />
      <MatchEngine />
      <PlatformActivity />
      <ForBrands />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
