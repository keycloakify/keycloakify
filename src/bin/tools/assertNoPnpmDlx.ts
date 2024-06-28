import { sep as pathSep } from "path";

export function assertNoPnpmDlx() {
    if (__dirname.includes(`${pathSep}pnpm${pathSep}dlx${pathSep}`)) {
        console.log(
            [
                "Please don't use `pnpm dlx keycloakify`.",
                "\nUse `npx keycloakify` or `pnpm exec keycloakify` instead since you want to use the",
                "keycloakify version that is installed in your project and not the latest version on NPM."
            ].join(" ")
        );
        process.exit(1);
    }
}
