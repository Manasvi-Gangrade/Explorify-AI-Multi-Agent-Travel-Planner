import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, LifeBuoy, Ticket } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trips } from "@/lib/site-data";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings | ExplorifyTrips" },
      { name: "description", content: "View upcoming and past India trip bookings, download vouchers and contact support." },
      { property: "og:title", content: "My Bookings | ExplorifyTrips" },
      { property: "og:description", content: "Manage your ExplorifyTrips India bookings and vouchers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Bookings,
});

function Bookings() {
  const [hasBookings, setHasBookings] = useState(true);
  const upcoming = trips.slice(0, 2);
  const past = trips.slice(4, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl sm:text-4xl">My bookings</h1>

      {!hasBookings ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-gradient-warm text-primary-foreground">
            <Ticket className="size-9" />
          </span>
          <h2 className="mt-6 font-display text-2xl">No trips booked yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Somewhere in India there's a valley, a fort or a beach waiting for you.
          </p>
          <Button asChild variant="hero" size="lg" className="mt-6"><Link to="/trips">Browse trips</Link></Button>
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="mt-8">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          {[
            { key: "upcoming", list: upcoming, status: "Confirmed" },
            { key: "past", list: past, status: "Completed" },
          ].map((group) => (
            <TabsContent key={group.key} value={group.key} className="mt-6 space-y-4">
              {group.list.map((t) => (
                <article key={t.id} className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft sm:grid-cols-[160px_minmax(0,1fr)]">
                  <img src={t.image} alt={t.destination} width={1200} height={900} loading="lazy" className="h-32 w-full rounded-xl object-cover" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl">{t.name}</h2>
                      <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground">{group.status}</span>
                    </div>
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="size-4 text-azure" /> 12–{12 + t.days} Sep 2026 · {t.days}D/{t.nights}N
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline">View voucher</Button>
                      <Button size="sm" variant="outline"><LifeBuoy /> Contact support</Button>
                      {group.key === "upcoming" && <Button size="sm" variant="ghost">Cancel</Button>}
                    </div>
                  </div>
                </article>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <button onClick={() => setHasBookings((v) => !v)} className="mt-8 text-xs text-muted-foreground underline">
        Preview {hasBookings ? "empty" : "filled"} state
      </button>
    </div>
  );
}
