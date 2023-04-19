import { transformCodebase } from "../../tools/transformCodebase";
import * as fs from "fs";
import { join as pathJoin, relative as pathRelative } from "path";
import type { ThemeType } from "../generateFtl";
import { downloadBuiltinKeycloakTheme } from "../../download-builtin-keycloak-theme";
import {
    resourcesCommonDirPathRelativeToPublicDir,
    resourcesDirPathRelativeToPublicDir,
    basenameOfKeycloakDirInPublicDir
} from "../../mockTestingResourcesPath";
import * as crypto from "crypto";

export async function downloadKeycloakStaticResources(
    // prettier-ignore
    params: {
        themeType: ThemeType;
        themeDirPath: string;
        isSilent: boolean;
        keycloakVersion: string;
    }
) {
    const { themeType, isSilent, themeDirPath, keycloakVersion } = params;

    const tmpDirPath = pathJoin(
        themeDirPath,
        "..",
        `tmp_suLeKsxId_${crypto.createHash("sha256").update(`${themeType}-${keycloakVersion}`).digest("hex").slice(0, 8)}`
    );

    await downloadBuiltinKeycloakTheme({
        keycloakVersion,
        "destDirPath": tmpDirPath,
        isSilent
    });

    transformCodebase({
        "srcDirPath": pathJoin(tmpDirPath, "keycloak", themeType, "resources"),
        "destDirPath": pathJoin(themeDirPath, pathRelative(basenameOfKeycloakDirInPublicDir, resourcesDirPathRelativeToPublicDir))
    });

    transformCodebase({
        "srcDirPath": pathJoin(tmpDirPath, "keycloak", "common", "resources"),
        "destDirPath": pathJoin(themeDirPath, pathRelative(basenameOfKeycloakDirInPublicDir, resourcesCommonDirPathRelativeToPublicDir))
    });

    fs.rmSync(tmpDirPath, { "recursive": true, "force": true });
}
