"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import { Reveal, SectionHeading } from "@/components/motion";
import { blogPosts } from "@/lib/site-data";

const categories = ["All", "Hill Stations", "Heritage", "Food Trails", "Offbeat India"];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = blogPosts.filter((post) => {
    if (selectedCategory === "All") return true;
    return post.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const featured = filteredPosts[0];
  const rest = filteredPosts.slice(1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 bg-background min-h-[70vh]">
      <SectionHeading
        eyebrow="The journal"
        title="Stories from the road"
        subtitle="Field notes, seasonal guides and the trips we can't stop thinking about."
      />

      <ul className="mt-7 flex flex-wrap gap-2">
        {categories.map((c) => (
          <li key={c}>
            <button
              onClick={() => setSelectedCategory(c)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === c
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:border-azure"
              }`}
            >
              {c}
            </button>
          </li>
        ))}
      </ul>

      {featured ? (
        <>
          <Reveal className="mt-10">
            <article className="group grid overflow-hidden rounded-3xl border border-border bg-card shadow-soft lg:grid-cols-2">
              <div className="overflow-hidden">
                <img
                  src={typeof featured.image === "string" ? featured.image : (featured.image as any).src}
                  alt={featured.title}
                  className="h-64 w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105 lg:h-full"
                />
              </div>
              <div className="p-8 flex flex-col justify-between">
                <div>
                  <span className="rounded-full bg-coral/15 px-3 py-1 text-xs font-semibold text-coral">
                    {featured.category}
                  </span>
                  <h2 className="mt-4 font-display text-3xl text-balance-display text-foreground">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {featured.excerpt}
                  </p>
                </div>
                <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3.5 text-azure" /> {featured.readingTime} min read ·{" "}
                  {featured.date}
                </p>
              </div>
            </article>
          </Reveal>

          {rest.length > 0 && (
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p, i) => (
                <Reveal as="li" key={p.slug} delay={(i % 3) * 90}>
                  <article className="group hover-lift h-full overflow-hidden rounded-2xl border border-border bg-card shadow-soft flex flex-col justify-between">
                    <div>
                      <img
                        src={typeof p.image === "string" ? p.image : (p.image as any).src}
                        alt={p.title}
                        loading="lazy"
                        className="h-48 w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                      />
                      <div className="p-5">
                        <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
                          {p.category}
                        </span>
                        <h3 className="mt-3 font-display text-lg leading-snug text-foreground">
                          {p.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
                      </div>
                    </div>
                    <div className="p-5 pt-0">
                      <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="size-3.5 text-azure" /> {p.readingTime} min read · {p.date}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div className="mt-12 text-center text-muted-foreground py-12">
          No articles found under this category.
        </div>
      )}
    </div>
  );
}
