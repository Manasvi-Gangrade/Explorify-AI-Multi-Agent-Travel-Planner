import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/common/theme-provider";
import { SiteHeader, SiteFooter, WhatsAppButton, MobileTabBar } from "@/components/site-chrome";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/sonner";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Explorify Trips — Handpicked India Tour Packages & AI Planner",
  description: "Explore India with custom itineraries, verified local operators, and real-time AI travel planning.",
};

import { TTSProvider } from "@/components/common/StandaloneTranslateTTS";
import { CurrencyProvider } from "@/hooks/use-currency";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${fraunces.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className="antialiased flex flex-col min-h-screen pb-16 lg:pb-0"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <CurrencyProvider>
              <TTSProvider>
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <SiteFooter />
                <WhatsAppButton />
                <MobileTabBar />
                <Toaster position="top-right" richColors />
              </TTSProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
