import { getKcContext } from "../../src/kcContext";
import type { KcContextBase } from "../../src/kcContext";
import type { ExtendsKcContextBase } from "../../src/kcContext";
import { same } from "evt/tools/inDepth";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { kcContextMocks, kcContextCommonMock } from "../../src/kcContext/kcContextMocks";
import { deepClone } from "../../src/tools/deepClone";

{
    const authorizedMailDomains = ["example.com", "another-example.com", "*.yet-another-example.com", "*.example.com", "hello-world.com"];

    const displayName = "this is an overwritten common value";

    const aNonStandardValue1 = "a non standard value 1";
    const aNonStandardValue2 = "a non standard value 2";

    type KcContextExtended =
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

    const getKcContextProxy = (params: { mockPageId: ExtendsKcContextBase<KcContextExtended>["pageId"] }) => {
        const { mockPageId } = params;

        const { kcContext } = getKcContext<KcContextExtended>({
            mockPageId,
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

        return { kcContext };
    };

    {
        const pageId = "login.ftl";

        const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

        assert(kcContext?.pageId === pageId);

        assert<Equals<typeof kcContext, KcContextBase.Login>>();

        assert(
            same(
                //NOTE: deepClone for printIfExists or other functions...
                deepClone(kcContext),
                (() => {
                    const mock = deepClone(kcContextMocks.find(({ pageId: pageId_i }) => pageId_i === pageId)!);

                    mock.realm.displayName = displayName;

                    return mock;
                })()
            )
        );

        console.log(`PASS ${pageId}`);
    }

    {
        const pageId = "info.ftl";

        const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

        assert(kcContext?.pageId === pageId);

        //NOTE: I don't understand the need to add: pageId: typeof pageId; ...
        assert<
            Equals<
                typeof kcContext,
                KcContextBase.Info & {
                    pageId: typeof pageId;
                    aNonStandardValue1: string;
                }
            >
        >();

        assert(
            same(
                deepClone(kcContext),
                (() => {
                    const mock = deepClone(kcContextMocks.find(({ pageId: pageId_i }) => pageId_i === pageId)!);

                    Object.assign(mock, { aNonStandardValue1 });

                    return mock;
                })()
            )
        );

        console.log(`PASS ${pageId}`);
    }

    {
        const pageId = "register.ftl";

        const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

        assert(kcContext?.pageId === pageId);

        //NOTE: I don't understand the need to add: pageId: typeof pageId; ...
        assert<
            Equals<
                typeof kcContext,
                KcContextBase.Register & {
                    pageId: typeof pageId;
                    authorizedMailDomains: string[];
                }
            >
        >();

        assert(
            same(
                deepClone(kcContext),
                (() => {
                    const mock = deepClone(kcContextMocks.find(({ pageId: pageId_i }) => pageId_i === pageId)!);

                    Object.assign(mock, { authorizedMailDomains });

                    return mock;
                })()
            )
        );

        console.log(`PASS ${pageId}`);
    }

    {
        const pageId = "my-extra-page-2.ftl";

        const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

        assert(kcContext?.pageId === pageId);

        assert<
            Equals<
                typeof kcContext,
                KcContextBase.Common & {
                    pageId: typeof pageId;
                    aNonStandardValue2: string;
                }
            >
        >();

        kcContext.aNonStandardValue2;

        assert(
            same(
                deepClone(kcContext),
                (() => {
                    const mock = deepClone(kcContextCommonMock);

                    Object.assign(mock, { pageId, aNonStandardValue2 });

                    return mock;
                })()
            )
        );

        console.log(`PASS ${pageId}`);
    }

    {
        const pageId = "my-extra-page-1.ftl";

        console.log("We expect a warning here =>");

        const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

        assert(kcContext?.pageId === pageId);

        assert<Equals<typeof kcContext, KcContextBase.Common & { pageId: typeof pageId }>>();

        assert(
            same(
                deepClone(kcContext),
                (() => {
                    const mock = deepClone(kcContextCommonMock);

                    Object.assign(mock, { pageId });

                    return mock;
                })()
            )
        );

        console.log(`PASS ${pageId}`);
    }
}

{
    const pageId = "login.ftl";

    const { kcContext } = getKcContext({
        "mockPageId": pageId
    });

    assert<Equals<typeof kcContext, KcContextBase | undefined>>();

    assert(same(deepClone(kcContext), deepClone(kcContextMocks.find(({ pageId: pageId_i }) => pageId_i === pageId)!)));

    console.log("PASS no extension");
}

{
    const { kcContext } = getKcContext();

    assert<Equals<typeof kcContext, KcContextBase | undefined>>();

    assert(kcContext === undefined);

    console.log("PASS no extension, no mock");
}
