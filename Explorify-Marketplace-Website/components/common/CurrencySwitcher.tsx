"use client";

import { useCurrency, CURRENCIES, CurrencyCode } from "@/hooks/use-currency";
import { Coins } from "lucide-react";

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="relative inline-flex items-center gap-0.5 px-1.5 py-1 rounded-full bg-white dark:bg-slate-900 text-[#1d6fa5] shadow-sm border border-[#1d6fa5]/35 text-[11px] font-semibold shrink-0 transition-all hover:border-[#1d6fa5]">
      <Coins className="size-3.5 shrink-0 text-[#1d6fa5]" />
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        aria-label="Select currency"
        className="bg-transparent text-[#1d6fa5] dark:text-sky-300 font-bold text-[11px] outline-none cursor-pointer pr-0.5 max-w-[55px] sm:max-w-none"
      >
        {Object.values(CURRENCIES).map((c) => (
          <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-foreground font-medium">
            {c.symbol} {c.code}
          </option>
        ))}
      </select>
    </div>
  );
}
