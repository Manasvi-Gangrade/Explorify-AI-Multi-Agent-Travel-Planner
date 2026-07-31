"use client";

import { CalendarDays, MapPin, Search, Users, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { indianDestinations } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function DestinationSearch({
  variant = "hero",
}: {
  variant?: "hero" | "compact";
}) {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<"standard" | "ai">("standard");
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [travellers, setTravellers] = useState(2);
  const [aiPrompt, setAiPrompt] = useState("");
  const [openList, setOpenList] = useState(false);
  const uid = useId();
  const listId = `dest-list-${uid}`;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return indianDestinations.slice(0, 6);
    return indianDestinations.filter((d) => d.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeMode === "ai") {
      const params = new URLSearchParams();
      if (aiPrompt.trim()) params.set("prompt", aiPrompt.trim());
      router.push(`/travel-planner?${params.toString()}`);
      return;
    }

    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/trips?${params.toString()}`);
  };

  return (
    <div className={cn("w-full", variant === "hero" ? "max-w-3xl" : "max-w-full")}>
      {/* Sleek Minimal Dual Tabs */}
      {variant === "hero" && (
        <div className="mb-2 flex items-center gap-1.5 px-1">
          <div className="inline-flex items-center rounded-full bg-black/40 backdrop-blur-md p-1 border border-white/20 shadow-md">
            <button
              type="button"
              onClick={() => setActiveMode("standard")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                activeMode === "standard"
                  ? "bg-white text-[#1d6fa5] shadow-xs"
                  : "text-white/80 hover:text-white"
              )}
            >
              <Search className="size-3.5" /> Search Packages
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("ai")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                activeMode === "ai"
                  ? "bg-gradient-to-r from-[#1d6fa5] to-[#257ba6] text-white shadow-xs border border-sky-300/40 scale-105"
                  : "text-sky-200 hover:text-white"
              )}
            >
              <Sparkles className="size-3.5 text-amber-300" /> Plan with AI
            </button>
          </div>
        </div>
      )}

      {/* Main Search Form */}
      <form
        onSubmit={submit}
        className="relative w-full rounded-2xl border border-border bg-card/95 p-2 shadow-float backdrop-blur-xl transition-all"
      >
        {activeMode === "standard" ? (
          <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_0.8fr_auto]">
            {/* Destination Input */}
            <div className="relative">
              <label htmlFor="dest-input" className="sr-only">
                Where in India do you want to go?
              </label>
              <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#1d6fa5]" />
              <input
                id="dest-input"
                role="combobox"
                aria-expanded={openList}
                aria-controls={listId}
                aria-autocomplete="list"
                autoComplete="off"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpenList(true);
                }}
                onFocus={() => setOpenList(true)}
                onBlur={() => window.setTimeout(() => setOpenList(false), 140)}
                placeholder="Kashmir, Goa, Jaipur…"
                className="h-12 w-full rounded-xl bg-surface pr-3 pl-9 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-[#1d6fa5]"
              />
              {openList && matches.length > 0 && (
                <ul
                  id={listId}
                  role="listbox"
                  className="absolute top-[calc(100%+6px)] left-0 z-30 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-float"
                >
                  {matches.map((m) => (
                    <li key={m}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={m === query}
                        onMouseDown={() => {
                          setQuery(m);
                          setOpenList(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-accent"
                      >
                        <MapPin className="size-4 text-[#1d6fa5]" />
                        {m}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Date Input */}
            <div className="relative">
              <label htmlFor="dest-date" className="sr-only">
                Travel date
              </label>
              <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#1d6fa5]" />
              <input
                id="dest-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 w-full rounded-xl bg-surface pr-3 pl-9 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-[#1d6fa5]"
              />
            </div>

            {/* Travellers Input */}
            <div className="relative">
              <label htmlFor="dest-travellers" className="sr-only">
                Number of travellers
              </label>
              <Users className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#1d6fa5]" />
              <input
                id="dest-travellers"
                type="number"
                min={1}
                max={20}
                value={travellers}
                onChange={(e) => setTravellers(Number(e.target.value))}
                className="h-12 w-full rounded-xl bg-surface pr-3 pl-9 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-[#1d6fa5]"
              />
            </div>

            {/* Single Search Button */}
            <Button type="submit" variant="hero" size="lg" className="h-12 w-full md:w-auto bg-[#1d6fa5] hover:bg-[#185c8a] font-bold text-white shadow-md">
              <Search className="size-4" /> Search
            </Button>
          </div>
        ) : (
          /* Clean AI Prompt Mode */
          <div className="flex flex-col sm:flex-row gap-2 items-center p-1">
            <div className="relative w-full flex-1">
              <Sparkles className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#1d6fa5]" />
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. 5-day honeymoon trip to Kashmir under ₹40,000 with luxury houseboat stay…"
                className="h-12 w-full rounded-xl bg-surface pr-3 pl-9 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-[#1d6fa5]"
              />
            </div>
            <Button
              type="submit"
              className="h-12 w-full sm:w-auto px-6 rounded-xl bg-gradient-to-r from-[#1d6fa5] via-[#2079b3] to-[#185c8a] text-white font-extrabold shadow-md hover:scale-105 transition-all border-0 shrink-0"
            >
              <Sparkles className="size-4 mr-1.5 text-amber-300" /> Generate AI Itinerary
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
