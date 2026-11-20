'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function MobileDeviceAdvisory() {
  const [isMobile, setIsMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  if (!isMobile || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-[#18181b]/95 border-b border-amber-500/30 text-white backdrop-blur-md px-3 py-2.5 z-[60] relative"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
              <Monitor className="w-3.5 h-3.5" />
            </div>
            <p className="text-white/90 truncate font-light">
              <span className="font-semibold text-amber-400">Desktop Recommended:</span> LinqChain Platform is intended for desktop workstations for full multi-tier simulation graphs.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="text-[11px] text-amber-400 hover:text-amber-300 font-medium underline flex items-center gap-0.5"
            >
              Overview <ChevronRight className="w-3 h-3" />
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

