import { Manrope, Instrument_Serif } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/modal";

const sans = Manrope({
  subsets: ["latin", "greek"],
  variable: "--font-sans",
  display: "swap",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nexus Control Center",
    template: "%s · Nexus",
  },
  description: "Premium εσωτερικό dashboard διαχείρισης για το Nexus",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el" className={`${sans.variable} ${display.variable} h-full`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('nexus-theme');var d=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
