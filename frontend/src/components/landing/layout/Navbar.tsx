"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoIcon } from "@/components/landing/ui/LogoIcon";
import { DesktopOnlyModal } from "@/components/landing/ui/DesktopOnlyModal";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Platform", href: "#platform" },
  { name: "Use Cases", href: "#use-cases" },
  { name: "Network", href: "#network" },
  { name: "Careers", href: "#careers" },
  { name: "Book a Demo", href: "#demo" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showDesktopModal, setShowDesktopModal] = useState(false);
  const router = useRouter();

  const handleExplore = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileMenuOpen(false);
      setShowDesktopModal(true);
      return;
    }
    setIsNavigating(true);
    setTimeout(() => {
      router.push('/login');
    }, 500);
  };

  const productUrl = process.env.NEXT_PUBLIC_APP_URL || "https://resilience-os.vercel.app/command-center";

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={cn(
        "fixed top-0 inset-x-0 z-50 w-full pt-4 md:pt-6 pointer-events-none transition-all duration-300",
        isScrolled ? "bg-black/80 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none pb-4 md:pb-0" : "",
        showDesktopModal ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        <div className="w-full px-4 md:px-12 flex items-center justify-between pointer-events-auto">
        
        {/* Top Left Logo */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center gap-3 z-50 mix-blend-difference group">
            <LogoIcon className="w-7 h-7 md:w-8 md:h-8 text-white group-hover:scale-105 transition-transform" />
            <span className="font-serif italic text-2xl md:text-3xl tracking-wide text-white flex items-center">
              Linq<span className="ml-[2px]">Chain</span>
            </span>
          </Link>
        </div>

        {/* Center Floating Navbar */}
        <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium transition-colors duration-300 px-5 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/10"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex flex-1 justify-end items-center">
          <button
            onClick={handleExplore}
            disabled={isNavigating}
            className="flex items-center gap-2 text-sm font-bold bg-[#FF9F68] text-black px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity duration-300 shadow-lg shadow-[#FF9F68]/20 disabled:opacity-70"
          >
            {isNavigating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Initializing...
              </>
            ) : (
              "Explore the platform"
            )}
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="flex-1 flex justify-end md:hidden">
          <button
            className="z-50 text-white bg-black/50 backdrop-blur-xl p-2.5 rounded-full border border-white/15 hover:border-white/30 active:scale-95 transition-all shadow-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "fixed inset-0 bg-[#090a0f] z-[100] flex flex-col justify-between pt-24 pb-10 px-6 md:hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          mobileMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-full pointer-events-none"
        )}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-[#FF9F68]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        {/* Close button inside drawer for top-right */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-full bg-white/10 text-white/80 hover:text-white border border-white/15 active:scale-95 transition-all"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-5 items-start mt-4">
          <span className="text-[10px] font-mono tracking-widest text-[#FF9F68] uppercase font-semibold mb-1">
            Navigation
          </span>
          {navLinks.map((link, idx) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="group flex items-center justify-between w-full py-2 border-b border-white/[0.06] text-white hover:text-[#FF9F68] transition-colors"
            >
              <span className="text-2xl font-serif italic tracking-wide">
                {link.name}
              </span>
              <span className="text-xs font-mono text-white/30 group-hover:text-[#FF9F68] transition-colors">
                0{idx + 1}
              </span>
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/10 w-full flex flex-col items-center gap-3">
          <button
            onClick={(e) => {
              setMobileMenuOpen(false);
              handleExplore(e);
            }}
            disabled={isNavigating}
            className="w-full py-3.5 px-6 rounded-full bg-[#FF9F68] hover:bg-white text-black font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,159,104,0.3)] transition-all whitespace-nowrap disabled:opacity-70 cursor-pointer"
          >
            {isNavigating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initializing...</span>
              </>
            ) : (
              <span>Explore the platform</span>
            )}
          </button>
          <span className="text-[10px] font-mono text-white/40">
            LinqChain Operating System v2.0
          </span>
        </div>
      </div>
    </header>

    <DesktopOnlyModal
      isOpen={showDesktopModal}
      onClose={() => setShowDesktopModal(false)}
      destinationUrl="/login"
    />
  </>
  );
}
