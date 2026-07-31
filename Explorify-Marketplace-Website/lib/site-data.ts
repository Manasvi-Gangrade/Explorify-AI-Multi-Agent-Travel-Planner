import _heroKashmir from "@/assets/hero-kashmir.jpg";
import _heroRajasthan from "@/assets/hero-rajasthan.jpg";
import _heroKerala from "@/assets/hero-kerala.jpg";
import _heroLadakh from "@/assets/hero-ladakh.jpg";
import _attrTaj from "@/assets/attr-taj.jpg";
import _attrGolden from "@/assets/attr-golden-temple.jpg";
import _attrHawa from "@/assets/attr-hawa-mahal.jpg";
import _attrVaranasi from "@/assets/attr-varanasi.jpg";
import _destGoa from "@/assets/dest-goa.jpg";
import _destManali from "@/assets/dest-manali.jpg";
import _destMeghalaya from "@/assets/dest-meghalaya.jpg";
import _destSpiti from "@/assets/dest-spiti.jpg";

// Extract .src strings so plain <img> tags work without [object Object]
const heroKashmir = _heroKashmir.src;
const heroRajasthan = _heroRajasthan.src;
const heroKerala = _heroKerala.src;
const heroLadakh = _heroLadakh.src;
const attrTaj = _attrTaj.src;
const attrGolden = _attrGolden.src;
const attrHawa = _attrHawa.src;
const attrVaranasi = _attrVaranasi.src;
const destGoa = _destGoa.src;
const destManali = _destManali.src;
const destMeghalaya = _destMeghalaya.src;
const destSpiti = _destSpiti.src;

export const images = {
  heroKashmir,
  heroRajasthan,
  heroKerala,
  heroLadakh,
  attrTaj,
  attrGolden,
  attrHawa,
  attrVaranasi,
  destGoa,
  destManali,
  destMeghalaya,
  destSpiti,
};

export type Region =
  | "North India"
  | "South India"
  | "East India"
  | "West India"
  | "Northeast India";

export type TripType =
  | "Adventure"
  | "Spiritual"
  | "Beach"
  | "Heritage"
  | "Hill Station";

export type ItineraryDay = {
  day: number;
  title: string;
  description: string;
  place: string;
};

