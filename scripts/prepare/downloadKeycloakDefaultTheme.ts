import { relative as pathRelative } from "path";
import { downloadAndExtractArchive } from "../../src/bin/tools/downloadAndExtractArchive";
import { getProxyFetchOptions } from "../../src/bin/tools/fetchProxyOptions";
import { join as pathJoin } from "path";
import { getThisCodebaseRootDirPath } from "../../src/bin/tools/getThisCodebaseRootDirPath";

export async function downloadKeycloakDefaultTheme(params: { keycloakVersion: string }) {
    const { keycloakVersion } = params;

    const { extractedDirPath } = await downloadAndExtractArchive({
        url: `https://repo1.maven.org/maven2/org/keycloak/keycloak-themes/${keycloakVersion}/keycloak-themes-${keycloakVersion}.jar`,
        cacheDirPath: pathJoin(
            getThisCodebaseRootDirPath(),
            "node_modules",
            ".cache",
            "scripts"
        ),
        fetchOptions: getProxyFetchOptions({
            npmConfigGetCwd: getThisCodebaseRootDirPath()
        }),
        uniqueIdOfOnArchiveFile: "downloadKeycloakDefaultTheme",
        onArchiveFile: async ({ fileRelativePath, writeFile }) => {
            const fileRelativePath_target = pathRelative("theme", fileRelativePath);

            if (fileRelativePath_target.startsWith("..")) {
                return;
            }

            await writeFile({ fileRelativePath: fileRelativePath_target });
        }
    });

    return { extractedDirPath };
}
