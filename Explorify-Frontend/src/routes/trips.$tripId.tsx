import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/motion";
import { TripCard, WishlistHeart } from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatINR, getTrip, trips, mapPlanToTrip, type Trip } from "@/lib/site-data";

export const Route = createFileRoute("/trips/$tripId")({
  loader: async ({ params }) => {
    try {
      const res = await fetch(`/api/plans/${params.tripId}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      return { trip: mapPlanToTrip(json.plan) };
    } catch (e) {
      const trip = getTrip(params.tripId);
      if (!trip) throw notFound();
      return { trip };
    }
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Trip unavailable | ExplorifyTrips" }, { name: "robots", content: "noindex" }],
      };
    }
    const t = loaderData.trip;
    return {
      meta: [
        { title: `${t.name} — ${t.days}D/${t.nights}N ${t.state} Tour | ExplorifyTrips` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.name} — ${t.state}` },
        { property: "og:description", content: t.blurb },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/trips/${params.tripId}` },
      ],
      links: [{ rel: "canonical", href: `/trips/${params.tripId}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: t.name,
            description: t.overview,
            touristType: t.type,
            itinerary: t.itinerary.map((d) => ({
              "@type": "ListItem",
              position: d.day,
              name: d.title,
            })),
            offers: {
              "@type": "Offer",
              price: t.price,
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: t.rating,
              reviewCount: t.reviews,
            },
          }),
        },
      ],
    };
  },
  component: TripDetail,
});

