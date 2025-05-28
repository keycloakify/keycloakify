import type { BuildContext } from "./shared/buildContext";
import { maybeDelegateCommandToCustomHandler } from "./shared/customHandler_delegate";
import { installExtension } from "./shared/installExtension";
import { exitIfUncommittedChanges } from "./shared/exitIfUncommittedChanges";
import { command as updateKcGenCommand } from "./update-kc-gen";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    const { hasBeenHandled } = await maybeDelegateCommandToCustomHandler({
        commandName: "initialize-login-theme",
        buildContext
    });

    if (hasBeenHandled) {
        return;
    }

    exitIfUncommittedChanges({
        projectDirPath: buildContext.projectDirPath
    });

    await installExtension({
        moduleName: "@keycloakify/keycloak-login-ui",
        buildContext
    });

    await updateKcGenCommand({
        buildContext: {
            ...buildContext,
            implementedThemeTypes: {
                ...buildContext.implementedThemeTypes,
                login: {
                    isImplemented: true
                }
            }
        }
    });
}
