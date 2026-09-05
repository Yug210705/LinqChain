import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getActiveCurrency, CURRENCY_META } from "@/stores/useAppStore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  const cur = getActiveCurrency();

  // INR keeps Indian notation (Cr / L) for readability
  if (cur === 'INR') {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  const meta = CURRENCY_META[cur] || CURRENCY_META.USD;
  return new Intl.NumberFormat(meta.locale, {
    style: 'currency',
    currency: cur,
    maximumFractionDigits: value >= 100000 ? 1 : 0,
    notation: value >= 1000000 ? 'compact' : 'standard',
  }).format(value);
}
