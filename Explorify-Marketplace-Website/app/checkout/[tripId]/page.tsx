"use client";

import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Check, Lock, ShieldCheck } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { formatINR, getTrip, mapPlanToTrip, type Trip } from "@/lib/site-data";
import { toast } from "sonner";
import { RazorpayMockModal } from "@/components/booking/RazorpayMockModal";
import { generateExplorifyPdfTicket } from "@/lib/pdf-generator";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const steps = ["Trip & date", "Traveller details", "Payment", "Confirmation"];

interface Departure {
  departureId: string;
  departureDate: string;
  availableSeats: number;
}

export default function CheckoutPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Sign in required! Please log in to complete your checkout.");
      router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(`/checkout/${tripId}`)}`);
    }
  }, [status, router, tripId]);

  const queryTravellers = Number(searchParams.get("travellers")) || 2;
  const queryDate = searchParams.get("date") || "";

  const [step, setStep] = useState(0);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [selectedDepartureId, setSelectedDepartureId] = useState("");
  const [travellersCount, setTravellersCount] = useState(queryTravellers);
  const [departureDate, setDepartureDate] = useState(queryDate);

  // Form Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Payment State
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [razorpayOpen, setRazorpayOpen] = useState(false);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Sync session details when loaded
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  // Load trip and departures
  useEffect(() => {
    if (!tripId) return;

    async function loadData() {
      try {
        setLoadingTrip(true);
        // Try fetching database plan details
        const res = await fetch(`/api/plans/${tripId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.plan) {
            setTrip(mapPlanToTrip(json.plan));
          }
        }
      } catch (e) {
        console.error("Error loading database plan:", e);
      } finally {
        setLoadingTrip(false);
      }

      // Load departures
      try {
        const depRes = await fetch(`/api/departures?planId=${tripId}`);
        if (depRes.ok) {
          const json = await depRes.json();
          setDepartures(json.departures || []);
          if (json.departures && json.departures.length > 0) {
            setSelectedDepartureId(json.departures[0].departureId);
            setDepartureDate(json.departures[0].departureDate);
          }
        }
      } catch (e) {
        console.error("Error loading departures:", e);
      }
    }

    loadData();
  }, [tripId]);

  // Fallback to local static trip database if database plan is not found
  const activeTrip = useMemo(() => {
    if (trip) return trip;
    return getTrip(tripId);
  }, [trip, tripId]);

  if (loadingTrip) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Loading checkout details...</p>
      </div>
    );
  }

  if (!activeTrip) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-display">Trip not found</h1>
        <p className="text-sm text-muted-foreground mt-2">The selected package is no longer available.</p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/trips">Browse trips</Link>
        </Button>
      </div>
    );
  }

  const base = activeTrip.price * travellersCount;
  const gst = Math.round(base * 0.05);
  const totalAmount = base + gst;

  const handleRazorpaySuccess = (paymentId: string) => {
    setIsProcessingPayment(true);
    setTimeout(async () => {
      const simulatedBooking = {
        bookingId: `EXP-${Date.now()}`,
        tripId: activeTrip.id,
        name: activeTrip.name,
        destination: activeTrip.destination,
        image: activeTrip.image,
        date: departureDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        days: activeTrip.days,
        nights: activeTrip.nights,
        numPeople: travellersCount,
        price: activeTrip.price,
        totalAmount,
        paymentStatus: "completed",
        paymentId,
        bookingStatus: "confirmed",
        createdAt: new Date().toISOString(),
      };

      const existing = JSON.parse(localStorage.getItem("explorify_bookings") || "[]");
      existing.unshift(simulatedBooking);
      localStorage.setItem("explorify_bookings", JSON.stringify(existing));

      // Automated Server Booking Persistence & Email Notification Dispatch
      const targetEmail = session?.user?.email || email || "explorer@explorify.ai";
      const targetName = session?.user?.name || name || "Manasvi Gangrade";

      try {
        await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: simulatedBooking.bookingId,
            tripId: activeTrip.id,
            tripName: activeTrip.name,
            customerName: targetName,
            customerEmail: targetEmail,
            customerPhone: phone || "+91 98765 43210",
            travellers: travellersCount,
            totalAmount,
            date: simulatedBooking.date,
            razorpayPaymentId: paymentId,
          }),
        });
        toast.success(`📧 Confirmation email & E-Ticket sent to ${targetEmail}!`);
      } catch (e) {
        console.error("Server booking creation error:", e);
      }

      setIsProcessingPayment(false);
      setStep(3); // Jump to confirmation
      toast.success("Payment verified! Booking confirmed.");
    }, 500);
  };

  const handlePrintPdf = () => {
    generateExplorifyPdfTicket({
      bookingId: `EXP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      tripId: activeTrip.id,
      tripName: activeTrip.name,
      destination: activeTrip.destination,
      state: activeTrip.state,
      days: activeTrip.days,
      nights: activeTrip.nights,
      customerName: name || "Manasvi Gangrade",
      customerPhone: phone || "+91 98765 43210",
      customerEmail: email || "explorer@explorify.ai",
      date: departureDate || "2026-09-15",
      travellers: travellersCount,
      totalAmount,
    });
  };

  // Handle Payment initiation
  const handlePayment = async () => {
    if (!name || !email || !phone) {
      toast.error("Please fill in all traveller details first.");
      setStep(1);
      return;
    }

    // Try real Razorpay order if departure and session exist, otherwise open Razorpay Mock Modal
    if (selectedDepartureId && session?.user?.id && typeof window !== "undefined" && window.Razorpay) {
      setIsProcessingPayment(true);
      try {
        // 1. Create booking in our database
        const bookingRes = await fetch("/api/bookings/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: tripId,
            departureId: selectedDepartureId,
            numPeople: travellersCount,
          }),
        });

        if (!bookingRes.ok) {
          const errorData = await bookingRes.json();
          throw new Error(errorData.error || "Failed to initiate booking");
        }

        const { bookingId } = await bookingRes.json();

        // 2. Create Razorpay order on server
        const orderRes = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });

        if (!orderRes.ok) {
          throw new Error("Failed to generate payment order");
        }

        const orderData = await orderRes.json();

        // 3. Open Razorpay Widget
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Explorify Trips",
          description: activeTrip.name,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              // Verify payment on the server
              const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  bookingId,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (verifyRes.ok) {
                setStep(3);
                toast.success("Payment verified and booking confirmed!");
              } else {
                toast.error("Payment verification failed. Please contact support.");
              }
            } catch (e) {
              console.error("Verification failed", e);
              toast.error("An error occurred during verification.");
            }
          },
          prefill: {
            name,
            email,
            contact: phone,
          },
          theme: {
            color: "#1d6fa5",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          toast.error(`Payment failed: ${response.error.description}`);
        });
        rzp.open();
      } catch (error: any) {
        console.warn("Real Razorpay unavailable, falling back to Interactive Razorpay Sandbox Modal:", error);
        setRazorpayOpen(true);
      } finally {
        setIsProcessingPayment(false);
      }
    } else {
      // Open interactive Razorpay Sandbox Modal
      setRazorpayOpen(true);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 bg-background">
      <h1 className="font-display text-3xl sm:text-4xl text-foreground">Book {activeTrip.name}</h1>

      <ol className="mt-8 grid grid-cols-4 gap-2">
        {steps.map((s, i) => (
          <li key={s} className="min-w-0">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-[#1d6fa5]" : "bg-muted"}`} />
            <p className={`mt-2 truncate text-xs ${i <= step ? "font-semibold text-primary" : "text-muted-foreground"}`}>{s}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold">Trip &amp; date</h2>
              <p className="text-sm text-muted-foreground">
                {activeTrip.origin} → {activeTrip.destination} · {activeTrip.days}D/{activeTrip.nights}N
              </p>

              {departures.length > 0 ? (
                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="c-dep">Select Departure Date</label>
                  <select
                    id="c-dep"
                    value={selectedDepartureId}
                    onChange={(e) => {
                      setSelectedDepartureId(e.target.value);
                      const chosen = departures.find(d => d.departureId === e.target.value);
                      if (chosen) setDepartureDate(chosen.departureDate);
                    }}
                    className="h-11 w-full rounded-xl bg-surface border border-border px-3 text-sm outline-none"
                  >
                    {departures.map((d) => (
                      <option key={d.departureId} value={d.departureId}>
                        {new Date(d.departureDate).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })} ({d.availableSeats} seats left)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="c-date">Departure date</label>
                  <input
                    id="c-date"
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="h-11 w-full rounded-xl bg-surface border border-border px-3 text-sm outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Running in flexible departure mode (Custom dates permitted).
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2" htmlFor="c-trav">Travellers</label>
                <input
                  id="c-trav"
                  type="number"
                  min={1}
                  max={activeTrip.groupSize || 10}
                  value={travellersCount}
                  onChange={(e) => setTravellersCount(Number(e.target.value))}
                  className="h-11 w-full rounded-xl bg-surface border border-border px-3 text-sm outline-none"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Traveller details</h2>
              <div>
                <label className="block text-sm font-semibold mb-1.5" htmlFor="c-name">Full name</label>
                <input
                  id="c-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Manasvi Sharma"
                  className="h-11 w-full rounded-xl bg-surface border border-border px-4 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" htmlFor="c-email">Email address</label>
                <input
                  id="c-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-xl bg-surface border border-border px-4 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" htmlFor="c-phone">Phone number</label>
                <input
                  id="c-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="h-11 w-full rounded-xl bg-surface border border-border px-4 text-sm outline-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Payment</h2>
              <p className="text-sm text-muted-foreground">
                You'll be redirected to Razorpay's secure checkout to pay {formatINR(totalAmount)}.
              </p>
              <ul className="flex flex-wrap gap-2 text-xs font-semibold">
                {["Razorpay", "UPI", "Cards", "Net Banking"].map((m) => (
                  <li key={m} className="rounded-md border border-border px-2.5 py-1.5 bg-surface text-foreground">{m}</li>
                ))}
              </ul>
              <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="size-3.5 text-azure" /> 256-bit SSL · PCI-DSS compliant
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center py-6">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent text-azure">
                <Check className="size-7" />
              </span>
              <h2 className="text-2xl font-display text-foreground">Booking confirmed!</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Your payment of {formatINR(totalAmount)} was processed. Your travel voucher has been generated.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <Button variant="outline" onClick={handlePrintPdf}>Download voucher (PDF)</Button>
                <Button variant="outline" onClick={() => toast.success("Added departure date to calendar!")}>Add to calendar</Button>
                <Button asChild variant="hero">
                  <Link href="/bookings">View my bookings</Link>
                </Button>
              </div>
            </div>
          )}

          {step < 3 && (
            <div className="mt-8 flex justify-between gap-3 border-t border-border pt-6">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
              <Button
                variant="hero"
                onClick={() => {
                  if (step === 2) {
                    handlePayment();
                  } else {
                    setStep((s) => s + 1);
                  }
                }}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment
                  ? "Processing..."
                  : step === 2
                  ? `Pay ${formatINR(totalAmount)}`
                  : "Continue"}
              </Button>
            </div>
          )}
        </div>

        <aside>
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <img
              src={activeTrip.image}
              alt={activeTrip.destination}
              className="h-32 w-full rounded-xl object-cover"
            />
            <h2 className="mt-4 font-display text-lg text-foreground">{activeTrip.name}</h2>
            <dl className="mt-4 space-y-2 text-sm text-foreground">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Base ({travellersCount}×)</dt>
                <dd>{formatINR(base)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GST (5%)</dt>
                <dd>{formatINR(gst)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-display text-lg mt-2">
                <dt>Total</dt>
                <dd className="text-primary">{formatINR(totalAmount)}</dd>
              </div>
            </dl>
            <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-azure" /> Verified by ExplorifyTrips
            </p>
          </div>
        </aside>
      </div>

      {/* Razorpay Interactive Test Payment Popup Modal */}
      <RazorpayMockModal
        open={razorpayOpen}
        onOpenChange={setRazorpayOpen}
        amount={totalAmount}
        tripName={activeTrip.name}
        customerName={name}
        customerEmail={email}
        customerPhone={phone}
        onSuccess={handleRazorpaySuccess}
      />
    </div>
  );
}
