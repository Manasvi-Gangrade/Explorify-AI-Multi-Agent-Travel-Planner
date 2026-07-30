import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Gift,
  Headphones,
  Heart,
  Lock,
  MapPinned,
  Quote,
  Sparkles,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DestinationSearch } from "@/components/destination-search";
import { Reveal, SectionHeading, StatCounter } from "@/components/motion";
import { TripCard } from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import {
  attractions,
  images,
  regionCards,
  testimonials,
  trips,
} from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ExplorifyTrips — Handpicked India Tour Packages & AI Planner" },
      {
        name: "description",
        content:
          "Book Kashmir, Rajasthan, Kerala, Ladakh, Goa and Northeast tours with verified local operators. Plan any Indian trip in seconds with our AI Travel Planner.",
      },
      {
        property: "og:title",
        content: "ExplorifyTrips — Handpicked India Tour Packages",
      },
      {
        property: "og:description",
        content:
          "Verified Indian journeys, secure Razorpay checkout and an AI planner that builds your itinerary in seconds.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const heroSlides = [
  {
    image: images.heroKashmir,
    alt: "Shikara boats on Dal Lake, Srinagar, Kashmir at sunrise",
    kicker: "Kashmir",
  },
  {
    image: images.heroRajasthan,
    alt: "Camels crossing the Thar desert dunes below Jaisalmer fort at sunset",
    kicker: "Rajasthan",
  },
  {
    image: images.heroKerala,
    alt: "Houseboat drifting through palm-lined Kerala backwaters",
    kicker: "Kerala",
  },
  {
    image: images.heroLadakh,
    alt: "Turquoise Pangong Tso lake framed by Ladakh mountains",
    kicker: "Ladakh",
  },
];

