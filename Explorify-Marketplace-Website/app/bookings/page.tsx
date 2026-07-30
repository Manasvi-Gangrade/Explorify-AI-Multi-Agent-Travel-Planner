"use client";

import Link from "next/link";
import { CalendarDays, LifeBuoy, Ticket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTrip, trips, formatINR } from "@/lib/site-data";

export default function BookingsPage() {
  const { data: session } = useSession();
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const [localBookings, setLocalBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bookings
  useEffect(() => {
    const saved = localStorage.getItem("explorify_bookings");
    if (saved) {
      try {
        setLocalBookings(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    async function loadServerBookings() {
      try {
        const res = await fetch("/api/bookings");
        if (res.ok) {
          const json = await res.json();
          setDbBookings(json.bookings || []);
        }
      } catch (e) {
        console.error("Failed to load server bookings:", e);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      loadServerBookings();
    } else {
      setLoading(false);
    }
  }, [session]);

  const allBookings = useMemo(() => {
    const serverMapped = dbBookings.map((b) => {
      const details = getTrip(b.planId) || {
        name: `Custom India Itinerary`,
        destination: b.tripDate,
        image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800", // Taj Mahal default
        days: b.numPeople > 4 ? 6 : 5,
        nights: b.numPeople > 4 ? 5 : 4,
      };

      return {
        bookingId: b.bookingId,
        tripId: b.planId,
        name: details.name,
        destination: details.destination,
        image: typeof details.image === "string" ? details.image : (details.image as any)?.src,
        date: b.tripDate,
        days: details.days,
        nights: details.nights,
        numPeople: b.numPeople,
        totalAmount: b.totalAmount,
        paymentStatus: b.paymentStatus,
        bookingStatus: b.bookingStatus,
        createdAt: b.createdAt,
      };
    });

    const combined = [...localBookings, ...serverMapped];
    // Sort by newest
    combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return combined;
  }, [dbBookings, localBookings]);

  // Upcoming vs Past bookings split
  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return allBookings.filter((b) => {
      const dDate = new Date(b.date);
      return dDate >= now && b.bookingStatus !== "cancelled";
    });
  }, [allBookings]);

  const pastBookings = useMemo(() => {
    const now = new Date();
    return allBookings.filter((b) => {
      const dDate = new Date(b.date);
      return dDate < now || b.bookingStatus === "cancelled" || b.bookingStatus === "completed";
    });
  }, [allBookings]);

  // Seed default dummy bookings if none exist for a fresh demonstration
  const displayUpcoming = useMemo(() => {
    if (upcomingBookings.length > 0) return upcomingBookings;
    // Fallback dummies just for visual display if they haven't booked anything
    const t = trips[0];
    return [
      {
        bookingId: "demo-up-1",
        tripId: t.id,
        name: t.name,
        destination: t.destination,
        image: t.image,
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        days: t.days,
        nights: t.nights,
        numPeople: 2,
        totalAmount: t.price * 2.1,
        paymentStatus: "completed",
        bookingStatus: "confirmed",
        createdAt: new Date().toISOString(),
        isDemo: true,
      }
    ];
  }, [upcomingBookings]);

  const displayPast = useMemo(() => {
    if (pastBookings.length > 0) return pastBookings;
    const t = trips[1];
    return [
      {
        bookingId: "demo-past-1",
        tripId: t.id,
        name: t.name,
        destination: t.destination,
        image: t.image,
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        days: t.days,
        nights: t.nights,
        numPeople: 3,
        totalAmount: t.price * 3.15,
        paymentStatus: "completed",
        bookingStatus: "completed",
        createdAt: new Date().toISOString(),
        isDemo: true,
      }
    ];
  }, [pastBookings]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 bg-background min-h-[70vh]">
      <h1 className="font-display text-3xl sm:text-4xl text-foreground">My bookings</h1>

      {loading ? (
        <div className="mt-12 text-center py-8">
          <div className="w-8 h-8 border-2 border-azure border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Retrieving your bookings...</p>
        </div>
      ) : allBookings.length === 0 && !session ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-gradient-warm text-primary-foreground">
            <Ticket className="size-9" />
          </span>
          <h2 className="mt-6 font-display text-2xl text-foreground">No trips booked yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Somewhere in India there's a valley, a fort or a beach waiting for you. Log in or explore our catalog!
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="hero" size="lg">
              <Link href="/trips">Browse trips</Link>
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="mt-8">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past / Cancelled</TabsTrigger>
          </TabsList>

          {[
            { key: "upcoming", list: displayUpcoming },
            { key: "past", list: displayPast },
          ].map((group) => (
            <TabsContent key={group.key} value={group.key} className="mt-6 space-y-4">
              {group.list.map((b) => (
                <article
                  key={b.bookingId}
                  className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft sm:grid-cols-[160px_minmax(0,1fr)] hover-lift"
                >
                  <img
                    src={b.image}
                    alt={b.destination}
                    className="h-32 w-full rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-xl text-foreground">{b.name}</h2>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          b.bookingStatus === "confirmed" || b.bookingStatus === "completed"
                            ? "bg-accent text-accent-foreground"
                            : b.bookingStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {b.bookingStatus.toUpperCase()} {b.isDemo && "· DEMO"}
                        </span>
                      </div>
                      <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays className="size-4 text-azure" />
                        {new Date(b.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })} · {b.days}D/{b.nights}N · {b.numPeople} Traveller{b.numPeople > 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Amount Paid: <span className="font-semibold text-primary">{formatINR(b.totalAmount)}</span>
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline">View voucher</Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href="https://wa.me/911234567890" target="_blank" rel="noopener noreferrer">
                          <LifeBuoy className="size-3.5 mr-1" /> Contact support
                        </a>
                      </Button>
                      {group.key === "upcoming" && b.bookingStatus !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            toast.error("Online cancellations are locked within 14 days. Please contact support.");
                          }}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
