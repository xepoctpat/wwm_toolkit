import { defineConfig } from "vite";

export default defineConfig({
    base: "./",
    root: "app",
    publicDir: "public",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
    },
    test: {
        include: ["../tests/**/*.test.ts"],
        environment: "node",
    },
});
