import { execSync } from "child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";

const testDir = "keycloakify_starter_test";

if (existsSync(path.join(process.cwd(), testDir))) {
    rmSync(path.join(process.cwd(), testDir), { recursive: true });
}
// Build and link package
execSync("yarn build");
const pkgJSON = JSON.parse(readFileSync(path.join(process.cwd(), "package.json")).toString("utf8"));
pkgJSON.main = "./index.js";
pkgJSON.types = "./index.d.ts";
pkgJSON.scripts.prepare = undefined;
writeFileSync(path.join(process.cwd(), "dist", "package.json"), JSON.stringify(pkgJSON));
// Wrapped in a try/catch because unlink errors if the package isn't linked
try {
    execSync("yarn unlink");
} catch {}
execSync("yarn link", { cwd: path.join(process.cwd(), "dist") });

// Clone latest keycloakify-starter and link to keycloakify output
execSync(`git clone https://github.com/keycloakify/keycloakify-starter.git ${testDir}`);
execSync("yarn install", { cwd: path.join(process.cwd(), testDir) });
execSync("yarn link keycloakify", { cwd: path.join(process.cwd(), testDir) });

//Ensure keycloak theme can be built
execSync("yarn build-keycloak-theme", { cwd: path.join(process.cwd(), testDir) });