export type Trip = {
  id: string;
  name: string;
  origin: string;
  destination: string;
  state: string;
  region: Region;
  type: TripType;
  days: number;
  nights: number;
  price: number;
  strikePrice?: number;
  rating: number;
  reviews: number;
  groupSize: number;
  freeCancellation: boolean;
  image: any;
  gallery: any[];
  blurb: string;
  overview: string;
  tags: string[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  meetingPoint: string;
  bookedLastWeek: number;
  featured?: boolean;
};

export function mapPlanToTrip(plan: any): Trip {
  const durationValue = plan.duration?.value || 6;
  return {
    id: plan.planId || "",
    name: plan.name || "",
    origin: plan.startingPoint || "Indore",
    destination: plan.endingPoint || "Srinagar",
    state: plan.state || "Jammu & Kashmir",
    region: plan.region || (plan.categories && plan.categories[0]) || "North India",
    type: plan.type || (plan.interests && plan.interests[0]) || "Hill Station",
    days: durationValue,
    nights: Math.max(1, durationValue - 1),
    price: plan.price || 0,
    strikePrice: plan.strikePrice || (plan.price ? Math.round(plan.price * 1.25) : 0),
    rating: plan.rating || 4.8,
    reviews: plan.reviews || 120,
    groupSize: plan.maxParticipants || 14,
    freeCancellation: plan.isActive !== undefined ? plan.isActive : true,
    image: (plan.images && plan.images[0]) || heroKashmir,
    gallery: (plan.images && plan.images.length > 0) ? plan.images : [heroKashmir],
    blurb: plan.description || "",
    overview: plan.fullDescription || plan.description || "",
    tags: plan.categories || [],
    highlights: plan.highlights || [],
    inclusions: plan.included || [],
    exclusions: plan.excluded || [],
    itinerary: (plan.stops || []).map((stop: any, idx: number) => ({
      day: stop.order || (idx + 1),
      title: stop.name || stop.title || `Day ${idx + 1}`,
      description: stop.description || "",
      place: stop.name || stop.title || "",
    })),
    meetingPoint: plan.meetingPoint || "Airport/Railway Station",
    bookedLastWeek: 12,
  };
}

export const trips: Trip[] = [
  {
    id: "fitoor-e-kashmir",
    name: "Fitoor-E-Kashmir",
    origin: "Indore",
    destination: "Srinagar",
    state: "Jammu & Kashmir",
    region: "North India",
    type: "Hill Station",
    days: 6,
    nights: 5,
    price: 24999,
    strikePrice: 31999,
    rating: 4.9,
    reviews: 268,
    groupSize: 14,
    freeCancellation: true,
    image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1566837945700-30057527ade0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=1200&auto=format&fit=crop",
    ],
    blurb:
      "Shikara sunrises on Dal Lake, chinar-lined boulevards and a houseboat night you'll retell for years.",
    overview:
      "Six unhurried days across the Kashmir valley — Srinagar's houseboats and Mughal gardens, the meadows of Gulmarg, the pine slopes of Pahalgam and a slow chinar-shaded afternoon in Sonmarg. Small groups, verified local operators and drivers who grew up on these roads.",
    tags: ["Guided tours", "Boat cruises", "Cultural experiences"],
    highlights: [
      "Sunrise shikara ride on Dal Lake",
      "Night stay on a heritage cedar houseboat",
      "Gondola ride over the Gulmarg meadows",
      "Wazwan dinner with a Kashmiri host family",
    ],
    inclusions: [
      "5 nights stay (hotel + houseboat)",
      "Daily breakfast and dinner",
      "All transfers in private vehicle",
      "Verified local guide throughout",
    ],
    exclusions: [
      "Flights to and from Srinagar",
      "Gondola phase-2 tickets",
      "Personal expenses and tips",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrive Srinagar · Dal Lake",
        description:
          "Airport pickup, check in to your houseboat and drift into evening with a shikara ride past floating vegetable gardens.",
        place: "Dal Lake, Srinagar",
      },
      {
        day: 2,
        title: "Mughal Gardens & Old City",
        description:
          "Nishat and Shalimar Bagh in the morning, then the walnut-wood interiors of Jamia Masjid and a walk through Zaina Kadal bazaar.",
        place: "Nishat Bagh, Srinagar",
      },
      {
        day: 3,
        title: "Gulmarg meadows",
        description:
          "Drive through rice terraces to Gulmarg for the gondola and an afternoon of alpine meadows and pony trails.",
        place: "Gulmarg",
      },
      {
        day: 4,
        title: "Pahalgam & Betaab Valley",
        description:
          "Lidder river walks, Aru and Betaab valley stops, and a riverside lunch under the deodars.",
        place: "Pahalgam",
      },
      {
        day: 5,
        title: "Sonmarg day trip",
        description:
          "Meadow of gold — glacier views at Thajiwas and a slow return with chai stops along the Sindh river.",
        place: "Sonmarg",
      },
      {
        day: 6,
        title: "Departure",
        description:
          "Last saffron and kahwa shopping at Lal Chowk before your airport transfer.",
        place: "Srinagar Airport",
      },
    ],
    meetingPoint: "Sheikh ul-Alam International Airport, Srinagar",
    bookedLastWeek: 18,
    featured: true,
  },
  {
    id: "royal-rajasthan",
    name: "Royal Rajasthan Circuit",
    origin: "Indore",
    destination: "Jaipur · Udaipur · Jaisalmer",
    state: "Rajasthan",
    region: "North India",
    type: "Heritage",
    days: 8,
    nights: 7,
    price: 29999,
    strikePrice: 36499,
    rating: 4.8,
    reviews: 341,
    groupSize: 16,
    freeCancellation: true,
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1609949279531-cf48d64bed89?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200&auto=format&fit=crop",
    ],
    blurb:
      "Pink City facades, lake palaces at dusk and a night under Thar desert stars in Sam.",
    overview:
      "Eight days through Rajasthan's three great moods — Jaipur's bazaars and forts, Udaipur's lakes and havelis, and the golden silence of Jaisalmer's dunes. Heritage stays, folk performances and a camel-back sunset included.",
    tags: ["Guided tours", "Cultural experiences", "Desert camping"],
    highlights: [
      "Hawa Mahal and Amber Fort with a heritage historian",
      "Sunset boat ride on Lake Pichola",
      "Camel safari and folk night at Sam dunes",
      "Blue City walking trail in Jodhpur",
    ],
    inclusions: [
      "7 nights in heritage hotels and desert camp",
      "Daily breakfast and 5 dinners",
      "All intercity transfers",
      "Monument entry for listed sites",
    ],
    exclusions: ["Airfare", "Camera fees at monuments", "Lunches"],
    itinerary: [
      {
        day: 1,
        title: "Arrive Jaipur",
        description:
          "Check in, evening at Hawa Mahal's lattice facade and dinner on Chokhi Dhani style thali.",
        place: "Hawa Mahal, Jaipur",
      },
      {
        day: 2,
        title: "Amber Fort & City Palace",
        description:
          "Sheesh Mahal mirrorwork, Jantar Mantar's instruments and Johari Bazaar for block prints.",
        place: "Amber Fort, Jaipur",
      },
      {
        day: 3,
        title: "Jaipur to Jodhpur",
        description:
          "Scenic drive, Mehrangarh Fort ramparts at golden hour and the indigo lanes below.",
        place: "Mehrangarh Fort, Jodhpur",
      },
      {
        day: 4,
        title: "Jodhpur to Jaisalmer",
        description:
          "Arrive the golden city, explore Patwon ki Haveli and its carved sandstone screens.",
        place: "Jaisalmer Fort",
      },
      {
        day: 5,
        title: "Sam Sand Dunes",
        description:
          "Camel safari at sunset, Kalbeliya folk dance and a night in a luxury desert camp.",
        place: "Sam Sand Dunes",
      },
      {
        day: 6,
        title: "Jaisalmer to Udaipur",
        description:
          "Long, beautiful drive through Ranakpur with its 1,444 marble pillars.",
        place: "Ranakpur Jain Temple",
      },
      {
        day: 7,
        title: "Udaipur lakes",
        description:
          "City Palace, Jagdish Temple and a sunset boat ride across Lake Pichola.",
        place: "Lake Pichola, Udaipur",
      },
      {
        day: 8,
        title: "Departure",
        description: "Breakfast by the lake and transfer to Udaipur airport.",
        place: "Udaipur Airport",
      },
    ],
    meetingPoint: "Jaipur Junction Railway Station",
    bookedLastWeek: 24,
    featured: true,
  },
  {
    id: "kerala-backwaters",
    name: "Kerala Backwaters & Spice Hills",
    origin: "Indore",
    destination: "Alleppey · Munnar",
    state: "Kerala",
    region: "South India",
    type: "Hill Station",
    days: 6,
    nights: 5,
    price: 22499,
    rating: 4.9,
    reviews: 412,
    groupSize: 12,
    freeCancellation: true,
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1616843413587-9e3a37f7bbd8?q=80&w=1200&auto=format&fit=crop",
    ],
    blurb:
      "A private houseboat through Alleppey's canals, tea-carpeted Munnar slopes and Kathakali by lamplight.",
    overview:
      "Slow travel at its finest — one night on a traditional kettuvallam houseboat, two in the tea estates of Munnar, and Fort Kochi's Chinese fishing nets at dusk.",
    tags: ["Boat cruises", "Cultural experiences", "Nature walks"],
    highlights: [
      "Overnight kettuvallam houseboat in Alleppey",
      "Tea estate walk and factory tour in Munnar",
      "Kathakali performance in Fort Kochi",
      "Ayurvedic massage session included",
    ],
    inclusions: [
      "5 nights (resort + houseboat)",
      "All meals on houseboat day",
      "Private AC vehicle",
      "Local naturalist guide in Munnar",
    ],
    exclusions: ["Flights", "Alcoholic beverages", "Optional spa add-ons"],
    itinerary: [
      {
        day: 1,
        title: "Arrive Kochi",
        description:
          "Fort Kochi heritage walk, Chinese fishing nets and a seafood dinner at the harbour.",
        place: "Fort Kochi",
      },
      {
        day: 2,
        title: "Kochi to Munnar",
        description:
          "Waterfalls and spice plantation stops en route to the hills.",
        place: "Munnar",
      },
      {
        day: 3,
        title: "Munnar tea country",
        description:
          "Sunrise at Top Station, tea museum and a walk through Eravikulam National Park.",
        place: "Eravikulam National Park",
      },
      {
        day: 4,
        title: "Alleppey houseboat",
        description:
          "Board your kettuvallam at noon and drift through paddy-fringed canals until sunset.",
        place: "Alleppey Backwaters",
      },
      {
        day: 5,
        title: "Village life & Kumarakom",
        description:
          "Canoe through narrow village canals and birdwatch at Kumarakom sanctuary.",
        place: "Kumarakom",
      },
      {
        day: 6,
        title: "Departure",
        description: "Transfer to Kochi airport with a coffee stop on the way.",
        place: "Kochi Airport",
      },
    ],
    meetingPoint: "Cochin International Airport",
    bookedLastWeek: 31,
    featured: true,
  },
  {
    id: "ladakh-high-passes",
    name: "Ladakh High Passes Expedition",
    origin: "Indore",
    destination: "Leh · Nubra · Pangong",
    state: "Ladakh",
    region: "North India",
    type: "Adventure",
    days: 7,
    nights: 6,
    price: 34999,
    strikePrice: 41999,
    rating: 4.8,
    reviews: 197,
    groupSize: 10,
    freeCancellation: false,
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600100397608-f010e423b971?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
    ],
    blurb:
      "Khardung La, Nubra's cold desert and a night beside the impossible blue of Pangong Tso.",
    overview:
      "A properly acclimatised Ladakh route with monastery mornings, high-pass crossings and camp nights at 14,000 ft. Oxygen support and an experienced mountain lead on every departure.",
    tags: ["Adventure", "Guided tours", "Camping"],
    highlights: [
      "Cross Khardung La, one of the world's highest motorable passes",
      "Double-humped camels on Hunder's cold dunes",
      "Lakeside camp at Pangong Tso",
      "Thiksey Monastery morning prayers",
    ],
    inclusions: [
      "6 nights stay incl. 2 camp nights",
      "Inner line permits",
      "Oxygen cylinders and first-aid",
      "All meals",
    ],
    exclusions: ["Flights to Leh", "Bike rental add-on", "Travel insurance"],
    itinerary: [
      {
        day: 1,
        title: "Arrive Leh · Acclimatise",
        description:
          "Rest day at 11,500 ft with an easy evening walk to Shanti Stupa.",
        place: "Shanti Stupa, Leh",
      },
      {
        day: 2,
        title: "Monastery circuit",
        description:
          "Thiksey morning prayers, Hemis and the Indus-Zanskar confluence.",
        place: "Thiksey Monastery",
      },
      {
        day: 3,
        title: "Leh to Nubra via Khardung La",
        description:
          "Cross the legendary pass and descend into the Nubra valley.",
        place: "Khardung La",
      },
      {
        day: 4,
        title: "Hunder & Diskit",
        description:
          "Cold-desert dunes, Bactrian camels and the giant Maitreya Buddha at Diskit.",
        place: "Hunder, Nubra",
      },
      {
        day: 5,
        title: "Nubra to Pangong",
        description:
          "Shyok river route to the lake, arriving for that first colour-shifting sunset.",
        place: "Pangong Tso",
      },
      {
        day: 6,
        title: "Pangong to Leh",
        description: "Sunrise at the lake, return via Chang La and Druk school.",
        place: "Chang La",
      },
      {
        day: 7,
        title: "Departure",
        description: "Early transfer to Kushok Bakula Rimpochee Airport.",
        place: "Leh Airport",
      },
    ],
    meetingPoint: "Leh Airport, Ladakh",
    bookedLastWeek: 12,
  },
  {
    id: "goa-coastal-escape",
    name: "Goa Coastal Escape",
    origin: "Indore",
    destination: "North & South Goa",
    state: "Goa",
    region: "West India",
    type: "Beach",
    days: 4,
    nights: 3,
    price: 14999,
    rating: 4.6,
    reviews: 523,
    groupSize: 18,
    freeCancellation: true,
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1587922546307-776227941871?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
    ],
    blurb:
      "Palolem sunsets, Fontainhas' Portuguese lanes and a dolphin cruise off Grande Island.",
    overview:
      "A short, sunny reset — north Goa's markets and beach shacks balanced with the quiet sands of the south, plus a heritage walk through Panjim's Latin Quarter.",
    tags: ["Beach", "Boat cruises", "Nightlife"],
    highlights: [
      "Dolphin-spotting cruise at Grande Island",
      "Fontainhas Latin Quarter heritage walk",
      "Sunset at Palolem and Butterfly beach",
      "Spice plantation lunch",
    ],
    inclusions: [
      "3 nights beach resort",
      "Daily breakfast",
      "Cruise and scooter day pass",
      "Airport transfers",
    ],
    exclusions: ["Flights", "Water sports", "Lunches and dinners"],
    itinerary: [
      {
        day: 1,
        title: "Arrive North Goa",
        description: "Check in at Candolim, sunset at Anjuna's cliff shacks.",
        place: "Anjuna Beach",
      },
      {
        day: 2,
        title: "Panjim & Old Goa",
        description:
          "Basilica of Bom Jesus, Fontainhas walk and a Mandovi river cruise.",
        place: "Fontainhas, Panjim",
      },
      {
        day: 3,
        title: "South Goa",
        description:
          "Palolem and Butterfly beach by kayak, then a quiet shack dinner.",
        place: "Palolem Beach",
      },
      {
        day: 4,
        title: "Departure",
        description: "Morning swim and transfer to Dabolim airport.",
        place: "Dabolim Airport",
      },
    ],
    meetingPoint: "Dabolim Airport, Goa",
    bookedLastWeek: 44,
  },
  {
    id: "spiti-valley-circuit",
    name: "Spiti Valley Circuit",
    origin: "Indore",
    destination: "Kaza · Chandratal",
    state: "Himachal Pradesh",
    region: "North India",
    type: "Adventure",
    days: 8,
    nights: 7,
    price: 27999,
    rating: 4.9,
    reviews: 156,
    groupSize: 10,
    freeCancellation: false,
    image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600100397608-f010e423b971?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
    ],
    blurb:
      "Key Monastery mornings, the world's highest post office and Chandratal under the Milky Way.",
    overview:
      "The full Manali–Kaza–Chandratal loop through Himachal's cold desert, with homestays in Langza and Komic and a night beside the moon lake.",
    tags: ["Adventure", "Camping", "Cultural experiences"],
    highlights: [
      "Sunrise at Key Monastery",
      "Homestay in Langza, the fossil village",
      "Post a letter from Hikkim's highest post office",
      "Camp beside Chandratal lake",
    ],
    inclusions: [
      "7 nights homestays and camps",
      "All meals",
      "Tempo Traveller with mountain driver",
      "Permits",
    ],
    exclusions: ["Travel to Manali", "Insurance", "Personal gear"],
    itinerary: [
      {
        day: 1,
        title: "Manali arrival",
        description: "Acclimatise in the old town and brief with your trip lead.",
        place: "Manali",
      },
      {
        day: 2,
        title: "Manali to Kaza",
        description: "Cross Kunzum La with the valley opening up below.",
        place: "Kunzum La",
      },
      {
        day: 3,
        title: "Key & Kibber",
        description:
          "Monastery morning and a walk to the wildlife sanctuary village of Kibber.",
        place: "Key Monastery",
      },
      {
        day: 4,
        title: "Langza · Hikkim · Komic",
        description: "Fossil hunting, the highest post office and Komic's gompa.",
        place: "Langza",
      },
      {
        day: 5,
        title: "Pin Valley",
        description: "Mudh village, blue skies and a riverside picnic.",
        place: "Pin Valley National Park",
      },
      {
        day: 6,
        title: "Chandratal",
        description: "Camp beside the moon lake and stargaze at 14,100 ft.",
        place: "Chandratal Lake",
      },
      {
        day: 7,
        title: "Return to Manali",
        description: "Descend via Rohtang with photo stops.",
        place: "Rohtang Pass",
      },
      {
        day: 8,
        title: "Departure",
        description: "Breakfast and onward transfer.",
        place: "Manali Bus Stand",
      },
    ],
    meetingPoint: "Mall Road, Manali",
    bookedLastWeek: 9,
  },
  {
    id: "varanasi-rishikesh-soul",
    name: "Varanasi & Rishikesh Soul Trail",
    origin: "Indore",
    destination: "Varanasi · Rishikesh",
    state: "UP & Uttarakhand",
    region: "North India",
    type: "Spiritual",
    days: 6,
    nights: 5,
    price: 19999,
    rating: 4.7,
    reviews: 231,
    groupSize: 15,
    freeCancellation: true,
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
    ],
    blurb:
      "Ganga aarti at Dashashwamedh, sunrise boat rows and Himalayan yoga mornings by the river.",
    overview:
      "India's oldest living city paired with the Ganga's mountain source town — aartis, ashrams, silk weaving lanes and a river-rafting afternoon.",
    tags: ["Spiritual", "Boat cruises", "Cultural experiences"],
    highlights: [
      "Ganga aarti front-row boat seats",
      "Sunrise rowboat along the ghats",
      "Sarnath's Dhamek Stupa",
      "Sunrise yoga and Ganga rafting in Rishikesh",
    ],
    inclusions: [
      "5 nights riverside stays",
      "Daily breakfast",
      "Boat rides and aarti seating",
      "Rafting session",
    ],
    exclusions: ["Flights and trains", "Donations", "Lunches"],
    itinerary: [
      {
        day: 1,
        title: "Arrive Varanasi",
        description: "Evening Ganga aarti from a boat at Dashashwamedh Ghat.",
        place: "Dashashwamedh Ghat",
      },
      {
        day: 2,
        title: "Sunrise ghats & Sarnath",
        description:
          "Rowboat at dawn, Kashi Vishwanath darshan and afternoon at Sarnath.",
        place: "Sarnath",
      },
      {
        day: 3,
        title: "Silk lanes",
        description:
          "Banarasi weaving workshop, kachori-sabzi breakfast and an overnight train.",
        place: "Varanasi Old City",
      },
      {
        day: 4,
        title: "Rishikesh arrival",
        description: "Triveni Ghat aarti and a walk across Ram Jhula.",
        place: "Triveni Ghat, Rishikesh",
      },
      {
        day: 5,
        title: "Yoga & rafting",
        description:
          "Sunrise yoga, Beatles Ashram murals and 16 km of Ganga rapids.",
        place: "Beatles Ashram",
      },
      {
        day: 6,
        title: "Departure",
        description: "Transfer to Dehradun airport.",
        place: "Dehradun Airport",
      },
    ],
    meetingPoint: "Lal Bahadur Shastri Airport, Varanasi",
    bookedLastWeek: 16,
  },
  {
    id: "meghalaya-living-roots",
    name: "Meghalaya Living Roots",
    origin: "Indore",
    destination: "Shillong · Cherrapunji",
    state: "Meghalaya",
    region: "Northeast India",
    type: "Adventure",
    days: 6,
    nights: 5,
    price: 25999,
    rating: 4.8,
    reviews: 143,
    groupSize: 12,
    freeCancellation: true,
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    ],
    blurb:
      "Double-decker root bridges, Asia's cleanest village and turquoise Dawki river mornings.",
    overview:
      "Rain-country trekking through Nongriat's root bridges, kayaking the glass-clear Umngot at Dawki and homestays in Mawlynnong.",
    tags: ["Adventure", "Nature walks", "Homestays"],
    highlights: [
      "Trek to the double-decker living root bridge",
      "Boat on the crystal Umngot river at Dawki",
      "Mawlynnong, Asia's cleanest village",
      "Mawsmai limestone caves",
    ],
    inclusions: [
      "5 nights stays and homestays",
      "Breakfast and dinner",
      "Trek guide and permits",
      "All transfers",
    ],
    exclusions: ["Flights to Guwahati", "Kayak rentals", "Lunches"],
    itinerary: [
      {
        day: 1,
        title: "Guwahati to Shillong",
        description: "Umiam lake stop and an evening at Police Bazaar.",
        place: "Umiam Lake",
      },
      {
        day: 2,
        title: "Cherrapunji",
        description: "Nohkalikai falls, Mawsmai caves and Arwah's fossils.",
        place: "Nohkalikai Falls",
      },
      {
        day: 3,
        title: "Nongriat trek",
        description:
          "3,500 steps down to the double-decker root bridge and rainbow falls.",
        place: "Nongriat",
      },
      {
        day: 4,
        title: "Dawki & Mawlynnong",
        description: "Boat the Umngot, then homestay in Mawlynnong.",
        place: "Dawki",
      },
      {
        day: 5,
        title: "Laitlum Canyons",
        description: "Grand canyon views and a slow return to Shillong.",
        place: "Laitlum Canyon",
      },
      {
        day: 6,
        title: "Departure",
        description: "Transfer to Guwahati airport.",
        place: "Guwahati Airport",
      },
    ],
    meetingPoint: "Guwahati Airport",
    bookedLastWeek: 11,
  },
  {
    id: "pachmarhi-satpura",
    name: "Pachmarhi Satpura Retreat",
    origin: "Indore",
    destination: "Pachmarhi",
    state: "Madhya Pradesh",
    region: "West India",
    type: "Hill Station",
    days: 3,
    nights: 2,
    price: 8999,
    rating: 4.5,
    reviews: 389,
    groupSize: 20,
    freeCancellation: true,
    image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    ],
    blurb:
      "Madhya Pradesh's only hill station — waterfalls, cave paintings and Dhoopgarh sunsets.",
    overview:
      "A weekend in the Satpura ranges: Bee Falls, Jata Shankar caves, ancient rock shelters and the highest sunset point in central India.",
    tags: ["Nature walks", "Guided tours", "Weekend"],
    highlights: [
      "Sunset at Dhoopgarh, the Satpura high point",
      "Bee Falls and Apsara Vihar pools",
      "Pandav caves rock shelters",
      "Jeep safari through Satpura foothills",
    ],
    inclusions: [
      "2 nights resort stay",
      "Breakfast and dinner",
      "Jeep sightseeing",
      "Road transfers from Indore",
    ],
    exclusions: ["Lunches", "Entry tickets", "Personal expenses"],
    itinerary: [
      {
        day: 1,
        title: "Indore to Pachmarhi",
        description: "Scenic road journey, check in and an easy evening walk.",
        place: "Pachmarhi",
      },
      {
        day: 2,
        title: "Falls & caves",
        description:
          "Bee Falls, Pandav caves, Jata Shankar and sunset at Dhoopgarh.",
        place: "Dhoopgarh",
      },
      {
        day: 3,
        title: "Return",
        description: "Handroll market stop and drive back to Indore.",
        place: "Indore",
      },
    ],
    meetingPoint: "Rajwada, Indore",
    bookedLastWeek: 27,
  },
];

