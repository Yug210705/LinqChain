"use client";

import { motion } from "framer-motion";

const STEPS = [
  { num: "01", title: "CONNECT", desc: "Bring operational data together from ERP, WMS, and TMS." },
  { num: "02", title: "MAP", desc: "Model dependencies across the physical network." },
  { num: "03", title: "SIMULATE", desc: "Stress-test disruptions and \"what-if\" scenarios." },
  { num: "04", title: "RECOVER", desc: "Compare recovery strategies based on cost, delay, and risk." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 md:py-32 w-full overflow-hidden bg-transparent">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-24">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-12 sm:mb-16 md:mb-24"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[10px] font-mono tracking-widest text-[#FF9F68] uppercase bg-[#FF9F68]/10 px-3 py-1 rounded-full border border-[#FF9F68]/20 inline-block mb-3">
            Execution Blueprint
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif italic text-white mb-3">
            From data to decisions.
          </h2>
        </motion.div>

        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between relative">
            <motion.div 
              className="hidden md:block absolute top-[30px] left-0 w-full h-px bg-white/10 -translate-y-1/2 z-0"
              initial={{ scaleX: 0, transformOrigin: "left" }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            
            {STEPS.map((step, i) => (
              <motion.div 
                key={i} 
                className="flex flex-col md:items-center relative z-10 w-full md:w-1/4 mb-7 sm:mb-10 md:mb-0"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div className="hidden md:flex w-16 h-16 rounded-full bg-black border border-white/20 shadow-xl flex-col items-center justify-center mb-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-brand/10 scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300" />
                  <span className="font-mono text-xl font-light text-brand relative z-10">{step.num}</span>
                </div>
                
                <div className="md:text-center px-1 sm:px-4 md:px-8">
                  <h3 className="text-sm font-bold tracking-widest text-white mb-2 flex items-center gap-3 md:block uppercase font-mono">
                    <span className="md:hidden font-mono text-[#FF9F68] text-xs bg-[#FF9F68]/10 border border-[#FF9F68]/25 px-2 py-0.5 rounded-md font-bold">{step.num}</span>
                    <span>{step.title}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-white/55 font-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
