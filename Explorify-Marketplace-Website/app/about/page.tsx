"use client";

import { Reveal, SectionHeading, StatCounter } from "@/components/motion";
import { images } from "@/lib/site-data";

const timeline = [
  {
    year: "2019",
    t: "Two friends, one Spiti road trip",
    d: "The plan fell apart on day two. We rebuilt it on the road and realised India needed better trip design.",
  },
  {
    year: "2021",
    t: "First 50 travellers",
    d: "Kashmir and Pachmarhi departures, run entirely on WhatsApp and spreadsheets.",
  },
  {
    year: "2023",
    t: "Verified operator network",
    d: "120+ on-ground partners vetted across 18 states.",
  },
  {
    year: "2026",
    t: "AI Travel Planner",
    d: "Custom Indian itineraries generated in seconds, refined by our human trip designers.",
  },
];

export default function AboutPage() {
  const heroImage = typeof images.heroRajasthan === "string" ? images.heroRajasthan : (images.heroRajasthan as any)?.src;

  return (
    <div className="bg-background">
      <section className="relative h-[52vh] overflow-hidden">
        <img
          src={typeof heroImage === "string" ? heroImage : (heroImage as any).src}
          alt="Camel riders crossing Thar desert dunes at sunset"
          className="h-full w-full object-cover animate-[ken-burns_22s_ease-in-out_infinite_alternate]"
        />
        <div className="absolute inset-0 scrim" />
        <div className="absolute inset-x-0 bottom-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl text-primary-foreground sm:text-6xl">
            We travel India for a living
          </h1>
          <p className="mt-3 max-w-xl text-primary-foreground/90">
            And we'd very much like you to come along.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our mission"
          title="Great trips are designed, not booked"
          subtitle="ExplorifyTrips exists to make Indian travel feel considered — routes that breathe, operators who live there, and pricing you can read in one glance."
        />
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <ol className="space-y-6 border-l-2 border-dashed border-[#1a213a]/40 pl-6">
          {timeline.map((row, i) => (
            <Reveal as="li" key={row.year} delay={i * 90} className="relative">
              <span className="absolute -left-[38px] grid size-8 place-items-center rounded-full bg-[#1a213a] text-[10px] font-bold text-white">
                {row.year.slice(2)}
              </span>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <p className="text-xs font-semibold tracking-widest text-[#1a213a] dark:text-sky-300 uppercase">
                  {row.year}
                </p>
                <h2 className="mt-1 font-display text-xl text-foreground">{row.t}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{row.d}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-3xl border border-border bg-card p-10 shadow-soft sm:grid-cols-3">
          <StatCounter value={18} label="States covered" />
          <StatCounter value={120} suffix="+" label="Local operators" />
          <StatCounter value={2400} suffix="+" label="Travellers hosted" />
        </div>
      </section>
    </div>
  );
}
