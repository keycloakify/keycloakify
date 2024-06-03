import { createGetKcContextMock, type Attribute } from "keycloakify/login";
import { id } from "tsafe/id";
import {
    kcContextMocks,
    kcContextCommonMock
} from "keycloakify/login/kcContext/kcContextMocks";
import { structuredCloneButFunctions } from "keycloakify/tools/structuredCloneButFunctions";
import { expect, it, describe } from "vitest";

describe("createGetKcContextMock", () => {
    type KcContextExtraProperties = {
        properties: {
            MY_ENV_VAR?: string;
        };
    };

    type KcContextExtraPropertiesPerPage = {
        "register.ftl": {
            authorizedMailDomains: string[];
        };
        "my-plugin-page.ftl": {
            aCustomValue: string;
        };
    };

    const { getKcContextMock } = createGetKcContextMock({
        kcContextExtraProperties: id<KcContextExtraProperties>({
            properties: {
                MY_ENV_VAR: "my env var value"
            }
        }),
        kcContextExtraPropertiesPerPage: id<KcContextExtraPropertiesPerPage>({
            "register.ftl": {
                authorizedMailDomains: ["gmail.com", "hotmail.com"]
            },
            "my-plugin-page.ftl": {
                aCustomValue: "some value"
            }
        }),
        overrides: {
            locale: {
                currentLanguageTag: "fr"
            }
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
                },
                passwordPolicies: {
                    length: 66
                }
            }
        }
    });

    it("returns the proper mock for register.frl", () => {
        const got = getKcContextMock({
            pageId: "register.ftl",
            overrides: {
                profile: {
                    attributesByName: {
                        gender: id<Attribute>({
                            validators: {
                                options: {
                                    options: [
                                        "male",
                                        "female",
                                        "non-binary",
                                        "prefer-not-to-say"
                                    ]
                                }
                            },
                            displayName: "${gender}",
                            annotations: {},
                            required: true,
                            readOnly: false,
                            name: "gender"
                        }),
                        email: undefined
                    }
                }
            }
        });

        const expected = (() => {
            const out: any = structuredCloneButFunctions(
                kcContextMocks.find(({ pageId }) => pageId === "register.ftl")
            );

            out.properties = {
                MY_ENV_VAR: "my env var value"
            };

            out.authorizedMailDomains = ["gmail.com", "hotmail.com"];

            out.locale.currentLanguageTag = "fr";

            delete out.profile.attributesByName.email;

            {
                const usernameAttribute = out.profile.attributesByName.username;

                delete usernameAttribute.value;
                usernameAttribute.validators.pattern = {
                    pattern: "^[a-zA-Z0-9]+$",
                    "ignore.empty.value": true,
                    "error-message": "${alphanumericalCharsOnly}"
                };
            }

            out.profile.attributesByName.gender = {
                validators: {
                    options: {
                        options: ["male", "female", "non-binary", "prefer-not-to-say"]
                    }
                },
                displayName: "${gender}",
                annotations: {},
                required: true,
                readOnly: false,
                name: "gender"
            };

            (out.passwordPolicies ??= {}).length = 66;

            return out;
        })();

        expect(got).toEqual(expected);
    });

    it("returns the proper mock plugin pages", () => {
        const got = getKcContextMock({
            pageId: "my-plugin-page.ftl",
            overrides: {
                locale: {
                    currentLanguageTag: "en"
                }
            }
        });

        const expected = (() => {
            const out: any = structuredCloneButFunctions(kcContextCommonMock);

            out.pageId = "my-plugin-page.ftl";

            out.aCustomValue = "some value";

            out.properties = {
                MY_ENV_VAR: "my env var value"
            };

            out.locale.currentLanguageTag = "en";

            return out;
        })();

        expect(got).toEqual(expected);
    });

    it("returns the proper mock for other pages", () => {
        const got = getKcContextMock({
            pageId: "login.ftl",
            overrides: {
                realm: {
                    registrationAllowed: false
                }
            }
        });

        const expected = (() => {
            const out: any = structuredCloneButFunctions(
                kcContextMocks.find(({ pageId }) => pageId === "login.ftl")
            );

            out.properties = {
                MY_ENV_VAR: "my env var value"
            };

            out.locale.currentLanguageTag = "fr";

            out.realm.registrationAllowed = false;

            return out;
        })();

        expect(got).toEqual(expected);
    });
});
