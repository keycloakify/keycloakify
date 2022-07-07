<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/109387840-eba11f80-7903-11eb-9050-db1dad883f78.png">  
</p>
<p align="center">
    <i>🔏  Create Keycloak themes using React 🔏</i>
    <br>
    <br>
    <a href="https://github.com/garronej/keycloakify/actions">
      <img src="https://github.com/garronej/keycloakify/workflows/ci/badge.svg?branch=main">
    </a>
    <a href="https://bundlephobia.com/package/keycloakify">
      <img src="https://img.shields.io/bundlephobia/minzip/keycloakify">
    </a>
    <a href="https://www.npmjs.com/package/keycloakify">
      <img src="https://img.shields.io/npm/dm/keycloakify">
    </a>
    <a href="https://github.com/garronej/keycloakify/blob/main/LICENSE">
      <img src="https://img.shields.io/npm/l/keycloakify">
    </a>
    <a href="https://github.com/InseeFrLab/keycloakify/blob/729503fe31a155a823f46dd66ad4ff34ca274e0a/tsconfig.json#L14">
        <img src="https://camo.githubusercontent.com/0f9fcc0ac1b8617ad4989364f60f78b2d6b32985ad6a508f215f14d8f897b8d3/68747470733a2f2f62616467656e2e6e65742f62616467652f547970655363726970742f7374726963742532302546302539462539322541412f626c7565">
    </a>
    <a href="https://github.com/thomasdarimont/awesome-keycloak">
        <img src="https://awesome.re/mentioned-badge.svg"/>
    </a>
    <p align="center">
        <a href="https://www.keycloakify.dev">Home</a>
        -
        <a href="https://docs.keycloakify.dev">Documentation</a>
</p>

</p>

<p align="center">
    <i>Ultimately this build tool generates a Keycloak theme <a href="https://www.keycloakify.dev">Learn more</a></i>
    <img src="https://user-images.githubusercontent.com/6702424/110260457-a1c3d380-7fac-11eb-853a-80459b65626b.png">
</p>

# Changelog highlights

## 5.7.0

-   Feat `logout-confirm.ftl`. [PR](https://github.com/InseeFrLab/keycloakify/pull/120)

## 5.6.4

Fix `login-verify-email.ftl` page. [Before](https://user-images.githubusercontent.com/6702424/177436014-0bad22c4-5bfb-45bb-8fc9-dad65143cd0c.png) - [After](https://user-images.githubusercontent.com/6702424/177435797-ec5d7db3-84cf-49cb-8efc-3427a81f744e.png)

## v5.6.0

Add support for `login-config-totp.ftl` page [#127](https://github.com/InseeFrLab/keycloakify/pull/127).

## v5.3.0

Rename `keycloak_theme_email` to `keycloak_email`.  
If you already had a `keycloak_theme_email` you should rename it `keycloak_email`.

## v5.0.0

New i18n system. Import of terms and services have changed. [See example](https://github.com/garronej/keycloakify-demo-app/blob/a5b6a50f24bc25e082931f5ad9ebf47492acd12a/src/index.tsx#L46-L63).

## v4.10.0

Add `login-idp-link-email.ftl` page [See PR](https://github.com/InseeFrLab/keycloakify/pull/92).

## v4.8.0

[Email template customization.](#email-template-customization)

## v4.7.4

**M1 Mac** support (for testing locally with a dockerized Keycloak).

## v4.7.2

> WARNING: This is broken.  
> Testing with local Keycloak container working with M1 Mac. Thanks to [@eduardosanzb](https://github.com/InseeFrLab/keycloakify/issues/43#issuecomment-975699658).  
> Be aware: When running M1s you are testing with Keycloak v15 else the local container spun will be a Keycloak v16.1.0.

## v4.7.0

Register with user profile enabled: Out of the box `options` validator support.  
[Example](https://user-images.githubusercontent.com/6702424/158911163-81e6bbe8-feb0-4dc8-abff-de199d7a678e.mov)

## v4.6.0

`tss-react` and `powerhooks` are no longer peer dependencies of `keycloakify`.
After updating Keycloakify you can remove `tss-react` and `powerhooks` from your dependencies if you don't use them explicitly.

## v4.5.3

There is a new recommended way to setup highly customized theme. See [here](https://github.com/garronej/keycloakify-demo-app/blob/look_and_feel/src/KcApp/KcApp.tsx).  
Unlike with [the previous recommended method](https://github.com/garronej/keycloakify-demo-app/blob/a51660578bea15fb3e506b8a2b78e1056c6d68bb/src/KcApp/KcApp.tsx),
with this new method your theme wont break on minor Keycloakify update.

## v4.3.0

Feature [`login-update-password.ftl`](https://user-images.githubusercontent.com/6702424/147517600-6191cf72-93dd-437b-a35c-47180142063e.png).  
Every time a page is added it's a breaking change for non CSS-only theme.  
Change [this](https://github.com/garronej/keycloakify-demo-app/blob/df664c13c77ce3c53ac7df0622d94d04e76d3f9f/src/KcApp/KcApp.tsx#L17) and [this](https://github.com/garronej/keycloakify-demo-app/blob/df664c13c77ce3c53ac7df0622d94d04e76d3f9f/src/KcApp/KcApp.tsx#L37) to update.

## v4

-   Out of the box [frontend form validation](#user-profile-and-frontend-form-validation) 🥳
-   Improvements (and breaking changes in `import { useKcMessage } from "keycloakify"`.

## v3

No breaking changes except that `@emotion/react`, [`tss-react`](https://www.npmjs.com/package/tss-react) and [`powerhooks`](https://www.npmjs.com/package/powerhooks) are now `peerDependencies` instead of being just dependencies.  
It's important to avoid problem when using `keycloakify` alongside [`mui`](https://mui.com) and
[when passing params from the app to the login page](https://github.com/InseeFrLab/keycloakify#implement-context-persistence-optional).

## v2.5

-   Feature [Use advanced message](https://github.com/InseeFrLab/keycloakify/blob/59f106bf9e210b63b190826da2bf5f75fc8b7644/src/lib/i18n/useKcMessage.tsx#L53-L66)
    and [`messagesPerFields`](https://github.com/InseeFrLab/keycloakify/blob/59f106bf9e210b63b190826da2bf5f75fc8b7644/src/lib/getKcContext/KcContextBase.ts#L70-L75) (implementation [here](https://github.com/InseeFrLab/keycloakify/blob/59f106bf9e210b63b190826da2bf5f75fc8b7644/src/bin/build-keycloak-theme/generateFtl/common.ftl#L130-L189))
-   Test container now uses Keycloak version `15.0.2`.

## v2

-   It's now possible to implement custom `.ftl` pages.
-   Support for Keycloak plugins that introduce non standard ftl values.
    (Like for example [this plugin](https://github.com/micedre/keycloak-mail-whitelisting) that define `authorizedMailDomains` in `register.ftl`).
