import * as fs from "fs";
import { join as pathJoin } from "path";
import { KEYCLOAK_VERSION } from "./constants";
import { transformCodebase } from "../../src/bin/tools/transformCodebase";
import { downloadKeycloakDefaultTheme } from "./downloadKeycloakDefaultTheme";
import { WELL_KNOWN_DIRECTORY_BASE_NAME } from "../../src/bin/shared/constants";
import { getThisCodebaseRootDirPath } from "../../src/bin/tools/getThisCodebaseRootDirPath";
import { accountMultiPageSupportedLanguages } from "./generateI18nMessages";

export async function createAccountV1Dir() {
    const { extractedDirPath } = await downloadKeycloakDefaultTheme({
        keycloakVersion: KEYCLOAK_VERSION.FOR_ACCOUNT_MULTI_PAGE
    });

    // TODO: Exclude unused resources.

    const destDirPath = pathJoin(
        getThisCodebaseRootDirPath(),
        WELL_KNOWN_DIRECTORY_BASE_NAME.ACCOUNT_V1
    );

    transformCodebase({
        srcDirPath: pathJoin(extractedDirPath, "base", "account"),
        destDirPath
    });

    transformCodebase({
        srcDirPath: pathJoin(extractedDirPath, "keycloak", "account", "resources"),
        destDirPath: pathJoin(destDirPath, "resources")
    });

    transformCodebase({
        srcDirPath: pathJoin(extractedDirPath, "keycloak", "common", "resources"),
        destDirPath: pathJoin(
            destDirPath,
            "resources",
            WELL_KNOWN_DIRECTORY_BASE_NAME.RESOURCES_COMMON
        )
    });

    fs.writeFileSync(
        pathJoin(destDirPath, "theme.properties"),
        Buffer.from(
            [
                "accountResourceProvider=account-v1",
                "",
                `locales=${accountMultiPageSupportedLanguages.join(",")}`,
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
                                `${WELL_KNOWN_DIRECTORY_BASE_NAME.RESOURCES_COMMON}/node_modules/patternfly/dist/css/${fileBasename}`
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
