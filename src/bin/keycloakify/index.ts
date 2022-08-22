#!/usr/bin/env node

export * from "./keycloakify";
import { main } from "./keycloakify";

if (require.main === module) {
    main();
}
