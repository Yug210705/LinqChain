"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Package, Clock, TrendingUp, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";

const PATHS = [
  {
    name: "PATH A",
    desc: "Alternate supplier",
    cost: "$61K",
    delay: "+1.2 days",
    risk: "Low",
    recommended: true,
  },
  {
    name: "PATH B",
    desc: "Inventory reallocation",
    cost: "$18K",
    delay: "+3.4 days",
    risk: "Medium",
    recommended: false,
  },
  {
    name: "PATH C",
    desc: "Route + supplier change",
    cost: "$42K",
    delay: "+2.1 days",
    risk: "Medium",
    recommended: false,
  },
];

export default function CrashTest() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mobileTab, setMobileTab] = useState<"impact" | "recovery">("impact");
  const [simStep, setSimStep] = useState(1);
  
  // We make the section 500vh tall to create a much longer, relaxed scroll timeline
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // Impact panel fades in
  const impactOpacity = useTransform(scrollYProgress, [0.1, 0.25], [0, 1]);
  const impactX = useTransform(scrollYProgress, [0.1, 0.25], [-50, 0]);

  // Recovery panel fades in
  const recoveryOpacity = useTransform(scrollYProgress, [0.35, 0.5], [0, 1]);
  const recoveryX = useTransform(scrollYProgress, [0.35, 0.5], [50, 0]);

  // Recommended path pops out at the end
  const recommendedScale = useTransform(scrollYProgress, [0.6, 0.75], [1, 1.05]);
  const recommendedGlow = useTransform(scrollYProgress, [0.6, 0.75], ["0px 0px 0px rgba(255,159,104,0)", "0px 0px 30px rgba(255,159,104,0.3)"]);

  return (
    <>
    <section ref={containerRef} className="relative hidden md:block md:h-[500vh] w-full bg-transparent mt-64 mb-32">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center pt-16 px-8 lg:px-12">
        
        <div className="w-full max-w-5xl flex flex-col items-center">
          <div className="text-center mb-4 md:mb-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-white mb-3 md:mb-4">
              Crash-test your supply chain.
            </h2>
            <p className="text-lg text-white/70 max-w-3xl mx-auto font-sans font-light">
              Scroll to model disruption scenarios, trace downstream impact, and compare recovery strategies before committing to a decision.
            </p>
          </div>

          <div className="w-full border border-white/10 rounded-2xl bg-black/60 backdrop-blur-2xl md:overflow-y-auto md:max-h-[85vh] shadow-2xl shrink-0 hide-scrollbar">
            <div className="border-b border-white/10 bg-white/5 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                <span className="text-[10px] font-medium tracking-widest text-red-400 uppercase">
                  Simulation Active
                </span>
              </div>
            </div>

            <div className="p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
              
              {/* Impact Panel */}
              <motion.div style={{ opacity: impactOpacity, x: impactX }}>
                <div className="mb-4">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-serif italic text-white mb-1">Primary Supplier</h3>
                  <p className="text-red-400 font-bold text-xs md:text-sm tracking-wide uppercase">Offline for 14 Days</p>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                    <Package className="w-4 h-4 md:w-5 md:h-5 text-brand" />
                    <div>
                      <p className="text-lg md:text-xl font-bold text-white leading-tight">18,420</p>
                      <p className="text-[8px] md:text-[10px] text-white/50 tracking-widest uppercase mt-0.5">Orders at risk</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                    <Clock className="w-4 h-4 md:w-5 md:h-5 text-brand" />
                    <div>
                      <p className="text-lg md:text-xl font-bold text-white leading-tight">11 Days</p>
                      <p className="text-[8px] md:text-[10px] text-white/50 tracking-widest uppercase mt-0.5">Inventory runway</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-brand" />
                    <div>
                      <p className="text-lg md:text-xl font-bold text-white leading-tight">37</p>
                      <p className="text-[8px] md:text-[10px] text-white/50 tracking-widest uppercase mt-0.5">Shipments affected</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recovery Panel */}
              <motion.div style={{ opacity: recoveryOpacity, x: recoveryX }}>
                <h4 className="text-[9px] md:text-[10px] text-white/50 tracking-widest uppercase mb-3 md:mb-4">Recovery Paths</h4>
                <div className="space-y-2 md:space-y-3">
                  {PATHS.map((path) => (
                    <motion.div 
                      key={path.name} 
                      style={path.recommended ? { scale: recommendedScale, boxShadow: recommendedGlow } : {}}
                      className={`p-3 md:p-4 rounded-xl border ${path.recommended ? "border-brand bg-brand/10 relative z-10" : "border-white/10 bg-white/5"}`}
                    >
                      {path.recommended && (
                        <div className="mb-1.5 md:mb-2 text-[8px] md:text-[10px] tracking-widest text-brand uppercase flex items-center gap-1.5">
                          <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3" /> Recommended
                        </div>
                      )}
                      <h5 className="text-sm md:text-base font-bold text-white mb-0.5">{path.name}</h5>
                      <p className="text-[10px] md:text-xs text-white/60 mb-2 md:mb-3">{path.desc}</p>
                      
                      <div className="grid grid-cols-3 gap-1 md:gap-2">
                        <div>
                          <p className="text-[7px] md:text-[9px] text-white/40 tracking-widest uppercase mb-0.5">Cost</p>
                          <p className="text-[9px] md:text-xs font-mono text-white">{path.cost}</p>
                        </div>
                        <div>
                          <p className="text-[7px] md:text-[9px] text-white/40 tracking-widest uppercase mb-0.5">Delay</p>
                          <p className="text-[9px] md:text-xs font-mono text-white">{path.delay}</p>
                        </div>
                        <div>
                          <p className="text-[7px] md:text-[9px] text-white/40 tracking-widest uppercase mb-0.5">Risk</p>
                          <p className="text-[9px] md:text-xs font-mono text-white">{path.risk}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Dedicated Mobile Interactive Framer Motion Section */}
    <section className="block md:hidden py-20 px-4 w-full bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-6"
      >
        <span className="text-[10px] font-mono tracking-widest text-[#FF9F68] uppercase bg-[#FF9F68]/10 px-3 py-1 rounded-full border border-[#FF9F68]/20 inline-block mb-3">
          Stress-Test Engine
        </span>
        <h2 className="text-3xl font-serif italic text-white mb-2">
          Crash-test your network.
        </h2>
        <p className="text-sm text-white/70 max-w-sm mx-auto font-light leading-relaxed">
          Simulate cascade failures and preview autonomous AI recovery paths in real time.
        </p>
      </motion.div>

      {/* Interactive Mobile Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full rounded-2xl border border-white/10 bg-black/70 backdrop-blur-2xl p-4 shadow-2xl overflow-hidden relative"
      >
        {/* Header Indicator */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase font-semibold">
              Simulation Active
            </span>
          </div>
          <span className="text-[9px] font-mono text-white/40">Tier-1 Disruption</span>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 mb-4">
          <button
            onClick={() => setMobileTab("impact")}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mobileTab === "impact" 
                ? "bg-[#FF9F68] text-black shadow-md shadow-[#FF9F68]/20" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Disruption Impact
          </button>
          <button
            onClick={() => setMobileTab("recovery")}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mobileTab === "recovery" 
                ? "bg-[#FF9F68] text-black shadow-md shadow-[#FF9F68]/20" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Recovery Options
          </button>
        </div>

        {/* Animated Tab Content */}
        <AnimatePresence mode="wait">
          {mobileTab === "impact" ? (
            <motion.div
              key="impact"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-400">Port 4 Shutdown</h4>
                  <p className="text-[11px] text-white/70 mt-0.5 leading-snug">
                    Supplier B cargo blocked. Downstream assembly at Plant Beta halted in 4.2 days.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Clock className="w-4 h-4 text-[#FF9F68] mx-auto mb-1" />
                  <p className="text-base font-bold font-mono text-white">4.2d</p>
                  <p className="text-[8px] text-white/50 uppercase tracking-wider mt-0.5">Runway</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <TrendingUp className="w-4 h-4 text-red-400 mx-auto mb-1" />
                  <p className="text-base font-bold font-mono text-red-400">37</p>
                  <p className="text-[8px] text-white/50 uppercase tracking-wider mt-0.5">Affected</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Package className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                  <p className="text-base font-bold font-mono text-white">$142K</p>
                  <p className="text-[8px] text-white/50 uppercase tracking-wider mt-0.5">Exposure</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="recovery"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-2.5"
            >
              {PATHS.map((path) => (
                <motion.div
                  key={path.name}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-xl border ${
                    path.recommended
                      ? "border-[#FF9F68] bg-[#FF9F68]/10 shadow-[0_0_20px_rgba(255,159,104,0.25)]"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{path.name}</span>
                    {path.recommended && (
                      <span className="text-[9px] font-mono tracking-wider text-[#FF9F68] bg-[#FF9F68]/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold uppercase">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/60 mb-2">{path.desc}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/80 pt-1.5 border-t border-white/10">
                    <span>Cost: <strong className="text-white">{path.cost}</strong></span>
                    <span>Delay: <strong className="text-white">{path.delay}</strong></span>
                    <span>Risk: <strong className={path.risk === "Low" ? "text-emerald-400" : "text-yellow-400"}>{path.risk}</strong></span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Action Feedback */}
        <motion.button
          onClick={() => {
            setSimStep(prev => (prev % 3) + 1);
            setMobileTab(prev => prev === "impact" ? "recovery" : "impact");
          }}
          whileTap={{ scale: 0.96 }}
          className="mt-4 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-medium text-white flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#FF9F68] animate-spin" style={{ animationDuration: "3s" }} />
          <span>Switch Scenario View (Step {simStep} of 3)</span>
        </motion.button>
      </motion.div>
    </section>
    </>
  );
}
