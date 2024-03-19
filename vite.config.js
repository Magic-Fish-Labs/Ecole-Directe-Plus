import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        basicSsl()
    ],
    https: true,
    server: {
        port: 80,
        host: "0.0.0.0",
    },
})
