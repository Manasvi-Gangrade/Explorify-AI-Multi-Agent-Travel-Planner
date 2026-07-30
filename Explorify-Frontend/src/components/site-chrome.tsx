import { Link, useRouterState } from "@tanstack/react-router";
import {
  Compass,
  Heart,
  Home,
  Menu,
  MessageCircle,
  Search,
  Ticket,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Bot,
  X,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/trips", label: "Browse Trips" },
  { to: "/travel-planner", label: "Travel Planner" },
  { to: "/bookings", label: "My Bookings" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
] as const;

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="ExplorifyTrips home">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-azure text-primary-foreground">
        <Compass className="size-5" />
      </span>
      <span className="font-display text-xl leading-none font-semibold">
        Explorify<span className="text-azure">Trips</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { ids } = useWishlist();

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-soft backdrop-blur-xl transition-all duration-300"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Wordmark />
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-accent hover:text-primary data-[status=active]:text-primary"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Link to="/wishlist" aria-label={`Wishlist, ${ids.length} saved trips`}>
              <span className="relative">
                <Heart className="size-5" />
                {ids.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-coral-foreground">
                    {ids.length}
                  </span>
                )}
              </span>
            </Link>
          </Button>
          <Button asChild variant="hero" size="sm" className="hidden sm:inline-flex">
            <Link to="/travel-planner">
              <Sparkles /> Plan with AI
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm">
              <div className="mt-6 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium text-foreground/85 hover:bg-accent hover:text-primary data-[status=active]:text-primary"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to="/wishlist"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-foreground/85 hover:bg-accent"
                >
                  Wishlist ({ids.length})
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/trips", label: "Search", icon: Search },
    { to: "/wishlist", label: "Wishlist", icon: Heart },
    { to: "/bookings", label: "Bookings", icon: Ticket },
    { to: "/about", label: "Profile", icon: Compass },
  ] as const;

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg">
        {items.map((it) => {
          const active =
            it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
          return (
            <li key={it.to} className="flex-1">
              <Link
                to={it.to}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <it.icon className={cn("size-5", active && "text-azure")} />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function WhatsAppButton() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    { sender: "bot", text: "Namaste! 🙏 Welcome to ExplorifyTrips support. How can I help you customize your Indian holiday today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [chatOpen]);

  const quickReplies = [
    { label: "Suggest Kashmir Plan 🏔️", text: "Can you suggest a Kashmir tour plan?" },
    { label: "Refunds & Cancellations 💳", text: "What is your refund policy?" },
    { label: "How to book? ✈️", text: "How do I book a tour package?" },
    { label: "Contact Support 📞", text: "How do I connect with customer support?" }
  ];

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { sender: "user", text }]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "Thank you for asking! I'm here to help with handpicked Indian tours and bookings. You can also reach our on-ground team on WhatsApp for immediate assistance.";
      
      const query = text.toLowerCase().trim();

      // 🛡️ Jailbreak & Prompt Injection Security Guard
      const jailbreakTriggers = [
        "ignore previous", "system prompt", "dan mode", "do anything now", "jailbreak",
        "acting as", "you are now a", "dev mode", "translate", "python", "code", "programming",
        "write a script", "exploit", "hack", "bypass", "instruction", "prompt injection",
        "roleplay", "pretend to be", "override", "developer console", "sql", "inject"
      ];

      const isSecurityThreat = jailbreakTriggers.some(trigger => query.includes(trigger));

      // 🗺️ Context Relevance Validation Keywords
      const travelKeywords = [
        "travel", "trip", "tour", "package", "destination", "holiday", "vacation",
        "kashmir", "kerala", "rajasthan", "goa", "ladakh", "india", "mumbai", "delhi", "varanasi", "srinagar",
        "booking", "book", "refund", "cancel", "payment", "razorpay", "upi", "price", "cost", "charge",
        "flights", "trains", "hotel", "itinerary", "plan", "planner", "ai",
        "support", "contact", "phone", "email", "help", "hello", "hi", "hey", "namaste",
        "explorify", "trips", "website", "service", "customer"
      ];

      const isTravelRelated = query.length < 5 || travelKeywords.some(keyword => query.includes(keyword));

      if (isSecurityThreat) {
        replyText = "⚠️ Security Alert: Action blocked. I am the dedicated Explorify Assistant and cannot process system commands, code generation, or roleplay requests. How can I help you customize your Indian holiday package? 🏔️✈️";
      } else if (!isTravelRelated) {
        replyText = "I apologize, but I am only programmed to assist with ExplorifyTrips travel planning, handpicked India tour packages, bookings, payments, and customer support. Please let me know if you would like me to suggest a Kashmir tour, explain refund options, or guide you through booking! 🏔️🚗";
      } else {
        if (query.includes("kashmir")) {
          replyText = "🏔️ Kashmir is absolute paradise! Our standard 6-Day 'Heavenly Kashmir' package starts at ₹24,999/person, covering Srinagar Dal Lake houseboats, Gulmarg Gondola rides, and Pahalgam valley tours. If you want a custom, day-by-day plan with specific flights and hotels, please try our 'Plan with AI' tool in the header!";
        } else if (query.includes("refund") || query.includes("cancel")) {
          replyText = "💳 For package cancellations on ExplorifyTrips:\n• 15+ Days Before Travel: 100% full refund to original source.\n• 7-14 Days Before Travel: 50% partial refund.\n• Less than 7 Days: Non-refundable (as hotel reservations and local transport bookings get locked in).\n\nRefunds are securely processed via Razorpay back to your payment method within 5-7 business days.";
        } else if (query.includes("book")) {
          replyText = "✈️ Booking is easy and 100% secure:\n1. Go to 'Browse Trips' and select your dream holiday package.\n2. Choose a package category, select your departure date, and specify the number of guests.\n3. Click 'Book Now' and complete the secure payment using Razorpay (supports UPI, NetBanking, and Cards).\n\nOnce booked, your tickets and receipt will be available instantly under 'My Bookings'!";
        } else if (query.includes("support") || query.includes("contact") || query.includes("phone") || query.includes("email")) {
          replyText = "📞 Our customer support team is on standby 24/7!\n• Immediate Chat: Click the green WhatsApp button next to me to start a direct line with our on-ground team.\n• Email Support: Drop us a line at hello@explorifytrips.com.\n• Office Location: Vijay Nagar, Indore, Madhya Pradesh.";
        } else if (query.includes("hi") || query.includes("hello") || query.includes("hey") || query.includes("namaste")) {
          replyText = "Namaste! 🙏 Welcome to ExplorifyTrips. I can assist you with our handpicked tour packages, secure bookings, refunds, or customer support. What destination is on your mind today?";
        }
      }

      setMessages(prev => [...prev, { sender: "bot", text: replyText }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Help Chatbot Floating Trigger */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        aria-label="Open support chat"
        className="fixed right-20 bottom-20 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-warm text-primary-foreground shadow-float transition-transform duration-300 hover:scale-110 lg:bottom-6"
      >
        {chatOpen ? <X className="size-6 text-white" /> : <Bot className="size-6 text-white" />}
      </button>

      {/* WhatsApp Button Next to Chatbot */}
      <a
        href="https://wa.me/919000000000?text=Hi%20ExplorifyTrips!%20I%27d%20like%20help%20planning%20a%20trip."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with ExplorifyTrips on WhatsApp"
        className="fixed right-4 bottom-20 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-float transition-transform duration-300 hover:scale-110 lg:bottom-6"
      >
        <MessageCircle className="size-6 text-white" />
      </a>

      {/* Interactive Chat Dialog Panel */}
      {chatOpen && (
        <div className="fixed right-4 bottom-36 z-50 flex h-[460px] w-[340px] flex-col rounded-3xl border border-border bg-background/95 shadow-float backdrop-blur-xl animate-[fade-in_0.2s_ease-out] lg:right-20 lg:bottom-24">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-gradient-azure px-5 py-4 text-primary-foreground rounded-t-3xl">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 shrink-0 place-items-center justify-center rounded-xl bg-card text-primary shadow-soft">
                <Bot className="size-5 text-azure" />
                <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-card" />
              </span>
              <div>
                <h3 className="text-sm font-semibold leading-tight text-white">Explorify Assistant</h3>
                <span className="text-[10px] text-primary-foreground/80">Online · Help Centre</span>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="rounded-lg p-1 text-primary-foreground/80 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex max-w-[85%] flex-col rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line",
                  msg.sender === "user"
                    ? "ml-auto bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-surface border border-border text-foreground rounded-tl-none"
                )}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="bg-surface border border-border text-muted-foreground max-w-[85%] rounded-2xl rounded-tl-none px-4 py-2.5 text-xs flex items-center gap-1.5 animate-pulse">
                <span className="inline-block size-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                <span className="inline-block size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0.2s]" />
                <span className="inline-block size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0.4s]" />
                Assistant is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Suggestion Chips */}
          {messages.length === 1 && !isTyping && (
            <div className="px-4 pb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Frequently Asked</p>
              <div className="flex flex-wrap gap-1.5">
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(reply.text)}
                    className="text-left text-xs bg-accent hover:bg-accent/80 text-primary border border-border rounded-lg px-2.5 py-1.5 font-medium transition-colors"
                  >
                    {reply.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputValue.trim()) {
                handleSendMessage(inputValue);
              }
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask support..."
              className="h-10 flex-1 rounded-xl bg-surface px-3 text-sm text-foreground outline-none border border-border focus-visible:ring-1 focus-visible:ring-azure/50"
            />
            <Button type="submit" size="sm" variant="azure" className="h-10 px-4 rounded-xl">
              Send
            </Button>
          </form>
        </div>
      )}
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="india-watermark mt-24 border-t border-border bg-surface text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Handpicked Indian journeys, run with verified local operators.
              Built in Indore, made for every corner of India.
            </p>
            <div className="mt-5 flex gap-2">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="ExplorifyTrips social profile"
                  className="grid size-10 place-items-center rounded-xl border border-border bg-card text-azure transition-colors hover:border-azure"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Quick links">
            <h3 className="font-display text-lg">Quick Links</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition-colors hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal and support">
            <h3 className="font-display text-lg">Legal &amp; Support</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {[
                "Cancellation & Refunds",
                "Terms of Service",
                "Privacy Policy",
                "Payment Security",
                "Help Centre",
              ].map((t) => (
                <li key={t}>
                  <a href="#" className="transition-colors hover:text-primary">
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-display text-lg">Get in Touch</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-azure" />
                <span>Vijay Nagar, Indore, Madhya Pradesh 452010, India</span>
              </li>
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-azure" />
                <a href="tel:+919000000000" className="hover:text-primary">
                  +91 90000 00000
                </a>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-azure" />
                <a href="mailto:hello@explorifytrips.com" className="hover:text-primary">
                  hello@explorifytrips.com
                </a>
              </li>
            </ul>
            <h4 className="mt-6 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              We Accept
            </h4>
            <ul className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
              {["Razorpay", "UPI", "Visa", "Mastercard", "Net Banking"].map((p) => (
                <li
                  key={p}
                  className="rounded-md border border-border bg-card px-2.5 py-1.5 text-secondary-foreground"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ExplorifyTrips. Made with chai in Indore, India.</p>
          <p>GSTIN 23AAAAA0000A1Z5 · Secured by Razorpay · 256-bit SSL</p>
        </div>
      </div>
    </footer>
  );
}
