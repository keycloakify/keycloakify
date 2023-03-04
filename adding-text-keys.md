---
description: >-
  If you want to overwrite the translation messages that comes by default with
  Keycloak, define some new messages, or add translation for a new language.
---

# 🌎 i18n: msg(...)

{% hint style="info" %}
In Keycloakify you don't [directly eddit the `messages_xx.properties` files](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FsspJ8BvaNa5VrAWRnnD0%2Fuploads%2FARZ2fA82vANcrQ30kEac%2FUntitled.png?alt=media\&token=14c35c9a-e78d-4cf0-9037-22097eb6071b). &#x20;
{% endhint %}

{% embed url="https://github.com/codegouvfr/keycloakify-starter/blob/main/src/keycloak-theme/i18n.ts" %}
Overwiting default messages or defining new ones
{% endembed %}

{% embed url="https://github.com/codegouvfr/keycloakify-starter/blob/9f2e4438bd54648767571be7ef47a777bc6565f8/src/keycloak-theme/KcApp.tsx#L32-L43" %}
Using the i18n API
{% endembed %}

{% hint style="success" %}
You can set the language you'll get in `i18n.curentLanguageTag` by specifying `ui_locales=xx` as query parameter when redirecting to your login or register page. &#x20;

[See how](context-persistence.md).
{% endhint %}
