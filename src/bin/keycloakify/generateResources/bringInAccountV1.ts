import * as fs from "fs";
import { join as pathJoin } from "path";
import { assert } from "tsafe/assert";
import type { BuildContext } from "../../shared/buildContext";
import {
    RESOURCES_COMMON,
    LAST_KEYCLOAK_VERSION_WITH_ACCOUNT_V1,
    ACCOUNT_V1_THEME_NAME
} from "../../shared/constants";
import {
    downloadKeycloakDefaultTheme,
    BuildContextLike as BuildContextLike_downloadKeycloakDefaultTheme
} from "../../shared/downloadKeycloakDefaultTheme";
import { transformCodebase } from "../../tools/transformCodebase";

export type BuildContextLike = BuildContextLike_downloadKeycloakDefaultTheme;

assert<BuildContext extends BuildContextLike ? true : false>();

export async function bringInAccountV1(params: {
    resourcesDirPath: string;
    buildContext: BuildContextLike;
}) {
    const { resourcesDirPath, buildContext } = params;

    const { defaultThemeDirPath } = await downloadKeycloakDefaultTheme({
        keycloakVersion: LAST_KEYCLOAK_VERSION_WITH_ACCOUNT_V1,
        buildContext
    });

    const accountV1DirPath = pathJoin(
        resourcesDirPath,
        "theme",
        ACCOUNT_V1_THEME_NAME,
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
        destDirPath: pathJoin(accountV1DirPath, "resources", RESOURCES_COMMON)
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
                                `${RESOURCES_COMMON}/node_modules/patternfly/dist/css/${fileBasename}`
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
