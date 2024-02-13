import * as fs from "fs";
import { join as pathJoin } from "path";
import { assert } from "tsafe/assert";
import { Reflect } from "tsafe/Reflect";
import type { BuildOptions } from "../buildOptions";
import { resources_common, lastKeycloakVersionWithAccountV1, accountV1ThemeName } from "../../constants";
import { downloadBuiltinKeycloakTheme } from "../../download-builtin-keycloak-theme";
import { transformCodebase } from "../../tools/transformCodebase";
import { rmSync } from "../../tools/fs.rmSync";

type BuildOptionsLike = {
    keycloakifyBuildDirPath: string;
    cacheDirPath: string;
    npmWorkspaceRootDirPath: string;
};

{
    const buildOptions = Reflect<BuildOptions>();

    assert<typeof buildOptions extends BuildOptionsLike ? true : false>();
}

export async function bringInAccountV1(params: { buildOptions: BuildOptionsLike }) {
    const { buildOptions } = params;

    const builtinKeycloakThemeTmpDirPath = pathJoin(buildOptions.keycloakifyBuildDirPath, "..", "tmp_yxdE2_builtin_keycloak_theme");

    await downloadBuiltinKeycloakTheme({
        "destDirPath": builtinKeycloakThemeTmpDirPath,
        "keycloakVersion": lastKeycloakVersionWithAccountV1,
        buildOptions
    });

    const accountV1DirPath = pathJoin(buildOptions.keycloakifyBuildDirPath, "src", "main", "resources", "theme", accountV1ThemeName, "account");

    transformCodebase({
        "srcDirPath": pathJoin(builtinKeycloakThemeTmpDirPath, "base", "account"),
        "destDirPath": accountV1DirPath
    });

    transformCodebase({
        "srcDirPath": pathJoin(builtinKeycloakThemeTmpDirPath, "keycloak", "account", "resources"),
        "destDirPath": pathJoin(accountV1DirPath, "resources")
    });

    transformCodebase({
        "srcDirPath": pathJoin(builtinKeycloakThemeTmpDirPath, "keycloak", "common", "resources"),
        "destDirPath": pathJoin(accountV1DirPath, "resources", resources_common)
    });

    rmSync(builtinKeycloakThemeTmpDirPath, { "recursive": true });

    fs.writeFileSync(
        pathJoin(accountV1DirPath, "theme.properties"),
        Buffer.from(
            [
                "accountResourceProvider=account-v1",
                "",
                "locales=ar,ca,cs,da,de,en,es,fr,fi,hu,it,ja,lt,nl,no,pl,pt-BR,ru,sk,sv,tr,zh-CN",
                "",
                "styles=" +
                    [
                        "css/account.css",
                        "img/icon-sidebar-active.png",
                        "img/logo.png",
                        ...["patternfly.min.css", "patternfly-additions.min.css", "patternfly-additions.min.css"].map(
                            fileBasename => `${resources_common}/node_modules/patternfly/dist/css/${fileBasename}`
                        )
                    ].join(" "),
                "",
                "##### css classes for form buttons",
                "# main class used for all buttons",
                "kcButtonClass=btn",
                "# classes defining priority of the button - primary or default (there is typically only one priority button for the form)",
                "kcButtonPrimaryClass=btn-primary",
                "kcButtonDefaultClass=btn-default",
                "# classes defining size of the button",
                "kcButtonLargeClass=btn-lg",
                ""
            ].join("\n"),
            "utf8"
        )
    );
}
