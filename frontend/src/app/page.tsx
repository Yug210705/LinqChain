import Navbar from "@/components/landing/layout/Navbar";
import Hero from "@/components/landing/sections/Hero";
import Problem from "@/components/landing/sections/Problem";
import ProductThesis from "@/components/landing/sections/ProductThesis";
import CoreCapabilities from "@/components/landing/sections/CoreCapabilities";
import CrashTest from "@/components/landing/sections/CrashTest";
import NetworkTwin from "@/components/landing/sections/NetworkTwin";
import DecisionSupport from "@/components/landing/sections/DecisionSupport";
import UseCases from "@/components/landing/sections/UseCases";
import HowItWorks from "@/components/landing/sections/HowItWorks";
import FinalCTA from "@/components/landing/sections/FinalCTA";
import Footer from "@/components/landing/layout/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0D0D0E] text-white selection:bg-[#FF9F68]/30">
      {/* Cinematic Harbor Background - Completely Static & Glitch-Free */}
      <div className="fixed inset-0 w-full h-[100dvh] min-h-screen z-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img
          src="/cinematic_bg.jpg"
          alt="Harbor Background"
          className="w-full h-full object-cover object-center blur-xs"
          style={{
            transform: "none",
            willChange: "auto",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />
      </div>

      <Navbar />
      <main className="flex-1 w-full relative z-10">
        <Hero />
        <Problem />
        <ProductThesis />
        <CoreCapabilities />
        <CrashTest />
        <NetworkTwin />
        <DecisionSupport />
        <UseCases />
        <HowItWorks />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
