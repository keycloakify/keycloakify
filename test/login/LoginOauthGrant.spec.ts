import { createElement } from "react";
import { createGetKcContextMock } from "keycloakify/login/KcContext";
import type { I18n } from "keycloakify/login/i18n";
import LoginOauthGrant from "keycloakify/login/pages/LoginOauthGrant";
import type { ClassKey } from "keycloakify/login/TemplateProps";
import { describe, expect, it } from "vitest";

const { getKcContextMock } = createGetKcContextMock({
    kcContextExtension: {},
    kcContextExtensionPerPage: {}
});

describe("LoginOauthGrant", () => {
    it("preserves the configured body class alongside the OAuth-specific class", () => {
        expect(
            getBodyClassName({
                classes: {
                    kcBodyClass: "custom-body-class"
                }
            })
        ).toBe("kcBodyClass custom-body-class oauth");
    });

    it("keeps the OAuth-specific class when no custom body class is configured", () => {
        expect(getBodyClassName({})).toBe("kcBodyClass oauth");
    });
});

function getBodyClassName(params: { classes?: Partial<Record<ClassKey, string>> }) {
    const { classes } = params;

    const element = LoginOauthGrant({
        kcContext: getKcContextMock({ pageId: "login-oauth-grant.ftl" }),
        i18n,
        doUseDefaultCss: true,
        classes,
        Template: () => null
    });

    return (element.props as { bodyClassName?: string }).bodyClassName;
}

const i18n = {
    currentLanguage: {
        languageTag: "en",
        label: "English"
    },
    enabledLanguages: [],
    isFetchingTranslations: false,
    msgStr: (key: string) => key,
    advancedMsgStr: (key: string) => key,
    msg: (key: string) => createElement("span", undefined, key),
    advancedMsg: (key: string) => createElement("span", undefined, key)
} as unknown as I18n;
