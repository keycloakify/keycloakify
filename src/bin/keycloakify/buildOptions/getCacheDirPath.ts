import { join as pathJoin } from "path";
import { getAbsoluteAndInOsFormatPath } from "../../tools/getAbsoluteAndInOsFormatPath";

export function getCacheDirPath(params: { reactAppRootDirPath: string }) {
    const { reactAppRootDirPath } = params;

    const cacheDirPath = pathJoin(
        (() => {
            if (process.env.XDG_CACHE_HOME !== undefined) {
                return getAbsoluteAndInOsFormatPath({
                    "pathIsh": process.env.XDG_CACHE_HOME,
                    "cwd": reactAppRootDirPath
                });
            }

            // TODO: Recursively look up
            return pathJoin(reactAppRootDirPath, "node_modules", ".cache");
        })(),
        "keycloakify"
    );

    return { cacheDirPath };
}
