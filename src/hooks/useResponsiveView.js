import { useEffect, useState } from "react";

export function useResponsiveView() {
  const [view, setView] = useState("day");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 639px)");
    const handleChange = (e) => {
      if (e.matches) setView("day");
    };
    handleChange(mq);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return [view, setView];
}
