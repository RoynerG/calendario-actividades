import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // → Redirige el AdapterDateFnsV3 al AdapterDateFns estándar
      "@mui/x-date-pickers/AdapterDateFnsV3":
        "@mui/x-date-pickers/AdapterDateFns",
    },
  },
});
