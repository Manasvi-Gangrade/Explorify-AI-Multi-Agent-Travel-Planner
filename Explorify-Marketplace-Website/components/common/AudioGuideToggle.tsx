"use client";

import { useTTS } from "@/components/common/StandaloneTranslateTTS";
import { Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

export function AudioGuideToggle() {
  const { ttsEnabled, setTtsEnabled, stop } = useTTS();

  const toggle = () => {
    if (ttsEnabled) {
      stop();
      setTtsEnabled(false);
      toast.info("Audio Voice Guide disabled.");
    } else {
      setTtsEnabled(true);
      toast.success("Audio Voice Guide enabled! Hover over any text to hear natural speech.");
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={ttsEnabled ? "Disable Audio Voice Guide" : "Enable Audio Voice Guide"}
      aria-label="Toggle Audio Voice Guide"
      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all shadow-sm border ${
        ttsEnabled
          ? "bg-[#1d6fa5] text-white border-[#1d6fa5] shadow-md hover:bg-[#185d8b]"
          : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:border-[#1d6fa5] hover:text-[#1d6fa5]"
      }`}
    >
      {ttsEnabled ? (
        <Volume2 className="size-4 text-white shrink-0" />
      ) : (
        <VolumeX className="size-4 shrink-0" />
      )}
    </button>
  );
}
