// index.ts

import type { Plugin, ResolvedConfig } from "vite";
import * as fs from "fs";

console.log("Hello world!");

export function keycloakify(): Plugin {
    let config: ResolvedConfig;

    return {
        "name": "keycloakify",

        "configResolved": resolvedConfig => {
            // Store the resolved config
            config = resolvedConfig;

            console.log("========> configResolved", config);

            fs.writeFileSync("/Users/joseph/github/keycloakify-starter/log.txt", Buffer.from("Hello World", "utf8"));
        },

        "buildStart": () => {
            console.log("Public Directory:", config.publicDir); // Path to the public directory
            console.log("Dist Directory:", config.build.outDir); // Path to the dist directory
            console.log("Assets Directory:", config.build.assetsDir); // Path to the assets directory within outDir
        }

        // ... other hooks
    };
}
