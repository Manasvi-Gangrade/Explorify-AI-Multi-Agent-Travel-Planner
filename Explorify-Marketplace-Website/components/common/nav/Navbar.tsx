"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import ProfileMenu from "./ProfileMenu";
import { MapPin, Ticket, Compass } from "lucide-react";
import { usePathname } from "next/navigation";
import { GoogleTranslateWidget } from "@/components/common/StandaloneTranslateTTS";
import { VoiceNavigationAssistant } from "@/components/common/VoiceNavigationAssistant";
import { AudioGuideToggle } from "@/components/common/AudioGuideToggle";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const navItems = [
    { href: "/trips", label: "Browse Trips", icon: MapPin },
    { href: "/travel-planner", label: "Travel Planner", icon: Compass },
    { href: "/bookings", label: "My Bookings", icon: Ticket },
  ];

  return (
    <>
      {/* ── Brand Bar (static, part of page flow) ── */}
      <div className="relative z-40 border-b border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg hover:scale-105 transition-transform duration-200 shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1d6fa5] flex items-center justify-center text-white font-bold shadow-md text-sm sm:text-base">
              E
            </div>
            <span className="text-[#1d6fa5] dark:text-white font-extrabold text-lg sm:text-xl notranslate" translate="no">
              ExplorifyTrips
            </span>
          </Link>

          {/* Translation Widget, Audio Voice (Speaker) & Voice Assistant (Mic) */}
          <div className="flex items-center gap-2 shrink-0">
            <AudioGuideToggle />
            <VoiceNavigationAssistant />
            <GoogleTranslateWidget />
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ) : session ? (
              <ProfileMenu user={session.user} />
            ) : (
              <Link href="/auth/sign-in">
                <Button
                  size="sm"
                  className="rounded-full bg-gradient-to-r from-[#1d6fa5] to-[#257ba6] text-white font-bold shadow-md hover:scale-105 transition-all border-0 px-4 py-1.5"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Nav Links (sticky — scrolls below brand bar, then pins to top) ── */}
      {session && (
        <div className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
          <nav className="mx-auto max-w-7xl px-6 flex items-center justify-center gap-1 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold
                    transition-all duration-200 hover:scale-105
                    ${
                      isActive
                        ? "bg-[#1d6fa5]/12 text-[#1d6fa5] dark:bg-[#1d6fa5]/25 dark:text-sky-300 font-bold border border-[#1d6fa5]/30 shadow-xs"
                        : "text-slate-700 dark:text-slate-300 hover:bg-[#1d6fa5]/10 hover:text-[#1d6fa5]"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
