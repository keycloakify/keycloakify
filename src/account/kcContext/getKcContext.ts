import type { DeepPartial } from "keycloakify/tools/DeepPartial";
import { deepAssign } from "keycloakify/tools/deepAssign";
import type { ExtendKcContext } from "./getKcContextFromWindow";
import { getKcContextFromWindow } from "./getKcContextFromWindow";
import { pathJoin } from "keycloakify/bin/tools/pathJoin";
import { pathBasename } from "keycloakify/tools/pathBasename";
import { mockTestingResourcesCommonPath } from "keycloakify/bin/mockTestingResourcesPath";
import { symToStr } from "tsafe/symToStr";
import { kcContextMocks, kcContextCommonMock } from "keycloakify/account/kcContext/kcContextMocks";
import { id } from "tsafe/id";
import { accountThemePageIds } from "keycloakify/bin/keycloakify/generateFtl/pageId";

export function getKcContext<KcContextExtension extends { pageId: string } = never>(params?: {
    mockPageId?: ExtendKcContext<KcContextExtension>["pageId"];
    mockData?: readonly DeepPartial<ExtendKcContext<KcContextExtension>>[];
}): { kcContext: ExtendKcContext<KcContextExtension> | undefined } {
    const { mockPageId, mockData } = params ?? {};

    const realKcContext = getKcContextFromWindow<KcContextExtension>();

    if (mockPageId !== undefined && realKcContext === undefined) {
        //TODO maybe trow if no mock fo custom page

        console.log(
            [
                `%cKeycloakify: ${symToStr({ mockPageId })} set to ${mockPageId}.`,
                `If assets are missing make sure you have built your Keycloak theme at least once.`
            ].join(" "),
            "background: red; color: yellow; font-size: medium"
        );

        const kcContextDefaultMock = kcContextMocks.find(({ pageId }) => pageId === mockPageId);

        const partialKcContextCustomMock = mockData?.find(({ pageId }) => pageId === mockPageId);

        if (kcContextDefaultMock === undefined && partialKcContextCustomMock === undefined) {
            console.warn(
                [
                    `WARNING: You declared the non build in page ${mockPageId} but you didn't `,
                    `provide mock data needed to debug the page outside of Keycloak as you are trying to do now.`,
                    `Please check the documentation of the getKcContext function`
                ].join("\n")
            );
        }

        const kcContext: any = {};

        deepAssign({
            "target": kcContext,
            "source": kcContextDefaultMock !== undefined ? kcContextDefaultMock : { "pageId": mockPageId, ...kcContextCommonMock }
        });

        if (partialKcContextCustomMock !== undefined) {
            deepAssign({
                "target": kcContext,
                "source": partialKcContextCustomMock
            });
        }

        return { kcContext };
    }

    if (realKcContext === undefined) {
        return { "kcContext": undefined };
    }

    if (id<readonly string[]>(accountThemePageIds).indexOf(realKcContext.pageId) < 0 && !("account" in realKcContext)) {
        return { "kcContext": undefined };
    }

    {
        const { url } = realKcContext;

        url.resourcesCommonPath = pathJoin(url.resourcesPath, pathBasename(mockTestingResourcesCommonPath));
    }

    return { "kcContext": realKcContext };
}
