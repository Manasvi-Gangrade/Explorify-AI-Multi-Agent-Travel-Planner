"use client";

import Link from "next/link";
import { Heart, Star, Clock, MapPin, ShieldCheck, Check, Sun, Calendar, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCurrency } from "@/hooks/use-currency";
import { type Trip } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { BookingModal } from "@/components/booking/BookingModal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function WishlistHeart({
  tripId,
  className,
}: {
  tripId: string;
  className?: string;
}) {
  const { has, toggle } = useWishlist();
  const [pop, setPop] = useState(false);
  const active = has(tripId);

  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(tripId);
        setPop(true);
        window.setTimeout(() => setPop(false), 450);
      }}
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-card/90 text-foreground shadow-soft backdrop-blur transition-all hover:bg-card hover:scale-110",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-5 transition-all",
          active ? "fill-rose-500 text-rose-500" : "text-muted-foreground hover:text-rose-400",
          pop && "animate-[heart-pop_0.45s_cubic-bezier(0.34,1.56,0.64,1)]",
        )}
      />
    </button>
  );
}

function getWeatherInfo(destination: string, state: string) {
  const text = `${destination} ${state}`.toLowerCase();
  if (text.includes("kashmir") || text.includes("leh") || text.includes("ladakh")) return "18°C Mild · Apr–Oct Best Window";
  if (text.includes("goa") || text.includes("kerala") || text.includes("alleppey")) return "28°C Sunny · Nov–Feb Best Window";
  if (text.includes("jaipur") || text.includes("rajasthan") || text.includes("udaipur")) return "25°C Pleasant · Oct–Mar Best Window";
  if (text.includes("manali") || text.includes("himachal") || text.includes("shimla")) return "16°C Cool · Mar–June Best Window";
  return "24°C Pleasant · Year-round Best Window";
}

export function TripCard({ trip, index = 0 }: { trip: Trip; index?: number }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [bookingOpen, setBookingOpen] = useState(false);

  const weatherText = getWeatherInfo(trip.destination, trip.state);

  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated" || !session) {
      toast.error("Sign in required! Please log in to book your trip.");
      router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(`/trips/${trip.id}`)}`);
      return;
    }
    setBookingOpen(true);
  };

  return (
    <>
      <article className="group hover-lift relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={typeof trip.image === "string" ? trip.image : (trip.image as any)?.src ?? "/placeholder-trip.jpg"}
            alt={`${trip.destination}, ${trip.state} — ${trip.name}`}
            loading={index < 3 ? "eager" : "lazy"}
            width={1200}
            height={900}
            className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
          />
          <div className="pointer-events-none absolute inset-0 scrim opacity-70" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card/92 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
              <Clock className="size-3.5 text-[#1d6fa5]" />
              {trip.days}D / {trip.nights}N
            </span>
            {trip.freeCancellation && (
              <span className="rounded-full bg-gold/95 px-3 py-1 text-xs font-semibold text-gold-foreground">
                Free cancellation
              </span>
            )}
          </div>

          <WishlistHeart tripId={trip.id} className="absolute top-3 right-3" />

          <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between gap-3">
            <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-primary-foreground">
              <MapPin className="size-4 shrink-0 text-amber-300" />
              <span className="truncate">
                {trip.origin} → {trip.destination}
              </span>
            </p>

            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-card/92 px-2.5 py-1 text-xs font-semibold backdrop-blur">
              <Star className="size-3.5 fill-gold text-gold" />
              {trip.rating}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl leading-snug">{trip.name}</h3>
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground"
              title="Verified by ExplorifyTrips"
            >
              <ShieldCheck className="size-3.5 text-azure" />
              Verified
            </span>
          </div>

          {/* Live Weather & Season Badge */}
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 rounded-full border border-sky-200 dark:border-sky-800/50 w-fit">
            <Sun className="size-3.5 text-amber-500 shrink-0" />
            <span>{weatherText}</span>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {trip.blurb}
          </p>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {trip.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-md bg-surface px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>

          <ul className="mt-3 space-y-1.5">
            {trip.highlights.slice(0, 2).map((h) => (
              <li key={h} className="flex gap-2 text-sm text-foreground/80">
                <Check className="mt-0.5 size-4 shrink-0 text-azure" />
                <span>{h}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-end justify-between gap-2 pt-5">
            <div>
              <p className="text-xs text-muted-foreground">Starting from</p>
              <p className="font-display text-xl text-primary font-bold">
                {formatPrice(trip.price)}
                {trip.strikePrice && (
                  <span className="ml-1.5 font-sans text-xs text-muted-foreground line-through">
                    {formatPrice(trip.strikePrice)}
                  </span>
                )}
              </p>
            </div>

            <div className="flex gap-1.5">
              <Button
                type="button"
                size="sm"
                onClick={handleBookClick}
                className="bg-gradient-to-r from-[#1d6fa5] to-[#257ba6] hover:from-[#185c8a] hover:to-[#1d6fa5] text-white font-bold rounded-xl text-xs px-3 shadow-sm"
              >
                Book Now
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-xl text-xs px-2.5">
                <Link href={`/trips/${trip.id}`}>
                  View
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>

      {/* Booking Checkout Modal */}
      <BookingModal
        trip={trip}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />
    </>
  );
}

export function TripCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="shimmer aspect-[4/3] w-full" />
      <div className="space-y-3 p-5">
        <div className="shimmer h-5 w-2/3 rounded" />
        <div className="shimmer h-4 w-full rounded" />
        <div className="shimmer h-4 w-4/5 rounded" />
        <div className="flex justify-between pt-3">
          <div className="shimmer h-8 w-28 rounded" />
          <div className="shimmer h-8 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}
