"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Activity, ShieldAlert, Cpu } from "lucide-react";
import { useState, useEffect } from "react";
import { DesktopOnlyModal } from "@/components/landing/ui/DesktopOnlyModal";

export default function Hero() {
  const router = useRouter();
  const [showDesktopModal, setShowDesktopModal] = useState(false);

  const [textIndex, setTextIndex] = useState(0);
  const fullText = "> Generating recovery path...\n> Rerouting Supplier B cargo through Port 4.\n> Delay: +1.2 days | Cost impact: $61K.\n> Proceed?";
  
  useEffect(() => {
    if (textIndex < fullText.length) {
      const timeout = setTimeout(() => setTextIndex(prev => prev + 1), 45);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setTextIndex(0), 4000);
      return () => clearTimeout(timeout);
    }
  }, [textIndex, fullText.length]);

  const handleStartSimulating = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowDesktopModal(true);
      return;
    }
    router.push("/login");
  };

  return (
    <section className="relative min-h-[100vh] w-full flex flex-col items-center justify-start pt-24 sm:pt-32 md:pt-40 pb-16 md:pb-20 overflow-hidden bg-transparent">
      
      {/* Dynamic Lighting Orbs with Framer Motion floating effect */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand/20 rounded-[100%] blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1.1, 0.95, 1.1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-white/5 rounded-[100%] blur-[100px] pointer-events-none" 
      />

      {/* Grid Overlay for Tech Vibe */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-24 z-10 flex flex-col items-center relative">
        
        {/* Kicker */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-5 sm:mb-8"
        >
          <div className="flex items-center gap-2 sm:gap-2.5 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-xl shadow-xl shadow-black/40">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9F68] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF9F68]"></span>
            </span>
            <span className="text-white/90 text-[10px] sm:text-xs font-semibold tracking-wider sm:tracking-widest uppercase whitespace-nowrap">
              LinqChain Intelligence Layer 2.0
            </span>
          </div>
        </motion.div>

        {/* Headlines */}
        <motion.div 
          className="max-w-6xl w-full text-center flex flex-col items-center justify-center mb-4 sm:mb-6 md:mb-8"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <h1 className="text-[2.2rem] xs:text-[2.65rem] sm:text-6xl md:text-8xl lg:text-[7rem] font-sans font-bold tracking-tight text-white leading-[1.08] mb-1.5 md:mb-2 text-balance drop-shadow-2xl">
            The operating system
          </h1>
          <h1 className="text-[2.35rem] xs:text-[2.85rem] sm:text-6xl md:text-8xl lg:text-[7.5rem] font-serif italic text-[#FF9F68] tracking-tight leading-[1.08] text-balance drop-shadow-2xl pr-0 md:pr-4">
            for your supply chain.
          </h1>
        </motion.div>

        {/* Subtitle & CTAs */}
        <motion.div
          className="max-w-2xl text-center w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.4 }}
        >
          <p className="text-sm sm:text-base md:text-xl text-white/75 font-light tracking-normal text-balance leading-relaxed mb-6 sm:mb-8 md:mb-10 px-2 sm:px-4 md:px-0 max-w-lg mx-auto">
            See the physical network in real-time. Simulate cascading disruptions. Let AI map your fastest path to recovery.
          </p>

          <div className="flex items-center justify-center w-full">
            <motion.button
              onClick={handleStartSimulating}
              whileHover={{ scale: 1.04, boxShadow: "0 0 45px rgba(255,159,104,0.55)" }}
              whileTap={{ scale: 0.96 }}
              className="group inline-flex items-center justify-center gap-2.5 text-sm sm:text-base font-bold bg-[#FF9F68] hover:bg-white text-black px-8 py-3.5 sm:px-10 sm:py-4 rounded-full transition-all duration-300 shadow-[0_0_35px_rgba(255,159,104,0.4)] whitespace-nowrap cursor-pointer"
            >
              <span>Start simulating</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="w-full max-w-6xl mt-10 sm:mt-16 md:mt-24 px-3 sm:px-6 relative z-10 perspective-[2000px]"
        initial={{ opacity: 0, y: 150, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
      >
        <div className="w-full min-h-[300px] sm:min-h-[350px] md:min-h-[450px] lg:min-h-[500px] rounded-t-3xl border border-white/20 bg-black/50 backdrop-blur-3xl shadow-[0_-20px_80px_rgba(0,0,0,0.8)] overflow-hidden relative flex flex-col">
          {/* Mockup Header */}
          <div className="h-10 md:h-12 border-b border-white/10 bg-white/5 flex items-center justify-between px-4 md:px-6 gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="w-px h-4 bg-white/10 mx-2" />
              <span className="text-[10px] md:text-xs font-mono text-white/40">LinqChain Command Center</span>
            </div>
            {/* Live Status indicator on mobile & desktop */}
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider hidden sm:inline">Engine Live</span>
            </div>
          </div>

          {/* Mockup Body - Abstract UI */}
          <div className="flex-1 p-3 sm:p-4 md:p-8 flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-8 overflow-hidden">
            <div className="w-full md:w-64 flex flex-col gap-3 sm:gap-4 shrink-0">
              <div className="flex flex-row gap-3 sm:gap-4 w-full">
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 h-16 sm:h-20 md:h-24 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-center px-3 md:px-6 shrink-0"
                >
                  <p className="text-[8px] md:text-[10px] text-white/40 tracking-widest uppercase mb-1">Risk Score</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl md:text-3xl font-mono text-brand">42</span>
                    <Activity className="w-3 h-3 md:w-4 md:h-4 text-brand mb-1.5" />
                  </div>
                </motion.div>
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 h-16 sm:h-20 md:h-24 rounded-xl sm:rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col justify-center px-3 md:px-6 shrink-0"
                >
                  <p className="text-[8px] md:text-[10px] text-red-400 tracking-widest uppercase mb-1">Disruptions</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl md:text-3xl font-mono text-red-400">3</span>
                    <ShieldAlert className="w-3 h-3 md:w-4 md:h-4 text-red-400 mb-1.5" />
                  </div>
                </motion.div>
              </div>

              {/* Mobile Animated Topology Preview (Displayed on mobile screens) */}
              <div className="md:hidden w-full rounded-xl bg-white/[0.03] border border-white/10 p-3 flex flex-col gap-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono text-white/50 uppercase tracking-widest">Active Disruption Path</span>
                  <span className="text-[8px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">Port Bottleneck</span>
                </div>
                <div className="relative h-12 w-full flex items-center justify-between px-2">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 40" preserveAspectRatio="none">
                    <path d="M 30 20 L 150 20" stroke="rgba(239,68,68,0.3)" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                    <motion.path 
                      d="M 30 20 L 150 20" 
                      stroke="#ef4444" 
                      strokeWidth="2.5" 
                      strokeDasharray="4 4" 
                      fill="none" 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    />
                    <path d="M 150 20 L 270 20" stroke="rgba(250,204,21,0.3)" strokeWidth="2" fill="none" />
                    <motion.path 
                      d="M 150 20 L 270 20" 
                      stroke="#facc15" 
                      strokeWidth="2.5" 
                      fill="none" 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 0.5, ease: "linear" }}
                    />
                  </svg>
                  <div className="flex flex-col items-center z-10">
                    <div className="w-3.5 h-3.5 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <span className="text-[7px] text-white/60 font-mono mt-1">Supplier</span>
                  </div>
                  <div className="flex flex-col items-center z-10">
                    <div className="w-4 h-4 rounded-full bg-red-500/20 border-2 border-red-500 animate-pulse flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.8)]">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <span className="text-[7px] text-red-400 font-bold font-mono mt-1">Port Beta</span>
                  </div>
                  <div className="flex flex-col items-center z-10">
                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    </div>
                    <span className="text-[7px] text-yellow-400 font-mono mt-1">Plant</span>
                  </div>
                </div>
              </div>

              {/* AI Recommendation Box */}
              <div className="w-full min-h-[90px] sm:min-h-[100px] md:min-h-0 md:flex-1 rounded-xl sm:rounded-2xl bg-brand/5 border border-brand/20 p-3 sm:p-4 md:p-6 flex flex-col relative overflow-hidden shrink-0">
                <div className="flex items-center gap-2 mb-2 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  <p className="text-[8px] md:text-[10px] text-brand tracking-widest uppercase">AI Recommendation</p>
                </div>
                <div className="relative flex-1 min-h-[70px]">
                  <div className="absolute inset-0 text-[10px] md:text-sm text-white/90 font-mono leading-relaxed whitespace-pre-wrap">
                    {fullText.substring(0, textIndex)}
                    <motion.span 
                      animate={{ opacity: [1, 0] }} 
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-1 h-2.5 md:w-1.5 md:h-3.5 bg-brand ml-0.5 align-middle"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop Supply Chain Flow */}
            <div className="hidden md:flex flex-1 rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent relative overflow-hidden items-center justify-center">
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem]" />
               
               {/* Animated Supply Chain Flow */}
               <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Normal Edge */}
                  <path d="M 15 25 L 40 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
                  <motion.path d="M 15 25 L 40 50" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }} />

                  {/* Disrupted Edge */}
                  <path d="M 15 75 L 40 50" fill="none" stroke="rgba(239,68,68,0.2)" strokeWidth="0.4" strokeDasharray="1 1" />
                  <motion.path d="M 15 75 L 40 50" fill="none" stroke="rgba(239,68,68,0.8)" strokeWidth="0.6" strokeDasharray="2 2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />

                  {/* Cascading Impact Edge */}
                  <path d="M 40 50 L 70 50" fill="none" stroke="rgba(250,204,21,0.2)" strokeWidth="0.3" />
                  <motion.path d="M 40 50 L 70 50" fill="none" stroke="rgba(250,204,21,0.8)" strokeWidth="0.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, repeat: Infinity, delay: 0.5, ease: "linear" }} />

                  {/* Final Normal Edges */}
                  <path d="M 70 50 L 90 30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
                  <path d="M 70 50 L 90 70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
               </svg>

               {/* Nodes */}
               <div className="absolute top-[25%] left-[15%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                 <div className="w-3 h-3 rounded-full bg-white/20 border border-white" />
                 <span className="text-[9px] text-white/50 mt-1.5 uppercase font-medium tracking-widest bg-black/60 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm">Supplier A</span>
               </div>
               
               <div className="absolute top-[75%] left-[15%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                 <div className="w-5 h-5 rounded-full bg-red-500/20 border-2 border-red-500 animate-pulse flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                   <div className="w-2 h-2 rounded-full bg-red-500" />
                 </div>
                 <span className="text-[9px] text-red-400 mt-1.5 uppercase font-bold tracking-widest bg-black/60 px-2 py-0.5 rounded border border-red-500/30 backdrop-blur-sm">Supplier B (Disrupted)</span>
               </div>

               <div className="absolute top-[50%] left-[40%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                 <div className="w-4 h-4 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                 </div>
                 <span className="text-[9px] text-yellow-400 mt-1.5 uppercase font-bold tracking-widest bg-black/60 px-2 py-0.5 rounded border border-yellow-500/30 backdrop-blur-sm">Plant (At Risk)</span>
               </div>

               <div className="absolute top-[50%] left-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                 <div className="w-3 h-3 rounded-full bg-white/20 border border-white" />
                 <span className="text-[9px] text-white/50 mt-1.5 uppercase font-medium tracking-widest bg-black/60 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm">Warehouse</span>
               </div>

               <div className="absolute top-[30%] left-[90%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                 <div className="w-2 h-2 rounded-full bg-[#FF9F68]" />
                 <span className="text-[9px] text-[#FF9F68] mt-1.5 uppercase font-medium tracking-widest">Customer</span>
               </div>

               <div className="absolute top-[70%] left-[90%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                 <div className="w-2 h-2 rounded-full bg-[#FF9F68]" />
                 <span className="text-[9px] text-[#FF9F68] mt-1.5 uppercase font-medium tracking-widest">Customer</span>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      <DesktopOnlyModal
        isOpen={showDesktopModal}
        onClose={() => setShowDesktopModal(false)}
        destinationUrl="/login"
      />

    </section>
  );
}
