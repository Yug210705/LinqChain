"use client";

import { Search, Activity, RotateCcw } from "lucide-react";
import { motion, Variants } from "framer-motion";

const CAPABILITIES = [
  {
    id: "see",
    title: "SEE",
    subtitle: "Understand the network.",
    icon: Search,
    items: ["Suppliers", "Facilities", "Inventory", "Shipments", "Ports", "Vessels", "Routes", "Dependencies", "Risk"],
  },
  {
    id: "simulate",
    title: "SIMULATE",
    subtitle: "Stress-test the network.",
    icon: Activity,
    items: ["Supplier shutdown", "Port closure", "Shipment delay", "Demand spike", "Capacity reduction", "Raw material shortage"],
  },
  {
    id: "recover",
    title: "RECOVER",
    subtitle: "Evaluate the way back.",
    icon: RotateCcw,
    items: ["Alternative supplier", "Alternative route", "Inventory reallocation", "Shipment prioritization", "Production adjustment"],
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function CoreCapabilities() {
  return (
    <section className="py-16 sm:py-24 md:py-32 w-full overflow-hidden bg-transparent">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-24">
        <motion.div 
          className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 w-full"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {CAPABILITIES.map((cap) => (
            <motion.div 
              key={cap.id} 
              variants={cardVariants}
              whileTap={{ scale: 0.99 }}
              className="w-full group relative rounded-2xl md:rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl p-5 sm:p-7 lg:p-9 overflow-hidden hover:border-[#FF9F68]/30 transition-all duration-500 shadow-xl"
            >
              <div className="flex items-center gap-3.5 mb-3 sm:mb-6 relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#FF9F68]/15 border border-[#FF9F68]/30 flex items-center justify-center text-[#FF9F68] group-hover:scale-110 transition-transform duration-500 shrink-0 shadow-[0_0_15px_rgba(255,159,104,0.2)]">
                  <cap.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif italic text-white leading-tight">{cap.title}</h3>
                  <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest font-mono">{cap.subtitle}</p>
                </div>
              </div>

              {/* Responsive Micro-Chips Layout */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10 relative z-10">
                {cap.items.map((item, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-white/75 group-hover:text-white transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F68] shrink-0" />
                    <span className="truncate font-light text-[11px] sm:text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
