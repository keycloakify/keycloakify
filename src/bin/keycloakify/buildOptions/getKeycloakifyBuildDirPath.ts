import { getAbsoluteAndInOsFormatPath } from "../../tools/getAbsoluteAndInOsFormatPath";
import { join as pathJoin } from "path";

export function getKeycloakifyBuildDirPath(params: {
    reactAppRootDirPath: string;
    parsedPackageJson_keycloakify_keycloakifyBuildDirPath: string | undefined;
    bundler: "vite" | "webpack";
}) {
    const { reactAppRootDirPath, parsedPackageJson_keycloakify_keycloakifyBuildDirPath, bundler } = params;

    const keycloakifyBuildDirPath = (() => {
        if (parsedPackageJson_keycloakify_keycloakifyBuildDirPath !== undefined) {
            getAbsoluteAndInOsFormatPath({
                "pathIsh": parsedPackageJson_keycloakify_keycloakifyBuildDirPath,
                "cwd": reactAppRootDirPath
            });
        }

        return pathJoin(
            reactAppRootDirPath,
            `${(() => {
                switch (bundler) {
                    case "vite":
                        return "dist";
                    case "webpack":
                        return "build";
                }
            })()}_keycloak`
        );
    })();

    return { keycloakifyBuildDirPath };
}
