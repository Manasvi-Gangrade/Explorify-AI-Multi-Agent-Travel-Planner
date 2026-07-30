import { createFileRoute, Link } from "@tanstack/react-router";
import { SlidersHorizontal, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Reveal, SectionHeading } from "@/components/motion";
import { TripCard, TripCardSkeleton } from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { trips, mapPlanToTrip, type Region, type TripType } from "@/lib/site-data";

type Search = { q?: string; region?: string };

export const Route = createFileRoute("/trips/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    region: typeof s.region === "string" && s.region ? s.region : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse India Tour Packages | ExplorifyTrips" },
      {
        name: "description",
        content:
          "Filter handpicked Indian trips by region, trip type, duration and budget — Kashmir, Rajasthan, Kerala, Ladakh, Goa, Meghalaya and more.",
      },
      { property: "og:title", content: "Browse India Tour Packages" },
      {
        property: "og:description",
        content: "Handpicked Indian journeys with verified local operators.",
      },
      { property: "og:url", content: "/trips" },
    ],
    links: [{ rel: "canonical", href: "/trips" }],
  }),
  component: BrowseTrips,
});

const regions: Region[] = [
  "North India",
  "South India",
  "East India",
  "West India",
  "Northeast India",
];
const types: TripType[] = [
  "Adventure",
  "Spiritual",
  "Beach",
  "Heritage",
  "Hill Station",
];

function BrowseTrips() {
  const search = Route.useSearch();
  const [selRegions, setSelRegions] = useState<string[]>(
    search.region ? [search.region] : [],
  );
  const [selTypes, setSelTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState([40000]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [sort, setSort] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  const { data: dbPlans } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/plans");
        if (!res.ok) throw new Error();
        const json = await res.json();
        return json.plans || [];
      } catch (e) {
        console.error("Failed to load plans from DynamoDB, using fallback", e);
        return [];
      }
    },
  });

  const allTrips = useMemo(() => {
    const dbTrips = (dbPlans || []).map(mapPlanToTrip);
    const dbIds = new Set(dbTrips.map((t: any) => t.id));
    const cleanMockTrips = trips.filter((t: any) => !dbIds.has(t.id));
    return [...dbTrips, ...cleanMockTrips];
  }, [dbPlans]);

  const results = useMemo(() => {
    const q = (search.q ?? "").toLowerCase();
    const list = allTrips.filter((t) => {
      const matchesQ =
        !q ||
        `${t.name} ${t.destination} ${t.state} ${t.region}`.toLowerCase().includes(q);
      const matchesRegion = !selRegions.length || selRegions.includes(t.region);
      const matchesType = !selTypes.length || selTypes.includes(t.type);
      const matchesBudget = t.price <= budget[0];
      const matchesCancel = !freeOnly || t.freeCancellation;
      return matchesQ && matchesRegion && matchesType && matchesBudget && matchesCancel;
    });
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    if (sort === "duration") sorted.sort((a, b) => a.days - b.days);
    if (sort === "popular") sorted.sort((a, b) => b.reviews - a.reviews);
    return sorted;
  }, [search.q, allTrips, selRegions, selTypes, budget, freeOnly, sort]);

  const toggle = (
    value: string,
    list: string[],
    set: (v: string[]) => void,
  ) => set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const filters = (
    <div className="space-y-8">
      <fieldset>
        <legend className="text-sm font-semibold">Region</legend>
        <div className="mt-3 space-y-2.5">
          {regions.map((r) => (
            <div key={r} className="flex items-center gap-2.5">
              <Checkbox
                id={`r-${r}`}
                checked={selRegions.includes(r)}
                onCheckedChange={() => toggle(r, selRegions, setSelRegions)}
              />
              <Label htmlFor={`r-${r}`} className="text-sm font-normal">
                {r}
              </Label>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Trip type</legend>
        <div className="mt-3 space-y-2.5">
          {types.map((t) => (
            <div key={t} className="flex items-center gap-2.5">
              <Checkbox
                id={`t-${t}`}
                checked={selTypes.includes(t)}
                onCheckedChange={() => toggle(t, selTypes, setSelTypes)}
              />
              <Label htmlFor={`t-${t}`} className="text-sm font-normal">
                {t}
              </Label>
            </div>
          ))}
        </div>
      </fieldset>

      <div>
        <Label className="text-sm font-semibold">
          Max budget · ₹{budget[0].toLocaleString("en-IN")}
        </Label>
        <Slider
          className="mt-4"
          min={8000}
          max={40000}
          step={1000}
          value={budget}
          onValueChange={setBudget}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="free-cancel" className="text-sm font-semibold">
          Free cancellation only
        </Label>
        <Switch id="free-cancel" checked={freeOnly} onCheckedChange={setFreeOnly} />
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-sky">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Browse trips"
          title={search.q ? `Trips matching "${search.q}"` : "Every corner of India, curated"}
          subtitle="Small groups, verified operators, transparent pricing."
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-soft">
              {filters}
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {results.length} trip{results.length === 1 ? "" : "s"} found
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters((v) => !v)}
                >
                  <SlidersHorizontal /> Filters
                </Button>
                <label htmlFor="sort" className="sr-only">
                  Sort trips
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-10 rounded-lg border border-border bg-card px-3 text-sm"
                >
                  <option value="popular">Popularity</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="rating">Rating</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </div>

            {showFilters && (
              <div className="mt-5 rounded-2xl border border-border bg-card p-6 shadow-soft lg:hidden">
                {filters}
              </div>
            )}

            {results.length === 0 ? (
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                <TripCardSkeleton />
                <div className="flex flex-col justify-center rounded-2xl border border-dashed border-border p-8 text-center">
                  <p className="font-display text-xl">No trips match those filters</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try widening your budget or clearing a region.
                  </p>
                  <Button
                    className="mx-auto mt-5"
                    variant="outline"
                    onClick={() => {
                      setSelRegions([]);
                      setSelTypes([]);
                      setBudget([40000]);
                      setFreeOnly(false);
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            ) : (
              <ul className="mt-8 grid gap-6 sm:grid-cols-2">
                {results.map((trip, i) => (
                  <Reveal as="li" key={trip.id} delay={(i % 2) * 90}>
                    <TripCard trip={trip} index={i} />
                    <p className="mt-2 flex items-center gap-1.5 px-1 text-xs text-coral">
                      <Star className="size-3.5 fill-coral text-coral" />
                      {trip.bookedLastWeek} travellers booked this in the last week
                    </p>
                  </Reveal>
                ))}
              </ul>
            )}

            <p className="mt-10 text-center text-sm text-muted-foreground">
              Can't find your route?{" "}
              <Link to="/travel-planner" className="font-semibold text-primary hover:underline">
                Build a custom plan with AI
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
