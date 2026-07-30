import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Lock, ShieldCheck } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { formatINR, getTrip, mapPlanToTrip } from "@/lib/site-data";

type Search = { travellers?: number; date?: string };

export const Route = createFileRoute("/checkout/$tripId")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    travellers: Number(s.travellers) || 2,
    date: typeof s.date === "string" ? s.date : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Secure Checkout | ExplorifyTrips" },
      { name: "description", content: "Complete your India trip booking with secure Razorpay payment." },
      { property: "og:title", content: "Secure Checkout | ExplorifyTrips" },
      { property: "og:description", content: "Trip selection, traveller details and secure Razorpay payment." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const steps = ["Trip & date", "Traveller details", "Payment", "Confirmation"];

function Checkout() {
  const { tripId } = Route.useParams();
  const search = Route.useSearch();
  const [step, setStep] = useState(0);

  const { data: dbPlan, isLoading } = useQuery({
    queryKey: ["plan", tripId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/plans/${tripId}`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        return json.plan;
      } catch {
        return null;
      }
    },
  });

  const trip = useMemo(() => {
    if (dbPlan) return mapPlanToTrip(dbPlan);
    return getTrip(tripId);
  }, [dbPlan, tripId]);

  if (isLoading && !getTrip(tripId)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Loading checkout details...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl">Trip not found</h1>
        <Button asChild className="mt-6"><Link to="/trips">Browse trips</Link></Button>
      </div>
    );
  }

  const travellers = search.travellers ?? 2;
  const base = trip.price * travellers;
  const gst = Math.round(base * 0.05);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl sm:text-4xl">Book {trip.name}</h1>

      <ol className="mt-8 grid grid-cols-4 gap-2">
        {steps.map((s, i) => (
          <li key={s} className="min-w-0">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-gradient-azure" : "bg-muted"}`} />
            <p className={`mt-2 truncate text-xs ${i <= step ? "font-semibold text-primary" : "text-muted-foreground"}`}>{s}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl">Trip &amp; date</h2>
              <p className="text-sm text-muted-foreground">{trip.origin} → {trip.destination} · {trip.days}D/{trip.nights}N</p>
              <label className="block text-sm font-semibold" htmlFor="c-date">Departure date</label>
              <input id="c-date" type="date" defaultValue={search.date} className="h-11 w-full rounded-xl bg-surface px-3 text-sm" />
              <label className="block text-sm font-semibold" htmlFor="c-trav">Travellers</label>
              <input id="c-trav" type="number" min={1} defaultValue={travellers} className="h-11 w-full rounded-xl bg-surface px-3 text-sm" />
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl">Traveller details</h2>
              {["Full name", "Email address", "Phone number"].map((l) => (
                <div key={l}>
                  <label className="block text-sm font-semibold" htmlFor={l}>{l}</label>
                  <input id={l} className="mt-1.5 h-11 w-full rounded-xl bg-surface px-3 text-sm" />
                </div>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl">Payment</h2>
              <p className="text-sm text-muted-foreground">You'll be redirected to Razorpay's secure checkout to pay {formatINR(base + gst)}.</p>
              <ul className="flex flex-wrap gap-2 text-xs font-semibold">
                {["Razorpay", "UPI", "Cards", "Net Banking"].map((m) => (
                  <li key={m} className="rounded-md border border-border px-2.5 py-1.5">{m}</li>
                ))}
              </ul>
              <p className="inline-flex items-center gap-2 text-xs text-muted-foreground"><Lock className="size-3.5 text-azure" /> 256-bit SSL · PCI-DSS compliant</p>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent text-azure"><Check className="size-7" /></span>
              <h2 className="text-2xl">Booking confirmed</h2>
              <p className="text-sm text-muted-foreground">Your voucher is on its way to your inbox.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline">Download voucher (PDF)</Button>
                <Button variant="outline">Add to calendar</Button>
                <Button asChild variant="hero"><Link to="/bookings">View my bookings</Link></Button>
              </div>
            </div>
          )}

          {step < 3 && (
            <div className="mt-8 flex justify-between gap-3">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep((s: number) => s - 1)}>Back</Button>
              <Button variant="hero" onClick={() => setStep((s: number) => s + 1)}>
                {step === 2 ? "Pay with Razorpay" : "Continue"}
              </Button>
            </div>
          )}
        </div>

        <aside>
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <img src={trip.image} alt={trip.destination} width={1200} height={900} loading="lazy" className="h-32 w-full rounded-xl object-cover" />
            <h2 className="mt-4 font-display text-lg">{trip.name}</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Base ({travellers}×)</dt><dd>{formatINR(base)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">GST (5%)</dt><dd>{formatINR(gst)}</dd></div>
              <div className="flex justify-between border-t border-border pt-2 font-display text-lg"><dt>Total</dt><dd className="text-primary">{formatINR(base + gst)}</dd></div>
            </dl>
            <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-azure" /> Verified by ExplorifyTrips</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
