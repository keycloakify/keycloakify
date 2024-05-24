import * as fs from "fs";
import { join as pathJoin } from "path";
import { assert } from "tsafe/assert";
import type { BuildOptions } from "../../shared/buildOptions";
import {
    resources_common,
    lastKeycloakVersionWithAccountV1,
    accountV1ThemeName
} from "../../shared/constants";
import { downloadKeycloakDefaultTheme } from "../../shared/downloadKeycloakDefaultTheme";
import { transformCodebase } from "../../tools/transformCodebase";

type BuildOptionsLike = {
    cacheDirPath: string;
    npmWorkspaceRootDirPath: string;
    keycloakifyBuildDirPath: string;
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function bringInAccountV1(params: { buildOptions: BuildOptionsLike }) {
    const { buildOptions } = params;

    const { defaultThemeDirPath } = await downloadKeycloakDefaultTheme({
        keycloakVersion: lastKeycloakVersionWithAccountV1,
        buildOptions
    });

    const accountV1DirPath = pathJoin(
        buildOptions.keycloakifyBuildDirPath,
        "src",
        "main",
        "resources",
        "theme",
        accountV1ThemeName,
        "account"
    );

    transformCodebase({
        srcDirPath: pathJoin(defaultThemeDirPath, "base", "account"),
        destDirPath: accountV1DirPath
    });

    transformCodebase({
        srcDirPath: pathJoin(defaultThemeDirPath, "keycloak", "account", "resources"),
        destDirPath: pathJoin(accountV1DirPath, "resources")
    });

    transformCodebase({
        srcDirPath: pathJoin(defaultThemeDirPath, "keycloak", "common", "resources"),
        destDirPath: pathJoin(accountV1DirPath, "resources", resources_common)
    });

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
                        ...[
                            "patternfly.min.css",
                            "patternfly-additions.min.css",
                            "patternfly-additions.min.css"
                        ].map(
                            fileBasename =>
                                `${resources_common}/node_modules/patternfly/dist/css/${fileBasename}`
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
