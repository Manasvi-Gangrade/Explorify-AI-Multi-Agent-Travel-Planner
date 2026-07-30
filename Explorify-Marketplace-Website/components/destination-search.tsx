"use client";

import { CalendarDays, MapPin, Search, Users } from "lucide-react";
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
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [travellers, setTravellers] = useState(2);
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
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    }
    router.push(`/trips?${params.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      className={cn(
        "relative w-full rounded-2xl border border-border bg-card/95 p-2 shadow-float backdrop-blur-xl",
        variant === "hero" ? "max-w-3xl" : "max-w-full",
      )}
    >
      <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_0.8fr_auto]">
        <div className="relative">
          <label htmlFor="dest-input" className="sr-only">
            Where in India do you want to go?
          </label>
          <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#1a213a]" />
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
            className="h-12 w-full rounded-xl bg-surface pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
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
                    <MapPin className="size-4 text-azure" />
                    {m}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <label htmlFor="dest-date" className="sr-only">
            Travel date
          </label>
          <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-azure" />
          <input
            id="dest-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 w-full rounded-xl bg-surface pr-3 pl-9 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="relative">
          <label htmlFor="dest-travellers" className="sr-only">
            Number of travellers
          </label>
          <Users className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-azure" />
          <input
            id="dest-travellers"
            type="number"
            min={1}
            max={20}
            value={travellers}
            onChange={(e) => setTravellers(Number(e.target.value))}
            className="h-12 w-full rounded-xl bg-surface pr-3 pl-9 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <Button type="submit" variant="hero" size="lg" className="h-12 w-full md:w-auto">
          <Search /> Search
        </Button>
      </div>
    </form>
  );
}
