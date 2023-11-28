import { transformCodebase } from "../../tools/transformCodebase";
import * as fs from "fs";
import { join as pathJoin, dirname as pathDirname } from "path";
import { downloadBuiltinKeycloakTheme } from "../../download-builtin-keycloak-theme";
import { resources_common, type ThemeType } from "../../constants";
import { BuildOptions } from "../BuildOptions";
import { assert } from "tsafe/assert";
import * as crypto from "crypto";

export type BuildOptionsLike = {
    cacheDirPath: string;
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function downloadKeycloakStaticResources(
    // prettier-ignore
    params: {
        themeType: ThemeType;
        themeDirPath: string;
        keycloakVersion: string;
        usedResources: {
            resourcesCommonFilePaths: string[];
        } | undefined;
        buildOptions: BuildOptionsLike;
    }
) {
    const { themeType, themeDirPath, keycloakVersion, buildOptions } = params;

    // NOTE: Hack for 427
    const usedResources = (() => {
        const { usedResources } = params;

        if (usedResources === undefined) {
            return undefined;
        }

        assert(usedResources !== undefined);

        return {
            "resourcesCommonDirPaths": usedResources.resourcesCommonFilePaths.map(filePath => {
                {
                    const splitArg = "/dist/";

                    if (filePath.includes(splitArg)) {
                        return filePath.split(splitArg)[0] + splitArg;
                    }
                }

                return pathDirname(filePath);
            })
        };
    })();

    const tmpDirPath = pathJoin(
        themeDirPath,
        `tmp_suLeKsxId_${crypto.createHash("sha256").update(`${themeType}-${keycloakVersion}`).digest("hex").slice(0, 8)}`
    );

    await downloadBuiltinKeycloakTheme({
        keycloakVersion,
        "destDirPath": tmpDirPath,
        buildOptions
    });

    const resourcesPath = pathJoin(themeDirPath, themeType, "resources");

    transformCodebase({
        "srcDirPath": pathJoin(tmpDirPath, "keycloak", themeType, "resources"),
        "destDirPath": resourcesPath
    });

    transformCodebase({
        "srcDirPath": pathJoin(tmpDirPath, "keycloak", "common", "resources"),
        "destDirPath": pathJoin(resourcesPath, resources_common),
        "transformSourceCode":
            usedResources === undefined
                ? undefined
                : ({ fileRelativePath, sourceCode }) => {
                      if (usedResources.resourcesCommonDirPaths.find(dirPath => fileRelativePath.startsWith(dirPath)) === undefined) {
                          return undefined;
                      }

                      return { "modifiedSourceCode": sourceCode };
                  }
    });

    fs.rmSync(tmpDirPath, { "recursive": true, "force": true });
}
