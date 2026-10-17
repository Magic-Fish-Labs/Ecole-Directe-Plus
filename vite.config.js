import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { iframePlugins } from "./vite.iframe-plugins.js";

// Vite configuration
export default defineConfig({
    plugins: [
        react(),
        basicSsl(),
        ...iframePlugins(),
    ],
    server: {
        https: true,
        port: 3000,
    },
});
