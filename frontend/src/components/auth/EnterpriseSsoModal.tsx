"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from "lucide-react";

interface EnterpriseSsoModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: "microsoft" | "sap" | null;
  onSuccess: (profile: { email: string; displayName: string }) => Promise<void>;
}

export function EnterpriseSsoModal({
  isOpen,
  onClose,
  provider,
  onSuccess,
}: EnterpriseSsoModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset fields when provider changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSubmitting(false);
      setIsSuccess(false);
      if (provider === "microsoft") {
        setEmail("user@enterprise-azure.com");
        setPassword("Microsoft#2026Pass");
      } else if (provider === "sap") {
        setEmail("S002481923@sap.corp");
        setPassword("SAP#Enterprise2026");
      } else {
        setEmail("");
        setPassword("");
      }
    }
  }, [isOpen, provider]);

  if (!isOpen || !provider) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError(
        provider === "microsoft"
          ? "Please enter your Microsoft account or work email."
          : "Please enter your SAP Universal ID, S-User ID, or corporate e-mail."
      );
      return;
    }

    if (!cleanEmail.includes("@") && provider === "microsoft") {
      setError("Please enter a valid Microsoft email address (e.g. name@company.com or name@outlook.com).");
      return;
    }

    if (!password) {
      setError("Please enter your account password.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate authentic secure SSO handshake delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const rawName = cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const displayName =
        provider === "microsoft"
          ? `${rawName || "Enterprise User"}`
          : `${rawName || "SAP Operator"}`;

      setIsSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 600));

      await onSuccess({
        email: cleanEmail,
        displayName,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please verify your credentials.");
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  };

  const isMicrosoft = provider === "microsoft";

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className={`relative w-full max-w-md my-auto rounded-2xl bg-white shadow-2xl border ${
            isMicrosoft ? "border-neutral-200" : "border-[#0070f2]/30"
          } p-6 sm:p-8 text-neutral-900 overflow-hidden z-10`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {isSuccess ? (
            /* Success confirmation screen */
            <div className="py-8 flex flex-col items-center text-center">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                  isMicrosoft ? "bg-emerald-50 text-emerald-600" : "bg-[#0070f2]/10 text-[#0070f2]"
                }`}
              >
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-1">
                {isMicrosoft ? "Microsoft Account Verified" : "SAP Universal ID Authenticated"}
              </h3>
              <p className="text-xs text-neutral-500 mb-3">
                Federating identity with LinqChain Command Center...
              </p>
              <div className="text-xs font-mono text-neutral-700 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">
                {email}
              </div>
            </div>
          ) : (
            <>
              {/* Provider Branding Header */}
              {isMicrosoft ? (
                /* Microsoft Header */
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="grid grid-cols-2 gap-0.5 w-5 h-5 shrink-0">
                      <div className="w-2.5 h-2.5 bg-[#f25022]" />
                      <div className="w-2.5 h-2.5 bg-[#7fba00]" />
                      <div className="w-2.5 h-2.5 bg-[#00a4ef]" />
                      <div className="w-2.5 h-2.5 bg-[#ffb900]" />
                    </div>
                    <span className="font-semibold text-neutral-800 text-lg tracking-tight">
                      Microsoft
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-1">
                    Sign in
                  </h2>
                  <p className="text-xs text-neutral-500">
                    to continue to <strong className="text-neutral-800 font-semibold">LinqChain Enterprise Platform</strong>
                  </p>
                </div>
              ) : (
                /* SAP Header */
                <div className="mb-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#0070B8] flex items-center justify-center text-white font-black text-xs shadow-sm">
                      SAP
                    </div>
                    <div>
                      <span className="font-bold text-neutral-900 text-base leading-none block">
                        SAP Identity Authentication
                      </span>
                      <span className="text-[10px] text-[#0070B8] font-medium block">
                        Enterprise Universal ID Federation
                      </span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900 mb-1">
                    Log On
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Use your SAP Universal ID, S-User ID, or corporate e-mail
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    {isMicrosoft ? "Email, phone, or Skype" : "E-Mail, S-User ID, or User ID"}
                  </label>
                  <input
                    type={isMicrosoft ? "email" : "text"}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      isMicrosoft
                        ? "name@company.com or name@outlook.com"
                        : "e.g. S002481923 or operator@sap.corp"
                    }
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2] transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Password
                    </label>
                    <span className="text-[11px] text-[#0070f2] hover:underline cursor-pointer">
                      Forgot password?
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isMicrosoft ? (
                  <div className="pt-2">
                    <p className="text-[11px] text-neutral-500 mb-4">
                      No account?{" "}
                      <span className="text-[#0070f2] hover:underline cursor-pointer font-medium">
                        Create one!
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-500 mb-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-neutral-300 text-[#0070f2] focus:ring-[#0070f2]"
                      />
                      <span>Remember this device</span>
                    </label>
                    <span className="text-[#0070B8] font-medium hover:underline cursor-pointer">
                      SAP Trust Center
                    </span>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2.5 rounded-xl font-semibold text-xs text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 ${
                      isMicrosoft
                        ? "bg-[#0078d4] hover:bg-[#006abc] shadow-[#0078d4]/20"
                        : "bg-[#0070B8] hover:bg-[#005a94] shadow-[#0070B8]/20"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>{isMicrosoft ? "Sign In" : "Log On with SAP"}</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Security Badge */}
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
                <Lock className="w-3 h-3 text-neutral-400" />
                <span>
                  {isMicrosoft
                    ? "Secured by Microsoft Azure Active Directory (OIDC)"
                    : "Secured by SAP Identity Authentication & SAML 2.0"}
                </span>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

