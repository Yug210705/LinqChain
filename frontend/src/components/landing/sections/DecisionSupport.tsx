"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DesktopOnlyModal } from "@/components/landing/ui/DesktopOnlyModal";

export default function DecisionSupport() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [showDesktopModal, setShowDesktopModal] = useState(false);

  const handleSimulate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowDesktopModal(true);
      return;
    }
    router.push("/login");
  };

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const opacity1 = useTransform(scrollYProgress, [0, 0.3], [0.1, 1]);
  const opacity2 = useTransform(scrollYProgress, [0.1, 0.5], [0.1, 1]);

  return (
    <section ref={containerRef} className="py-32 w-full overflow-hidden bg-transparent">
      <div className="w-full px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <motion.div>
            <motion.h2 style={{ opacity: opacity1 }} className="text-3xl sm:text-4xl md:text-6xl font-serif italic text-white mb-4 md:mb-6">
              From signal to impact.
            </motion.h2>
            <motion.p style={{ opacity: opacity2 }} className="text-lg md:text-xl text-white/70 mb-10 md:mb-12 font-light">
              Don&apos;t just detect risk. Evaluate what to do next with AI-assisted resolution paths.
            </motion.p>
            
            <ul className="space-y-8">
              <li className="flex items-start gap-6 group">
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-hover:border-brand transition-colors">
                  <span className="text-xs font-mono text-white/50 group-hover:text-brand">01</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Detect Anomaly</h4>
                  <p className="text-sm text-white/50">Port congestion detected in Shanghai. ETA delayed by 4 days.</p>
                </div>
              </li>
              <li className="flex items-start gap-6 group">
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-hover:border-brand transition-colors">
                  <span className="text-xs font-mono text-white/50 group-hover:text-brand">02</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Trace Downstream Impact</h4>
                  <p className="text-sm text-white/50">14 shipments, 3 warehouses, and 2 major customer groups affected.</p>
                </div>
              </li>
              <li className="flex items-start gap-6 group">
                <div className="w-10 h-10 rounded-full bg-brand/20 border border-brand text-brand flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,159,104,0.3)]">
                  <span className="text-xs font-mono">03</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Evaluate Resolutions</h4>
                  <p className="text-sm text-white/50">Compare rerouting, expediting, or inventory reallocation.</p>
                </div>
              </li>
            </ul>
          </motion.div>

          <motion.div 
            className="relative rounded-2xl sm:rounded-3xl border border-white/10 bg-black/60 backdrop-blur-2xl p-4 sm:p-6 md:p-10 shadow-2xl overflow-hidden"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Top Amber Ambient Glow */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#FF9F68]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6 pb-3 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <h3 className="text-xs font-semibold tracking-wider text-red-400 uppercase font-mono">Port Congestion Detected</h3>
              </div>
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest hidden xs:inline">Incident #SC-402</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 relative z-10">
              <div className="p-3 sm:p-4 rounded-xl bg-white/[0.04] border border-white/10">
                <p className="text-[9px] font-mono tracking-widest text-white/40 uppercase mb-1">Monitored Route</p>
                <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Shanghai</span>
                  <ArrowRight className="w-3 h-3 text-[#FF9F68]" />
                  <span>Mumbai</span>
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/25">
                <p className="text-[9px] font-mono tracking-widest text-red-400/80 uppercase mb-1">Downstream Impact</p>
                <p className="text-xs sm:text-sm font-bold text-red-400">14 Shipments Delayed</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl border border-[#FF9F68]/30 bg-[#FF9F68]/[0.07] mb-5 sm:mb-6 relative z-10 shadow-[0_0_20px_rgba(255,159,104,0.1)]">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <h4 className="text-xs sm:text-sm font-bold text-white">Resolution Plan Active</h4>
                <span className="text-[9px] tracking-widest font-bold text-[#FF9F68] uppercase bg-[#FF9F68]/20 border border-[#FF9F68]/30 px-2.5 py-0.5 rounded-full font-mono">REROUTE</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed mb-3">
                Diverting 8 critical shipments to alternate port. Assembly runway preserved.
              </p>
              <div className="flex items-center gap-4 pt-2.5 border-t border-[#FF9F68]/20 text-[11px] font-mono">
                <span className="text-white/80">Cost: <strong className="text-white">$12.4K</strong></span>
                <span className="text-[#FF9F68]">Time saved: <strong className="text-white">3 days</strong></span>
              </div>
            </div>

            <motion.button 
              onClick={handleSimulate}
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,159,104,0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 sm:py-4 rounded-full bg-[#FF9F68] hover:bg-white text-black text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#FF9F68]/25 cursor-pointer whitespace-nowrap"
            >
              <span>Simulate Impact</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      <DesktopOnlyModal
        isOpen={showDesktopModal}
        onClose={() => setShowDesktopModal(false)}
        destinationUrl="/login"
      />
    </section>
  );
}
