"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Clock,
  Shield,
  ArrowLeft,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Info,
  Backpack,
  Ban,
  AlertTriangle,
  Navigation,
  Globe,
  Star,
  Users,
  Utensils,
  Sparkles,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { DynamoDBPlan, DynamoDBDeparture } from "@/lib/dynamodb";
import { getPublicUrl } from "@/lib/s3";
import { getTrip, type Trip, formatINR } from "@/lib/site-data";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

function resolveImageUrl(img: any): string {
  if (!img) return "/placeholder-trip.jpg";
  if (typeof img === "object" && (img.src || (img as any).default)) {
    return img.src || (img as any).default;
  }
  if (typeof img === "string") {
    if (
      img.startsWith("http://") ||
      img.startsWith("https://") ||
      img.startsWith("/") ||
      img.startsWith("data:")
    ) {
      return img;
    }
    return getPublicUrl(img);
  }
  return "/placeholder-trip.jpg";
}

interface DepartureWithAvailability extends DynamoDBDeparture {
  availableSeats: number;
  priceOverride?: number;
}

function mapStaticTripToPlan(trip: Trip): DynamoDBPlan {
  const allImages = [trip.image, ...(trip.gallery || [])].filter(Boolean);
  return {
    planId: trip.id,
    vendorId: "explorify-official",
    name: trip.name,
    images: allImages as any,
    description: trip.blurb,
    fullDescription: trip.overview,
    price: trip.price,
    maxParticipants: trip.groupSize,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    duration: { value: trip.days, unit: "days" },
    startingPoint: trip.origin,
    endingPoint: trip.destination,
    meetingPoint: trip.meetingPoint,
    stops: (trip.itinerary || []).map((item) => ({
      order: item.day,
      name: item.title,
      description: item.description,
      activities: [item.place],
    })),
    highlights: trip.highlights || [],
    included: trip.inclusions || [],
    excluded: trip.exclusions || [],
    categories: [trip.region, trip.type],
    interests: trip.tags || [],
  };
}

