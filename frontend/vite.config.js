// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
    const isDev = command === "serve";

    return {
        plugins: [react()],

        ...(isDev && {
            server: {
                proxy: {
                    "/api": {
                        target: "http://localhost:8000",
                        changeOrigin: true,
                    },
                },
            },
        }),
    };
});
