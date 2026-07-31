"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, ShieldCheck, CheckCircle2, Download, Sparkles, CreditCard, Lock, QrCode, X } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { type Trip } from "@/lib/site-data";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { RazorpayMockModal } from "@/components/booking/RazorpayMockModal";
import { generateExplorifyPdfTicket } from "@/lib/pdf-generator";

interface BookingModalProps {
  trip: Trip | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingModal({ trip, open, onOpenChange }: BookingModalProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [date, setDate] = useState("");
  const [travellers, setTravellers] = useState(2);
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"details" | "processing" | "confirmed">("details");
  const [bookingId, setBookingId] = useState("");
  const [razorpayOpen, setRazorpayOpen] = useState(false);

  if (!trip) return null;

  const basePrice = trip.price;
  const totalPrice = basePrice * travellers;

  const handlePayment = () => {
    if (status !== "authenticated" || !session) {
      toast.error("Sign in required! Please log in to complete your trip booking.");
      onOpenChange(false);
      router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '/trips')}`);
      return;
    }
    // Open Razorpay Mock Modal popup
    setRazorpayOpen(true);
  };

  const handleRazorpaySuccess = (paymentId: string) => {
    setStep("processing");

    setTimeout(async () => {
      const generatedId = `EXP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      setBookingId(generatedId);

      // Save simulated booking in localStorage so it displays on My Bookings page
      const simulatedBooking = {
        bookingId: generatedId,
        tripId: trip.id,
        name: trip.name,
        destination: trip.destination,
        image: trip.image,
        date,
        days: trip.days,
        nights: trip.nights,
        numPeople: travellers,
        price: trip.price,
        totalAmount: totalPrice,
        paymentStatus: "completed",
        paymentId,
        bookingStatus: "confirmed",
        createdAt: new Date().toISOString(),
      };

      const existing = JSON.parse(localStorage.getItem("explorify_bookings") || "[]");
      existing.unshift(simulatedBooking);
      localStorage.setItem("explorify_bookings", JSON.stringify(existing));

      // Dispatch Automated Server Booking & Email Notification
      const targetEmail = session?.user?.email || email || "explorer@explorify.ai";
      const targetName = session?.user?.name || name || "Manasvi Gangrade";

      try {
        await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId,
            tripId: trip.id,
            tripName: trip.name,
            customerName: targetName,
            customerEmail: targetEmail,
            customerPhone: phone || "+91 98765 43210",
            travellers,
            totalAmount: totalPrice,
            date,
            razorpayPaymentId: paymentId,
          }),
        });
        toast.success(`📧 Confirmation email & E-Ticket sent to ${targetEmail}!`);
      } catch (e) {
        console.error("Booking API error:", e);
      }

      setStep("confirmed");
      toast.success("Payment Verified! Booking Confirmed.");
    }, 600);
  };

  const handlePrintPdf = () => {
    if (!trip) return;
    generateExplorifyPdfTicket({
      bookingId,
      tripId: trip.id,
      tripName: trip.name,
      destination: trip.destination,
      state: trip.state,
      days: trip.days,
      nights: trip.nights,
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      date,
      travellers,
      totalAmount: totalPrice,
    });
  };

  const resetModal = () => {
    setStep("details");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6 bg-card border-border shadow-float">
        {step === "details" && (
          <div>
            <DialogHeader className="pb-3 border-b border-border">
              <DialogTitle className="text-xl font-display font-bold text-foreground flex items-center justify-between">
                <span>Book Package</span>
                <span className="text-xs font-sans font-bold bg-[#1d6fa5]/15 text-[#1d6fa5] px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="size-3.5" /> Razorpay Secured
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                {trip.name} • {trip.destination}, {trip.state}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-sm">
              {/* Departure & Traveler Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Departure Date</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#1d6fa5]" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#1d6fa5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Travelers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#1d6fa5]" />
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={travellers}
                      onChange={(e) => setTravellers(Number(e.target.value))}
                      className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#1d6fa5]"
                    />
                  </div>
                </div>
              </div>

              {/* Traveler Information Form */}
              <div className="space-y-2 bg-surface/50 p-3 rounded-xl border border-border">
                <p className="text-xs font-bold text-foreground">Lead Passenger Details</p>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#1d6fa5]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#1d6fa5]"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#1d6fa5]"
                  />
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="bg-accent/40 rounded-xl p-3.5 space-y-1.5 border border-[#1d6fa5]/20">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Base Price ({travellers} Traveler{travellers > 1 ? "s" : ""})</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                  <span>Verified Operator Discount</span>
                  <span>- {formatPrice(0)}</span>
                </div>
                <div className="border-t border-border pt-1.5 flex justify-between font-bold text-base text-foreground">
                  <span>Total Amount Payable</span>
                  <span className="text-[#1d6fa5]">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-[#1d6fa5] to-[#257ba6] hover:from-[#185c8a] hover:to-[#1d6fa5] text-white font-extrabold py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <CreditCard className="size-4" /> Pay {formatPrice(totalPrice)} with Razorpay
            </Button>
          </div>
        )}

        {step === "processing" && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="size-14 rounded-full border-4 border-[#1d6fa5] border-t-transparent animate-spin" />
            <div>
              <h3 className="font-bold text-lg text-foreground">Processing Secure Payment</h3>
              <p className="text-xs text-muted-foreground mt-1">Connecting with Razorpay Gateway Sandbox…</p>
            </div>
          </div>
        )}

        {step === "confirmed" && (
          <div className="py-4 space-y-5 text-center">
            <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="size-8" />
            </div>

            <div>
              <h3 className="font-display font-bold text-2xl text-foreground">Booking Confirmed!</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Your e-ticket ID <strong className="text-[#1d6fa5]">{bookingId}</strong> is ready.
              </p>
            </div>

            <div className="bg-surface p-4 rounded-xl border border-border text-left space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Trip:</span><span className="font-bold">{trip.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date:</span><span className="font-bold">{date}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Passenger:</span><span className="font-bold">{name} ({travellers} Guests)</span></div>
              <div className="flex justify-between border-t border-border pt-1.5 font-bold text-sm"><span>Paid:</span><span className="text-[#1d6fa5]">{formatPrice(totalPrice)}</span></div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handlePrintPdf}
                className="flex-1 bg-[#1d6fa5] hover:bg-[#185c8a] text-white font-bold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="size-4" /> Download Official PDF Ticket
              </Button>
              <Button
                variant="outline"
                onClick={resetModal}
                className="rounded-xl py-2.5 text-xs font-bold"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Razorpay Mock Payment Popup Modal */}
      <RazorpayMockModal
        open={razorpayOpen}
        onOpenChange={setRazorpayOpen}
        amount={totalPrice}
        tripName={trip.name}
        customerName={name}
        customerEmail={email}
        customerPhone={phone}
        onSuccess={handleRazorpaySuccess}
      />
    </Dialog>
  );
}
