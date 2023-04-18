import { transformCodebase } from "../../tools/transformCodebase";
import * as fs from "fs";
import { join as pathJoin, relative as pathRelative } from "path";
import type { ThemeType } from "../generateFtl";
import { downloadBuiltinKeycloakTheme } from "../../download-builtin-keycloak-theme";
import { mockTestingResourcesCommonPath, mockTestingResourcesPath, mockTestingSubDirOfPublicDirBasename } from "../../mockTestingResourcesPath";

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

    const tmpDirPath = pathJoin(themeDirPath, "..", "tmp_suLeKsxId");

    await downloadBuiltinKeycloakTheme({
        keycloakVersion,
        "destDirPath": tmpDirPath,
        isSilent
    });

    transformCodebase({
        "srcDirPath": pathJoin(tmpDirPath, "keycloak", themeType, "resources"),
        "destDirPath": pathJoin(themeDirPath, pathRelative(mockTestingSubDirOfPublicDirBasename, mockTestingResourcesPath))
    });

    transformCodebase({
        "srcDirPath": pathJoin(tmpDirPath, "keycloak", "common", "resources"),
        "destDirPath": pathJoin(themeDirPath, pathRelative(mockTestingSubDirOfPublicDirBasename, mockTestingResourcesCommonPath))
    });

    fs.rmSync(tmpDirPath, { "recursive": true, "force": true });
}
