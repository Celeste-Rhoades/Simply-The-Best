import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import jsconfigPaths from 'vite-jsconfig-paths'

const env = loadEnv("development", "./")


// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), jsconfigPaths()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: env.VITE_BACKEND_URL,
      },
    }
  }
});