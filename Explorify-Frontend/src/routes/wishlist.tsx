import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { TripCard } from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";
import { trips } from "@/lib/site-data";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Saved Trips | ExplorifyTrips" },
      { name: "description", content: "Your saved Indian trips, ready when you are." },
      { property: "og:title", content: "Saved Trips | ExplorifyTrips" },
      { property: "og:description", content: "Your saved Indian trips, ready when you are." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { ids } = useWishlist();
  const saved = trips.filter((t) => ids.includes(t.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl sm:text-4xl">Saved trips</h1>
      {saved.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-coral/15 text-coral"><Heart className="size-9" /></span>
          <h2 className="mt-6 font-display text-2xl">Nothing saved yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tap the heart on any trip to keep it here.</p>
          <Button asChild variant="hero" size="lg" className="mt-6"><Link to="/trips">Browse trips</Link></Button>
        </div>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((t, i) => <li key={t.id}><TripCard trip={t} index={i} /></li>)}
        </ul>
      )}
    </div>
  );
}
