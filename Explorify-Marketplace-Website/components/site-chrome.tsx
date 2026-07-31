"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ProfileMenu from "@/components/common/nav/ProfileMenu";
import { CurrencySwitcher } from "@/components/common/CurrencySwitcher";
import { AudioGuideToggle } from "@/components/common/AudioGuideToggle";
import { VoiceNavigationAssistant } from "@/components/common/VoiceNavigationAssistant";
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
import { GoogleTranslateWidget } from "@/components/common/StandaloneTranslateTTS";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/trips", label: "Browse Trips" },
  { href: "/travel-planner", label: "Travel Planner" },
  { href: "/bookings", label: "My Bookings" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
] as const;

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="ExplorifyTrips home">
      <span className="grid size-9 place-items-center rounded-xl bg-[#1d6fa5] text-white shadow-sm">
        <Compass className="size-5" />
      </span>
      <span className="font-display text-xl leading-none font-semibold notranslate" translate="no">
        Explorify<span className="text-[#1d6fa5] dark:text-sky-300">Trips</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { ids } = useWishlist();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (ids.length > 0) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 400);
      return () => clearTimeout(timer);
    }
  }, [ids.length]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 dark:border-slate-800/70 bg-[#f4f8fb]/95 dark:bg-slate-950/95 shadow-soft backdrop-blur-xl transition-all duration-300">
      {/* Top Main Bar: Logo + All Utilities & Auth */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Wordmark />

        <div className="flex shrink-0 items-center gap-3 sm:gap-4 lg:gap-5">
          {/* Language Selector Dropdown */}
          <div className="flex items-center">
            <GoogleTranslateWidget />
          </div>

          {/* Currency Switcher Dropdown */}
          <div className="flex items-center">
            <CurrencySwitcher />
          </div>

          {/* Audio Voice Guide (Speaker) & Voice Command Assistant (Mic) Side by Side */}
          <div className="flex items-center gap-2 mr-3 sm:mr-5">
            <AudioGuideToggle />
            <VoiceNavigationAssistant />
          </div>

          {/* Subtle Vertical Divider Separator */}
          <div className="h-6 w-[1px] bg-border/60 mx-2 sm:mx-3 hidden sm:block shrink-0" />

          {/* Wishlist Button - Extra Large Red Heart */}
          <Link
            href="/wishlist"
            aria-label={`Wishlist, ${ids.length} saved trips`}
            className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all hover:scale-110"
          >
            <Heart
              className={cn(
                "w-[25px] h-[25px] sm:w-[29px] sm:h-[29px] fill-rose-500 text-rose-500 transition-all duration-300",
                isPulsing && "scale-125"
              )}
            />
            {ids.length > 0 && (
              <span className="absolute -top-1 -right-1 grid h-4.5 min-w-[18px] sm:h-5 sm:min-w-[20px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] sm:text-[11px] font-extrabold text-white shadow-md border-2 border-background">
                {ids.length}
              </span>
            )}
          </Link>

          {/* Plan with AI Button */}
          <Button asChild variant="hero" size="sm" className="hidden sm:inline-flex rounded-full bg-gradient-to-r from-[#1d6fa5] to-[#257ba6] text-white font-bold px-4.5 py-2 text-xs sm:text-sm shadow-md border-0 hover:scale-105 transition-all">
            <Link href="/travel-planner">
              Plan with AI
            </Link>
          </Button>

          {/* Authentication Section */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : session ? (
              <ProfileMenu user={session.user} />
            ) : (
              <Button asChild size="sm" className="rounded-full bg-gradient-to-r from-[#1d6fa5] to-[#257ba6] text-white font-bold shadow-md hover:scale-105 transition-all border-0">
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Sheet Menu Trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden rounded-full h-9 w-9 sm:h-10 sm:w-10 border-slate-200 dark:border-slate-800" aria-label="Open menu">
                <Menu className="size-5 text-[#1d6fa5]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm flex flex-col justify-between p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <Wordmark />
                </div>

                {/* Clean Navigation Links list - No duplicate Wishlist or Translate */}
                <div className="flex flex-col gap-1.5 mt-2">
                  {navLinks.map((l) => {
                    const active = l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition-all",
                          active
                            ? "text-[#1d6fa5] bg-[#1d6fa5]/12 border border-[#1d6fa5]/30 font-bold"
                            : "text-foreground/80 hover:bg-accent hover:text-[#1d6fa5]"
                        )}
                      >
                        <span>{l.label}</span>
                        {active && <span className="h-2 w-2 rounded-full bg-[#1d6fa5]" />}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Auth in Mobile Sheet */}
              <div className="border-t border-border pt-4">
                {!session ? (
                  <Button asChild className="w-full rounded-xl bg-gradient-to-r from-[#1d6fa5] to-[#257ba6] text-white font-bold py-3 shadow-md" onClick={() => setOpen(false)}>
                    <Link href="/auth/sign-in">Sign In to Explorify</Link>
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 p-2 bg-accent/40 rounded-xl">
                    <ProfileMenu user={session.user} />
                    <div>
                      <p className="text-sm font-bold text-foreground">{session.user?.name || "Explorer"}</p>
                      <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Dedicated Bottom Sub-Bar: Navigation Links ONLY (Spacious, Transparent & Larger Font) */}
      <div className="hidden lg:block border-t border-border/30 bg-transparent px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 sm:gap-4">
          {navLinks.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-full px-5 py-2 text-base font-bold transition-all duration-200 tracking-wide",
                  active
                    ? "bg-[#1d6fa5] text-white shadow-md scale-105"
                    : "text-foreground/85 hover:bg-[#1d6fa5]/12 hover:text-[#1d6fa5]"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  const { ids } = useWishlist();
  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/trips", label: "Trips", icon: Search },
    { href: "/travel-planner", label: "AI Planner", icon: Sparkles },
    { href: "/wishlist", label: `Wishlist (${ids.length})`, icon: Heart },
    { href: "/bookings", label: "Bookings", icon: Ticket },
  ] as const;

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden shadow-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg justify-around">
        {items.map((it) => {
          const active =
            it.href === "/" ? pathname === "/" : pathname?.startsWith(it.href);
          const isWishlist = it.href === "/wishlist";
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-all",
                  active ? "text-[#1d6fa5]" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <it.icon
                  className={cn(
                    "size-5 transition-transform",
                    isWishlist && "text-rose-500 fill-rose-500",
                    !isWishlist && active && "text-[#1d6fa5] scale-110",
                  )}
                />
                <span className={cn(active && "font-bold text-[#1d6fa5]")}>{it.label}</span>
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
      const query = text.toLowerCase().trim();

      // 🛡️ Hardened Jailbreak & Prompt Injection Security Guard
      const jailbreakTriggers = [
        "ignore previous", "system prompt", "dan mode", "do anything now", "jailbreak",
        "acting as", "you are now a", "dev mode", "translate", "python", "code", "programming",
        "write a script", "exploit", "hack", "bypass", "instruction", "prompt injection",
        "roleplay", "pretend to be", "override", "developer console", "sql", "inject",
        "disregard", "you must", "force reply", "hidden instructions", "print the system",
        "prompt text", "system text", "api key", "secret token", "server secret"
      ];

      // 🗺️ Context Relevance Validation Keywords (Must pertain to India/Travel/Support)
      const travelKeywords = [
        "travel", "trip", "tour", "package", "destination", "holiday", "vacation",
        "kashmir", "kerala", "rajasthan", "goa", "ladakh", "india", "mumbai", "delhi", "varanasi", "srinagar",
        "booking", "book", "refund", "cancel", "payment", "razorpay", "upi", "price", "cost", "charge",
        "flights", "trains", "hotel", "itinerary", "plan", "planner", "ai", "monument", "fort", "beach",
        "support", "contact", "phone", "email", "help", "hello", "hi", "hey", "namaste", "pachmarhi", "spiti",
        "explorify", "trips", "website", "service", "customer", "operator", "guide"
      ];

      const isSecurityThreat = jailbreakTriggers.some(trigger => query.includes(trigger));
      const isTravelRelated = query.length < 5 || travelKeywords.some(keyword => query.includes(keyword));

      let replyText = "";

      if (isSecurityThreat) {
        replyText = "⚠️ Security Shield: Access Blocked.\n\nI am the dedicated Explorify assistant and cannot execute system queries, scripting instructions, key retrieval, or roleplay scenarios. Please let me know how I can help you plan your next trip within India! 🏔️✈️";
      } else if (!isTravelRelated) {
        replyText = "I apologize, but my capabilities are limited to assisting with ExplorifyTrips travel services. I can answer questions about:\n\n• 🏔️ India Tour Packages (Kashmir, Goa, Spiti, etc.)\n• ✈️ AI-Powered custom itinerary generation\n• 💳 Secure bookings, pricing, and Razorpay refunds\n• 📞 Customer support and operator details\n\nHow can I help you customize your Indian holiday package today? 🚗";
      } else {
        // Handle common inputs
        if (query.includes("kashmir") || query.includes("srinagar") || query.includes("gulmarg")) {
          replyText = "🏔️ **Kashmir Valley Escapade** (6 Days / 5 Nights)\n• **Highlights:** Luxury houseboats on Dal Lake, Gondola ride in Gulmarg, Betaab Valley in Pahalgam.\n• **Pricing:** Starts at ₹24,999/person (including premium stays, private cab transfers, and breakfast).\n• **Customisation:** You can configure a tailored flight/train itinerary using our **'Plan with AI'** planner in the header bar!";
        } else if (query.includes("goa") || query.includes("beach")) {
          replyText = "🏖️ **Scenic Goa Beach Escapade** (5 Days / 4 Nights)\n• **Highlights:** Sunset boat cruise on Mandovi River, Scuba diving at Grand Island, guided tour of Old Goa Churches.\n• **Pricing:** Starts at ₹12,999/person.\n• **Vibe:** Relaxed coastal holiday with verified beachside resorts.";
        } else if (query.includes("delhi") || query.includes("agra") || query.includes("vande bharat")) {
          replyText = "🚅 **Delhi-Agra Vande Bharat Tour** (2 Days / 1 Night)\n• **Highlights:** Taj Mahal & Agra Fort sunrise guide, executive class Vande Bharat train tickets, luxury Agra hotel stay.\n• **Pricing:** Starts at ₹4,999/person.\n• **Vibe:** Swift cultural weekend getaway.";
        } else if (query.includes("varanasi") || query.includes("ganga")) {
          replyText = "🙏 **Spiritual Varanasi Tour** (3 Days / 2 Nights)\n• **Highlights:** Evening Ganga Aarti boat ride, Subah-e-Banaras experience, Kashi Vishwanath corridor tour.\n• **Pricing:** Starts at ₹6,999/person.\n• **Vibe:** Holy ghats and rich Indian heritage.";
        } else if (query.includes("refund") || query.includes("cancel")) {
          replyText = "💳 **Cancellations & Refunds Policy**:\n• **15+ Days Before departure:** 100% full refund.\n• **7-14 Days Before departure:** 50% partial refund.\n• **Less than 7 Days:** Non-refundable (local reservations lock-in).\n\nAll refunds are processed securely via Razorpay back to your payment method in 5-7 business days. You can track this under 'My Bookings'.";
        } else if (query.includes("book") || query.includes("payment") || query.includes("razorpay")) {
          replyText = "✈️ **How to Book & Pay**:\n1. Choose your package from the 'Browse Trips' catalogue.\n2. Select an active departure date and specify the number of travellers.\n3. Verify your billing info and click 'Pay'.\n4. Pay securely using UPI, Credit Cards, or Net Banking via the Razorpay window.\n\nYour voucher is created instantly and stored in **'My Bookings'**!";
        } else if (query.includes("support") || query.includes("contact") || query.includes("phone") || query.includes("email")) {
          replyText = "📞 **Connect with Explorify Support**:\n• **Direct Line:** Tap the green WhatsApp button next to me to chat with our on-ground planners.\n• **Email Support:** hello@explorifytrips.com\n• **HQ Address:** Vijay Nagar, Indore, Madhya Pradesh.\n\nOur team is available 24/7 to resolve booking queries, custom packages, and payment details.";
        } else {
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
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-primary">
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