function generateStaticDepartures(planId: string, price: number): DepartureWithAvailability[] {
  const deps: DepartureWithAvailability[] = [];
  const today = new Date();
  for (let i = 2; i <= 30; i += 4) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    deps.push({
      departureId: `dep-${planId}-${i}`,
      planId: planId,
      departureDate: dateStr,
      pickupLocation: "Central City Pickup / Railway Station",
      pickupTime: "07:30 AM",
      totalCapacity: 14,
      bookedSeats: 4,
      availableSeats: 10,
      priceOverride: price,
      status: "scheduled",
      isActive: true,
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
    });
  }
  return deps;
}

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.planId as string;
  const { data: session, status } = useSession();

  const [plan, setPlan] = useState<DynamoDBPlan | null>(null);
  const [departures, setDepartures] = useState<DepartureWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [travellerCount, setTravellerCount] = useState(2);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  useEffect(() => {
    const fetchData = async () => {
      let fetchedPlan: DynamoDBPlan | null = null;
      try {
        const planRes = await fetch(`/api/plans/${planId}`);
        if (planRes.ok) {
          const planData = await planRes.json();
          if (planData.plan) {
            fetchedPlan = planData.plan;
            setPlan(fetchedPlan);
          }
        }
      } catch (error) {
        console.error("Error fetching plan API:", error);
      }

      if (!fetchedPlan) {
        const staticTrip = getTrip(planId);
        if (staticTrip) {
          fetchedPlan = mapStaticTripToPlan(staticTrip);
          setPlan(fetchedPlan);
          setDepartures(generateStaticDepartures(planId, staticTrip.price));
        }
      }

      if (fetchedPlan && fetchedPlan.vendorId !== "explorify-official") {
        try {
          const deptRes = await fetch(`/api/departures?planId=${planId}`);
          if (deptRes.ok) {
            const deptData = await deptRes.json();
            if (deptData.departures && deptData.departures.length > 0) {
              setDepartures(deptData.departures);
            }
          }
        } catch (error) {
          console.error("Error fetching departures:", error);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [planId]);

  // Auto-rotate gallery images every 3.5 seconds
  useEffect(() => {
    if (!plan || !plan.images || plan.images.length <= 1) return;
    const imagesList = plan.images;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % imagesList.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [plan]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background">
        <div className="size-10 border-3 border-azure border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Curating tour details & departures...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background text-center px-4">
        <AlertCircle className="size-12 text-destructive mb-3 opacity-60" />
        <h2 className="text-2xl font-bold text-foreground">Trip Not Found</h2>
        <p className="text-muted-foreground text-sm mt-1 mb-6">The requested expedition plan does not exist or has expired.</p>
        <Button asChild className="bg-azure hover:bg-azure/90">
          <Link href="/search">Browse All Destinations</Link>
        </Button>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleProceedToBooking = () => {
    if (status !== "authenticated" || !session) {
      toast.error("Sign in required! Please log in to book your trip.");
      router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(`/checkout/${planId}?travellers=${travellerCount}&date=${selectedDate || ""}`)}`);
      return;
    }

    router.push(`/checkout/${planId}?travellers=${travellerCount}&date=${selectedDate || ""}`);
  };

  // Group departures by date
  const departuresByDate = departures.reduce(
    (acc, dep) => {
      const dateKey = dep.departureDate.split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(dep);
      return acc;
    },
    {} as Record<string, DepartureWithAvailability[]>,
  );

  const selectedDateDepartures = selectedDate ? departuresByDate[selectedDate] || [] : [];

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const hasDeparture = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return departuresByDate[dateStr] && departuresByDate[dateStr].length > 0;
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (hasDeparture(day)) {
      setSelectedDate(dateStr);
    }
  };

  const imagesList = plan.images && plan.images.length > 0 ? plan.images : ["/placeholder-trip.jpg"];

  return (
    <div className="bg-background text-foreground min-h-screen pb-20">
      {/* Top Breadcrumb Header Bar */}
      <div className="border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Link href="/search" className="flex items-center gap-1.5 text-xs font-semibold">
              <ArrowLeft className="size-4" /> Back to Destinations
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:inline-flex border-azure/40 text-azure font-medium text-xs">
              <Shield className="size-3.5 mr-1" /> Explorify Verified Tour
            </Badge>
            <Button size="sm" className="bg-azure hover:bg-azure/90 font-semibold" onClick={handleProceedToBooking}>
              Book Now · {formatINR(plan.price * travellerCount)}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Title Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className="bg-azure/10 text-azure hover:bg-azure/20 border-0 font-semibold">
              ⭐ 4.9/5 (128 Explorer Reviews)
            </Badge>
            {plan.categories?.map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            {plan.name}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <MapPin className="size-4 text-azure" />
              {plan.startingPoint && plan.endingPoint
                ? `${plan.startingPoint} → ${plan.endingPoint}`
                : plan.startingPoint || plan.endingPoint || "Pan India Expedition"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-amber-500" />
              {plan.duration.value} Days / {Math.max(1, plan.duration.value - 1)} Nights
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Sparkles className="size-4" /> Instant Confirmation & Free Cancellation
            </span>
          </div>
        </div>

        {/* Gallery Mosaic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10 rounded-3xl overflow-hidden shadow-xl border border-border/50 bg-card">
          <div className="md:col-span-2 relative h-[360px] sm:h-[460px] group overflow-hidden">
            <img
              src={resolveImageUrl(imagesList[activeImageIndex])}
              alt={plan.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-xs uppercase tracking-widest font-semibold opacity-90">Featured View</p>
              <h3 className="font-display text-xl font-bold">{plan.name}</h3>
            </div>
          </div>

          {/* Thumbnail column */}
          <div className="grid grid-cols-4 md:grid-cols-1 gap-2.5 p-3 bg-muted/20">
            {imagesList.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-[90px] sm:h-[105px] rounded-2xl overflow-hidden border-2 transition-all ${
                  activeImageIndex === idx
                    ? "border-azure ring-2 ring-azure/40 shadow-lg scale-[1.03]"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={resolveImageUrl(img)}
                  alt={`Gallery photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 bg-card border border-border/60 rounded-2xl p-4 sm:p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-azure/10 text-azure flex items-center justify-center shrink-0">
              <Clock className="size-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase">Duration</div>
              <div className="font-bold text-foreground">{plan.duration.value} Days Journey</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="size-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase">Group Size</div>
              <div className="font-bold text-foreground">Max {plan.maxParticipants || 14} Explorers</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Utensils className="size-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase">Meals & Stay</div>
              <div className="font-bold text-foreground">Breakfast & Resort Included</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Shield className="size-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase">Safety</div>
              <div className="font-bold text-foreground">Verified Tour Leader</div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Left Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview Section */}
            <section className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-soft">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="size-6 text-azure" /> Expedition Overview
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
                {plan.fullDescription || plan.description}
              </p>
            </section>

            {/* Highlights Box */}
            {plan.highlights && plan.highlights.length > 0 && (
              <section className="bg-linear-to-br from-azure/5 via-card to-background border border-azure/20 rounded-3xl p-6 sm:p-8 shadow-soft">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Star className="size-6 text-amber-500 fill-amber-500" /> Key Highlights & Experiences
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {plan.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 bg-background/80 border border-border/40 rounded-xl p-3.5">
                      <div className="size-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        ✓
                      </div>
                      <span className="text-sm font-medium text-foreground">{h}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Day-by-Day Itinerary Timeline */}
            {plan.stops && plan.stops.length > 0 && (
              <section className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-soft">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Navigation className="size-6 text-azure" /> Day-by-Day Detailed Itinerary
                </h2>

                <div className="space-y-4">
                  {plan.stops
                    .sort((a, b) => a.order - b.order)
                    .map((stop) => {
                      const isOpen = expandedDay === stop.order;
                      return (
                        <div
                          key={stop.order}
                          className="border border-border/60 rounded-2xl overflow-hidden transition-all bg-background"
                        >
                          <button
                            onClick={() => setExpandedDay(isOpen ? null : stop.order)}
                            className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="size-9 rounded-xl bg-azure text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                                D{stop.order}
                              </span>
                              <div>
                                <h3 className="font-bold text-base text-foreground">{stop.name}</h3>
                                <p className="text-xs text-muted-foreground">{stop.activities.join(" · ")}</p>
                              </div>
                            </div>
                            {isOpen ? <ChevronUp className="size-5 text-muted-foreground" /> : <ChevronDown className="size-5 text-muted-foreground" />}
                          </button>

                          {isOpen && (
                            <div className="px-5 pb-5 pt-1 text-sm text-muted-foreground border-t border-border/40 bg-muted/10 space-y-3">
                              {stop.description && <p className="leading-relaxed">{stop.description}</p>}
                              {stop.activities.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {stop.activities.map((act, i) => (
                                    <Badge key={i} variant="outline" className="bg-card text-xs">
                                      📍 {act}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </section>
            )}

            {/* Inclusions & Exclusions */}
            {((plan.included && plan.included.length > 0) || (plan.excluded && plan.excluded.length > 0)) && (
              <section className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-soft">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">What&apos;s Included in Your Package</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Included */}
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                    <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                      <Check className="size-5" /> Included Services
                    </h3>
                    <ul className="space-y-2.5">
                      {plan.included.map((item, idx) => (
                        <li key={idx} className="text-sm font-medium text-foreground flex items-start gap-2.5">
                          <span className="size-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            ✓
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Excluded */}
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                    <h3 className="font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                      <X className="size-5" /> Exclusions
                    </h3>
                    <ul className="space-y-2.5">
                      {plan.excluded.map((item, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2.5">
                          <span className="size-4 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            ✕
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sticky Right Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border/80 rounded-3xl p-6 shadow-xl space-y-6">
              {/* Pricing Header */}
              <div className="border-b border-border/40 pb-5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Starting From</span>
                    <div className="text-3xl font-extrabold text-azure">{formatINR(plan.price)}</div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    SAVE ₹4,000 TODAY
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per person (taxes included) · Instant Razorpay Receipt</p>
              </div>

              {/* Travellers Selector */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Select Travellers</label>
                <div className="flex items-center justify-between bg-muted/30 border border-border/60 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-azure" />
                    <span className="text-sm font-semibold text-foreground">{travellerCount} Traveller(s)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setTravellerCount(Math.max(1, travellerCount - 1))}
                      className="size-8 rounded-lg border border-border bg-card hover:bg-muted font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-sm">{travellerCount}</span>
                    <button
                      onClick={() => setTravellerCount(Math.min(10, travellerCount + 1))}
                      className="size-8 rounded-lg border border-border bg-card hover:bg-muted font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Departures */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Available Departure Dates</label>

                {departures.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-xl">
                    No scheduled departures currently available.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="hover:text-foreground">
                        ‹ Prev
                      </button>
                      <span>
                        {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </span>
                      <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="hover:text-foreground">
                        Next ›
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
                        <span key={idx} className="font-bold opacity-40 py-1">
                          {d}
                        </span>
                      ))}
                      {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const hasDep = hasDeparture(day);
                        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const isSelected = selectedDate === dateStr;

                        return (
                          <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            disabled={!hasDep}
                            className={`aspect-square rounded-lg text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-azure text-white font-bold scale-105 shadow-sm"
                                : hasDep
                                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/30"
                                : "opacity-30 cursor-not-allowed"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Total Calculation */}
              <div className="bg-muted/20 border border-border/40 rounded-2xl p-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Base Price ({travellerCount}x)</span>
                  <span>{formatINR(plan.price * travellerCount)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Explorify Booking Guarantee</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="border-t border-border/40 pt-2 flex justify-between font-extrabold text-base text-foreground">
                  <span>Total Amount</span>
                  <span className="text-azure">{formatINR(plan.price * travellerCount)}</span>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                size="lg"
                className="w-full bg-azure hover:bg-azure/90 text-white font-bold text-base py-6 rounded-2xl shadow-lg shadow-azure/20"
                onClick={handleProceedToBooking}
              >
                Proceed to Secure Checkout
              </Button>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="size-3.5 text-emerald-500" /> 256-bit Encrypted SSL Payment
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="size-3.5 text-azure" /> Automatic E-Ticket PDF Email Delivery
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
