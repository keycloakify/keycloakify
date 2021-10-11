#!/usr/bin/env node

export * from "./build-keycloak-theme";
import { main } from "./build-keycloak-theme";

if (require.main === module) {
    main();
}
