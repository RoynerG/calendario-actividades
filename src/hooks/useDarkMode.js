import { useEffect, useState } from "react";

function getInitial() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(getInitial);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const target = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(target.classList.contains("dark"));
    });
    observer.observe(target, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}