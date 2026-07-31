"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, memo } from "react";
import { Globe } from "lucide-react";

// --- GLOBAL TYPES FOR GOOGLE TRANSLATE ---
declare global {
    interface Window {
        googleTranslateElementInit: () => void;
        google: any;
    }
}

// --- PART 1: TEXT-TO-SPEECH (TTS) ON HOVER CONTEXT ---
interface TTSContextType {
    speak: (text: string, lang?: string) => void;
    stop: () => void;
    speaking: boolean;
    supported: boolean;
    ttsEnabled: boolean;
    setTtsEnabled: (enabled: boolean) => void;
}

const TTSContext = createContext<TTSContextType | undefined>(undefined);

export const TTSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [speaking, setSpeaking] = useState(false);
    const [supported, setSupported] = useState(false);

    // Speaker / Voice on hover OFF by default
    const [ttsEnabled, setTtsEnabled] = useState(false);
    const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

    // Initialize speech synthesis and load voices
    useEffect(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            setSupported(true);
            const updateVoices = () => {
                voicesRef.current = window.speechSynthesis.getVoices();
            };
            window.speechSynthesis.onvoiceschanged = updateVoices;
            updateVoices();
        }
    }, []);

    // Speak Function that auto-detects current Google Translate language
    const speak = useCallback((text: string, manualLang?: string) => {
        if (!supported || typeof window === "undefined") return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();

        // Detect current language from Google Translate Cookie
        let lang = manualLang;
        if (!lang) {
            const googCookie = document.cookie.match(/(^|;)\s*googtrans=([^;]+)/);
            if (googCookie) {
                // Extracts target language from cookie (e.g., "/en/hi" -> "hi")
                const parts = googCookie[2].split('/');
                lang = parts.length > 2 ? parts[2] : "en";
            } else {
                lang = "en"; // Default fallback
            }
        }

        // Try to find a voice that matches the selected language
        let preferredVoice = voices.find(v => v.lang.startsWith(lang as string) || v.lang.startsWith(lang?.toLowerCase() as string));

        // Final Fallback for all cases
        if (!preferredVoice) {
            preferredVoice = voices.find(v => v.lang.startsWith("en-US") || v.name.includes("Google US"));
        }

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [supported]);

    const stop = useCallback(() => {
        if (!supported || typeof window === "undefined") return;
        window.speechSynthesis.cancel();
        setSpeaking(false);
    }, [supported]);

    // Global Hover Listener to trigger speech
    useEffect(() => {
        if (!ttsEnabled || !supported || typeof window === "undefined") return;

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Target elements that usually contain readable text
            const interactable = target.closest('button, a, h1, h2, h3, h4, h5, h6, p, li, span, label');

            if (interactable) {
                // First look for screen-reader text, then alt text, then visible text
                const text = interactable.getAttribute('aria-label') ||
                    interactable.getAttribute('alt') ||
                    (interactable as HTMLElement).innerText;

                if (text && text.trim().length > 0) {
                    // Prevent reading extremely long chunks of text accidentally
                    if (text.length < 300) {
                        speak(text);
                    }
                }
            }
        };

        const handleMouseOut = () => {
            stop();
        };

        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);

        return () => {
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseout', handleMouseOut);
            stop();
        };
    }, [ttsEnabled, supported, speak, stop]);

    return (
        <TTSContext.Provider value={{ speak, stop, speaking, supported, ttsEnabled, setTtsEnabled }}>
            {children}
        </TTSContext.Provider>
    );
};

export const useTTS = () => {
    const context = useContext(TTSContext);
    if (!context) throw new Error("useTTS must be used within a TTSProvider");
    return context;
};