function TripDetail() {
  const { trip } = Route.useLoaderData() as { trip: Trip };
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [travellers, setTravellers] = useState(2);
  const [date, setDate] = useState("");
  const total = trip.price * travellers;
  const related = trips.filter((t) => t.id !== trip.id).slice(0, 3);

  return (
    <article>
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <li><Link to="/" className="hover:text-primary">Home</Link></li>
          <li><ChevronRight className="size-3" /></li>
          <li><Link to="/trips" className="hover:text-primary">Trips</Link></li>
          <li><ChevronRight className="size-3" /></li>
          <li className="text-foreground">{trip.name}</li>
        </ol>
      </nav>

      <header className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-3xl text-balance-display sm:text-5xl">{trip.name}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-azure" />{trip.origin} → {trip.destination}</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="size-4 text-azure" />{trip.days} days / {trip.nights} nights</span>
              <span className="inline-flex items-center gap-1.5"><Star className="size-4 fill-gold text-gold" />{trip.rating} ({trip.reviews} reviews)</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-azure" />Verified by ExplorifyTrips</span>
            </p>
          </div>
          <WishlistHeart tripId={trip.id} className="shadow-soft" />
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-4 sm:grid-rows-2">
          {trip.gallery.map((g, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightbox(g)}
              className={`group relative overflow-hidden rounded-2xl ${i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}
            >
              <img
                src={g}
                alt={`${trip.destination} photo ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                width={1200}
                height={900}
                className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i === 0 ? "h-64 sm:h-full" : "h-32 sm:h-full"}`}
              />
            </button>
          ))}
        </div>
      </header>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[70] grid place-items-center bg-foreground/85 p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            aria-label="Close photo"
            className="absolute top-5 right-5 grid size-11 place-items-center rounded-full bg-card"
            onClick={() => setLightbox(null)}
          >
            <X className="size-5" />
          </button>
          <img src={lightbox} alt={`${trip.destination} enlarged`} className="max-h-[85vh] rounded-2xl object-contain" />
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div className="space-y-12">
          <Reveal>
            <h2 className="text-2xl">Overview</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{trip.overview}</p>
          </Reveal>

          <Reveal>
            <h2 className="text-2xl">Highlights</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {trip.highlights.map((h) => (
                <li key={h} className="flex gap-2.5 rounded-xl bg-surface p-4 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-azure" />{h}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-2xl">Day-by-day itinerary</h2>
            <ol className="mt-6 space-y-6 border-l-2 border-dashed border-azure/40 pl-6">
              {trip.itinerary.map((d) => (
                <li key={d.day} className="relative">
                  <span className="absolute -left-[38px] grid size-8 place-items-center rounded-full bg-gradient-azure text-xs font-bold text-primary-foreground">
                    {d.day}
                  </span>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                    <h3 className="font-display text-lg">{d.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.description}</p>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(d.place + ", India")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-primary hover:border-azure"
                    >
                      <MapPin className="size-3.5" /> View {d.place} on Google Maps
                    </a>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h2 className="text-2xl">Inclusions</h2>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {trip.inclusions.map((x) => (
                    <li key={x} className="flex gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-azure" />{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-2xl">Exclusions</h2>
                <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                  {trip.exclusions.map((x) => (
                    <li key={x} className="flex gap-2.5"><X className="mt-0.5 size-4 shrink-0 text-coral" />{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <h2 className="text-2xl">Meeting point &amp; cancellation</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm font-semibold">Meeting point</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{trip.meetingPoint}</p>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(trip.meetingPoint)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex text-xs font-semibold text-primary hover:underline"
                >
                  Open in Google Maps
                </a>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm font-semibold">Cancellation &amp; refunds</p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {trip.freeCancellation
                    ? "Free cancellation up to 14 days before departure. 50% refund up to 7 days before."
                    : "Non-refundable within 21 days of departure due to permits and camp bookings. 50% refund before that."}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <h2 className="text-2xl">Reviews</h2>
            <ul className="mt-4 space-y-4">
              {[
                { n: "Kavya R.", r: 5, t: "Every logistic handled. We only had to show up and look around." },
                { n: "Arjun M.", r: 5, t: "Guides were locals, not scripts. Best part of the trip." },
                { n: "Neha S.", r: 4, t: "Loved it. Would prefer one extra free evening in the itinerary." },
              ].map((rev) => (
                <li key={rev.n} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{rev.n}</span>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                      Verified booking
                    </span>
                    <span className="ml-auto flex gap-0.5">
                      {Array.from({ length: rev.r }).map((_, i) => (
                        <Star key={i} className="size-3.5 fill-gold text-gold" />
                      ))}
                    </span>
                  </div>
                  <p className="mt-2.5 text-sm text-muted-foreground">{rev.t}</p>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-2xl">Frequently asked</h2>
            <Accordion type="single" collapsible className="mt-4">
              {[
                { q: "Are flights included?", a: "Flights are not included so you can book from your nearest city. We help with recommended options." },
                { q: "What is the group size?", a: `Maximum ${trip.groupSize} travellers per departure.` },
                { q: "Is it suitable for families?", a: "Yes — this route works well for families with children above 6 years." },
              ].map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>

        <aside>
          <div className="sticky top-24 hidden rounded-3xl border border-border bg-card p-6 shadow-float lg:block">
            <p className="text-xs text-muted-foreground">From</p>
            <p className="font-display text-3xl text-primary">{formatINR(trip.price)}<span className="ml-1 font-sans text-sm text-muted-foreground">/ person</span></p>

            <div className="mt-5 space-y-3">
              <div>
                <label htmlFor="book-date" className="text-xs font-semibold">Departure date</label>
                <input id="book-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl bg-surface px-3 text-sm" />
              </div>
              <div>
                <label htmlFor="book-trav" className="text-xs font-semibold">Travellers</label>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-surface px-3">
                  <Users className="size-4 text-azure" />
                  <input id="book-trav" type="number" min={1} max={trip.groupSize} value={travellers} onChange={(e) => setTravellers(Number(e.target.value))} className="h-11 w-full bg-transparent text-sm outline-none" />
                </div>
              </div>
            </div>

            <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Base ({travellers}×)</dt><dd>{formatINR(total)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">GST (5%)</dt><dd>{formatINR(Math.round(total * 0.05))}</dd></div>
              <div className="flex justify-between font-display text-lg"><dt>Total</dt><dd className="text-primary">{formatINR(Math.round(total * 1.05))}</dd></div>
            </dl>

            <Button asChild variant="hero" size="lg" className="mt-5 w-full">
              <Link to="/checkout/$tripId" params={{ tripId: trip.id }} search={{ travellers, date: date || undefined }}>
                Reserve now
              </Link>
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Secured by Razorpay · 256-bit SSL</p>
          </div>
        </aside>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl">You might also like</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((t, i) => (
            <li key={t.id}><TripCard trip={t} index={i} /></li>
          ))}
        </ul>
      </section>

      {/* Mobile sticky booking bar */}
      <div className="fixed inset-x-0 bottom-[56px] z-40 flex items-center justify-between gap-3 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">From</p>
          <p className="font-display text-lg text-primary">{formatINR(trip.price)}</p>
        </div>
        <Button asChild variant="hero" className="shrink-0">
          <Link to="/checkout/$tripId" params={{ tripId: trip.id }} search={{ travellers, date: date || undefined }}>
            Book now
          </Link>
        </Button>
      </div>
    </article>
  );
}
