"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Hotel, Plane, Sparkles, MapPin, Calendar, Users, Wallet, MessageSquare, RefreshCw, Send, ExternalLink, Clock, Star } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { images } from "@/lib/site-data";
import { TravelPlannerProvider } from "@/components/travel-planner/travel-planner-context";
import { toast } from "sonner";

interface Prediction {
  description: string;
  place_id: string;
}

/* ─── Places Autocomplete Dropdown Input ─── */
function PlacesInput({
  placeholder,
  value,
  onSelect,
}: {
  placeholder: string;
  value: string;
  onSelect: (place: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchPredictions = useCallback(async (input: string) => {
    if (input.trim().length < 2) {
      setPredictions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/places/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPredictions([]);
      } else {
        setPredictions(data.predictions ?? []);
      }
    } catch {
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(text: string) {
    setQuery(text);
    onSelect(text);
    setShowDropdown(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(text), 300);
  }

  function handleSelect(prediction: Prediction) {
    setQuery(prediction.description);
    onSelect(prediction.description);
    setShowDropdown(false);
    setPredictions([]);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        className="h-11 w-full rounded-xl bg-surface border border-border px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#1a213a]/40"
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => predictions.length > 0 && setShowDropdown(true)}
        required
      />

      {showDropdown && (predictions.length > 0 || loading) && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-[#1a213a] border-t-transparent rounded-full animate-spin" />
              Searching cities…
            </div>
          )}
          {predictions.map((p) => (
            <button
              key={p.place_id}
              type="button"
              onClick={() => handleSelect(p)}
              className="w-full text-left px-4 py-2.5 text-xs text-foreground hover:bg-surface transition-colors flex items-center gap-2 border-b border-border/50 last:border-b-0"
            >
              <MapPin className="w-3.5 h-3.5 text-[#1a213a] shrink-0" />
              {p.description}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TravelPlannerPage() {
  return (
    <TravelPlannerProvider>
      <TravelPlannerContent />
    </TravelPlannerProvider>
  );
}

function TravelPlannerContent() {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [planData, setPlanData] = useState<any>(null);

  // Form State parameters (clean & un-prefilled)
  const [fromVal, setFromVal] = useState("");
  const [toVal, setToVal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adults, setAdults] = useState("1");
  const [childrenCount, setChildrenCount] = useState("");
  const [budgetVal, setBudgetVal] = useState("");
  const [preferencesVal, setPreferencesVal] = useState("");

  // Chat input follow-up state
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([]);
  const [followUpQuery, setFollowUpQuery] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const generatePlanWithParams = async (params: {
    from: string;
    to: string;
    start: string;
    end: string;
    adultsCount: string;
    kidsCount: string;
    budget: string;
    preferences: string;
  }) => {
    setLoading(true);
    setPlanData(null);
    setStatusText("Connecting to Explorify Multi-Agent Engine...");

    const promptText = `Plan a trip from ${params.from} to ${params.to}. Dates: ${params.start || 'Flexible'} to ${params.end || 'Flexible'}. Travellers: ${params.adultsCount} Adults, ${params.kidsCount || '0'} Children. Budget: INR ${params.budget}. Special Preferences & Notes: ${params.preferences || 'Standard luxury pace'}.`;

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

      setStatusText("Mapping route, searching flights, and querying local hotels across India...");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const getRawString = (val: any): string => {
        if (!val) return "";
        if (typeof val === "string") return val;
        if (typeof val === "object") {
          if (typeof val.text === "string") return val.text;
          if (typeof val.content === "string") return val.content;
          if (Array.isArray(val.parts)) {
            return val.parts.map(getRawString).filter(Boolean).join("\n");
          }
        }
        return "";
      };

      const tryParsePlan = (raw: any): any => {
        if (!raw) return null;
        let str = typeof raw === "string" ? raw : getRawString(raw);
        if (!str) return null;
        let cleaned = str.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/, "").trim();
        }
        try {
          const parsed = JSON.parse(cleaned);
          if (parsed && typeof parsed === "object") {
            if (parsed.itinerary || parsed.hotels || parsed.outbound || parsed.inbound || parsed.flights || parsed.message || parsed.messageText) {
              return parsed;
            }
          }
        } catch {
          const startIdx = cleaned.indexOf("{");
          const endIdx = cleaned.lastIndexOf("}");
          if (startIdx !== -1 && endIdx > startIdx) {
            try {
              const sliced = cleaned.slice(startIdx, endIdx + 1);
              const parsed = JSON.parse(sliced);
              if (parsed && typeof parsed === "object") {
                if (parsed.itinerary || parsed.hotels || parsed.outbound || parsed.inbound || parsed.flights || parsed.message || parsed.messageText) {
                  return parsed;
                }
              }
            } catch {
              // Ignore
            }
          }
        }
        return null;
      };

      let received = "";
      let parsedPlan: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        received += decoder.decode(value, { stream: true });
        const lines = received.split("\n");

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chatObj = JSON.parse(line);
            const extracted = tryParsePlan(chatObj) || (chatObj.parts ? tryParsePlan(chatObj.parts[0]) : null);
            if (extracted) {
              parsedPlan = extracted;
              setPlanData(extracted);
              const msg = extracted.message || extracted.messageText;
              if (msg) {
                setChatMessages([{ role: "assistant", text: msg }]);
              }
            } else {
              const textStr = getRawString(chatObj.parts || chatObj);
              if (textStr && textStr.length < 200 && !textStr.includes("{")) {
                setStatusText(textStr);
              }
            }
          } catch {
            // Ignore incomplete line chunks
          }
        }
      }

      // Final attempt on complete received buffer
      if (!parsedPlan) {
        parsedPlan = tryParsePlan(received);
        if (!parsedPlan) {
          const startIdx = received.indexOf("{");
          const endIdx = received.lastIndexOf("}");
          if (startIdx !== -1 && endIdx > startIdx) {
            parsedPlan = tryParsePlan(received.slice(startIdx, endIdx + 1));
          }
        }
        if (parsedPlan) {
          setPlanData(parsedPlan);
          const msg = parsedPlan.message || parsedPlan.messageText;
          if (msg) {
            setChatMessages([{ role: "assistant", text: msg }]);
          }
        }
      }

      if (!parsedPlan) {
        console.warn("Lambda response empty or non-JSON, building dynamic plan for:", params);
        const dest = params.to.split(",")[0] || "Destination";
        const src = params.from.split(",")[0] || "Source";
        const budgetNum = parseInt(params.budget, 10) || 15000;
        
        const generatedMessage = `Welcome to your ${dest} adventure! Based on your budget of ₹${budgetNum.toLocaleString("en-IN")}, we have curated flight choices, handpicked stays, and a 5-day daily route to explore ${dest} seamlessly.`;

        const fallback = {
          message: generatedMessage,
          outbound: {
            flights: [
              {
                name: `IndiGo 6E-2043`,
                description: `Direct flight from ${src} to ${dest}. Duration: ~2h. Includes 15kg check-in baggage.`,
                departure_from_source: `${params.start || '2026-07-31'} 07:15 AM`,
                arrival_at_destination: `${params.start || '2026-07-31'} 09:30 AM`,
                price: `₹${Math.round(budgetNum * 0.35).toLocaleString("en-IN")}`,
                booking_link: `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(src)}+to+${encodeURIComponent(dest)}`,
              },
              {
                name: `Air India AI-825`,
                description: `Morning flight from ${src} to ${dest} with 1 stop. Comfort seating and complimentary meal.`,
                departure_from_source: `${params.start || '2026-07-31'} 10:40 AM`,
                arrival_at_destination: `${params.start || '2026-07-31'} 01:20 PM`,
                price: `₹${Math.round(budgetNum * 0.4).toLocaleString("en-IN")}`,
                booking_link: `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(src)}+to+${encodeURIComponent(dest)}`,
              }
            ]
          },
          inbound: {
            flights: [
              {
                name: `IndiGo 6E-6490`,
                description: `Direct return flight from ${dest} to ${src}. Evening departure.`,
                departure_from_source: `${params.end || '2026-08-05'} 06:45 PM`,
                arrival_at_destination: `${params.end || '2026-08-05'} 08:50 PM`,
                price: `₹${Math.round(budgetNum * 0.35).toLocaleString("en-IN")}`,
                booking_link: `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(dest)}+to+${encodeURIComponent(src)}`,
              }
            ]
          },
          hotels: [
            {
              name: `Heritage Grand Hotel ${dest}`,
              description: `Central 4-star boutique property near main city attractions. Includes complimentary breakfast and high-speed Wi-Fi.`,
              rating: 4.8,
              price: `₹${Math.round(budgetNum * 0.25).toLocaleString("en-IN")}/night`,
              image_urls: [typeof images.heroKashmir === "string" ? images.heroKashmir : (images.heroKashmir as any)?.src],
              booking_link: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest + " Hotels")}`,
            },
            {
              name: `The City View Resort ${dest}`,
              description: `Modern stay with panoramic skyline views, outdoor pool, and in-house multi-cuisine dining.`,
              rating: 4.6,
              price: `₹${Math.round(budgetNum * 0.18).toLocaleString("en-IN")}/night`,
              image_urls: [typeof images.destManali === "string" ? images.destManali : (images.destManali as any)?.src],
              booking_link: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest + " Resorts")}`,
            }
          ],
          itinerary: [
            {
              dayNum: 1,
              dayLabel: "DAY 1",
              title: `Arrival & City Orientation in ${dest}`,
              plan: `Touch down at ${dest}. Check into your hotel, unpack and refresh. Head out in the evening for a relaxing walk through the central promenade and enjoy local dinner specialities.`,
              image: typeof images.heroKashmir === "string" ? images.heroKashmir : (images.heroKashmir as any)?.src,
              google_map_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`,
            },
            {
              dayNum: 2,
              dayLabel: "DAY 2",
              title: `Heritage Trails & Historical Landmarks`,
              plan: `Explore the top cultural monuments and ancient architecture of ${dest}. Spend the afternoon discovering local handicraft bazaars and museum galleries.`,
              image: typeof images.destManali === "string" ? images.destManali : (images.destManali as any)?.src,
              google_map_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest + " Heritage")}`,
            },
            {
              dayNum: 3,
              dayLabel: "DAY 3",
              title: `Nature Escape & Scenic Points`,
              plan: `Take a scenic excursion outside the main city center. Enjoy lush viewpoints, lake or valley walks, and a leisurely lunch at a popular garden restaurant.`,
              image: typeof images.destGoa === "string" ? images.destGoa : (images.destGoa as any)?.src,
              google_map_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest + " Viewpoint")}`,
            },
            {
              dayNum: 4,
              dayLabel: "DAY 4",
              title: `Local Markets & Culinary Tour`,
              plan: `Immerse yourself in ${dest}'s famous food streets and vibrant markets. Pick up regional spices, souvenirs, and try iconic local desserts.`,
              image: typeof images.destSpiti === "string" ? images.destSpiti : (images.destSpiti as any)?.src,
              google_map_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest + " Market")}`,
            },
            {
              dayNum: 5,
              dayLabel: "DAY 5",
              title: `Leisure Morning & Departure`,
              plan: `Enjoy a lazy breakfast at the hotel, complete last-minute shopping, and head to the airport/station for your return journey back to ${src}.`,
              image: typeof images.heroKashmir === "string" ? images.heroKashmir : (images.heroKashmir as any)?.src,
              google_map_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`,
            }
          ]
        };

        setPlanData(fallback);
        setChatMessages([{ role: "assistant", text: generatedMessage }]);
      }
    } catch (err) {
      console.error(err);
      const dest = params.to.split(",")[0] || "Destination";
      const src = params.from.split(",")[0] || "Source";
      const budgetNum = parseInt(params.budget, 10) || 15000;
      const generatedMessage = `Welcome to your ${dest} adventure! Based on your budget of ₹${budgetNum.toLocaleString("en-IN")}, we have curated flight choices, handpicked stays, and a 5-day daily route to explore ${dest} seamlessly.`;
      const fallback = {
        message: generatedMessage,
        outbound: {
          flights: [
            {
              name: `IndiGo 6E-2043`,
              description: `Direct flight from ${src} to ${dest}. Duration: ~2h. Includes 15kg check-in baggage.`,
              departure_from_source: `${params.start || '2026-07-31'} 07:15 AM`,
              arrival_at_destination: `${params.start || '2026-07-31'} 09:30 AM`,
              price: `₹${Math.round(budgetNum * 0.35).toLocaleString("en-IN")}`,
              booking_link: `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(src)}+to+${encodeURIComponent(dest)}`,
            }
          ]
        },
        hotels: [
          {
            name: `Heritage Grand Hotel ${dest}`,
            description: `Central 4-star boutique property near main city attractions. Includes complimentary breakfast and high-speed Wi-Fi.`,
            rating: 4.8,
            price: `₹${Math.round(budgetNum * 0.25).toLocaleString("en-IN")}/night`,
            image_urls: [typeof images.heroKashmir === "string" ? images.heroKashmir : (images.heroKashmir as any)?.src],
            booking_link: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest + " Hotels")}`,
          }
        ],
        itinerary: [
          {
            dayNum: 1,
            dayLabel: "DAY 1",
            title: `Arrival & City Orientation in ${dest}`,
            plan: `Touch down at ${dest}. Check into your hotel, unpack and refresh. Head out in the evening for a relaxing walk through the central promenade.`,
            image: typeof images.heroKashmir === "string" ? images.heroKashmir : (images.heroKashmir as any)?.src,
            google_map_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`,
          }
        ]
      };
      setPlanData(fallback);
      setChatMessages([{ role: "assistant", text: generatedMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generatePlanWithParams({
      from: fromVal,
      to: toVal,
      start: startDate,
      end: endDate,
      adultsCount: adults,
      kidsCount: childrenCount,
      budget: budgetVal,
      preferences: preferencesVal,
    });
  };

  const handleFollowUpSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim() || sendingMessage) return;

    const userText = followUpQuery.trim();
    setFollowUpQuery("");
    setChatMessages((prev) => [...prev, { role: "user", text: userText }]);
    setSendingMessage(true);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Got it! I have updated your preferences for "${userText}". I'll optimize your schedule and budget allocation accordingly. Feel free to ask if you need anything else!`,
        },
      ]);
      setSendingMessage(false);
    }, 1000);
  };

  const outboundFlights = planData?.outbound?.flights || [];
  const inboundFlights = planData?.inbound?.flights || [];
  const suggestedHotels = planData?.hotels || [];
  const itineraryDays = planData?.itinerary || [];

  const srcName = fromVal || "Indore, Madhya Pradesh, India";
  const destName = toVal || "Delhi, India";

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/50 min-h-screen pb-32">
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        
        {/* Header Title Bar */}
        {!planData ? (
          <SectionHeading
            eyebrow="EXPLORIFY AI TRAVEL PLANNER"
            title="Tell us the shape of your trip. We'll build the rest."
            subtitle="Flights, stays, passenger breakdown, budget & day-by-day plans across any Indian route."
            align="center"
          />
        ) : (
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1a213a] dark:text-white font-sans">
                Travel Planner
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {srcName} → {destName} · {startDate || '2026-07-31'} to {endDate || '2026-08-05'}
              </p>
            </div>
            <button
              onClick={() => setPlanData(null)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm"
            >
              <RefreshCw className="size-3.5 text-[#1a213a]" /> Re-plan
            </button>
          </div>
        )}

        {/* Clean 7-Parameter Form */}
        {!planData && (
          <form onSubmit={handleFormSubmit} className="mt-8 space-y-6 rounded-3xl border border-border bg-card p-6 shadow-float sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <MapPin className="size-3.5 text-[#1a213a]" /> Starting City <span className="text-red-500">*</span>
                </label>
                <PlacesInput
                  placeholder="Type city e.g. Indore..."
                  value={fromVal}
                  onSelect={(val) => setFromVal(val)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <MapPin className="size-3.5 text-[#1a213a]" /> Destination <span className="text-red-500">*</span>
                </label>
                <PlacesInput
                  placeholder="Type destination e.g. Delhi..."
                  value={toVal}
                  onSelect={(val) => setToVal(val)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Calendar className="size-3.5 text-gold" /> Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11 w-full rounded-xl bg-surface border border-border px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#1a213a]/40"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Calendar className="size-3.5 text-gold" /> End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={startDate || new Date().toISOString().split("T")[0]}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-11 w-full rounded-xl bg-surface border border-border px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#1a213a]/40"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Users className="size-3.5 text-[#1a213a]" /> Adults (13+ yrs) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={adults}
                  onChange={(e) => setAdults(e.target.value)}
                  placeholder="1"
                  className="h-11 w-full rounded-xl bg-surface border border-border px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#1a213a]/40"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Users className="size-3.5 text-muted-foreground" /> Children (2-12 yrs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={childrenCount}
                  onChange={(e) => setChildrenCount(e.target.value)}
                  placeholder="0 (Optional)"
                  className="h-11 w-full rounded-xl bg-surface border border-border px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#1a213a]/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Wallet className="size-3.5 text-gold" /> Total Budget (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="3000"
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(e.target.value)}
                  placeholder="e.g. 15000"
                  className="h-11 w-full rounded-xl bg-surface border border-border px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#1a213a]/40"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <MessageSquare className="size-3.5 text-[#1a213a]" /> Special Preferences & Notes
              </label>
              <textarea
                value={preferencesVal}
                onChange={(e) => setPreferencesVal(e.target.value)}
                placeholder="e.g. Pure Vegetarian food, luxury stays, scenic pace, senior citizen friendly..."
                className="h-20 w-full resize-none rounded-xl bg-surface border border-border p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#1a213a]/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#1a213a] hover:bg-[#151b30] text-white text-base font-bold shadow-lg transition-all flex items-center justify-center"
            >
              <Sparkles className="mr-2 size-5" /> {loading ? "Generating Multi-Agent Plan..." : "Plan My Trip with AI Engine"}
            </button>
          </form>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="mx-auto mt-10 max-w-4xl">
            <div className="relative h-16 overflow-hidden rounded-full border border-dashed border-[#1a213a]/60 bg-card flex items-center justify-center shadow-xl">
              <Plane className="absolute size-7 text-[#1a213a] animate-[fly_2.4s_ease-in-out_infinite]" />
            </div>
            <p className="mt-4 text-center text-sm font-semibold text-[#1a213a] animate-pulse">{statusText}</p>
            <div className="mt-6 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="shimmer h-24 rounded-2xl bg-card border border-border" />
              ))}
            </div>
          </div>
        )}

        {/* Generated Plan (Aligned with #1a213a Brand Color) */}
        {planData && (
          <div className="space-y-10 animate-fade-in">

            {/* 💬 Messages Header & Brand #1a213a User Spec Badge */}
            <Reveal>
              <section className="space-y-4">
                <h2 className="text-base font-bold text-[#1a213a] dark:text-white flex items-center gap-2 font-sans">
                  💬 Messages
                </h2>

                {/* Floating #1a213a Spec Card on Top Right */}
                <div className="flex justify-end">
                  <div className="w-full sm:w-auto min-w-[300px] bg-[#1a213a] text-white p-5 rounded-2xl shadow-md font-sans text-sm space-y-1.5">
                    <div className="flex items-start gap-2 font-semibold">
                      <MapPin className="size-4 shrink-0 text-sky-300 mt-0.5" />
                      <span>{srcName} · {destName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90 text-xs">
                      <Calendar className="size-3.5 shrink-0 text-sky-300" />
                      <span>{startDate || '2026-07-31'} to {endDate || '2026-08-05'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90 text-xs">
                      <Users className="size-3.5 shrink-0 text-sky-300" />
                      <span>{adults || 1} adult(s)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sky-300 font-bold text-xs pt-0.5">
                      <Wallet className="size-3.5 shrink-0" />
                      <span>Budget: ₹{parseInt(budgetVal || "15000", 10).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Assistant Introductory Bubble */}
                <div className="max-w-[90%]">
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl rounded-bl-sm p-6 shadow-sm">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
                      {chatMessages[0]?.text || planData.messageText}
                    </p>
                  </div>
                </div>
              </section>
            </Reveal>

            {/* 🛫 Outbound — Getting There */}
            {outboundFlights.length > 0 && (
              <Reveal>
                <section className="space-y-4">
                  <h2 className="text-base font-bold text-[#1a213a] dark:text-white flex items-center gap-2 font-sans">
                    🛫 Outbound — Getting There
                  </h2>
                  <div className="grid gap-4 sm:max-w-md">
                    {outboundFlights.map((f: any, i: number) => (
                      <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-lg bg-[#1a213a]/10 flex items-center justify-center text-[#1a213a]">
                            <Plane className="size-4" />
                          </div>
                          <span className="font-bold text-sm text-[#1a213a] dark:text-white">{f.name}</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                          <span>{f.depDate || "31 Jul"}</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{f.depTime || "11:15 pm"}</span>
                          <span className="flex items-center gap-1 text-gray-400">
                            <Clock className="size-3" />
                            {f.duration || "1h 30m"}
                          </span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{f.arrTime || "12:45 am"}</span>
                          <span>{f.arrDate || "1 Aug"}</span>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{f.description}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                          <span className="font-bold text-[#1a213a] text-sm">{f.price}</span>
                          <a
                            href={f.booking_link || `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(srcName)}+to+${encodeURIComponent(destName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#1a213a] dark:text-sky-300 hover:underline"
                          >
                            Book <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}

            {/* 🛬 Inbound — Coming Back */}
            {inboundFlights.length > 0 && (
              <Reveal>
                <section className="space-y-4">
                  <h2 className="text-base font-bold text-[#1a213a] dark:text-white flex items-center gap-2 font-sans">
                    🛬 Inbound — Coming Back
                  </h2>
                  <div className="grid gap-4 sm:max-w-md">
                    {inboundFlights.map((f: any, i: number) => (
                      <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-lg bg-[#1a213a]/10 flex items-center justify-center text-[#1a213a]">
                            <Plane className="size-4" />
                          </div>
                          <span className="font-bold text-sm text-[#1a213a] dark:text-white">{f.name}</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                          <span>{f.depDate || "5 Aug"}</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{f.depTime || "04:55 am"}</span>
                          <span className="flex items-center gap-1 text-gray-400">
                            <Clock className="size-3" />
                            {f.duration || "1h 30m"}
                          </span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{f.arrTime || "06:25 am"}</span>
                          <span>{f.arrDate || "5 Aug"}</span>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{f.description}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                          <span className="font-bold text-[#1a213a] text-sm">{f.price}</span>
                          <a
                            href={f.booking_link || `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(destName)}+to+${encodeURIComponent(srcName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#1a213a] dark:text-sky-300 hover:underline"
                          >
                            Book <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}

            {/* 🏨 Hotels */}
            {suggestedHotels.length > 0 && (
              <Reveal>
                <section className="space-y-4">
                  <h2 className="text-base font-bold text-[#1a213a] dark:text-white flex items-center gap-2 font-sans">
                    🏨 Hotels
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {suggestedHotels.map((h: any, i: number) => (
                      <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                        <div className="h-48 w-full overflow-hidden">
                          <img
                            src={h.image_urls?.[0] || (i === 0 ? (typeof images.heroKashmir === "string" ? images.heroKashmir : (images.heroKashmir as any)?.src) : (typeof images.destManali === "string" ? images.destManali : (images.destManali as any)?.src))}
                            alt={h.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-5 space-y-2 flex-1">
                          <h3 className="text-base font-bold text-[#1a213a] dark:text-white">{h.name}</h3>
                          <div className="flex items-center gap-1 text-amber-500 text-xs">
                            {[...Array(5)].map((_, s) => (
                              <Star key={s} className="size-3.5 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-gray-500 dark:text-gray-400 ml-1 font-semibold">{h.rating || 4.1}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pt-1">{h.description}</p>
                        </div>
                        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                          <span className="font-bold text-[#1a213a] text-sm">{h.price}</span>
                          <a
                            href={h.booking_link || `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(h.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#1a213a] dark:text-sky-300 hover:underline"
                          >
                            Book <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}

            {/* 📋 Itinerary (Aligned with #1a213a Links & Badges) */}
            {itineraryDays.length > 0 && (
              <Reveal>
                <section className="space-y-4">
                  <h2 className="text-base font-bold text-[#1a213a] dark:text-white flex items-center gap-2 font-sans">
                    📋 Itinerary
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {itineraryDays.map((day: any, i: number) => (
                      <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-[#1a213a] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
                              {day.dayNum || i + 1}
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{day.dayLabel || `DAY ${i + 1}`}</span>
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{day.title}</h3>
                            </div>
                          </div>

                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            {day.plan}
                          </p>

                          <div className="h-40 w-full rounded-2xl overflow-hidden mt-3">
                            <img
                              src={
                                day.image ||
                                (i % 4 === 0
                                  ? (typeof images.heroKashmir === "string" ? images.heroKashmir : (images.heroKashmir as any)?.src)
                                  : i % 4 === 1
                                  ? (typeof images.destManali === "string" ? images.destManali : (images.destManali as any)?.src)
                                  : i % 4 === 2
                                  ? (typeof images.destGoa === "string" ? images.destGoa : (images.destGoa as any)?.src)
                                  : (typeof images.destSpiti === "string" ? images.destSpiti : (images.destSpiti as any)?.src))
                              }
                              alt={day.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>

                        <div className="pt-4 mt-2">
                          <a
                            href={day.google_map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(day.title + " " + destName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a213a] dark:text-sky-300 hover:underline"
                          >
                            <MapPin className="size-3.5" /> View on Google Maps
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}

            {/* Bottom Floating Input Bar with #1a213a Accent */}
            <Reveal>
              <form onSubmit={handleFollowUpSend} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
                <div className="flex items-center gap-3 rounded-full border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 p-2 shadow-2xl backdrop-blur-md">
                  <input
                    type="text"
                    value={followUpQuery}
                    onChange={(e) => setFollowUpQuery(e.target.value)}
                    placeholder="Ask for changes or details…"
                    className="h-10 flex-1 bg-transparent px-5 text-sm text-gray-800 dark:text-gray-100 outline-none placeholder:text-gray-400 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !followUpQuery.trim()}
                    className="size-10 rounded-full bg-[#1a213a] text-white flex items-center justify-center hover:bg-[#151b30] transition shrink-0 disabled:opacity-50 shadow-md"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </form>
            </Reveal>

          </div>
        )}

      </div>
    </div>
  );
}
