import { createFileRoute } from "@tanstack/react-router";
import { Hotel, Plane, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { Reveal, SectionHeading } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { formatINR, images } from "@/lib/site-data";

export const Route = createFileRoute("/travel-planner")({
  head: () => ({
    meta: [
      { title: "AI Travel Planner for India Trips | ExplorifyTrips" },
      { name: "description", content: "Generate a full India itinerary in seconds — flights, hotels and a day-by-day plan tailored to your dates and budget." },
      { property: "og:title", content: "AI Travel Planner for India Trips" },
      { property: "og:description", content: "Flights, stays and a day-by-day Indian itinerary generated in seconds." },
      { property: "og:url", content: "/travel-planner" },
    ],
    links: [{ rel: "canonical", href: "/travel-planner" }],
  }),
  component: Planner,
});

const plan = {
  flights: [
    { airline: "IndiGo 6E-2043", route: "Indore (IDR) → Srinagar (SXR)", time: "06:15 · 1 stop DEL", price: 7480 },
    { airline: "Air India AI-825", route: "Indore (IDR) → Srinagar (SXR)", time: "09:40 · 1 stop DEL", price: 8920 },
  ],
  hotels: [
    { name: "Heritage Houseboat, Dal Lake", area: "Srinagar", rating: 4.8, price: 4200, image: images.heroKashmir },
    { name: "Pine Ridge Resort", area: "Gulmarg", rating: 4.6, price: 5600, image: images.destManali },
  ],
  days: [
    { d: 1, t: "Arrive Srinagar", desc: "Airport pickup and an evening shikara ride across Dal Lake.", image: images.heroKashmir },
    { d: 2, t: "Mughal gardens", desc: "Nishat and Shalimar Bagh, then the old city's walnut-wood mosques.", image: images.attrHawa },
    { d: 3, t: "Gulmarg", desc: "Gondola ride and alpine meadow walks at 3,000 m.", image: images.destManali },
    { d: 4, t: "Pahalgam", desc: "Betaab valley, Lidder river trails and a deodar-shaded lunch.", image: images.destSpiti },
  ],
};

function Planner() {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [planData, setPlanData] = useState<any>(null);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPlanData(null);
    setStatusText("Connecting to Explorify AI Engine...");

    const fromVal = (document.getElementById("p-from") as HTMLInputElement).value || "Indore";
    const toVal = (document.getElementById("p-to") as HTMLInputElement).value || "Srinagar";
    const startVal = (document.getElementById("p-start") as HTMLInputElement).value || "";
    const travVal = (document.getElementById("p-trav") as HTMLInputElement).value || "2";
    const budgetVal = (document.getElementById("p-budget") as HTMLInputElement).value || "25000";

    const promptText = `Plan a trip from ${fromVal} to ${toVal}. Dates: ${startVal}. Travellers: ${travVal}. Budget: INR ${budgetVal}.`;

    try {
      const response = await fetch("/api/travel-planner/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: {
            chat_history: [
              {
                role: "user",
                parts: [promptText],
              },
            ],
          },
          token_map: [],
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to call planning engine");
      }

      setStatusText("Mapping your route across India...");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let received = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        received += decoder.decode(value, { stream: true });
        const lines = received.split("\n");

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chatObj = JSON.parse(line);
            if (chatObj.parts && chatObj.parts[0]) {
              const textContent = chatObj.parts[0];
              try {
                const planJson = JSON.parse(textContent);
                if (planJson.itinerary || planJson.hotels) {
                  setPlanData(planJson);
                }
              } catch {
                if (typeof textContent === "string" && textContent.length < 150) {
                  setStatusText(textContent);
                }
              }
            }
          } catch {
            // Ignore incomplete chunks
          }
        }
      }

      // Final sweep parsing
      setStatusText("Finalizing your itinerary...");
      const finalLines = received.split("\n");
      for (const line of finalLines) {
        if (!line.trim()) continue;
        try {
          const chatObj = JSON.parse(line);
          if (chatObj.parts && chatObj.parts[0]) {
            const planJson = JSON.parse(chatObj.parts[0]);
            if (planJson.itinerary || planJson.hotels) {
              setPlanData(planJson);
            }
          }
        } catch {
          // Ignore final sweep parse errors
        }
      }
    } catch (err) {
      console.error(err);
      setStatusText("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const parsePrice = (priceStr: string | number | undefined, fallback: number): number => {
    if (!priceStr) return fallback;
    if (typeof priceStr === "number") return priceStr;
    const digits = priceStr.replace(/[^0-9]/g, "");
    const num = parseInt(digits, 10);
    return isNaN(num) ? fallback : num;
  };

  const outboundFlights = planData?.outbound?.flights || [];
  const outboundTrains = planData?.outbound?.trains || [];
  const inboundFlights = planData?.inbound?.flights || [];
  const inboundTrains = planData?.inbound?.trains || [];
  const suggestedHotels = planData?.hotels || [];
  const itineraryDays = planData?.itinerary || [];

  const flights = [
    ...outboundFlights.map((f: any) => ({
      airline: f.name || "Outbound Flight",
      route: f.description || "Flight to Destination",
      time: f.departure_from_source ? `Departure: ${f.departure_from_source}` : "Scheduled Flight",
      price: parsePrice(f.price, 5400),
      bookingLink: f.booking_link || null,
    })),
    ...outboundTrains.map((t: any) => ({
      airline: t.name || "Outbound Train",
      route: t.description || "Train to Destination",
      time: t.departure_from_source ? `Departure: ${t.departure_from_source}` : "Scheduled Train",
      price: parsePrice(t.price, 1200),
      bookingLink: t.booking_link || null,
    })),
    ...inboundFlights.map((f: any) => ({
      airline: f.name || "Inbound Flight",
      route: f.description || "Flight Back",
      time: f.departure_from_source ? `Departure: ${f.departure_from_source}` : "Scheduled Flight",
      price: parsePrice(f.price, 5400),
      bookingLink: f.booking_link || null,
    })),
    ...inboundTrains.map((t: any) => ({
      airline: t.name || "Inbound Train",
      route: t.description || "Train Back",
      time: t.departure_from_source ? `Departure: ${t.departure_from_source}` : "Scheduled Train",
      price: parsePrice(t.price, 1200),
      bookingLink: t.booking_link || null,
    }))
  ];

  const hotels = suggestedHotels.map((h: any, idx: number) => ({
    name: h.name || "Recommended Hotel",
    area: h.description ? h.description.split(",")[0] : "Local Area",
    rating: h.rating || 4.5,
    price: parsePrice(h.price, 3500),
    image: (h.image_urls && h.image_urls[0]) || (idx % 2 === 0 ? images.heroKashmir : images.destManali),
    bookingLink: h.booking_link || null,
  }));

  const days = itineraryDays.map((day: any, idx: number) => ({
    d: idx + 1,
    t: day.title || `Day ${idx + 1}`,
    desc: day.plan || "",
    image: idx % 4 === 0 ? images.heroKashmir : idx % 4 === 1 ? images.destManali : idx % 4 === 2 ? images.destGoa : images.destSpiti,
    mapUrl: day.google_map_url || null,
  }));

  const fromLabel = planData?.outbound?.flights?.[0]?.description?.split("→")?.[0]?.trim() || 
                    planData?.outbound?.trains?.[0]?.description?.split("→")?.[0]?.trim() || "Source";
  const toLabel = planData?.outbound?.flights?.[0]?.description?.split("→")?.[1]?.trim() || 
                  planData?.outbound?.trains?.[0]?.description?.split("→")?.[1]?.trim() || "Destination";

  return (
    <div className="bg-gradient-sky pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="AI Travel Planner"
          title="Tell us the shape of your trip. We'll build the rest."
          subtitle="Flights, stays and a day-by-day plan across any Indian route."
          align="center"
        />

        <form onSubmit={generate} className="mx-auto mt-9 grid max-w-4xl gap-3 rounded-3xl border border-border bg-card p-5 shadow-float sm:grid-cols-2 lg:grid-cols-5">
          {[
            { id: "p-from", label: "From", type: "text", def: "Indore" },
            { id: "p-to", label: "To", type: "text", def: "Srinagar" },
            { id: "p-start", label: "Start date", type: "date", def: "" },
            { id: "p-trav", label: "Travellers", type: "number", def: "2" },
            { id: "p-budget", label: "Budget (₹)", type: "number", def: "25000" },
          ].map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="text-xs font-semibold">{f.label}</label>
              <input id={f.id} type={f.type} defaultValue={f.def} className="mt-1.5 h-11 w-full rounded-xl bg-surface px-3 text-sm" />
            </div>
          ))}
          <div className="sm:col-span-2 lg:col-span-5">
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              <Sparkles className="mr-2" /> {loading ? "Generating itinerary..." : "Generate my plan"}
            </Button>
          </div>
        </form>

        {loading && (
          <div className="mx-auto mt-10 max-w-4xl">
            <div className="relative h-14 overflow-hidden rounded-full border border-dashed border-azure/50 bg-card">
              <Plane className="absolute top-1/2 size-6 -translate-y-1/2 text-azure animate-[fly_2.4s_ease-in-out_infinite]" />
            </div>
            <p className="mt-3 text-center text-sm text-muted-foreground">{statusText}</p>
            <div className="mt-6 space-y-3">
              {[0, 1, 2].map((i) => <div key={i} className="shimmer h-24 rounded-2xl" />)}
            </div>
          </div>
        )}

        {planData && (
          <div className="mt-12 space-y-12">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-soft">
                <h2 className="text-2xl">Your route</h2>
                <svg viewBox="0 0 600 160" className="mt-4 w-full" role="img" aria-label="Animated route map">
                  <path d="M60 130 C 200 20, 400 20, 540 40" fill="none" stroke="var(--color-azure)" strokeWidth="3" strokeDasharray="8 8" />
                  <circle cx="60" cy="130" r="8" fill="var(--color-primary)" />
                  <circle cx="540" cy="40" r="8" fill="var(--color-coral)" />
                  <text x="42" y="152" className="fill-current text-xs" fill="currentColor">{fromLabel}</text>
                  <text x="500" y="26" className="fill-current text-xs" fill="currentColor">{toLabel}</text>
                </svg>
              </div>
            </Reveal>

            {flights.length > 0 && (
              <Reveal>
                <h2 className="text-2xl">Suggested flights & transports</h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {flights.map((f: any, i: number) => (
                    <li key={i} className="hover-lift flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-soft">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold"><Plane className="size-4 text-azure" />{f.airline}</div>
                        <p className="mt-2 text-sm text-muted-foreground">{f.route}</p>
                        <p className="text-xs text-muted-foreground">{f.time}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-display text-2xl text-primary">{formatINR(f.price)}</span>
                        {f.bookingLink && (
                          <a href={f.bookingLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-azure hover:underline">
                            Book Stay/Ticket →
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {hotels.length > 0 && (
              <Reveal>
                <h2 className="text-2xl">Where to stay</h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {hotels.map((h: any, i: number) => (
                    <li key={i} className="hover-lift overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                      <img src={h.image} alt={h.name} width={1200} height={900} loading="lazy" className="h-40 w-full object-cover" />
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold"><Hotel className="size-4 text-azure" />{h.name}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{h.area} · {h.rating} ★</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="font-display text-2xl text-primary">{formatINR(h.price)}<span className="ml-1 font-sans text-xs text-muted-foreground">/ night</span></span>
                          {h.bookingLink && (
                            <a href={h.bookingLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-azure hover:underline">
                              Book Stay →
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {days.length > 0 && (
              <Reveal>
                <h2 className="text-2xl">Day-by-day plan</h2>
                <ol className="mt-6 space-y-6 border-l-2 border-dashed border-azure/40 pl-6">
                  {days.map((d: any) => (
                    <li key={d.d} className="relative">
                      <span className="absolute -left-[38px] grid size-8 place-items-center rounded-full bg-gradient-azure text-xs font-bold text-primary-foreground">{d.d}</span>
                      <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft sm:grid-cols-[96px_minmax(0,1fr)]">
                        <img src={d.image} alt={d.t} width={1200} height={900} loading="lazy" className="h-24 w-full rounded-xl object-cover sm:h-24 sm:w-24" />
                        <div className="min-w-0">
                          <h3 className="font-display text-lg">{d.t}</h3>
                          <p className="mt-1.5 text-sm text-muted-foreground">{d.desc}</p>
                          {d.mapUrl && (
                            <a href={d.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-azure hover:underline">
                              🗺️ View on Google Maps
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </Reveal>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
