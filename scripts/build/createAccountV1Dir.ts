import * as fs from "fs";
import { join as pathJoin } from "path";
import { transformCodebase } from "../../src/bin/tools/transformCodebase";
import { downloadKeycloakDefaultTheme } from "../shared/downloadKeycloakDefaultTheme";
import { WELL_KNOWN_DIRECTORY_BASE_NAME } from "../../src/bin/shared/constants";
import { getThisCodebaseRootDirPath } from "../../src/bin/tools/getThisCodebaseRootDirPath";
import { accountMultiPageSupportedLanguages } from "../generate-i18n-messages";
import * as fsPr from "fs/promises";

export async function createAccountV1Dir() {
    const { extractedDirPath } = await downloadKeycloakDefaultTheme({
        keycloakVersionId: "FOR_ACCOUNT_MULTI_PAGE"
    });

    const destDirPath = pathJoin(
        getThisCodebaseRootDirPath(),
        "dist",
        "res",
        "account-v1"
    );

    await fsPr.rm(destDirPath, { recursive: true, force: true });

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
