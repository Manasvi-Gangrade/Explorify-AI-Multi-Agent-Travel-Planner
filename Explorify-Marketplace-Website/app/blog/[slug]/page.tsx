"use client";

import Link from "next/link";
import { useParams, useRouter } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, User, Share2, Sparkles, MapPin, Bookmark } from "lucide-react";
import { usePathname } from "next/navigation";
import { blogPosts, getTrip, trips } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { TripCard } from "@/components/trip-card";

// Rich article detailed content map
const blogDetailsMap: Record<string, {
  author: string;
  authorRole: string;
  content: string[];
  tips: string[];
  recommendedTripId: string;
}> = {
  "best-time-to-visit-kashmir": {
    author: "Rohan Sharma",
    authorRole: "Senior Himalayan Explorer",
    content: [
      "Kashmir does not have a single 'best season'. Instead, it re-invents its personality every three months. To experience the valley in its true glory, matching your travel dates to what you wish to experience is essential.",
      "Spring (April to May): The famous Tulip Garden in Srinagar bursts into bloom with over 1.5 million tulips. Snow begins melting on the higher slopes, filling the streams of Pahalgam and Sonmarg with crystal-clear turquoise waters.",
      "Summer (June to August): High-altitude passes clear up, making it the ideal window for trekking, horse riding in Gulmarg's high meadows, and staying in heritage houseboats on Nigeen Lake away from crowd hot-spots.",
      "Autumn (September to November): Saffron harvesting begins in Pampore. The chinars turn a fiery golden-amber. Crisp, chilly evenings make drinking hot Kahwa tea by the fireplace an unforgettable experience.",
      "Winter (December to March): Gulmarg transforms into Asia's premier ski resort. Snow blankets the pine trees and frozen Dal Lake offers breathtaking winter wonderland photography opportunity."
    ],
    tips: [
      "Book houseboat stays in advance during April tulip season.",
      "Always carry valid photo ID cards for high-altitude security checkposts.",
      "Taste authentic Wazwan meal at a local family homestay in Srinagar."
    ],
    recommendedTripId: "kashmir-paradise",
  },
  "rajasthan-heritage-havelis": {
    author: "Priya Ranawat",
    authorRole: "Heritage & Architecture Specialist",
    content: [
      "Stepping into a 300-year-old Rajasthani Haveli is like walking through a living gallery of Indian royal history. Intricate jharokhas, hand-painted frescoes, and sprawling courtyards offer an immersive glimpse into royal living.",
      "Jaipur's Merchant Mansions: The old walled city houses hidden gems with courtyard fountains and stained glass windows that catch the morning sunlight in vibrant colors.",
      "Udaipur's Lake Front Stays: Overlooking Lake Pichola, these heritage boutique hotels blend romantic Mewari architecture with modern luxury, serving traditional Laal Maas under starlit rooftop dinners.",
      "Jaisalmer Golden Fort Havelis: Built from yellow sandstone that glows at dusk, living inside the UNESCO-listed living fort lets you hear folk musicians playing Sarangi from your bedroom window."
    ],
    tips: [
      "Opt for courtyard-facing rooms for quieter night sleep.",
      "Participate in evening cultural Kathputli (puppet) performances.",
      "Carry light cottons for afternoon sightseeing even in winter months."
    ],
    recommendedTripId: "royal-rajasthan",
  },
  "kerala-food-trail": {
    author: "Chef Arvind Menon",
    authorRole: "Culinary Travel Writer",
    content: [
      "Kerala's food story is defined by spice plantations, coconut groves, and sea breeze. Eating here is not just sustenance; it is a ritual passed down through generations.",
      "The Grand Sadya: A feast of 24 to 28 vegetarian dishes served on a fresh banana leaf, starting with crisp banana chips, parippu ghee curry, and concluding with sweet warm Ada Pradhaman payasam.",
      "Backwater Toddy Shop Delicacies: Freshly caught Karimeen (Pearl Spot fish) marinated in fiery shallot-chilli masala, wrapped in banana leaf and pan-seared to smoky perfection.",
      "Thalassery Biryani Trail: Unlike North Indian biryanis, Malabar biryani uses small-grain KHYMA rice cooked in ghee with tender spiced chicken, topped with fried cashews and raisins."
    ],
    tips: [
      "Eat Sadya with your clean right hand for full sensory experience.",
      "Visit Fort Kochi morning fish markets to select fresh catches.",
      "Sip warm herbal Ayurvedic water ('Dahashamani') served with meals."
    ],
    recommendedTripId: "kerala-backwaters",
  },
  "offbeat-northeast": {
    author: "Tenzing Norbu",
    authorRole: "Northeast Expeditions Guide",
    content: [
      "Away from commercial tourist routes, Northeast India remains one of Asia's last pristine natural frontiers. Misty valleys, living root bridges, and vibrant tribal cultures welcome curious travellers.",
      "Meghalaya's Living Root Bridges: Hand-woven over generations by the Khasi tribe using live rubber tree roots, these natural marvels span gushing rain rivers in Cherrapunji and Mawlynnong.",
      "Ziro Valley, Arunachal Pradesh: Home to the Apatani tribe, famous for wet rice cultivation and pine hills. A peaceful retreat for music, nature walks, and authentic tribal hospitality.",
      "Mechuka Valley: Nestled near the Indo-Tibet border, surrounded by snow-capped peaks, wooden houses, and ancient 400-year-old Buddhist monasteries."
    ],
    tips: [
      "Apply for Inner Line Permits (ILP) prior to visiting Arunachal & Nagaland.",
      "Pack quick-drying rain gear and sturdy waterproof trekking shoes.",
      "Respect local tribal customs and request permission before photographing elders."
    ],
    recommendedTripId: "spiti-expedition",
  },
  "spiti-first-timers": {
    author: "Vikram Rathore",
    authorRole: "High-Altitude Overlanding Specialist",
    content: [
      "Spiti Valley — the 'Middle Land' between India and Tibet — is a high-altitude cold desert of stark mountain beauty, ancient monasteries, and zero light pollution.",
      "Acclimatization is Rule #1: Spend 48 hours ascending gradually via Shimla/Kinnaur rather than rushing up from Manali to prevent Acute Mountain Sickness (AMS).",
      "Monasteries on the Edge: Key Monastery perched on a conical hill, and Dhankar Monastery hovering above river cliffs offer spiritual peace amidst barren Himalayan expanses.",
      "Chandratal Lake Camping: The moon lake changes color from turquoise to deep blue as clouds pass overhead. Night skies reveal the Milky Way galaxy with incredible clarity."
    ],
    tips: [
      "Carry Diamox (after consulting doctor) and stay well-hydrated with 4L water daily.",
      "Bikes & cars must have high ground clearance for water crossings ('Nallahs').",
      "BSI/BSNL sims have limited network; inform family about off-grid status."
    ],
    recommendedTripId: "spiti-expedition",
  },
  "varanasi-morning-guide": {
    author: "Devdutt Shastri",
    authorRole: "Culture & Spiritual Historian",
    content: [
      "Varanasi awakens before dawn. The ancient city comes alive as temple bells ring out, incense diffuses into the river mist, and the Ganges mirrors the golden morning sun.",
      "5:15 AM — Wooden Boat at Subah-e-Banaras: Start your morning at Assi Ghat watching Vedic chanting, classical music, and sunrise yoga while drifting past historical ghats.",
      "6:30 AM — Manikarnika & Dashashwamedh Walk: Observe the cycle of life along the sacred riverbanks, where morning bathers offer prayers to the rising sun.",
      "8:00 AM — Kachori Gali Breakfast: Savor piping hot Heeng Kachoris served on sal-leaf bowls paired with sweet hot Jalebis and kulhad chai."
    ],
    tips: [
      "Hire a traditional manual rowboat for a silent, scenic morning trip.",
      "Dress modestly when walking near sacred ghats and active temples.",
      "Carry cash for morning tea stalls and local street food vendors."
    ],
    recommendedTripId: "royal-rajasthan",
  }
};

