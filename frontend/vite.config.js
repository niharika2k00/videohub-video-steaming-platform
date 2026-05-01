import { defineConfig } from "vite";
import dotenv from "dotenv";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// load environment variables from .env file
dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // configured for importing modules from src(root) directory
    },
  },
  server: {
    host: true, // allow access from any device (mobile) on same network
    port: 5173, // frontend server default port (5173 for vite)
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_SERVER_URL, // backend server
        changeOrigin: true,
        secure: false,
      },
      "/s01/video": {
        target: process.env.VITE_NGINX_SERVER_URL, // nginx server
        changeOrigin: true,
      },
    },
    // assetsInclude: ["**/*.ts"],
    // middlewareMode: false,
    // fs: {
    //   allow: ["public"], // allow access to public folder
    // },
  },
});
