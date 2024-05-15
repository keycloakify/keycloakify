import { join as pathJoin } from "path";
import { getAbsoluteAndInOsFormatPath } from "../../tools/getAbsoluteAndInOsFormatPath";
import { getNpmWorkspaceRootDirPath } from "./getNpmWorkspaceRootDirPath";

export function getCacheDirPath(params: { reactAppRootDirPath: string }) {
    const { reactAppRootDirPath } = params;

    const { npmWorkspaceRootDirPath } = getNpmWorkspaceRootDirPath({ reactAppRootDirPath });

    const cacheDirPath = pathJoin(
        (() => {
            if (process.env.XDG_CACHE_HOME !== undefined) {
                return getAbsoluteAndInOsFormatPath({
                    "pathIsh": process.env.XDG_CACHE_HOME,
                    "cwd": reactAppRootDirPath
                });
            }

            return pathJoin(npmWorkspaceRootDirPath, "node_modules", ".cache");
        })(),
        "keycloakify"
    );

    return { cacheDirPath };
}
