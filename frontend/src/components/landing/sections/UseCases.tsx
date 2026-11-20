"use client";

import { ShieldAlert, PackageMinus, Anchor, Truck, BarChart3, Network, Route, Eye } from "lucide-react";
import { motion } from "framer-motion";

const USE_CASES = [
  { title: "Supplier Risk", desc: "Monitor supplier health and tier-N dependencies.", icon: ShieldAlert },
  { title: "Inventory Risk", desc: "Prevent stockouts before they affect revenue.", icon: PackageMinus },
  { title: "Port Disruption", desc: "Navigate congestion and port closures in real-time.", icon: Anchor },
  { title: "Transportation Risk", desc: "Track cascading delays across multi-modal transit.", icon: Truck },
  { title: "Demand Shocks", desc: "Simulate demand spikes against current capacity.", icon: BarChart3 },
  { title: "Network Planning", desc: "Optimize your physical footprint and routes.", icon: Network },
  { title: "Recovery Planning", desc: "Evaluate scenarios to restore operations faster.", icon: Route },
  { title: "Operational Visibility", desc: "One source of truth for the end-to-end supply chain.", icon: Eye },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="py-16 sm:py-24 md:py-32 w-full overflow-hidden bg-transparent">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-24">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-10 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[10px] font-mono tracking-widest text-[#FF9F68] uppercase bg-[#FF9F68]/10 px-3 py-1 rounded-full border border-[#FF9F68]/20 inline-block mb-3">
            Industry Solutions
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif italic text-white mb-3">
            For modern challenges.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-[1400px] mx-auto">
          {USE_CASES.map((uc, i) => (
            <motion.div 
              key={uc.title} 
              className="group p-5 sm:p-7 rounded-2xl md:rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl hover:border-[#FF9F68]/30 transition-all duration-300 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-[#FF9F68]/20 group-hover:border-[#FF9F68]/40 transition-all duration-300">
                <uc.icon className="w-5 h-5 text-white/75 group-hover:text-[#FF9F68] transition-colors duration-300" />
              </div>
              <h3 className="text-base sm:text-lg font-serif italic text-white mb-1.5">{uc.title}</h3>
              <p className="text-xs sm:text-sm text-white/55 font-light leading-relaxed">{uc.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