// --- PART 2: GOOGLE TRANSLATE WIDGET COMPONENT ---
export const GoogleTranslateWidget = memo(function GoogleTranslateWidget() {
    useEffect(() => {
        if (typeof window === "undefined") return;

        const cleanupGoogleTranslate = () => {
            if (document.body) {
                document.body.style.top = "0px";
                document.body.style.position = "static";
                document.body.style.marginTop = "0px";
            }
            if (document.documentElement) {
                document.documentElement.style.top = "0px";
                document.documentElement.style.marginTop = "0px";
            }

            // Remove any Google Translate injected floating popups, spinners, or badges
            const injectedSelectors = [
                ".goog-te-spinner-pos",
                ".goog-te-spinner",
                ".VIpgJd-yLiSp-bN9nOccupant",
                ".VIpgJd-yLiSp-L922fk",
                ".VIpgJd-yLiSp",
                ".VIpgJd-ZGainl",
                "#goog-gt-tt",
                ".goog-te-balloon-frame"
            ];

            injectedSelectors.forEach(sel => {
                try {
                    document.querySelectorAll(sel).forEach(el => el.remove());
                } catch {
                    // Ignore selector errors safely
                }
            });

            // Target all Google Translate iframe elements
            const iframes = document.querySelectorAll("iframe");
            iframes.forEach((iframe) => {
                const src = iframe.getAttribute("src") || "";
                const id = iframe.getAttribute("id") || "";
                const className = (typeof iframe.className === "string" ? iframe.className : "") || "";

                if (
                    className.includes("goog-te-banner-frame") ||
                    id.includes("goog") ||
                    src.includes("translate")
                ) {
                    iframe.style.setProperty("display", "none", "important");
                    iframe.style.setProperty("visibility", "hidden", "important");
                }
            });

            // Strip out "Powered by Google" text node from gadget container
            const gadgets = document.querySelectorAll(".goog-te-gadget");
            gadgets.forEach(g => {
                const textNodes = Array.from(g.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(t => t.remove());
            });
        };

        cleanupGoogleTranslate();
        const interval = setInterval(cleanupGoogleTranslate, 200);

        const initWidget = () => {
            if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        autoDisplay: false
                    },
                    'google_translate_element'
                );
            }
        };

        window.googleTranslateElementInit = initWidget;

        if (!document.getElementById("google-translate-script")) {
            const script = document.createElement("script");
            script.id = "google-translate-script";
            script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            document.body.appendChild(script);
        } else if (window.google && window.google.translate) {
            initWidget();
        }

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="relative inline-flex items-center gap-0.5 px-1.5 py-1 rounded-full bg-white dark:bg-slate-900 text-[#1d6fa5] shadow-sm border border-[#1d6fa5]/35 text-[11px] font-bold shrink-0 transition-all hover:border-[#1d6fa5]">
            <Globe className="size-3.5 shrink-0 text-[#1d6fa5]" />
            <div id="google_translate_element" className="inline-flex items-center"></div>

            <style jsx global>{`
                #google_translate_element .goog-te-gadget {
                    font-size: 0px !important;
                    color: transparent !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    display: inline-flex !important;
                    align-items: center !important;
                }
                #google_translate_element .goog-te-combo {
                    background-color: transparent !important;
                    border: none !important;
                    outline: none !important;
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    color: #1d6fa5 !important;
                    cursor: pointer !important;
                    padding: 0 2px !important;
                    margin: 0 !important;
                    height: auto !important;
                    max-width: 65px !important;
                }
                #google_translate_element span,
                #google_translate_element a {
                    display: none !important;
                }
                .goog-te-banner-frame,
                .goog-te-spinner-pos,
                .goog-te-spinner,
                .VIpgJd-yLiSp-bN9nOccupant,
                .VIpgJd-yLiSp-L922fk,
                .VIpgJd-yLiSp,
                .VIpgJd-ZGainl,
                #goog-gt-tt,
                .goog-te-balloon-frame {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    width: 0px !important;
                    height: 0px !important;
                }
                body {
                    top: 0px !important;
                    position: static !important;
                }
            `}</style>
        </div>
    );
});
