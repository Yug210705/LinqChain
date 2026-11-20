"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { DesktopOnlyModal } from "@/components/landing/ui/DesktopOnlyModal";

export default function FinalCTA() {
  const productUrl = "/login";
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDesktopModal, setShowDesktopModal] = useState(false);

  const handleExplore = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowDesktopModal(true);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      router.push('/login');
    }, 600);
  };

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  const opacity1 = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const opacity2 = useTransform(scrollYProgress, [0.3, 0.8], [0, 1]);
  const y1 = useTransform(scrollYProgress, [0, 0.5], [50, 0]);
  const y2 = useTransform(scrollYProgress, [0.3, 0.8], [50, 0]);

  return (
    <section ref={containerRef} className="py-16 sm:py-24 md:py-40 w-full relative overflow-hidden bg-transparent">
      
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-24 relative z-10">
        <motion.div 
          className="max-w-5xl mx-auto text-center border border-white/10 bg-black/60 backdrop-blur-2xl p-6 sm:p-10 md:p-16 lg:p-24 rounded-2xl md:rounded-3xl shadow-2xl relative overflow-hidden"
          style={{ opacity: opacity1, y: y1 }}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FF9F68]/15 rounded-full blur-3xl pointer-events-none" />

          <motion.h2 className="text-3xl sm:text-5xl lg:text-7xl font-serif italic text-white mb-3 sm:mb-5 relative z-10">
            Build resilience.
          </motion.h2>
          <motion.p style={{ opacity: opacity2, y: y2 }} className="text-sm sm:text-lg md:text-xl text-white/70 font-light mb-8 sm:mb-12 max-w-xl mx-auto relative z-10 leading-relaxed">
            See the network. Simulate the disruption. Plan the recovery.
          </motion.p>
          
          <div className="flex items-center justify-center w-full relative z-10">
            <button
              onClick={handleExplore}
              disabled={isLoading}
              className="group inline-flex items-center justify-center gap-2.5 text-sm sm:text-base font-bold bg-[#FF9F68] hover:bg-white text-black px-8 py-3.5 sm:px-10 sm:py-4 rounded-full transition-all duration-300 shadow-[0_0_35px_rgba(255,159,104,0.4)] whitespace-nowrap cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Initializing...</span>
                </>
              ) : (
                <>
                  <span>Explore the platform</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      <DesktopOnlyModal
        isOpen={showDesktopModal}
        onClose={() => setShowDesktopModal(false)}
        destinationUrl="/login"
      />
    </section>
  );
}
