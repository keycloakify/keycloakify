#!/usr/bin/env node

export * from "./keycloakify";
import { setLogLevel } from "../tools/logger";
import { main } from "./keycloakify";

if (require.main === module) {
    setLogLevel();
    main();
}
