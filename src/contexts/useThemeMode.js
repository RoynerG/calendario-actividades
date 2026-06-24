import { useContext } from "react";
import { ThemeContext } from "./themeContextStore";

export function useThemeMode() {
  return useContext(ThemeContext);
}
