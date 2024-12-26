import type { BuildContext } from "./shared/buildContext";
import { maybeDelegateCommandToCustomHandler } from "./shared/customHandler_delegate";
import { initializeSpa } from "./shared/initializeSpa";
import { exitIfUncommittedChanges } from "./shared/exitIfUncommittedChanges";
import { command as updateKcGenCommand } from "./update-kc-gen";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    const { hasBeenHandled } = maybeDelegateCommandToCustomHandler({
        commandName: "initialize-admin-theme",
        buildContext
    });

    if (hasBeenHandled) {
        return;
    }

    exitIfUncommittedChanges({
        projectDirPath: buildContext.projectDirPath
    });

    await initializeSpa({
        themeType: "admin",
        buildContext
    });

    await updateKcGenCommand({
        buildContext: {
            ...buildContext,
            implementedThemeTypes: {
                ...buildContext.implementedThemeTypes,
                admin: {
                    isImplemented: true
                }
            }
        }
    });
}
