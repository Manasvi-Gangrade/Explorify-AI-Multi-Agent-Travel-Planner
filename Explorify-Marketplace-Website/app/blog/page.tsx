"use client";

import Link from "next/link";
import { Clock, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { useState } from "react";
import { Reveal, SectionHeading } from "@/components/motion";
import { blogPosts } from "@/lib/site-data";
import { Button } from "@/components/ui/button";

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
        eyebrow="The Explorify Journal"
        title="Stories from the road"
        subtitle="Field notes, insider seasonal guides, and hidden Indian destinations we can't stop thinking about."
      />

      {/* Category Pills */}
      <ul className="mt-8 flex flex-wrap gap-2.5">
        {categories.map((c) => (
          <li key={c}>
            <button
              onClick={() => setSelectedCategory(c)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === c
                  ? "bg-[#1d6fa5] text-white shadow-md scale-105"
                  : "border border-border bg-card text-foreground/80 hover:border-[#1d6fa5] hover:text-[#1d6fa5]"
              }`}
            >
              {c}
            </button>
          </li>
        ))}
      </ul>

      {featured ? (
        <>
          {/* Featured Hero Article */}
          <Reveal className="mt-10">
            <Link href={`/blog/${featured.slug}`} className="block group">
              <article className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-soft hover:shadow-xl transition-all duration-300 lg:grid-cols-2">
                <div className="overflow-hidden relative">
                  <img
                    src={typeof featured.image === "string" ? featured.image : (featured.image as any).src}
                    alt={featured.title}
                    className="h-72 w-full object-cover transition-transform duration-1000 group-hover:scale-105 lg:h-full"
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-[#1d6fa5] text-white px-3 py-1 text-xs font-bold shadow-md">
                    Featured Story
                  </span>
                </div>
                <div className="p-8 flex flex-col justify-between">
                  <div>
                    <span className="rounded-full bg-[#1d6fa5]/15 px-3 py-1 text-xs font-bold text-[#1d6fa5]">
                      {featured.category}
                    </span>
                    <h2 className="mt-4 font-display text-2xl sm:text-3xl font-bold leading-tight text-foreground group-hover:text-[#1d6fa5] transition-colors">
                      {featured.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {featured.excerpt}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Clock className="size-3.5 text-[#1d6fa5]" /> {featured.readingTime} min read · {featured.date}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1d6fa5] group-hover:translate-x-1 transition-transform">
                      Read Story <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </Reveal>

          {/* Grid Articles */}
          {rest.length > 0 && (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p, i) => (
                <Reveal as="li" key={p.slug} delay={(i % 3) * 90}>
                  <Link href={`/blog/${p.slug}`} className="block h-full group">
                    <article className="hover-lift h-full overflow-hidden rounded-2xl border border-border bg-card shadow-soft flex flex-col justify-between group-hover:border-[#1d6fa5]/40 transition-colors">
                      <div>
                        <div className="overflow-hidden relative">
                          <img
                            src={typeof p.image === "string" ? p.image : (p.image as any).src}
                            alt={p.title}
                            loading="lazy"
                            className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-5">
                          <span className="rounded-full bg-[#1d6fa5]/12 px-2.5 py-1 text-[11px] font-bold text-[#1d6fa5]">
                            {p.category}
                          </span>
                          <h3 className="mt-3 font-display text-lg font-bold leading-snug text-foreground group-hover:text-[#1d6fa5] transition-colors">
                            {p.title}
                          </h3>
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                            {p.excerpt}
                          </p>
                        </div>
                      </div>
                      <div className="p-5 pt-0 flex items-center justify-between border-t border-border/40 mt-4">
                        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Clock className="size-3.5 text-[#1d6fa5]" /> {p.readingTime} min read
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1d6fa5] group-hover:translate-x-1 transition-transform">
                          Read <ArrowRight className="size-3" />
                        </span>
                      </div>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div className="mt-12 text-center text-muted-foreground py-12 bg-card rounded-2xl border border-border">
          <BookOpen className="size-8 text-[#1d6fa5] mx-auto mb-2 opacity-60" />
          No articles found under this category.
        </div>
      )}
    </div>
  );
}
