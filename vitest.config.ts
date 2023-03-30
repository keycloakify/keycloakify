/// <reference types="vitest" />
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    test: {
        alias: {
            "keycloakify": path.resolve(__dirname, "./src")
        }
    }
});
