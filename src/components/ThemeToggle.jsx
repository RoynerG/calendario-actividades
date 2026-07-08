import { FaSun, FaMoon } from "react-icons/fa";
import { useThemeMode } from "../contexts/useThemeMode";

export default function ThemeToggle({ className = "", style = {} }) {
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === "dark";
  const classes = [
    "theme-toggle-button",
    isDark ? "theme-toggle-button--dark" : "theme-toggle-button--light",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      style={style}
      className={classes}
    >
      {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
      <span className="global-floating-label">
        {isDark ? "Claro" : "Oscuro"}
      </span>
    </button>
  );
}