function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setActive((a) => (a + 1) % heroSlides.length),
      6500,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative -mt-[68px] min-h-[92vh] overflow-hidden pt-[68px]">
      {heroSlides.map((slide, i) => (
        <div
          key={slide.kicker}
          aria-hidden={i !== active}
          className={`absolute inset-0 transition-opacity duration-[1600ms] ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={i === active ? slide.alt : ""}
            width={1920}
            height={1080}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            className="h-full w-full object-cover animate-[ken-burns_22s_ease-in-out_infinite_alternate]"
          />
        </div>
      ))}
      <div className="absolute inset-0 scrim" />

      <div className="relative mx-auto flex min-h-[calc(92vh-68px)] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-card/90 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary backdrop-blur">
            <Sparkles className="size-3.5 text-gold" />
            {heroSlides[active].kicker} · Departures open for 2026
          </span>
          <h1 className="mt-5 font-display text-4xl leading-[1.05] text-primary-foreground text-balance-display sm:text-6xl lg:text-7xl">
            India, the way it deserves to be travelled.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
            Handpicked journeys across the valleys, deserts, backwaters and
            coastlines of India — designed with local operators who actually
            live there.
          </p>
        </div>

        <div className="mt-9">
          <DestinationSearch />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-primary-foreground/90">
          <span className="inline-flex items-center gap-2">
            <Star className="size-4 fill-gold text-gold" /> 4.8 average from
            2,400+ travellers
          </span>
          <span className="inline-flex items-center gap-2">
            <BadgeCheck className="size-4 text-gold" /> 100% verified operators
          </span>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { icon: BadgeCheck, title: "Verified Local Operators", copy: "Vetted, on-ground, licensed" },
    { icon: Lock, title: "Secure Payments", copy: "Razorpay · UPI · 256-bit SSL" },
    { icon: MapPinned, title: "Handpicked Experiences", copy: "Only routes we've walked" },
    { icon: Headphones, title: "24/7 Support", copy: "Call or WhatsApp, always" },
  ];
  return (
    <section className="border-y border-border bg-card">
      <ul className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {items.map((it, i) => (
          <Reveal as="li" key={it.title} delay={i * 80} className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-azure">
              <it.icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{it.title}</span>
              <span className="block text-xs text-muted-foreground">{it.copy}</span>
            </span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function AttractionsRail() {
  const scroller = useRef<HTMLUListElement>(null);
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Icons of India"
          title="Attractions you can't miss"
          subtitle="Drag or swipe through the landmarks that define a trip to India."
        />
        <div className="hidden gap-2 sm:flex">
          <Button
            variant="outline"
            size="icon"
            aria-label="Scroll attractions left"
            onClick={() => scroller.current?.scrollBy({ left: -340, behavior: "smooth" })}
          >
            <ArrowRight className="size-4 rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Scroll attractions right"
            onClick={() => scroller.current?.scrollBy({ left: 340, behavior: "smooth" })}
          >
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      <ul
        ref={scroller}
        className="no-scrollbar mt-9 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
      >
        {attractions.map((a, i) => (
          <li key={a.name} className="w-[76vw] shrink-0 snap-start sm:w-[300px]">
            <Reveal delay={i * 60}>
              <Link
                to="/trips"
                search={{ q: a.city }}
                className="group hover-lift block overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={a.image}
                    alt={`${a.name} in ${a.city}, India`}
                    loading="lazy"
                    width={1200}
                    height={900}
                    className="h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-115"
                  />
                  <div className="absolute inset-0 scrim" />
                  <div className="absolute right-4 bottom-4 left-4">
                    <h3 className="font-display text-2xl text-primary-foreground">{a.name}</h3>
                    <p className="text-sm text-primary-foreground/85">
                      {a.city} · {a.activities} experiences
                    </p>
                  </div>
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FeaturedTrips() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Most loved"
            title="Journeys travellers keep coming back for"
            subtitle="Every departure runs with a verified operator and a small group."
          />
          <Button asChild variant="outline">
            <Link to="/trips">
              Browse all trips <ArrowRight />
            </Link>
          </Button>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.slice(0, 6).map((trip, i) => (
            <Reveal as="li" key={trip.id} delay={(i % 3) * 100}>
              <TripCard trip={trip} index={i} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Regions() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Explore by region"
        title="Five very different Indias"
        subtitle="From Himalayan passes to Konkan coastlines — pick the landscape you're craving."
        align="center"
      />
      <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {regionCards.map((r, i) => (
          <Reveal
            as="li"
            key={r.title}
            delay={i * 80}
            className={i === 0 ? "lg:col-span-2" : ""}
          >
            <Link
              to="/trips"
              search={{ region: r.region }}
              className="group hover-lift relative block h-64 overflow-hidden rounded-2xl border border-border shadow-soft lg:h-72"
            >
              <img
                src={r.image}
                alt={r.title}
                loading="lazy"
                width={1200}
                height={900}
                className="h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"
              />
              <div className="absolute inset-0 scrim" />
              <div className="absolute right-5 bottom-5 left-5">
                <h3 className="font-display text-2xl text-primary-foreground">{r.title}</h3>
                <p className="text-sm text-primary-foreground/85">{r.blurb}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function PlannerTeaser() {
  return (
    <section className="bg-gradient-sky py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-xs font-semibold text-primary shadow-soft">
            <Sparkles className="size-3.5 text-gold" /> AI Travel Planner
          </span>
          <h2 className="mt-5 text-3xl text-balance-display sm:text-4xl">
            Plan your perfect Indian trip in seconds
          </h2>
          <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
            Tell us where you're starting, where you're dreaming of, and your
            budget. We'll build a complete plan — flights, stays and a
            day-by-day itinerary you can actually follow.
          </p>
          <Button asChild variant="hero" size="lg" className="mt-7">
            <Link to="/travel-planner">
              Try the planner <ArrowRight />
            </Link>
          </Button>
        </Reveal>

        <Reveal delay={140}>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-float">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Indore → Srinagar</span>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                6 days · ₹25,000
              </span>
            </div>
            <ol className="mt-5 space-y-4">
              {[
                { d: 1, t: "Land in Srinagar, shikara at golden hour" },
                { d: 2, t: "Mughal gardens & old city walk" },
                { d: 3, t: "Gulmarg gondola and meadow trails" },
              ].map((row) => (
                <li key={row.d} className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-azure text-xs font-bold text-primary-foreground">
                    {row.d}
                  </span>
                  <span className="text-sm text-foreground/85">{row.t}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 rounded-2xl bg-surface p-4 text-sm">
              <p className="font-semibold">Suggested flight</p>
              <p className="text-muted-foreground">
                IndiGo 6E-2043 · IDR → SXR via DEL · ₹7,480
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 rounded-3xl border border-border bg-card p-10 shadow-soft sm:grid-cols-2 lg:grid-cols-4">
        <StatCounter value={500} suffix="+" label="Happy travellers" />
        <StatCounter value={50} suffix="+" label="Indian destinations" />
        <StatCounter value={120} suffix="+" label="Verified local operators" />
        <StatCounter value={98} suffix="%" label="Would travel again" />
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Traveller stories"
          title="Real trips, real people"
          align="center"
        />
        <ul className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3">
          {testimonials.map((t, i) => (
            <Reveal
              as="li"
              key={t.name}
              delay={i * 80}
              className="w-[84vw] shrink-0 snap-start sm:w-[360px]"
            >
              <figure className="hover-lift h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                <Quote className="size-7 text-coral" />
                <blockquote className="mt-4 text-sm leading-relaxed text-foreground/85">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-warm font-display text-lg text-primary-foreground">
                    {t.name.charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {t.city} · {t.trip}
                    </span>
                  </span>
                  <span className="ml-auto flex shrink-0 gap-0.5">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} className="size-3.5 fill-gold text-gold" />
                    ))}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Gallery() {
  const shots = [
    { src: images.destSpiti, alt: "Key Monastery above Spiti Valley" },
    { src: images.attrHawa, alt: "Hawa Mahal facade in Jaipur" },
    { src: images.destGoa, alt: "Sunset over Palolem beach in Goa" },
    { src: images.attrGolden, alt: "Golden Temple reflected in the sacred pool, Amritsar" },
    { src: images.destMeghalaya, alt: "Living root bridge in Meghalaya" },
    { src: images.attrTaj, alt: "Taj Mahal at sunrise in Agra" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="From our travellers"
        title="Postcards from across India"
        align="center"
      />
      <div className="mt-10 columns-2 gap-4 md:columns-3 [&>*]:mb-4">
        {shots.map((s, i) => (
          <Reveal key={s.alt} delay={i * 60}>
            <img
              src={s.src}
              alt={s.alt}
              loading="lazy"
              width={1200}
              height={900}
              className={`w-full rounded-2xl object-cover shadow-soft transition-transform duration-500 hover:scale-[1.02] ${
                i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"
              }`}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ReferralAndNewsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Reveal className="h-full">
          <div className="h-full rounded-3xl bg-gradient-azure p-9 text-primary-foreground shadow-float">
            <h2 className="font-display text-3xl text-primary-foreground">
              Get 10% off your first booking
            </h2>
            <p className="mt-3 max-w-md text-sm text-primary-foreground/85">
              Monthly dispatches on offbeat India, seasonal windows and early
              access to new departures. No spam, ever.
            </p>
            <form
              className="mt-6 flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                setDone(true);
              }}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 flex-1 rounded-xl bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-gold"
              />
              <Button type="submit" variant="gold" size="lg" className="h-12">
                Claim my 10%
              </Button>
            </form>
            {done && (
              <p aria-live="polite" className="mt-3 text-sm text-primary-foreground">
                You're in — check your inbox for the code.
              </p>
            )}
          </div>
        </Reveal>

        <Reveal delay={120} className="h-full">
          <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-9 shadow-soft">
            <span className="grid size-12 place-items-center rounded-2xl bg-coral/15 text-coral">
              <Gift className="size-6" />
            </span>
            <h2 className="mt-5 font-display text-2xl">Refer a friend, get ₹500 off</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Share your code — they save ₹500 on their first trip and you get
              ₹500 credited the moment they travel.
            </p>
            <div className="mt-auto flex items-center gap-3 pt-6">
              <code className="flex-1 rounded-xl border border-dashed border-azure bg-surface px-4 py-3 text-center font-mono text-sm font-semibold text-primary">
                EXPLORE500
              </code>
              <Button
                variant="coral"
                onClick={() => navigator.clipboard?.writeText("EXPLORE500")}
              >
                Copy
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <AttractionsRail />
      <FeaturedTrips />
      <Regions />
      <PlannerTeaser />
      <Stats />
      <Testimonials />
      <Gallery />
      <ReferralAndNewsletter />
      <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <Link
          to="/wishlist"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <Heart className="size-4" /> View your saved trips
        </Link>
      </div>
    </>
  );
}
