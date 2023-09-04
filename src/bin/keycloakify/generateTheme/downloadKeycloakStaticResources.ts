import { transformCodebase } from "../../tools/transformCodebase";
import * as fs from "fs";
import { join as pathJoin } from "path";
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
            resourcesFilePaths: string[];
        } | undefined;
        buildOptions: BuildOptionsLike;
    }
) {
    const { themeType, themeDirPath, keycloakVersion, usedResources, buildOptions } = params;

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
        "destDirPath": resourcesPath,
        "transformSourceCode":
            usedResources === undefined
                ? undefined
                : ({ fileRelativePath, sourceCode }) => {
                      if (!usedResources.resourcesFilePaths.includes(fileRelativePath)) {
                          return undefined;
                      }

                      return { "modifiedSourceCode": sourceCode };
                  }
    });

    transformCodebase({
        "srcDirPath": pathJoin(tmpDirPath, "keycloak", "common", "resources"),
        "destDirPath": pathJoin(resourcesPath, resources_common),
        "transformSourceCode":
            usedResources === undefined
                ? undefined
                : ({ fileRelativePath, sourceCode }) => {
                      if (!usedResources.resourcesCommonFilePaths.includes(fileRelativePath)) {
                          return undefined;
                      }

                      return { "modifiedSourceCode": sourceCode };
                  }
    });

    fs.rmSync(tmpDirPath, { "recursive": true, "force": true });
}
