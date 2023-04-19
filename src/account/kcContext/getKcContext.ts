import type { DeepPartial } from "keycloakify/tools/DeepPartial";
import type { ExtendKcContext } from "./getKcContextFromWindow";
import { createGetKcContext } from "./createGetKcContext";

/** NOTE: We now recommend using createGetKcContext instead of this function to make storybook integration easier
 *  See: https://github.com/keycloakify/keycloakify-starter/blob/main/src/keycloak-theme/account/kcContext.ts
 */
export function getKcContext<KcContextExtension extends { pageId: string } = never>(params?: {
    mockPageId?: ExtendKcContext<KcContextExtension>["pageId"];
    mockData?: readonly DeepPartial<ExtendKcContext<KcContextExtension>>[];
}): { kcContext: ExtendKcContext<KcContextExtension> | undefined } {
    const { mockPageId, mockData } = params ?? {};

    const { getKcContext } = createGetKcContext({
        mockData
    });

    const { kcContext } = getKcContext({ mockPageId });

    return { kcContext };
}
