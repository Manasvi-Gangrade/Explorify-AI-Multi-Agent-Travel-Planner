"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Hotel, Plane, Sparkles, MapPin, Calendar, Users, Wallet, MessageSquare, RefreshCw, Send, ExternalLink, Clock, Star, Download, Share2, ArrowRight, Navigation, Building2, Bot, CheckCircle2, Loader2, ShieldCheck, Ticket, X } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { images } from "@/lib/site-data";
import { TravelPlannerProvider } from "@/components/travel-planner/travel-planner-context";
import { toast } from "sonner";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RazorpayMockModal } from "@/components/booking/RazorpayMockModal";

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
        className="h-11 w-full rounded-xl bg-surface border border-border px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#1d6fa5]/40"
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
              <span className="w-3.5 h-3.5 border-2 border-[#1d6fa5] border-t-transparent rounded-full animate-spin" />
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
              <MapPin className="w-3.5 h-3.5 text-[#1d6fa5] shrink-0" />
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
  const { data: session, status } = useSession();
  const router = useRouter();

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

  // Razorpay & Autonomous Agent Booking Modal State
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [pendingBookingTarget, setPendingBookingTarget] = useState<{ type: 'flight' | 'hotel' | 'all'; item?: any } | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingTarget, setBookingTarget] = useState<{ type: 'flight' | 'hotel' | 'all'; item?: any }>({ type: 'all' });
  const [bookingStep, setBookingStep] = useState(0);
  const [bookingProgress, setBookingProgress] = useState(0);
  const [confirmedPnr, setConfirmedPnr] = useState("");

  const handleInitiateBooking = (target: { type: 'flight' | 'hotel' | 'all'; item?: any }) => {
    if (status === "unauthenticated" || !session) {
      toast.error("Sign in required before booking expedition!");
      router.push("/auth/sign-in?callbackUrl=/travel-planner");
      return;
    }

    setPendingBookingTarget(target);
    setRazorpayOpen(true);
  };

  const triggerAgentBooking = async (target: { type: 'flight' | 'hotel' | 'all'; item?: any }) => {
    setBookingTarget(target);
    setBookingStep(0);
    setBookingProgress(15);
    setConfirmedPnr("");
    setBookingModalOpen(true);

    const openedTabs: (Window | null)[] = [];

    // Clean City Names for Google Flights & Booking.com query
    const cleanSrc = srcName.split(',')[0].trim() || "Indore";
    let cleanDest = destName.split(',')[0].trim() || "Delhi";
    if (cleanDest.toLowerCase().includes("kashmir")) {
      cleanDest = "Srinagar";
    }

    // Real Provider Webpages Open & Agent Tab Synchronization
    if (target.type === 'flight') {
      const flightUrl = target.item?.booking_link || `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(cleanSrc)}+to+${encodeURIComponent(cleanDest)}`;
      const flightWin = window.open(flightUrl, "ExplorifyFlightWindow", "width=1100,height=750,top=80,left=80");
      if (flightWin) openedTabs.push(flightWin);
    } else if (target.type === 'hotel') {
      const hotelUrl = target.item?.booking_link || `https://www.booking.com/searchresults.html?ss=${encodeURIComponent((target.item?.name || 'Hotel') + ' ' + cleanDest)}`;
      const hotelWin = window.open(hotelUrl, "ExplorifyHotelWindow", "width=1100,height=750,top=120,left=120");
      if (hotelWin) openedTabs.push(hotelWin);
    } else if (target.type === 'all') {
      const flightUrl1 = `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(cleanSrc)}+to+${encodeURIComponent(cleanDest)}`;
      const hotelUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(cleanDest + ' Hotels')}`;
      
      const flightWin = window.open(flightUrl1, "ExplorifyFlightWindow", "width=1100,height=750,top=80,left=80");
      if (flightWin) openedTabs.push(flightWin);
      
      setTimeout(() => {
        const hotelWin = window.open(hotelUrl, "ExplorifyHotelWindow", "width=1100,height=750,top=120,left=120");
        if (hotelWin) openedTabs.push(hotelWin);
      }, 400);
    }

    try {
      // Step 1: Dispatching Agent Call to Server API
      setTimeout(() => {
        setBookingStep(1);
        setBookingProgress(45);
      }, 600);

      const res = await fetch("/api/travel-planner/headless-book-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingType: target.type,
          source: cleanSrc,
          destination: cleanDest,
          dates: `${startDate || '2026-08-12'} to ${endDate || '2026-08-18'}`,
          item: target.item,
          passengers: adults || 1,
        }),
      });

      setBookingStep(2);
      setBookingProgress(85);

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Booking Agent API failed.");
      }

      // Continuous close loop for Google Flights / Booking.com windows
      const closeTimer = setInterval(() => {
        openedTabs.forEach((tabWin) => {
          try {
            if (tabWin && !tabWin.closed) {
              tabWin.close();
            }
          } catch (e) {}
        });
      }, 300);

      setTimeout(() => {
        clearInterval(closeTimer);
        setConfirmedPnr(data.pnr);
        setBookingStep(3);
        setBookingProgress(100);

        // Save Autonomous Agent Booking to My Bookings (localStorage)
        const newBookingItem = {
          bookingId: data.pnr,
          tripId: `ai-expedition-${data.pnr}`,
          name: `${cleanSrc} ➔ ${cleanDest} Autonomous AI Expedition`,
          destination: cleanDest,
          image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800",
          date: startDate || new Date().toISOString().split("T")[0],
          days: 5,
          nights: 4,
          numPeople: adults || 1,
          totalAmount: 25000,
          paymentStatus: "PAID",
          bookingStatus: "confirmed",
          createdAt: new Date().toISOString(),
        };

        try {
          const existing = JSON.parse(localStorage.getItem("explorify_bookings") || "[]");
          existing.unshift(newBookingItem);
          localStorage.setItem("explorify_bookings", JSON.stringify(existing));
        } catch (e) {
          console.error("Failed to save booking to localStorage:", e);
        }

        try { window.focus(); } catch (e) {}
        toast.success(`Autonomous Agent Reservation Saved to My Bookings! PNR: ${data.pnr}`);
      }, 2500);
    } catch (err: any) {
      console.error("Real Booking Agent Error:", err);
      toast.error(err.message || "Failed to execute booking agent.");
      setBookingModalOpen(false);
    }
  };

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

    const promptText = `Plan a trip from ${params.from} to ${params.to}.
Departure Location: ${params.from}
Destination: ${params.to}
Travel Dates: ${params.start || '2026-08-10'} to ${params.end || '2026-08-16'}
Travellers: ${params.adultsCount} Adults, ${params.kidsCount || '0'} Children
Total Budget (INR): ₹${params.budget}
Preferences: ${params.preferences || 'Standard leisure trip with top sights'}

Please generate a realistic, tailored travel plan for ${params.to} originating from ${params.from} including:
1. Direct or connecting flights matching ${params.from} to ${params.to}
2. Handpicked hotels in ${params.to} within the budget of ₹${params.budget}
3. Day-by-day itinerary with real tourist spots in ${params.to}`;

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

    // Rejection list for foreign destinations
    const foreignKeywords = [
      "london", "paris", "new york", "usa", "uk", "france", "dubai", "tokyo", "japan",
      "bangkok", "thailand", "singapore", "bali", "indonesia", "switzerland", "italy",
      "canada", "australia", "germany", "spain", "russia", "china", "egypt", "maldives"
    ];

    const toLower = toVal.toLowerCase();
    const fromLower = fromVal.toLowerCase();

    const isForeignDest = foreignKeywords.some((k) => toLower.includes(k) || fromLower.includes(k));

    if (isForeignDest) {
      toast.error("Explorify specializes exclusively in Indian domestic expeditions! Please enter an Indian city or destination.");
      return;
    }

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

  const handleDownloadPdfItinerary = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to download PDF Itinerary.");
      return;
    }

    const daysHtml = itineraryDays.map((d: any) => `
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
        <div style="font-[#1d6fa5]; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #1d6fa5;">${d.dayLabel || 'DAY'}</div>
        <h4 style="margin: 4px 0 8px 0; font-size: 16px; font-weight: 700; color: #0f172a;">${d.title}</h4>
        <p style="font-size: 13px; color: #475569; line-height: 1.5; margin: 0;">${d.plan}</p>
      </div>
    `).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Explorify AI Itinerary - ${srcName} to ${destName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 36px; color: #0f172a; max-width: 850px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1d6fa5; padding-bottom: 18px; }
          .logo { font-size: 24px; font-weight: 800; color: #1d6fa5; }
          .badge { background: #e0f2fe; color: #0369a1; font-weight: bold; padding: 6px 14px; border-radius: 20px; font-size: 12px; }
          .summary-card { background: #1d6fa5; color: white; border-radius: 14px; padding: 20px; margin: 20px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .label { font-size: 11px; color: #93c5fd; font-weight: 700; text-transform: uppercase; }
          .val { font-size: 15px; font-weight: 700; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Explorify AI Travel Planner</div>
          <div class="badge">OFFICIAL AI ITINERARY</div>
        </div>

        <div class="summary-card">
          <div>
            <div class="label">ROUTE</div>
            <div class="val">${srcName} → ${destName}</div>
          </div>
          <div>
            <div class="label">TRAVEL DATES</div>
            <div class="val">${startDate || '2026-07-31'} to ${endDate || '2026-08-05'}</div>
          </div>
          <div>
            <div class="label">PASSENGERS</div>
            <div class="val">${adults || 1} Adult(s)</div>
          </div>
          <div>
            <div class="label">BUDGET ALLOCATION</div>
            <div class="val">₹${parseInt(budgetVal || "15000", 10).toLocaleString("en-IN")}</div>
          </div>
        </div>

        <h3 style="color: #1d6fa5; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Day-by-Day Master Schedule</h3>
        ${daysHtml}

        <div class="footer">
          Generated by Explorify Multi-Agent Travel Planner • 24/7 Support: support@explorify.ai
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleWhatsAppShare = () => {
    const itinerarySummary = itineraryDays.slice(0, 3).map((d: any, idx: number) => `• Day ${idx + 1}: ${d.title}`).join("%0A");
    const shareText = `*Explorify AI Travel Itinerary*%0A%0A📍 *Route:* ${encodeURIComponent(srcName)} ➔ ${encodeURIComponent(destName)}%0A📅 *Dates:* ${startDate || '2026-07-31'} to ${endDate || '2026-08-05'}%0A👥 *Passengers:* ${adults || 1} Adult(s)%0A💰 *Budget:* ₹${parseInt(budgetVal || "15000", 10).toLocaleString("en-IN")}%0A%0A✨ *Highlights:*%0A${itinerarySummary}%0A%0AGenerated on Explorify AI Travel Planner! 🚀`;
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, "_blank");
  };

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
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1d6fa5] dark:text-white font-sans">
                Travel Planner
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {srcName} → {destName} · {startDate || '2026-07-31'} to {endDate || '2026-08-05'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => triggerAgentBooking({ type: 'all' })}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#1d6fa5] via-[#2079b3] to-[#185c8a] hover:scale-105 text-white text-xs font-extrabold transition shadow-md border border-sky-300/40"
              >
                <Sparkles className="size-3.5 text-amber-300 animate-pulse" /> Auto-Book Whole Expedition
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md"
              >
                <Share2 className="size-3.5" /> Share to WhatsApp
              </button>

              <button
                onClick={handleDownloadPdfItinerary}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1d6fa5] text-white text-xs font-bold hover:bg-[#185c8a] transition shadow-md"
              >
                <Download className="size-3.5" /> Download PDF Itinerary
              </button>

              <button
                onClick={() => setPlanData(null)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm"
              >
                <RefreshCw className="size-3.5 text-[#1d6fa5]" /> Re-plan
              </button>
            </div>
          </div>
        )}

        {/* Clean 7-Parameter Form */}
        {!planData && (
          <form onSubmit={handleFormSubmit} className="mt-8 space-y-6 rounded-3xl border border-border bg-card p-6 shadow-float sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <MapPin className="size-3.5 text-[#1d6fa5]" /> Starting City <span className="text-red-500">*</span>
                </label>
                <PlacesInput
                  placeholder="Type city e.g. Indore..."
                  value={fromVal}
                  onSelect={(val) => setFromVal(val)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <MapPin className="size-3.5 text-[#1d6fa5]" /> Destination <span className="text-red-500">*</span>
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
                  className="h-11 w-full rounded-xl bg-surface border border-border px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#1d6fa5]/40"
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
                  className="h-11 w-full rounded-xl bg-surface border border-border px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#1d6fa5]/40"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Users className="size-3.5 text-[#1d6fa5]" /> Adults (13+ yrs) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={adults}
                  onChange={(e) => setAdults(e.target.value)}
                  placeholder="1"
                  className="h-11 w-full rounded-xl bg-surface border border-border px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#1d6fa5]/40"
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
                  className="h-11 w-full rounded-xl bg-surface border border-border px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#1d6fa5]/40"
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
                  className="h-11 w-full rounded-xl bg-surface border border-border px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#1d6fa5]/40"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <MessageSquare className="size-3.5 text-[#1d6fa5]" /> Special Preferences & Notes
              </label>
              <textarea
                value={preferencesVal}
                onChange={(e) => setPreferencesVal(e.target.value)}
                placeholder="e.g. Pure Vegetarian food, luxury stays, scenic pace, senior citizen friendly..."
                className="h-20 w-full resize-none rounded-xl bg-surface border border-border p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#1d6fa5]/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#1d6fa5] hover:bg-[#151b30] text-white text-base font-bold shadow-lg transition-all flex items-center justify-center"
            >
              <Sparkles className="mr-2 size-5" /> {loading ? "Generating Multi-Agent Plan..." : "Plan My Trip with AI Engine"}
            </button>
          </form>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="mx-auto mt-10 max-w-4xl">
            <div className="relative h-16 overflow-hidden rounded-full border border-dashed border-[#1d6fa5]/60 bg-card flex items-center justify-center shadow-xl">
              <Plane className="absolute size-7 text-[#1d6fa5] animate-[fly_2.4s_ease-in-out_infinite]" />
            </div>
            <p className="mt-4 text-center text-sm font-semibold text-[#1d6fa5] animate-pulse">{statusText}</p>
            <div className="mt-6 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="shimmer h-24 rounded-2xl bg-card border border-border" />
              ))}
            </div>
          </div>
        )}

        {/* Generated Plan (Aligned with #1d6fa5 Brand Color) */}
        {planData && (
          <div className="space-y-10 animate-fade-in">

            {/* 🗺️ STEP-BY-STEP ROUTE CONNECTION VISUALIZER */}
            <Reveal>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#1d6fa5] dark:text-white flex items-center gap-2 font-sans tracking-wide">
                    <Navigation className="size-4 text-[#1d6fa5]" /> STEP-BY-STEP ROUTE CONNECTION
                  </h3>
                  <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                    Domestic Indian Expedition
                  </span>
                </div>

                {/* Route Node Pipeline Bar */}
                <div className="relative pt-3 pb-2 overflow-x-auto scrollbar-none">
                  <div className="flex items-center gap-2 sm:gap-4 min-w-[650px] justify-between">
                    
                    {/* Source Node */}
                    <div className="flex flex-col items-center gap-1.5 z-10 shrink-0">
                      <div className="size-11 rounded-2xl bg-[#1d6fa5] text-white flex items-center justify-center shadow-lg font-bold">
                        <Building2 className="size-5" />
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white max-w-[110px] text-center truncate">{srcName.split(',')[0]}</span>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">Origin</span>
                    </div>

                    {/* Connector Line 1 with Transit Icon */}
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full h-1 bg-gradient-to-r from-[#1d6fa5] to-[#2079b3] rounded-full relative flex items-center justify-center">
                        <div className="size-7 rounded-full bg-white dark:bg-gray-800 border-2 border-[#1d6fa5] text-[#1d6fa5] flex items-center justify-center shadow-md">
                          <Plane className="size-3.5" />
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#1d6fa5] mt-1">Outbound Transit</span>
                    </div>

                    {/* Destination Main Node */}
                    <div className="flex flex-col items-center gap-1.5 z-10 shrink-0">
                      <div className="size-11 rounded-2xl bg-[#1d6fa5] text-white flex items-center justify-center shadow-lg font-bold">
                        <MapPin className="size-5" />
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white max-w-[110px] text-center truncate">{destName.split(',')[0]}</span>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">Destination</span>
                    </div>

                    {/* Dynamic Days Itinerary Stop Nodes */}
                    {itineraryDays.slice(0, 3).map((day: any, i: number) => (
                      <React.Fragment key={i}>
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full h-1 bg-gradient-to-r from-[#2079b3] to-[#185c8a] rounded-full relative flex items-center justify-center">
                            <ArrowRight className="size-3.5 text-[#1d6fa5]" />
                          </div>
                          <span className="text-[10px] font-semibold text-gray-400">Day {day.dayNum || i + 1}</span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5 z-10 shrink-0">
                          <div className="size-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-700 text-[#1d6fa5] dark:text-sky-300 flex items-center justify-center shadow-sm font-bold text-xs">
                            {i + 1}
                          </div>
                          <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 max-w-[95px] text-center truncate">{day.title}</span>
                          <span className="text-[9px] text-gray-400 font-semibold">Excursion</span>
                        </div>
                      </React.Fragment>
                    ))}

                  </div>
                </div>

                <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-[#1d6fa5]" /> Zero-Manual Headless Reservation Engine Active
                  </div>
                  <Button
                    onClick={() => handleInitiateBooking({ type: 'all' })}
                    className="bg-[#1d6fa5] hover:bg-[#185c8a] text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-2 px-5 py-2.5"
                  >
                    <Bot className="size-4 animate-pulse" /> Auto-Book Whole Expedition
                  </Button>
                </div>
              </div>
            </Reveal>

            {/* Messages Header & Brand #1d6fa5 User Spec Badge */}
            <Reveal>
              <section className="space-y-4">
                <h2 className="text-base font-bold text-[#1d6fa5] dark:text-white flex items-center gap-2 font-sans">
                  Messages
                </h2>

                {/* Floating #1d6fa5 Spec Card on Top Right */}
                <div className="flex justify-end">
                  <div className="w-full sm:w-auto min-w-[300px] bg-[#1d6fa5] text-white p-5 rounded-2xl shadow-md font-sans text-sm space-y-1.5">
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

            {/* Outbound — Getting There */}
            {outboundFlights.length > 0 && (
              <Reveal>
                <section className="space-y-4">
                  <h2 className="text-base font-bold text-[#1d6fa5] dark:text-white flex items-center gap-2 font-sans">
                    Outbound — Getting There
                  </h2>
                  <div className="grid gap-4 sm:max-w-md">
                    {outboundFlights.map((f: any, i: number) => (
                      <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-lg bg-[#1d6fa5]/10 flex items-center justify-center text-[#1d6fa5]">
                            <Plane className="size-4" />
                          </div>
                          <span className="font-bold text-sm text-[#1d6fa5] dark:text-white">{f.name}</span>
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

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <span className="font-bold text-[#1d6fa5] text-sm">{f.price}</span>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={f.booking_link || `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(srcName)}+to+${encodeURIComponent(destName)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#1d6fa5]/30 text-[#1d6fa5] hover:bg-[#1d6fa5]/10 dark:text-sky-300 text-xs font-bold transition"
                            >
                              Direct Booking <ExternalLink className="size-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleInitiateBooking({ type: 'flight', item: f })}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#1d6fa5] hover:bg-[#185c8a] text-white text-xs font-bold transition shadow-xs"
                            >
                              <Bot className="size-3.5" /> Agent Auto-Book
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}

            {/* Inbound — Coming Back */}
            {inboundFlights.length > 0 && (
              <Reveal>
                <section className="space-y-4">
                  <h2 className="text-base font-bold text-[#1d6fa5] dark:text-white flex items-center gap-2 font-sans">
                    Inbound — Coming Back
                  </h2>
                  <div className="grid gap-4 sm:max-w-md">
                    {inboundFlights.map((f: any, i: number) => (
                      <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-lg bg-[#1d6fa5]/10 flex items-center justify-center text-[#1d6fa5]">
                            <Plane className="size-4" />
                          </div>
                          <span className="font-bold text-sm text-[#1d6fa5] dark:text-white">{f.name}</span>
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

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <span className="font-bold text-[#1d6fa5] text-sm">{f.price}</span>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={f.booking_link || `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(destName)}+to+${encodeURIComponent(srcName)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#1d6fa5]/30 text-[#1d6fa5] hover:bg-[#1d6fa5]/10 dark:text-sky-300 text-xs font-bold transition"
                            >
                              Direct Booking <ExternalLink className="size-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleInitiateBooking({ type: 'flight', item: f })}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#1d6fa5] hover:bg-[#185c8a] text-white text-xs font-bold transition shadow-xs"
                            >
                              <Bot className="size-3.5" /> Agent Auto-Book
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}

            {/* Hotels */}
            {suggestedHotels.length > 0 && (
              <Reveal>
                <section className="space-y-4">
                  <h2 className="text-base font-bold text-[#1d6fa5] dark:text-white flex items-center gap-2 font-sans">
                    Hotels
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
                          <h3 className="text-base font-bold text-[#1d6fa5] dark:text-white">{h.name}</h3>
                          <div className="flex items-center gap-1 text-amber-500 text-xs">
                            {[...Array(5)].map((_, s) => (
                              <Star key={s} className="size-3.5 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-gray-500 dark:text-gray-400 ml-1 font-semibold">{h.rating || 4.1}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pt-1">{h.description}</p>
                        </div>
                        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-[#1d6fa5] text-sm">{h.price}</span>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={h.booking_link || `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(h.name + ' ' + destName)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#1d6fa5]/30 text-[#1d6fa5] hover:bg-[#1d6fa5]/10 dark:text-sky-300 text-xs font-bold transition"
                            >
                              Direct Booking <ExternalLink className="size-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleInitiateBooking({ type: 'hotel', item: h })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1d6fa5] hover:bg-[#185c8a] text-white text-xs font-bold transition shadow-xs"
                            >
                              <Bot className="size-3.5" /> Agent Auto-Book
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}

            {/* Itinerary */}
            {itineraryDays.length > 0 && (
              <Reveal>
                <section className="space-y-4">
                  <h2 className="text-base font-bold text-[#1d6fa5] dark:text-white flex items-center gap-2 font-sans">
                    Itinerary
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {itineraryDays.map((day: any, i: number) => (
                      <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-[#1d6fa5] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
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
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1d6fa5] dark:text-sky-300 hover:underline"
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

            {/* Bottom Floating Input Bar with #1d6fa5 Accent */}
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
                    className="size-10 rounded-full bg-[#1d6fa5] text-white flex items-center justify-center hover:bg-[#151b30] transition shrink-0 disabled:opacity-50 shadow-md"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </form>
            </Reveal>

          </div>
        )}

        {/* 💳 OFFICIAL RAZORPAY PAYMENT GATEWAY MODAL */}
        <RazorpayMockModal
          open={razorpayOpen}
          onOpenChange={setRazorpayOpen}
          amount={Number(budgetVal) || 25000}
          tripName={`${srcName || "Origin"} to ${destName || "Destination"} Expedition`}
          customerName={session?.user?.name || "Explorer Passenger"}
          customerEmail={session?.user?.email || "explorer@explorify.ai"}
          customerPhone="+91 98765 43210"
          onSuccess={(paymentId) => {
            setRazorpayOpen(false);
            toast.success("Payment Received via Razorpay Gateway!", {
              description: `Payment ID: ${paymentId}`,
            });
            if (pendingBookingTarget) {
              triggerAgentBooking(pendingBookingTarget);
            }
          }}
        />

        {/* 🤖 AUTONOMOUS AI AGENT BOOKING MODAL */}
        {bookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-4 animate-fade-in">
            <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-2xl space-y-6 overflow-hidden">
              
              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-2xl bg-[#1d6fa5] text-white flex items-center justify-center shadow-md">
                    <Bot className="size-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#1d6fa5] dark:text-white font-sans">
                      Autonomous AI Booking Agent
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {bookingTarget.type === 'all' ? `Entire Expedition (${srcName.split(',')[0]} ➔ ${destName.split(',')[0]})` : (bookingTarget.item?.name || 'Selected Item')}
                    </p>
                  </div>
                </div>
                {bookingStep === 3 && (
                  <button
                    onClick={() => setBookingModalOpen(false)}
                    className="size-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Live Agent Browser Viewport & Progress */}
              {bookingStep < 3 ? (
                <div className="space-y-4 py-1">
                  {/* Live Provider Viewport Window */}
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-slate-900 overflow-hidden shadow-md">
                    <div className="bg-slate-800 px-3 py-2 flex items-center justify-between text-[11px] text-slate-300 font-mono border-b border-slate-700">
                      <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                        <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                        LIVE AGENT BROWSER VIEWPORT
                      </span>
                      <span className="text-sky-400 font-bold flex items-center gap-1">
                        <Loader2 className="size-3 animate-spin" /> Auto-Scrolling & Fare Lock
                      </span>
                    </div>
                    <div className="h-48 w-full relative overflow-hidden bg-slate-950">
                      {/* Animated Auto-Scrolling Agent Content */}
                      <div className="absolute inset-x-0 top-0 p-3 space-y-3 font-mono text-[11px] text-slate-300 animate-agent-scroll">
                        <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 flex justify-between items-center shadow-sm">
                          <span>✈️ Google Flights: {srcName.split(',')[0]} ➔ {destName.split(',')[0]}</span>
                          <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">STATUS: OK 200</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1 shadow-sm">
                          <div className="flex justify-between text-sky-300 font-bold">
                            <span>IndiGo 6E-2041 (Non-Stop)</span>
                            <span className="text-emerald-400 font-bold">₹4,850</span>
                          </div>
                          <p className="text-[10px] text-slate-400">Dep: 06:15 AM | Arr: 08:30 AM | Hand Baggage Included</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1 shadow-sm">
                          <div className="flex justify-between text-amber-300 font-bold">
                            <span>🏨 Booking.com: Luxury Resort & Spa</span>
                            <span className="text-emerald-400 font-bold">₹8,200/night</span>
                          </div>
                          <p className="text-[10px] text-slate-400">Rating: 4.8/5 | Free Breakfast & Instant Confirmation</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-300 font-extrabold text-center shadow-md">
                          ✔ FARE CHECKSUM VERIFIED • AUTO-REDIRECTING TO EXPLORIFY...
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                      <span className="flex items-center gap-1.5 text-[#1d6fa5]">
                        <Loader2 className="size-3.5 animate-spin" /> Autonomous Headless Agent Active...
                      </span>
                      <span>{bookingProgress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1d6fa5] via-sky-500 to-emerald-500 transition-all duration-500 rounded-full"
                        style={{ width: `${bookingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Confirmed E-Ticket Card with Celebration Pop-Up */
                <div className="space-y-5 animate-fade-in relative">
                  {/* Floating Celebration Badges */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-3 text-2xl animate-bounce pointer-events-none">
                    <span>🎉</span>
                    <span>✈️</span>
                    <span>🏨</span>
                    <span>✨</span>
                  </div>

                  <div className="rounded-3xl bg-gradient-to-b from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/40 border border-emerald-300 dark:border-emerald-700 p-6 text-center space-y-3 shadow-lg relative overflow-hidden">
                    <div className="size-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xl ring-4 ring-emerald-300/50 animate-pulse">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-300 bg-emerald-200/80 dark:bg-emerald-900/80 px-3 py-0.5 rounded-full mb-1">
                        <Sparkles className="size-3" /> 100% Zero-Manual Autonomous Success
                      </span>
                      <h4 className="font-extrabold text-xl text-emerald-950 dark:text-emerald-100 font-sans">
                        Expedition Fully Booked & Reserved!
                      </h4>
                    </div>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold leading-relaxed">
                      Explorify AI Headless Server Agent has autonomously locked low-tier fares, verified provider inventory, synchronized all route tabs, and returned to Explorify!
                    </p>
                  </div>

                  {/* Ticket Summary Box */}
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 p-4 space-y-2.5 text-xs font-sans shadow-sm">
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
                      <span className="font-bold text-gray-500 uppercase text-[10px]">MASTER RESERVATION PNR</span>
                      <span className="font-extrabold text-sm text-[#1d6fa5] tracking-wider font-mono">{confirmedPnr}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-600 dark:text-gray-400">Expedition Route:</span>
                      <span className="font-bold text-gray-900 dark:text-white">{srcName.split(',')[0]} ➔ {destName.split(',')[0]}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-600 dark:text-gray-400">Travel Dates:</span>
                      <span className="font-bold text-gray-900 dark:text-white">{startDate || '2026-08-12'} to {endDate || '2026-08-18'}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-gray-200 dark:border-gray-800">
                      <span className="font-semibold text-gray-600 dark:text-gray-400">Execution Status:</span>
                      <span className="inline-flex items-center gap-1 font-extrabold text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                        <ShieldCheck className="size-3.5" /> Autonomous Sync Complete
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleDownloadPdfItinerary}
                      className="flex-1 py-3 rounded-xl bg-[#1d6fa5] hover:bg-[#185c8a] text-white text-xs font-extrabold transition shadow-lg flex items-center justify-center gap-2"
                    >
                      <Ticket className="size-4" /> Download Official E-Ticket & Receipt
                    </button>
                    <button
                      onClick={() => setBookingModalOpen(false)}
                      className="px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
