import { copyKeycloakResourcesToPublic } from "./shared/copyKeycloakResourcesToPublic";
import type { BuildContext } from "./shared/buildContext";
import { maybeDelegateCommandToCustomHandler } from "./shared/customHandler_delegate";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    maybeDelegateCommandToCustomHandler({
        commandName: "copy-keycloak-resources-to-public",
        buildContext
    });

    copyKeycloakResourcesToPublic({
        buildContext
    });
}
