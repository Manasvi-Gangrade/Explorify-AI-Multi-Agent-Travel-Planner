import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/motion";
import { blogPosts } from "@/lib/site-data";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "India Travel Journal | ExplorifyTrips Blog" },
      { name: "description", content: "Guides to hill stations, heritage trails, food routes and offbeat India from the ExplorifyTrips team." },
      { property: "og:title", content: "India Travel Journal | ExplorifyTrips" },
      { property: "og:description", content: "Guides to hill stations, heritage, food trails and offbeat India." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: Blog,
});

function Blog() {
  const [featured, ...rest] = blogPosts;
  const categories = ["All", "Hill Stations", "Heritage", "Food Trails", "Offbeat India"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="The journal" title="Stories from the road" subtitle="Field notes, seasonal guides and the trips we can't stop thinking about." />

      <ul className="mt-7 flex flex-wrap gap-2">
        {categories.map((c, i) => (
          <li key={c}>
            <button className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${i === 0 ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:border-azure"}`}>
              {c}
            </button>
          </li>
        ))}
      </ul>

      <Reveal className="mt-10">
        <article className="group grid overflow-hidden rounded-3xl border border-border bg-card shadow-soft lg:grid-cols-2">
          <div className="overflow-hidden">
            <img src={featured.image} alt={featured.title} width={1920} height={1080} className="h-64 w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105 lg:h-full" />
          </div>
          <div className="p-8">
            <span className="rounded-full bg-coral/15 px-3 py-1 text-xs font-semibold text-coral">{featured.category}</span>
            <h2 className="mt-4 font-display text-3xl text-balance-display">{featured.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{featured.excerpt}</p>
            <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3.5 text-azure" /> {featured.readingTime} min read · {featured.date}
            </p>
          </div>
        </article>
      </Reveal>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p, i) => (
          <Reveal as="li" key={p.slug} delay={(i % 3) * 90}>
            <article className="group hover-lift h-full overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <img src={p.image} alt={p.title} width={1200} height={900} loading="lazy" className="h-48 w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
              <div className="p-5">
                <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">{p.category}</span>
                <h3 className="mt-3 font-display text-lg leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
                <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3.5 text-azure" /> {p.readingTime} min read · {p.date}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
