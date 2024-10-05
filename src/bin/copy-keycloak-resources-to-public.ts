import { copyKeycloakResourcesToPublic } from "./shared/copyKeycloakResourcesToPublic";
import type { BuildContext } from "./shared/buildContext";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    copyKeycloakResourcesToPublic({
        buildContext
    });
}
