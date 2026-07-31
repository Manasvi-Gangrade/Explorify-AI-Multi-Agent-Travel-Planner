"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // multiplier from INR base
  label: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: "INR", symbol: "₹", rate: 1, label: "INR (₹)" },
  USD: { code: "USD", symbol: "$", rate: 0.012, label: "USD ($)" },
  EUR: { code: "EUR", symbol: "€", rate: 0.011, label: "EUR (€)" },
  GBP: { code: "GBP", symbol: "£", rate: 0.0095, label: "GBP (£)" },
  AED: { code: "AED", symbol: "AED ", rate: 0.044, label: "AED" },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (priceInINR: number) => string;
  config: CurrencyConfig;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "INR",
  setCurrency: () => {},
  formatPrice: (p) => `₹${p.toLocaleString("en-IN")}`,
  config: CURRENCIES.INR,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("INR");

  useEffect(() => {
    const saved = localStorage.getItem("explorify_currency") as CurrencyCode;
    if (saved && CURRENCIES[saved]) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem("explorify_currency", c);
  };

  const config = CURRENCIES[currency] || CURRENCIES.INR;

  const formatPrice = (priceInINR: number): string => {
    if (!priceInINR || isNaN(priceInINR)) return `${config.symbol}0`;
    const converted = Math.round(priceInINR * config.rate);
    if (currency === "INR") {
      return `₹${priceInINR.toLocaleString("en-IN")}`;
    }
    return `${config.symbol}${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, config }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
