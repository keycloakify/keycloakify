import { createGetKcContext } from "keycloakify/login/kcContext/createGetKcContext";
import type { ExtendKcContext } from "keycloakify/login/kcContext/getKcContextFromWindow";
import type { KcContext } from "keycloakify/login/kcContext";
import { same } from "evt/tools/inDepth";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { kcContextMocks, kcContextCommonMock } from "keycloakify/login/kcContext/kcContextMocks";
import { deepClone } from "keycloakify/tools/deepClone";
import { expect, it, describe } from "vitest";

describe("createGetKcContext", () => {
    const authorizedMailDomains = ["example.com", "another-example.com", "*.yet-another-example.com", "*.example.com", "hello-world.com"];

    const displayName = "this is an overwritten common value";

    const aNonStandardValue1 = "a non standard value 1";
    const aNonStandardValue2 = "a non standard value 2";

    type KcContextExtension =
        | {
              pageId: "register.ftl";
              authorizedMailDomains: string[];
          }
        | {
              pageId: "info.ftl";
              aNonStandardValue1: string;
          }
        | {
              pageId: "my-extra-page-1.ftl";
          }
        | {
              pageId: "my-extra-page-2.ftl";
              aNonStandardValue2: string;
          };

    const getKcContextProxy = (params: { mockPageId: ExtendKcContext<KcContextExtension>["pageId"] }) => {
        const { mockPageId } = params;

        const { getKcContext } = createGetKcContext<KcContextExtension>({
            "mockData": [
                {
                    "pageId": "login.ftl",
                    "realm": { displayName }
                },
                {
                    "pageId": "info.ftl",
                    aNonStandardValue1
                },
                {
                    "pageId": "register.ftl",
                    authorizedMailDomains
                },
                {
                    "pageId": "my-extra-page-2.ftl",
                    aNonStandardValue2
                }
            ]
        });

        const { kcContext } = getKcContext({
            mockPageId
        });

        return { kcContext };
    };
    it("has proper API for login.ftl", () => {
        const pageId = "login.ftl";

        const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

        assert(kcContext?.pageId === pageId);

        assert<Equals<typeof kcContext, KcContext.Login>>();

        expect(
            same(
                //NOTE: deepClone for printIfExists or other functions...
                deepClone(kcContext),
                (() => {
                    const mock = deepClone(kcContextMocks.find(({ pageId: pageId_i }) => pageId_i === pageId)!);

                    mock.realm.displayName = displayName;

                    return mock;
                })()
            )
        ).toBe(true);
    });

    it("has a proper API for info.ftl", () => {
        const pageId = "info.ftl";

        const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

        assert(kcContext?.pageId === pageId);

        //NOTE: I don't understand the need to add: pageId: typeof pageId; ...
        assert<
            Equals<
                typeof kcContext,
                KcContext.Info & {
                    pageId: typeof pageId;
                    aNonStandardValue1: string;
                }
            >
        >();

        expect(
            same(
                deepClone(kcContext),
                (() => {
                    const mock = deepClone(kcContextMocks.find(({ pageId: pageId_i }) => pageId_i === pageId)!);

                    Object.assign(mock, { aNonStandardValue1 });

                    return mock;
                })()
            )
        ).toBe(true);
    });
    it("has a proper API for register.ftl", () => {
        const pageId = "register.ftl";

        const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

        assert(kcContext?.pageId === pageId);

        //NOTE: I don't understand the need to add: pageId: typeof pageId; ...
        assert<
            Equals<
                typeof kcContext,
                KcContext.Register & {
                    pageId: typeof pageId;
                    authorizedMailDomains: string[];
                }
            >
        >();

        expect(
            same(
                deepClone(kcContext),
                (() => {
                    const mock = deepClone(kcContextMocks.find(({ pageId: pageId_i }) => pageId_i === pageId)!);

                    Object.assign(mock, { authorizedMailDomains });

                    return mock;
                })()
            )
        ).toBe(true);
    });
    it("has a proper API for my-extra-page-2.ftl", () => {
        const pageId = "my-extra-page-2.ftl";

        const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

        assert(kcContext?.pageId === pageId);

        assert<
            Equals<
                typeof kcContext,
                KcContext.Common & {
                    pageId: typeof pageId;
                    aNonStandardValue2: string;
                }
            >
        >();

        kcContext.aNonStandardValue2;

        expect(
            same(
                deepClone(kcContext),
                (() => {
                    const mock = deepClone(kcContextCommonMock);

                    Object.assign(mock, { pageId, aNonStandardValue2 });

                    return mock;
                })()
            )
        ).toBe(true);
    });
    it("has a proper API for my-extra-page-1.ftl", () => {
        const pageId = "my-extra-page-1.ftl";

        console.log("We expect a warning here =>");

        const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

        assert(kcContext?.pageId === pageId);

        assert<Equals<typeof kcContext, KcContext.Common & { pageId: typeof pageId }>>();

        expect(
            same(
                deepClone(kcContext),
                (() => {
                    const mock = deepClone(kcContextCommonMock);

                    Object.assign(mock, { pageId });

                    return mock;
                })()
            )
        ).toBe(true);
    });
    it("returns the proper mock for login.ftl", () => {
        const pageId = "login.ftl";

        const { getKcContext } = createGetKcContext();

        const { kcContext } = getKcContext({
            "mockPageId": pageId
        });

        assert<Equals<typeof kcContext, KcContext.Login>>();

        assert(same(deepClone(kcContext), deepClone(kcContextMocks.find(({ pageId: pageId_i }) => pageId_i === pageId)!)));
    });
    it("returns undefined when no mock is specified", () => {
        const { getKcContext } = createGetKcContext();

        const { kcContext } = getKcContext();

        assert<Equals<typeof kcContext, KcContext | undefined>>();

        assert(kcContext === undefined);
    });

    it("mock are properly overwritten", () => {
        const { getKcContext } = createGetKcContext();

        const displayName = "myDisplayName";

        const { kcContext } = getKcContext({
            "mockPageId": "login.ftl",
            "storyPartialKcContext": {
                "realm": {
                    displayName
                }
            }
        });

        assert<Equals<typeof kcContext, KcContext.Login>>();

        assert(kcContext?.realm.displayName === displayName);
    });

    it("mockPageId doesn't have to be a singleton", () => {
        const { getKcContext } = createGetKcContext();

        const mockPageId: "login.ftl" | "register.ftl" = "login.ftl" as any;

        const { kcContext } = getKcContext({
            mockPageId
        });

        assert<Equals<typeof kcContext, KcContext.Login | KcContext.Register>>();
    });

    it("no undefined as long as we provide a mock pageId", () => {
        const { getKcContext } = createGetKcContext();

        const mockPageId: KcContext["pageId"] = "login.ftl" as any;

        const { kcContext } = getKcContext({
            mockPageId
        });

        assert<Equals<typeof kcContext, KcContext>>();
    });
});
