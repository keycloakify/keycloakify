import type { KcContext, Attribute } from "./KcContext";
import { kcContextMocks, kcContextCommonMock } from "./kcContextMocks";
import type { DeepPartial } from "keycloakify/tools/DeepPartial";
import { deepAssign } from "keycloakify/tools/deepAssign";
import { id } from "tsafe/id";
import { exclude } from "tsafe/exclude";
import { assert } from "tsafe/assert";
import type { ExtendKcContext } from "./getKcContextFromWindow";
import { getKcContextFromWindow } from "./getKcContextFromWindow";
import { pathJoin } from "keycloakify/bin/tools/pathJoin";
import { pathBasename } from "keycloakify/tools/pathBasename";
import { resourcesCommonDirPathRelativeToPublicDir } from "keycloakify/bin/mockTestingResourcesPath";
import { symToStr } from "tsafe/symToStr";

export function createGetKcContext<KcContextExtension extends { pageId: string } = never>(params?: {
    mockData?: readonly DeepPartial<ExtendKcContext<KcContextExtension>>[];
}) {
    const { mockData } = params ?? {};

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

            console.log(`%cKeycloakify: ${symToStr({ mockPageId })} set to ${mockPageId}.`, "background: red; color: yellow; font-size: medium");

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

                if (
                    partialKcContextCustomMock.pageId === "register-user-profile.ftl" ||
                    partialKcContextCustomMock.pageId === "update-user-profile.ftl" ||
                    partialKcContextCustomMock.pageId === "idp-review-user-profile.ftl"
                ) {
                    assert(
                        kcContextDefaultMock?.pageId === "register-user-profile.ftl" ||
                            kcContextDefaultMock?.pageId === "update-user-profile.ftl" ||
                            kcContextDefaultMock?.pageId === "idp-review-user-profile.ftl"
                    );

                    const { attributes } = kcContextDefaultMock.profile;

                    id<KcContext.RegisterUserProfile>(kcContext).profile.attributes = [];
                    id<KcContext.RegisterUserProfile>(kcContext).profile.attributesByName = {};

                    const partialAttributes = [
                        ...((partialKcContextCustomMock as DeepPartial<KcContext.RegisterUserProfile>).profile?.attributes ?? [])
                    ].filter(exclude(undefined));

                    attributes.forEach(attribute => {
                        const partialAttribute = partialAttributes.find(({ name }) => name === attribute.name);

                        const augmentedAttribute: Attribute = {} as any;

                        deepAssign({
                            "target": augmentedAttribute,
                            "source": attribute
                        });

                        if (partialAttribute !== undefined) {
                            partialAttributes.splice(partialAttributes.indexOf(partialAttribute), 1);

                            deepAssign({
                                "target": augmentedAttribute,
                                "source": partialAttribute
                            });
                        }

                        id<KcContext.RegisterUserProfile>(kcContext).profile.attributes.push(augmentedAttribute);
                        id<KcContext.RegisterUserProfile>(kcContext).profile.attributesByName[augmentedAttribute.name] = augmentedAttribute;
                    });

                    partialAttributes
                        .map(partialAttribute => ({ "validators": {}, ...partialAttribute }))
                        .forEach(partialAttribute => {
                            const { name } = partialAttribute;

                            assert(name !== undefined, "If you define a mock attribute it must have at least a name");

                            id<KcContext.RegisterUserProfile>(kcContext).profile.attributes.push(partialAttribute as any);
                            id<KcContext.RegisterUserProfile>(kcContext).profile.attributesByName[name] = partialAttribute as any;
                        });
                }
            }

            return { kcContext };
        }

        if (realKcContext === undefined) {
            return { "kcContext": undefined as any };
        }

        if (realKcContext.themeType !== "login") {
            return { "kcContext": undefined as any };
        }

        {
            const { url } = realKcContext;

            url.resourcesCommonPath = pathJoin(url.resourcesPath, pathBasename(resourcesCommonDirPathRelativeToPublicDir));
        }

        return { "kcContext": realKcContext as any };
    }

    return { getKcContext };
}