export const attractions = [
  { name: "Taj Mahal", city: "Agra", activities: 84, image: attrTaj },
  {
    name: "Golden Temple",
    city: "Amritsar",
    activities: 52,
    image: attrGolden,
  },
  { name: "Hawa Mahal", city: "Jaipur", activities: 96, image: attrHawa },
  {
    name: "Kerala Backwaters",
    city: "Alleppey",
    activities: 118,
    image: heroKerala,
  },
  {
    name: "Ganga Ghats",
    city: "Varanasi",
    activities: 73,
    image: attrVaranasi,
  },
  { name: "Pangong Tso", city: "Ladakh", activities: 41, image: heroLadakh },
];

export const regionCards = [
  {
    title: "Himalayas & Hill Stations",
    blurb: "Manali, Spiti, Kashmir, Ladakh",
    image: destManali,
    region: "North India" as Region,
  },
  {
    title: "Beaches & Islands",
    blurb: "Goa, Andaman, Gokarna",
    image: destGoa,
    region: "West India" as Region,
  },
  {
    title: "Desert & Heritage",
    blurb: "Jaipur, Jaisalmer, Udaipur",
    image: heroRajasthan,
    region: "North India" as Region,
  },
  {
    title: "Backwaters & South India",
    blurb: "Alleppey, Munnar, Hampi, Coorg",
    image: heroKerala,
    region: "South India" as Region,
  },
  {
    title: "Spiritual Journeys",
    blurb: "Varanasi, Rishikesh, Amritsar",
    image: attrVaranasi,
    region: "North India" as Region,
  },
];

