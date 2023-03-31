/// <reference types="vitest" />
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    "test": {
        "alias": {
            "keycloakify": path.resolve(__dirname, "./src")
        },
        "watchExclude": ["**/node_modules/**", "**/dist/**", "**/sample_react_project/**", "**/sample_custom_react_project/**"]
    }
});
