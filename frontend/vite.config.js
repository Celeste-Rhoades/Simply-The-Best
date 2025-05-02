import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  theme: {
    colors: {
      darkBlue: "#006895",
      cerulean: "#0799ba",
      lightTeal: "#1fa5b0",
      seaFoamGreen: "#8ec1b8",
      lightTanGrey: "##f6f5f2",
    },
  },
  plugins: [tailwindcss(), react()],
});
