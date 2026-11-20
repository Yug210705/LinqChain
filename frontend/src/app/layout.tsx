import type { Metadata, Viewport } from "next";
import { Roboto, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { AppShell } from "@/components/layout/app-shell";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const roboto = Roboto({ 
  weight: ['300', '400', '500', '700', '900'],
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-roboto',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: 'swap',
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: "LinqChain - Intelligence for the Physical Supply Chain",
  description: "See what breaks before it happens. Model dependencies, simulate disruptions, and recover faster with the supply chain intelligence layer.",
  icons: {
    icon: "/linqchain-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.className} ${roboto.variable} ${playfair.variable} bg-slate-50 dark:bg-[#121212] min-h-screen text-slate-900 dark:text-neutral-100 antialiased`}>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