export const testimonials = [
  {
    name: "Ananya Deshmukh",
    city: "Pune",
    trip: "Fitoor-E-Kashmir",
    rating: 5,
    quote:
      "The houseboat night on Dal Lake was straight out of a film. Our guide Bilal knew every chinar tree by name.",
  },
  {
    name: "Rohit Verma",
    city: "Indore",
    trip: "Spiti Valley Circuit",
    rating: 5,
    quote:
      "Eight days, zero stress. Permits, oxygen, homestays — everything handled. Chandratal night sky broke me.",
  },
  {
    name: "Meera Iyer",
    city: "Chennai",
    trip: "Kerala Backwaters",
    rating: 5,
    quote:
      "I'm from Kerala and they still showed me canals I'd never seen. That says everything about their local operators.",
  },
  {
    name: "Simran Kaur",
    city: "Delhi",
    trip: "Royal Rajasthan Circuit",
    rating: 4,
    quote:
      "Heritage stays were gorgeous and the Sam dunes folk night had my parents dancing. Would book again.",
  },
];

export const blogPosts = [
  {
    slug: "best-time-to-visit-kashmir",
    title: "When Kashmir Is At Its Most Beautiful: A Month-by-Month Guide",
    category: "Hill Stations",
    readingTime: 8,
    excerpt:
      "Tulips in April, saffron in October, snow in January — the valley reinvents itself every season. Here's how to time it.",
    image: heroKashmir,
    date: "12 Jul 2026",
    featured: true,
  },
  {
    slug: "rajasthan-heritage-havelis",
    title: "Sleeping In History: 9 Heritage Havelis Across Rajasthan",
    category: "Heritage",
    readingTime: 6,
    excerpt:
      "From Jaisalmer's carved sandstone to Udaipur's lake-facing balconies, these stays are the destination.",
    image: heroRajasthan,
    date: "04 Jul 2026",
  },
  {
    slug: "kerala-food-trail",
    title: "A Food Trail Through Kerala, From Sadya To Karimeen Pollichathu",
    category: "Food Trails",
    readingTime: 7,
    excerpt:
      "Banana-leaf feasts, toddy shop fish curry and Thalassery biryani — eat your way down the coast.",
    image: heroKerala,
    date: "28 Jun 2026",
  },
  {
    slug: "offbeat-northeast",
    title: "Beyond Shillong: Offbeat Northeast India You Haven't Booked Yet",
    category: "Offbeat India",
    readingTime: 9,
    excerpt:
      "Ziro's rice fields, Mechuka's valleys and Meghalaya's root bridges — the quiet side of the seven sisters.",
    image: destMeghalaya,
    date: "19 Jun 2026",
  },
  {
    slug: "spiti-first-timers",
    title: "Spiti For First-Timers: Altitude, Permits & Packing",
    category: "Offbeat India",
    readingTime: 5,
    excerpt:
      "Everything nobody tells you before you drive into India's coldest desert.",
    image: destSpiti,
    date: "10 Jun 2026",
  },
  {
    slug: "varanasi-morning-guide",
    title: "The Perfect Varanasi Morning, Hour By Hour",
    category: "Heritage",
    readingTime: 6,
    excerpt:
      "Be on the water by 5:20am. Everything else follows from that one decision.",
    image: attrVaranasi,
    date: "01 Jun 2026",
  },
];

