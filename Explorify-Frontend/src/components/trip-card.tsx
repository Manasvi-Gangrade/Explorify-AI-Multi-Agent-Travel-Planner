import { Link } from "@tanstack/react-router";
import { Heart, Star, Clock, MapPin, ShieldCheck, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatINR, type Trip } from "@/lib/site-data";
import { cn } from "@/lib/utils";

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
        "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-card/90 text-foreground shadow-soft backdrop-blur transition-colors hover:bg-card",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-5 transition-colors",
          active ? "fill-coral text-coral" : "text-muted-foreground",
          pop && "animate-[heart-pop_0.45s_cubic-bezier(0.34,1.56,0.64,1)]",
        )}
      />
    </button>
  );
}

export function TripCard({ trip, index = 0 }: { trip: Trip; index?: number }) {
  return (
    <article className="group hover-lift relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={trip.image}
          alt={`${trip.destination}, ${trip.state} — ${trip.name}`}
          loading={index < 3 ? "eager" : "lazy"}
          width={1200}
          height={900}
          className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
        />
        <div className="pointer-events-none absolute inset-0 scrim opacity-70" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card/92 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
            <Clock className="size-3.5 text-azure" />
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
            <MapPin className="size-4 shrink-0" />
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

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {trip.blurb}
        </p>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {trip.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-md bg-surface px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>

        <ul className="mt-4 space-y-1.5">
          {trip.highlights.slice(0, 2).map((h) => (
            <li key={h} className="flex gap-2 text-sm text-foreground/80">
              <Check className="mt-0.5 size-4 shrink-0 text-azure" />
              <span>{h}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xs text-muted-foreground">Starting from</p>
            <p className="font-display text-2xl text-primary">
              {formatINR(trip.price)}
              {trip.strikePrice && (
                <span className="ml-2 font-sans text-sm text-muted-foreground line-through">
                  {formatINR(trip.strikePrice)}
                </span>
              )}
            </p>
          </div>
          <Button asChild size="sm" variant="hero">
            <Link to="/trips/$tripId" params={{ tripId: trip.id }}>
              View trip
            </Link>
          </Button>
        </div>
      </div>
    </article>
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
