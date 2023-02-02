---
description: >-
  If you want to overwrite the translation messages that comes by default with
  Keycloak, define some new messages, or add translation for a new language.
---

# 🌎 i18n: msg(...)

{% hint style="info" %}
In Keycloakify you don't [directly edit the `messages_xx.properties` files](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FsspJ8BvaNa5VrAWRnnD0%2Fuploads%2FARZ2fA82vANcrQ30kEac%2FUntitled.png?alt=media\&token=14c35c9a-e78d-4cf0-9037-22097eb6071b). &#x20;
{% endhint %}

[src/KcApp/KcApp.tsx](https://github.com/garronej/keycloakify-starter/blob/main/src/KcApp/KcApp.tsx)

```tsx
import type { KcContext } from "./kcContext";
import KcAppBase, { defaultKcProps, useI18n } from "keycloakify";

export type Props = {
    kcContext: KcContext;
};

export default function KcApp(props: Props) {
    const { kcContext } = props;

    const i18n = useI18n({
        kcContext,
        // NOTE: Here you can override the default i18n messages
        // or define new ones that, for example, you would have
        // defined in the Keycloak admin UI for UserProfile
        // https://user-images.githubusercontent.com/6702424/182050652-522b6fe6-8ee5-49df-aca3-dba2d33f24a5.png
        "extraMessages": {
            "en": {
                "foo": "foo in English",
                // Here we overwrite the default english value for the message "doForgotPassword" 
                // that is "Forgot Password?" see: https://github.com/InseeFrLab/keycloakify/blob/f0ae5ea908e0aa42391af323b6d5e2fd371af851/src/lib/i18n/generated_messages/18.0.1/login/en.ts#L17
                "doForgotPassword": "I forgot my password"
            },
            "fr": {
                /* spell-checker: disable */
                "foo": "foo en Francais",
                "doForgotPassword": "J'ai oublié mon mot de passe"
                /* spell-checker: enable */
            },
        }
    });

    //NOTE: Locale not yet downloaded
    if (i18n === null) {
        return null;
    }
    
    /* 
     * Examples assuming i18n.currentLanguageTag === "en":
     * i18n.msg("access-denied") === <span>Access denied</span>
     * i18n.msg("foo") === <span>foo in English</span>
     */

    return (
        <KcAppBase
            kcContext={kcContext}
            i18n={i18n}
            {...defaultKcProps}
        />
    );
}

```

{% hint style="success" %}
You can set the language you'll get in `i18n.curentLanguageTag` by specifying `ui_locales=xx` as query parameter when redirecting to your login or register page. &#x20;

[See how](context-persistence.md).
{% endhint %}