export const indianDestinations = [
  "Srinagar, Kashmir",
  "Gulmarg, Kashmir",
  "Manali, Himachal Pradesh",
  "Spiti Valley, Himachal Pradesh",
  "Leh, Ladakh",
  "Pangong Tso, Ladakh",
  "Jaipur, Rajasthan",
  "Udaipur, Rajasthan",
  "Jaisalmer, Rajasthan",
  "Jodhpur, Rajasthan",
  "Agra, Uttar Pradesh",
  "Varanasi, Uttar Pradesh",
  "Rishikesh, Uttarakhand",
  "Amritsar, Punjab",
  "Goa",
  "Alleppey, Kerala",
  "Munnar, Kerala",
  "Kochi, Kerala",
  "Hampi, Karnataka",
  "Coorg, Karnataka",
  "Madurai, Tamil Nadu",
  "Mumbai, Maharashtra",
  "Pachmarhi, Madhya Pradesh",
  "Khajuraho, Madhya Pradesh",
  "Shillong, Meghalaya",
  "Cherrapunji, Meghalaya",
  "Port Blair, Andaman",
  "Havelock Island, Andaman",
  "Darjeeling, West Bengal",
  "Puri, Odisha",
];

export const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const getTrip = (id: string) => trips.find((t) => t.id === id);
