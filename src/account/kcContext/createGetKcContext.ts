import type { DeepPartial } from "keycloakify/tools/DeepPartial";
import { deepAssign } from "keycloakify/tools/deepAssign";
import { isStorybook } from "keycloakify/lib/isStorybook";
import type { ExtendKcContext } from "./getKcContextFromWindow";
import { getKcContextFromWindow } from "./getKcContextFromWindow";
import { symToStr } from "tsafe/symToStr";
import { kcContextMocks, kcContextCommonMock } from "keycloakify/account/kcContext/kcContextMocks";

export function createGetKcContext<KcContextExtension extends { pageId: string } = never>(params?: {
    mockData?: readonly DeepPartial<ExtendKcContext<KcContextExtension>>[];
    mockProperties?: Record<string, string>;
}) {
    const { mockData, mockProperties } = params ?? {};

    function getKcContext<PageId extends ExtendKcContext<KcContextExtension>["pageId"] | undefined = undefined>(params?: {
        mockPageId?: PageId;
        storyPartialKcContext?: DeepPartial<Extract<ExtendKcContext<KcContextExtension>, { pageId: PageId }>>;
    }): {
        kcContext: PageId extends undefined
            ? ExtendKcContext<KcContextExtension> | undefined
            : Extract<ExtendKcContext<KcContextExtension>, { pageId: PageId }>;
    } {
        const { mockPageId, storyPartialKcContext } = params ?? {};

        const realKcContext = getKcContextFromWindow<KcContextExtension>();

        if (mockPageId !== undefined && realKcContext === undefined) {
            //TODO maybe trow if no mock fo custom page

            warn_that_mock_is_enbaled: {
                if (isStorybook) {
                    break warn_that_mock_is_enbaled;
                }

                console.log(`%cKeycloakify: ${symToStr({ mockPageId })} set to ${mockPageId}.`, "background: red; color: yellow; font-size: medium");
            }

            const kcContextDefaultMock = kcContextMocks.find(({ pageId }) => pageId === mockPageId);

            const partialKcContextCustomMock = (() => {
                const out: DeepPartial<ExtendKcContext<KcContextExtension>> = {};

                const mockDataPick = mockData?.find(({ pageId }) => pageId === mockPageId);

                if (mockDataPick !== undefined) {
                    deepAssign({
                        "target": out,
                        "source": mockDataPick
                    });
                }

                if (storyPartialKcContext !== undefined) {
                    deepAssign({
                        "target": out,
                        "source": storyPartialKcContext
                    });
                }

                return Object.keys(out).length === 0 ? undefined : out;
            })();

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

            if (mockProperties !== undefined) {
                deepAssign({
                    "target": kcContext.properties,
                    "source": mockProperties
                });
            }

            return { kcContext };
        }

        if (realKcContext === undefined) {
            return { "kcContext": undefined as any };
        }

        if (realKcContext.themeType !== "account") {
            return { "kcContext": undefined as any };
        }

        return { "kcContext": realKcContext as any };
    }

    return { getKcContext };
}
