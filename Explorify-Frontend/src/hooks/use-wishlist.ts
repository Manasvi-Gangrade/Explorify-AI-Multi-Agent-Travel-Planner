import { useCallback, useEffect, useSyncExternalStore } from "react";

const KEY = "explorify.wishlist";
const listeners = new Set<() => void>();
let cache: string[] = [];

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return cache;
}

function getServerSnapshot() {
  return cache;
}

export function useWishlist() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const stored = read();
    if (stored.join(",") !== cache.join(",")) {
      cache = stored;
      emit();
    }
  }, []);

  const toggle = useCallback((id: string) => {
    const next = cache.includes(id)
      ? cache.filter((x) => x !== id)
      : [...cache, id];
    cache = next;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    emit();
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, toggle, has };
}
