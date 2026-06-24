import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./themeContextStore";

const STORAGE_KEY = "calendario_theme";
const VALID_MODES = ["light", "dark"];

function getInitialMode() {
  if (typeof window === "undefined") return "light";

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (VALID_MODES.includes(stored)) return stored;
  } catch {
    // localStorage no disponible (modo privado, etc.)
  }

  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefersDark ? "dark" : "light";
}

function applyModeToDocument(mode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(getInitialMode);

  useEffect(() => {
    applyModeToDocument(mode);

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignorar
    }

    window.dispatchEvent(new CustomEvent("themeChanged", { detail: { mode } }));
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (VALID_MODES.includes(stored)) return;
      } catch {
        // continuar
      }
      setModeState(e.matches ? "dark" : "light");
    };

    mq.addEventListener("change", handleSystemChange);
    return () => mq.removeEventListener("change", handleSystemChange);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode: (next) => {
        if (VALID_MODES.includes(next)) setModeState(next);
      },
      toggleTheme: () =>
        setModeState((prev) => (prev === "dark" ? "light" : "dark")),
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
