import { FaSun, FaMoon } from "react-icons/fa";
import { useThemeMode } from "../contexts/useThemeMode";

export default function ThemeToggle({ className = "", style = {} }) {
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === "dark";

  const buttonStyle = {
    padding: "0.6rem 1rem",
    borderRadius: "9999px",
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.35)",
    transition: "all 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    border: isDark ? "2px solid #fde047" : "2px solid #1f2937",
    cursor: "pointer",
    backgroundColor: isDark ? "#facc15" : "#1f2937",
    color: isDark ? "#111827" : "#fde047",
    fontWeight: 700,
    fontSize: "0.85rem",
    letterSpacing: "0.02em",
    zIndex: 200000,
    ...style,
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      style={buttonStyle}
      className={className}
    >
      {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
      <span>{isDark ? "Claro" : "Oscuro"}</span>
    </button>
  );
}