export default function BlogPostDetailPage({ params }: { params?: { slug?: string } }) {
  // Extract slug from URL if not passed in params
  const pathname = usePathname();
  const slugFromPath = pathname ? pathname.split("/").pop() : "";
  const slug = params?.slug || slugFromPath || "best-time-to-visit-kashmir";

  const post = blogPosts.find((p) => p.slug === slug) || blogPosts[0];
  const details = blogDetailsMap[post.slug] || blogDetailsMap["best-time-to-visit-kashmir"];
  const recommendedTrip = getTrip(details.recommendedTripId) || trips[0];
  const otherPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article className="min-h-screen bg-background pb-20">
      {/* Header Banner */}
      <header className="relative bg-surface border-b border-border py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#1d6fa5] hover:underline mb-6"
          >
            <ArrowLeft className="size-4" /> Back to all articles
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold mb-4">
            <span className="rounded-full bg-[#1d6fa5]/15 px-3 py-1 text-[#1d6fa5]">
              {post.category}
            </span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="size-3.5" /> {post.readingTime} min read
            </span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3.5" /> {post.date}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
            {post.title}
          </h1>

          <div className="mt-6 flex items-center gap-4 border-t border-border/60 pt-6">
            <div className="size-11 rounded-full bg-gradient-to-r from-[#1d6fa5] to-[#257ba6] text-white font-bold flex items-center justify-center text-sm shadow-md">
              {details.author.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{details.author}</p>
              <p className="text-xs text-muted-foreground">{details.authorRole} · Explorify Journal</p>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Cover Image */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 -mt-6">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-border shadow-float">
          <img
            src={typeof post.image === "string" ? post.image : (post.image as any).src}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-12">
        <p className="text-lg leading-relaxed text-foreground font-medium italic border-l-4 border-[#1d6fa5] pl-4 mb-8">
          "{post.excerpt}"
        </p>

        <div className="space-y-6 text-foreground/90 leading-relaxed text-base">
          {details.content.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* Pro Insider Tips Callout Box */}
        {details.tips && details.tips.length > 0 && (
          <div className="my-10 rounded-2xl border border-[#1d6fa5]/30 bg-[#1d6fa5]/5 p-6 shadow-xs">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-[#1d6fa5]">
              <Sparkles className="size-5" /> Insider Travel Tips
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground/85">
              {details.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#1d6fa5] font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Package Card Banner */}
        {recommendedTrip && (
          <div className="my-12 rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
              <div>
                <span className="text-xs font-bold text-[#1d6fa5] uppercase tracking-wider">
                  Recommended Explorify Experience
                </span>
                <h4 className="font-display text-xl font-bold text-foreground">
                  {recommendedTrip.name}
                </h4>
              </div>
              <Button asChild size="sm" className="rounded-full bg-gradient-to-r from-[#1d6fa5] to-[#257ba6] text-white font-bold">
                <Link href={`/checkout/${recommendedTrip.id}`}>
                  Book Experience
                </Link>
              </Button>
            </div>
            <TripCard trip={recommendedTrip} />
          </div>
        )}
      </div>

      {/* Related Articles */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 pt-12 border-t border-border">
        <h3 className="font-display text-2xl font-bold text-foreground mb-8">
          More stories from the road
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {otherPosts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}>
              <Link href={`/blog/${p.slug}`}>
                <article className="group hover-lift h-full overflow-hidden rounded-2xl border border-border bg-card shadow-soft flex flex-col justify-between">
                  <div>
                    <img
                      src={typeof p.image === "string" ? p.image : (p.image as any).src}
                      alt={p.title}
                      className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="p-5">
                      <span className="rounded-full bg-[#1d6fa5]/15 px-2.5 py-1 text-[11px] font-semibold text-[#1d6fa5]">
                        {p.category}
                      </span>
                      <h4 className="mt-3 font-display text-base font-bold leading-snug text-foreground group-hover:text-[#1d6fa5] transition-colors">
                        {p.title}
                      </h4>
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{p.excerpt}</p>
                    </div>
                  </div>
                  <div className="p-5 pt-0">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1d6fa5] group-hover:underline">
                      Read story →
                    </span>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </article>
  );
}
