"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, chatApi, normalizeUser, type User } from "@/lib/chat-api";

const SEARCH_MIN_LENGTH = 2;
const DEBOUNCE_MS = 300;

/**
 * Debounced people search shared by the new-conversation dialog and the
 * group details panel. `excludeIds` filters out yourself / already-picked
 * members so they never appear as actionable results.
 */
export function useUserSearch(token: string, excludeIds: string[] = []) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const trimmed = query.trim();
  // Joined into one primitive so fresh arrays from callers don't retrigger.
  const excludeKey = excludeIds.join(",");

  useEffect(() => {
    if (trimmed.length < SEARCH_MIN_LENGTH) {
      setResults([]);
      setSearching(false);
      setError(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setSearching(true);
    setError(null);

    const timer = window.setTimeout(async () => {
      try {
        const raw = await chatApi.search(token, trimmed);
        if (requestId !== requestIdRef.current) return;
        const list = Array.isArray(raw) ? raw : (raw?.data ?? raw?.users ?? []);
        const excluded = new Set(
          excludeKey ? excludeKey.split(",").filter(Boolean) : [],
        );
        setResults(
          list
            .map(normalizeUser)
            .filter((user: User) => user.id && !excluded.has(user.id)),
        );
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setResults([]);
        setError(
          err instanceof ApiError
            ? `Search failed: ${err.message}`
            : "Search failed. Check your connection and try again.",
        );
      } finally {
        if (requestId === requestIdRef.current) setSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [excludeKey, token, trimmed]);

  return {
    query,
    setQuery,
    results,
    searching,
    error,
    minLength: SEARCH_MIN_LENGTH,
  };
}
