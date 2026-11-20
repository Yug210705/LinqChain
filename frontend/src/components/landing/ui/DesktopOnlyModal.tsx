"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Copy, Check, X, AlertTriangle, Layers, Cpu } from "lucide-react";

interface DesktopOnlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationUrl?: string;
}

export function DesktopOnlyModal({
  isOpen,
  onClose,
  destinationUrl = "/login",
}: DesktopOnlyModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin + destinationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-sm rounded-2xl sm:rounded-3xl border border-white/15 bg-[#121214] p-5 sm:p-7 shadow-[0_0_80px_rgba(255,159,104,0.25)] text-white overflow-hidden z-10"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-52 h-52 bg-[#FF9F68]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#FF9F68]/15 border border-[#FF9F68]/30 flex items-center justify-center text-[#FF9F68] shadow-[0_0_20px_rgba(255,159,104,0.3)]">
                <Monitor className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#FF9F68] uppercase bg-[#FF9F68]/10 px-2.5 py-0.5 rounded-full border border-[#FF9F68]/20 inline-block mb-1">
                  Workstation Required
                </span>
                <h3 className="text-xl font-bold font-sans text-white tracking-tight">
                  Desktop Recommended
                </h3>
              </div>
            </div>

            {/* Message Body */}
            <p className="text-sm text-white/70 leading-relaxed mb-6 font-light">
              <strong className="text-white font-medium">LinqChain Platform</strong> is an enterprise command center designed for large, high-resolution desktop monitors.
            </p>

            {/* Why Desktop features */}
            <div className="space-y-2.5 mb-6 bg-white/[0.03] border border-white/10 rounded-2xl p-3.5">
              <div className="flex items-center gap-3 text-xs text-white/80">
                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#FF9F68]">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span>Multi-tier interactive dependency graphs</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/80">
                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <span>Real-time cascading disruption simulations</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/80">
                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-yellow-400">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span>Autonomous AI recovery path matrices</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleCopyLink}
                className="w-full py-3.5 px-4 rounded-xl bg-[#FF9F68] hover:bg-[#ffb084] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(255,159,104,0.3)] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-black" />
                    <span className="font-bold">Link Copied! Open on Desktop</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-black" />
                    <span>Copy Desktop Access Link</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                Stay on Mobile Overview
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

