import type { ExtendKcContext } from "keycloakify/login";
import { createGetKcContextMock } from "keycloakify/login/KcContext";
import { KcContext as KcContextBase } from "keycloakify/login/KcContext";
import { assert, type Equals } from "tsafe/assert";
import { Reflect } from "tsafe/Reflect";

{
    type KcContextExtension = {
        properties: {
            myCustomProperty: string | undefined;
        };
    };

    type KcContextExtensionPerPage = {
        "login.ftl": {
            foo: string;
        };
        "my-custom-page.ftl": {
            bar: number;
        };
    };

    type KcContext = ExtendKcContext<KcContextExtension, KcContextExtensionPerPage>;

    {
        type Got = Extract<KcContext, { pageId: "login.ftl" }>;
        type Expected = KcContextBase.Login & {
            properties: { myCustomProperty: string | undefined };
        } & { foo: string };

        assert<Equals<Got, Expected>>();
    }

    {
        type Got = Extract<KcContext, { pageId: "register.ftl" }>;
        type Expected = KcContextBase.Register & {
            properties: { myCustomProperty: string | undefined };
        };

        assert<Equals<Got, Expected>>();
    }

    {
        type Got = Extract<KcContext, { pageId: "my-custom-page.ftl" }>;

        type Expected = KcContextBase.Common &
            KcContextExtension & { pageId: "my-custom-page.ftl" } & {
                properties: { myCustomProperty: string | undefined };
            } & { bar: number };

        assert<Got extends Expected ? true : false>();
        assert<Expected extends Got ? true : false>();
    }

    const { getKcContextMock } = createGetKcContextMock({
        kcContextExtension: Reflect<KcContextExtension>(),
        kcContextExtensionPerPage: Reflect<KcContextExtensionPerPage>()
    });

    {
        const got = getKcContextMock({
            pageId: "login.ftl"
        });

        type Expected = Extract<KcContext, { pageId: "login.ftl" }>;

        assert<Equals<typeof got, Expected>>();
    }

    {
        const got = getKcContextMock({
            pageId: "register.ftl"
        });

        type Expected = Extract<KcContext, { pageId: "register.ftl" }>;

        assert<Equals<typeof got, Expected>>();
    }

    {
        const got = getKcContextMock({
            pageId: "my-custom-page.ftl"
        });

        type Expected = Extract<KcContext, { pageId: "my-custom-page.ftl" }>;

        assert<Equals<typeof got, Expected>>();
    }

    getKcContextMock({
        // @ts-expect-error
        pageId: "non-existing-page.ftl"
    });

    getKcContextMock({
        pageId: "login.ftl",
        overrides: {
            // @ts-expect-error
            bar: 42
        }
    });

    createGetKcContextMock({
        kcContextExtension: Reflect<KcContextExtension>(),
        kcContextExtensionPerPage: Reflect<KcContextExtensionPerPage>(),
        overrides: {
            locale: {
                currentLanguageTag: "fr"
            },
            // @ts-expect-error
            profile: {}
        },
        overridesPerPage: {
            "register.ftl": {
                profile: {
                    attributesByName: {
                        username: {
                            validators: {
                                pattern: {
                                    pattern: "^[a-zA-Z0-9]+$",
                                    "ignore.empty.value": true,
                                    "error-message": "${alphanumericalCharsOnly}"
                                }
                            },
                            value: undefined,
                            name: "username"
                        }
                    }
                }
            },
            // @ts-expect-error
            "non-existing-page.ftl": {}
        }
    });

    createGetKcContextMock({
        kcContextExtension: Reflect<KcContextExtension>(),
        kcContextExtensionPerPage: Reflect<KcContextExtensionPerPage>(),
        overridesPerPage: {
            "register.ftl": {
                // @ts-expect-error
                nonExistingProperty: 42
            }
        }
    });
}

{
    type KcContextExtension = {};

    type KcContextExtensionPerPage = {};

    type KcContext = ExtendKcContext<KcContextExtension, KcContextExtensionPerPage>;

    {
        type Got = Extract<KcContext, { pageId: "login.ftl" }>;
        type Expected = KcContextBase.Login;

        assert<Equals<Got, Expected>>();
    }

    {
        type Got = Extract<KcContext, { pageId: "register.ftl" }>;
        type Expected = KcContextBase.Register;

        assert<Equals<Got, Expected>>();
    }

    const { getKcContextMock } = createGetKcContextMock({
        kcContextExtension: Reflect<KcContextExtension>(),
        kcContextExtensionPerPage: Reflect<KcContextExtensionPerPage>()
    });

    {
        const got = getKcContextMock({
            pageId: "login.ftl"
        });

        type Expected = Extract<KcContext, { pageId: "login.ftl" }>;

        assert<Equals<typeof got, Expected>>();
    }

    {
        const got = getKcContextMock({
            pageId: "register.ftl"
        });

        type Expected = Extract<KcContext, { pageId: "register.ftl" }>;

        assert<Equals<typeof got, Expected>>();
    }

    getKcContextMock({
        // @ts-expect-error
        pageId: "non-existing-page.ftl"
    });

    getKcContextMock({
        pageId: "login.ftl",
        overrides: {
            // @ts-expect-error
            bar: 42
        }
    });
}
