import { type ExtendKcContext, createGetKcContextMock } from "keycloakify/login";
import { KcContext as KcContextBase } from "keycloakify/login/KcContext";
import { assert, type Equals } from "tsafe/assert";
import { Reflect } from "tsafe/Reflect";

{
    type KcContextExtraProperties = {
        properties: {
            myCustomProperty: string | undefined;
        };
    };

    type KcContextExtraPropertiesPerPage = {
        "login.ftl": {
            foo: string;
        };
        "my-custom-page.ftl": {
            bar: number;
        };
    };

    type KcContext = ExtendKcContext<
        KcContextExtraProperties,
        KcContextExtraPropertiesPerPage
    >;

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
            KcContextExtraProperties & { pageId: "my-custom-page.ftl" } & {
                properties: { myCustomProperty: string | undefined };
            } & { bar: number };

        assert<Got extends Expected ? true : false>();
        assert<Expected extends Got ? true : false>();
    }

    const { getKcContextMock } = createGetKcContextMock({
        kcContextExtraProperties: Reflect<KcContextExtraProperties>(),
        kcContextExtraPropertiesPerPage: Reflect<KcContextExtraPropertiesPerPage>()
    });

    {
        const got = getKcContextMock({
            pageId: "login.ftl"
        });

        type Expected = KcContext;

        assert<Equals<typeof got, Expected>>();
    }

    {
        const got = getKcContextMock({
            pageId: "register.ftl"
        });

        type Expected = KcContext;

        assert<Equals<typeof got, Expected>>();
    }

    {
        const got = getKcContextMock({
            pageId: "my-custom-page.ftl"
        });

        type Expected = KcContext;

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
        kcContextExtraProperties: Reflect<KcContextExtraProperties>(),
        kcContextExtraPropertiesPerPage: Reflect<KcContextExtraPropertiesPerPage>(),
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
        kcContextExtraProperties: Reflect<KcContextExtraProperties>(),
        kcContextExtraPropertiesPerPage: Reflect<KcContextExtraPropertiesPerPage>(),
        overridesPerPage: {
            "register.ftl": {
                // @ts-expect-error
                nonExistingProperty: 42
            }
        }
    });
}

{
    type KcContextExtraProperties = {};

    type KcContextExtraPropertiesPerPage = {};

    type KcContext = ExtendKcContext<
        KcContextExtraProperties,
        KcContextExtraPropertiesPerPage
    >;

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
        kcContextExtraProperties: Reflect<KcContextExtraProperties>(),
        kcContextExtraPropertiesPerPage: Reflect<KcContextExtraPropertiesPerPage>()
    });

    {
        const got = getKcContextMock({
            pageId: "login.ftl"
        });

        type Expected = KcContext;

        assert<Equals<typeof got, Expected>>();
    }

    {
        const got = getKcContextMock({
            pageId: "register.ftl"
        });

        type Expected = KcContext;

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
