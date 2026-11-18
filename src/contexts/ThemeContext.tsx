"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { STORAGE_KEYS, writeStorage } from "@/services/storage";

type Theme = "light" | "dark";
interface ThemeContextValue { theme: Theme; toggleTheme: () => void; setTheme: (theme: Theme) => void; }
const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_CHANGE_EVENT = "eteon:theme-change";

function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

function getThemeSnapshot() {
  return window.localStorage.getItem(STORAGE_KEYS.theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const serializedTheme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => null);
  const theme = useMemo<Theme>(() => {
    if (!serializedTheme) return "light";
    try {
      return JSON.parse(serializedTheme) === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  }, [serializedTheme]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const setTheme = (next: Theme) => {
    writeStorage(STORAGE_KEYS.theme, next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(theme === "light" ? "dark" : "light"), setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
