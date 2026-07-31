"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function VoiceNavigationAssistant({ className }: { className?: string }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const router = useRouter();
  const silenceTimerRef = useRef<any>(null);
  const lastExecutedTextRef = useRef<string>("");

  // Mic starts OFF by default on page load/visit
  useEffect(() => {
    setIsListening(false);
    isListeningRef.current = false;
  }, []);

  // Initialize Web Speech Recognition with en-IN locale & reliable pause detection
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
    };

    recognition.onresult = (event: any) => {
      let finalSpeech = "";
      let interimSpeech = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalSpeech += " " + transcript;
        } else {
          interimSpeech += " " + transcript;
        }
      }

      // If browser signals FINAL sentence, process immediately!
      if (finalSpeech.trim()) {
        const clean = finalSpeech.trim();
        if (clean !== lastExecutedTextRef.current) {
          lastExecutedTextRef.current = clean;
          processVoiceCommand(clean);
        }
        return;
      }

      // Otherwise, wait for 800ms silence before executing interim speech
      if (interimSpeech.trim()) {
        const cleanInterim = interimSpeech.trim();
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (cleanInterim && cleanInterim !== lastExecutedTextRef.current) {
            lastExecutedTextRef.current = cleanInterim;
            processVoiceCommand(cleanInterim);
          }
        }, 800);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition notice:", event.error);
      if (isListeningRef.current && event.error !== "not-allowed") {
        setTimeout(() => {
          try { recognition.start(); } catch (e) {}
        }, 400);
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          setTimeout(() => {
            if (isListeningRef.current) {
              try { recognition.start(); } catch (err) {}
            }
          }, 300);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isListeningRef.current = false;
      try { recognition.stop(); } catch (e) {}
    };
  }, []);

  const startAssistant = () => {
    if (!recognitionRef.current) return;
    isListeningRef.current = true;
    setIsListening(true);
    sessionStorage.setItem("explorify_voice_assistant_on", "true");
    try {
      recognitionRef.current.start();
    } catch (e) {}
  };

  const stopAssistant = () => {
    isListeningRef.current = false;
    setIsListening(false);
    sessionStorage.setItem("explorify_voice_assistant_on", "false");
    try {
      recognitionRef.current.stop();
    } catch (e) {}
  };

  const toggleAssistant = () => {
    if (!isSupported) {
      toast.error("Voice recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    if (isListeningRef.current) {
      stopAssistant();
    } else {
      startAssistant();
    }
  };

  // Safe React input & change event dispatcher
  const fillElementValue = (el: HTMLInputElement | HTMLTextAreaElement, value: string) => {
    el.focus();
    el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };

  // =========================================================================
  // UNIVERSAL DOM CLICKER UTILITY
  // Scans all visible buttons, links, and clickable elements for matching text!
  // =========================================================================
  const tryClickElementByText = (targetText: string): boolean => {
    const cleanTarget = targetText.toLowerCase().trim();
    if (!cleanTarget) return false;

    const clickables = Array.from(
      document.querySelectorAll<HTMLElement>("button, a, [role='button'], input[type='button'], input[type='submit']")
    );

    // 1. Exact or startsWith text match
    for (const el of clickables) {
      const text = (el.innerText || el.textContent || el.getAttribute("aria-label") || el.getAttribute("title") || "").toLowerCase().trim();
      if (text && (text === cleanTarget || text.startsWith(cleanTarget))) {
        el.click();
        return true;
      }
    }

    // 2. Contains word match
    for (const el of clickables) {
      const text = (el.innerText || el.textContent || el.getAttribute("aria-label") || el.getAttribute("title") || "").toLowerCase().trim();
      if (text && text.includes(cleanTarget)) {
        el.click();
        return true;
      }
    }

    return false;
  };

  // =========================================================================
  // SMART INTELLIGENT VOICE COMMAND & FORM ENGINE
  // =========================================================================
  const processVoiceCommand = (rawSpeech: string) => {
    const p = rawSpeech.toLowerCase().trim();
    if (!p) return;

    // 1. OFF / DEACTIVATE
    if (p === "off" || p.includes("turn off") || p.includes("stop listening") || p.includes("deactivate")) {
      stopAssistant();
      return;
    }

    // 2. ACTIVE INPUT FOCUS DICTATION (If user clicked inside an input field)
    const activeEl = document.activeElement as HTMLElement | null;
    if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
      const inputEl = activeEl as HTMLInputElement | HTMLTextAreaElement;

      if (p.includes("clear input") || p.includes("erase text")) {
        fillElementValue(inputEl, "");
        return;
      }
      if (p.includes("submit form") || p.includes("press enter") || p.includes("search")) {
        const form = inputEl.closest("form");
        if (form) form.requestSubmit();
        return;
      }

      // Dictate spoken text into active input field
      const cleanDictation = rawSpeech.replace(/^(my|the|type|write|fill|set|enter)\s+/i, "").trim();
      fillElementValue(inputEl, cleanDictation);
      return;
    }

    // 3. EXPLICIT UNIVERSAL CLICK COMMANDS ("click view", "press book", "open sign in", etc.)
    if (p.startsWith("click ") || p.startsWith("press ") || p.startsWith("open ") || p.startsWith("select ")) {
      const target = p.replace(/^(click|press|open|select)\s+/i, "").trim();
      if (tryClickElementByText(target)) {
        return;
      }
    }

    // 4. FORM AUTOFILLING BY INTENT
    // --- STARTING CITY ---
    if (p.includes("from ") || p.includes("starting city") || p.includes("start city") || p.startsWith("city ")) {
      const val = rawSpeech.replace(/^(from|starting city|start city|city)\s+/i, "").trim();
      const input = document.querySelector<HTMLInputElement>(
        "input[placeholder*='city'], input[placeholder*='Indore'], input[name*='start'], input[name*='from'], input[placeholder*='Starting']"
      );
      if (input && val) {
        fillElementValue(input, val);
        return;
      }
    }

    // --- DESTINATION ---
    if (p.includes("destination ") || p.startsWith("to ") || p.includes("going to ")) {
      const val = rawSpeech.replace(/^(destination is|destination|to|going to|set destination)\s+/i, "").trim();
      const input = document.querySelector<HTMLInputElement>(
        "input[placeholder*='destination'], input[placeholder*='Delhi'], input[name*='dest'], input[name*='to']"
      );
      if (input && val) {
        fillElementValue(input, val);
        return;
      }
    }

    // --- BUDGET ---
    if (p.includes("budget")) {
      const match = p.match(/\d+/);
      if (match) {
        const input = document.querySelector<HTMLInputElement>(
          "input[name*='budget'], input[placeholder*='15000'], input[placeholder*='Budget']"
        );
        if (input) {
          fillElementValue(input, match[0]);
          return;
        }
      }
    }

    // --- ADULTS ---
    if (p.includes("adult")) {
      const match = p.match(/\d+/);
      if (match) {
        const input = document.querySelector<HTMLInputElement>(
          "input[name*='adult'], input[placeholder*='Adult']"
        );
        if (input) {
          fillElementValue(input, match[0]);
          return;
        }
      }
    }

    // --- CHILDREN ---
    if (p.includes("child")) {
      const match = p.includes("no") || p.includes("zero") ? "0" : p.match(/\d+/)?.[0];
      if (match) {
        const input = document.querySelector<HTMLInputElement>(
          "input[name*='child'], input[placeholder*='Children']"
        );
        if (input) {
          fillElementValue(input, match);
          return;
        }
      }
    }

    // --- SPECIAL PREFERENCES ---
    if (p.includes("preference") || p.includes("notes") || p.includes("veg") || p.includes("luxury")) {
      const val = rawSpeech.replace(/^(preference|preferences|notes|special preference)\s+/i, "").trim();
      const textarea = document.querySelector<HTMLTextAreaElement>(
        "textarea, textarea[placeholder*='Vegetarian']"
      );
      if (textarea && val) {
        fillElementValue(textarea, val);
        return;
      }
    }

    // --- PASSENGER NAME ---
    if (p.includes("name")) {
      const val = rawSpeech.replace(/^(name is|my name is|my name|name|lead passenger)\s+/i, "").trim();
      const input = document.querySelector<HTMLInputElement>(
        "input[name*='name'], input[placeholder*='Name']"
      );
      if (input && val) {
        fillElementValue(input, val);
        return;
      }
    }

    // --- EMAIL ---
    if (p.includes("email")) {
      const val = rawSpeech.replace(/^(email is|my email is|my email|email)\s+/i, "").trim().replace(/\s+at\s+/gi, "@").replace(/\s+dot\s+/gi, ".");
      const input = document.querySelector<HTMLInputElement>(
        "input[type='email'], input[name*='email']"
      );
      if (input && val) {
        fillElementValue(input, val);
        return;
      }
    }

    // --- PHONE ---
    if (p.includes("phone") || p.includes("mobile")) {
      const digits = p.replace(/\D/g, "");
      const input = document.querySelector<HTMLInputElement>(
        "input[type='tel'], input[name*='phone'], input[name*='mobile']"
      );
      if (input && digits) {
        fillElementValue(input, digits);
        return;
      }
    }

    // --- TRAVELERS ---
    if (p.includes("traveler") || p.includes("guest")) {
      const match = p.match(/\d+/);
      if (match) {
        const input = document.querySelector<HTMLInputElement>(
          "input[name*='traveler'], input[name*='guest'], input[placeholder*='Traveler']"
        );
        if (input) {
          fillElementValue(input, match[0]);
          return;
        }
      }
    }

    // 5. INTENT-BASED BUTTON CLICKING
    // --- VIEW / VIEW DETAILS ---
    if (p === "view" || p.includes("view trip") || p.includes("view details") || p.includes("show details")) {
      if (tryClickElementByText("view")) return;
    }

    // --- BOOK / BOOK NOW ---
    if (p === "book" || p.includes("book now") || p.includes("book trip") || p.includes("reserve")) {
      if (tryClickElementByText("book now") || tryClickElementByText("book") || tryClickElementByText("reserve")) return;
    }

    // --- PLAN MY TRIP / SUBMIT PLANNER ---
    if (p.includes("plan my trip") || p.includes("generate plan") || p.includes("submit planner") || p.includes("plan trip")) {
      if (tryClickElementByText("plan my trip") || tryClickElementByText("plan")) return;
    }

    // --- PAY / RAZORPAY ---
    if (p.includes("pay") || p.includes("razorpay") || p.includes("confirm booking") || p.includes("pay now")) {
      if (tryClickElementByText("pay") || tryClickElementByText("razorpay")) return;
    }

    // --- DOWNLOAD TICKET ---
    if (p.includes("download") || p.includes("ticket") || p.includes("pdf")) {
      if (tryClickElementByText("download") || tryClickElementByText("ticket")) return;
    }

    // --- SIGN IN / LOGIN ---
    if (p.includes("sign in") || p.includes("login") || p.includes("log in")) {
      if (tryClickElementByText("sign in") || tryClickElementByText("login")) return;
    }

    // --- SIGN OUT / LOGOUT ---
    if (p.includes("sign out") || p.includes("logout") || p.includes("log out")) {
      if (tryClickElementByText("sign out") || tryClickElementByText("logout")) return;
    }

    // --- WISHLIST / SAVE ---
    if (p.includes("wishlist") || p.includes("favorite") || p.includes("heart")) {
      const heartBtn = document.querySelector<HTMLButtonElement>("button[aria-label*='wishlist'], button[aria-label*='Save']");
      if (heartBtn) {
        heartBtn.click();
        return;
      }
    }

    // 6. DESTINATION NAVIGATION INTENTS
    const destinationRoutes = [
      { keys: ["kashmir", "gulmarg", "pahalgam", "srinagar"], route: "/trips/fitoor-e-kashmir" },
      { keys: ["goa", "north goa", "south goa"], route: "/trips/goa-coastal-escape" },
      { keys: ["rajasthan", "jaipur", "udaipur", "jaisalmer", "jodhpur"], route: "/trips/royal-rajasthan" },
      { keys: ["ladakh", "leh", "pangong", "nubra"], route: "/trips/ladakh-high-passes" },
      { keys: ["kerala", "backwaters", "alleppey", "munnar", "kochi"], route: "/trips/kerala-backwaters" },
      { keys: ["spiti", "kaza"], route: "/trips/spiti-valley-circuit" },
      { keys: ["varanasi", "rishikesh", "haridwar", "ganges"], route: "/trips/varanasi-rishikesh-soul" },
      { keys: ["meghalaya", "shillong", "cherrapunji"], route: "/trips/meghalaya-living-roots" },
      { keys: ["pachmarhi", "satpura"], route: "/trips/pachmarhi-satpura" },
    ];

    for (const dest of destinationRoutes) {
      for (const k of dest.keys) {
        if (p.includes(k)) {
          router.push(dest.route);
          return;
        }
      }
    }

    // 7. PAGE NAVIGATION ROUTING
    if (p.includes("planner") || p.includes("itinerary")) {
      router.push("/travel-planner");
      return;
    }
    if (p.includes("blog") || p.includes("article")) {
      router.push("/blog");
      return;
    }
    if (p.includes("booking") || p.includes("my bookings")) {
      router.push("/bookings");
      return;
    }
    if (p.includes("home") || p.includes("main page")) {
      router.push("/");
      return;
    }
    if (p.includes("trips") || p.includes("packages") || p.includes("explore")) {
      router.push("/trips");
      return;
    }

    // 8. SCROLLING (Down, Up, Top, Bottom, Neeche, Uper)
    if (p.includes("down") || p.includes("neeche") || p.includes("niche")) {
      const amt = p.includes("bottom") ? document.body.scrollHeight : 600;
      window.scrollBy({ top: amt, behavior: "smooth" });
      return;
    }
    if (p.includes("up") || p.includes("uper") || p.includes("top")) {
      const amt = p.includes("top") ? -window.scrollY : -600;
      window.scrollBy({ top: amt, behavior: "smooth" });
      return;
    }

    // 9. DYNAMIC GENERIC BUTTON CLICK FALLBACK
    // If user says "click [anything]" or just a button label present on screen
    if (tryClickElementByText(p)) {
      return;
    }

    // 10. FALLBACK SEARCH
    const cleanSearch = p.replace(/(i want to|show me|take me to|find|search|explore)/gi, "").trim();
    if (cleanSearch.length > 1) {
      router.push(`/trips?search=${encodeURIComponent(cleanSearch)}`);
    }
  };

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      {/* MIC ICON BUTTON - SOLID OPAQUE BRAND BLUE WHEN ACTIVE */}
      <button
        type="button"
        onClick={toggleAssistant}
        aria-label="Toggle Voice Navigation Assistant"
        title={isListening ? "Disable Voice Navigation Assistant" : "Enable Voice Navigation Assistant"}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all shadow-sm border ${
          isListening
            ? "bg-[#1d6fa5] text-white border-[#1d6fa5] shadow-md hover:bg-[#185d8b]"
            : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:border-[#1d6fa5] hover:text-[#1d6fa5]"
        }`}
      >
        {isListening ? (
          <Mic className="size-4 text-white shrink-0 animate-pulse" />
        ) : (
          <MicOff className="size-4 shrink-0" />
        )}
      </button>
    </div>
  );
}
