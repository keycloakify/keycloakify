<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/109387840-eba11f80-7903-11eb-9050-db1dad883f78.png">  
</p>
<p align="center">
    <i>🔏  Customize key cloak's pages as if they were part of your App 🔏</i>
    <br>
    <br>
    <img src="https://github.com/garronej/keycloakify/workflows/ci/badge.svg?branch=develop">
    <img src="https://img.shields.io/bundlephobia/minzip/keycloakify">
    <img src="https://img.shields.io/npm/dw/keycloakify">
    <img src="https://img.shields.io/npm/l/keycloakify">
</p>

<p align="center">
    <i>Ultimately this build tool Generates a Keycloak theme</i>
    <img src="https://user-images.githubusercontent.com/6702424/110260457-a1c3d380-7fac-11eb-853a-80459b65626b.png">
</p>

# Motivations

The problem: 

![keycloak_before](https://user-images.githubusercontent.com/6702424/108838381-dbbbcf80-75d3-11eb-8ae8-db41563ef9db.gif)

When we redirected to Keycloak the user suffers from a harsh context switch.
Keycloak does offer a way to customize theses pages but it requires a lot of raw HTML/CSS hacking
to reproduce the look and feel of a specific app. Not mentioning the maintenance cost of such an endeavour.  

Wouldn't it be great if we could just design the login and register pages as if they where part of our app?  
Here is `yarn add keycloakify` for you 🍸

<p align="center">
    <i>With keycloakify:</i><br>
    <img src="https://github.com/InseeFrLab/keycloakify/releases/download/v0.3.8/keycloakify_after.gif">
</p>

Tested with the following Keycloak versions: 
- [11.0.3](https://hub.docker.com/layers/jboss/keycloak/11.0.3/images/sha256-4438f1e51c1369371cb807dffa526e1208086b3ebb9cab009830a178de949782?context=explore)  
- [12.0.4](https://hub.docker.com/layers/jboss/keycloak/12.0.4/images/sha256-67e0c88e69bd0c7aef972c40bdeb558a974013a28b3668ca790ed63a04d70584?context=explore)  

**Disclaimer**: This tool will be maintained to stay compatible with Keycloak v11 and up, however, the default pages you will get 
(before you customize it) will always be the ones of the Keycloak v11.

- [Motivations](#motivations)
- [How to use](#how-to-use)
  - [Setting up the build tool](#setting-up-the-build-tool)
  - [Developing your login and register pages in your React app](#developing-your-login-and-register-pages-in-your-react-app)
    - [Just changing the look](#just-changing-the-look)
    - [Changing the look **and** feel](#changing-the-look-and-feel)
    - [Hot reload](#hot-reload)
- [GitHub Actions](#github-actions)
- [REQUIREMENTS](#requirements)
- [API Reference](#api-reference)
  - [The build tool](#the-build-tool)
- [Implement context persistance (optional)](#implement-context-persistance-optional)

# How to use
## Setting up the build tool

Add `keycloakify` to the dev dependencies of your project `npm install --save-dev keycloakify` or `yarn add --dev keycloakify`
then configure your `package.json` build's script to build the keycloak's theme by adding `&& build-keycloak-theme`.

Typically you will get: 

`package.json`
```json
"devDependencies": {
    "keycloakify": "^0.0.10"
},
"scripts": {
    "keycloak": "yarn build && build-keycloak-theme",
},
```

Then run `yarn keycloak` or `npm run keycloak`, you will be provided with instructions
about how to load the theme into Keycloak.

## Developing your login and register pages in your React app

### Just changing the look

The fist approach is to only arr/replace the default class names by your
own.

```tsx

import { App } from "./<wherever>/App";
import { 
  KcApp, 
  defaultKcProps, 
  kcContext
} from "keycloakify";
import { css } from "tss-react";

const myClassName = css({ "color": "red" });

reactDom.render(
    // Unless the app is currently being served by Keycloak 
    // kcContext is undefined.
    kcContext !== undefined ? 
        <KcApp 
            kcContext={kcContext} 
            {...{
                ...defaultKcProps,
                "kcHeaderWrapperClass": myClassName
            }} 
        /> :
        <App />, // Your actual app
    document.getElementById("root")
);
```

<i>result:</i>

<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/110261408-688d6280-7fb0-11eb-9822-7003d268b459.png">
</p>

### Changing the look **and** feel

If you want to really re-implement the pages the best approach is to 
create you own version of the [`<KcApp />`](https://github.com/garronej/keycloakify/blob/develop/src/lib/components/KcApp.tsx).
Copy/past some of [the components](https://github.com/garronej/keycloakify/tree/develop/src/lib/components) provided by this module and start hacking around. 

### Hot reload

By default, in order to see your changes you will have to wait for 
`yarn build` to complete which can takes sevrall minute. 

If you want to test your login screens outside of Keycloak, in [storybook](https://storybook.js.org/)
for example you can use `kcContextMocks`.

```tsx
import {
    KcApp,
    defaultKcProps,
    kcContextMocks
} from "keycloakify";

reactDom.render(
    kcContext !== undefined ? 
        <KcApp 
            kcContext={kcContextMocks.kcLoginContext}
            {...defaultKcProps} 
        />
    document.getElementById("root")
);
```

then `yarn start` ...

Checkout [this concrete example](https://github.com/garronej/keycloakify-demo-app/blob/main/src/index.tsx)


*NOTE: keycloak-react-theming was renamed keycloakify since this video was recorded*
[![kickstart_video](https://user-images.githubusercontent.com/6702424/108877866-f146ee80-75ff-11eb-8120-003b3c5f6dd8.png)](https://youtu.be/xTz0Rj7i2v8)

# GitHub Actions

![image](https://user-images.githubusercontent.com/6702424/110708305-c44b2c00-81fa-11eb-8152-eeaaac0883d6.png)

[Here is a demo repo](https://github.com/garronej/keycloakify-demo-app) to show how to automate
the building and publishing of the theme (the .jar file).

# REQUIREMENTS

This tools assumes you are bundling your app with Webpack (tested with 4.44.2) .
It assumes there is a `build/` directory at the root of your react project directory containing a `index.html` file
and a `static/` directory generated by webpack.

**All this is defaults with [`create-react-app`](https://create-react-app.dev)** (tested with 4.0.3=)

- For building the theme: `mvn` (Maven) must be installed
- For development, (testing the theme in a local container ): `rm`, `mkdir`, `wget`, `unzip` are assumed to be available
  and `docker` up and running.

NOTE: This build tool has only be tested on MacOS.

# API Reference 

## The build tool 

Part of the lib that runs with node, at build time.

- `npx build-keycloak-theme`: Builds the theme, the CWD is assumed to be the root of your react project.
- `npx download-sample-keycloak-themes`: Downloads the keycloak default themes (for development purposes)

# Implement context persistance (optional)

If, before logging in, a user has selected a specific language 
you don't want it to be reset to default when the user gets redirected to
the login or register pages.  
  
Same goes for the dark mode, you don't want, if the user had it enabled
to show the login page with light themes.  
  
The problem is that you are probably using `localStorage` to persist theses values across
reload but, as the Keycloak pages are not served on the same domain that the rest of your
app you won't be able to carry over states using `localStorage`.  

The only reliable solution is to inject parameters into the URL before
redirecting to Keycloak. We integrate with 
[`keycloak-js`](https://github.com/keycloak/keycloak-documentation/blob/master/securing_apps/topics/oidc/javascript-adapter.adoc), 
by providing you a way to tell `keycloak-js` that you would like to inject
some search parameters before redirecting.  

The method also works with [`@react-keycloak/web`](https://www.npmjs.com/package/@react-keycloak/web) (use the `initOptions`).

You can implement your own mechanism to pass the states in the URL and
restore it on the other side but we recommend using `powerhooks/useGlobalState`
from the library [`powerhooks`](https://www.powerhooks.dev) that provide an elegant
way to handle states such as `isDarkModeEnabled` or `selectedLanguage`.

Let's modify [the example](https://github.com/keycloak/keycloak-documentation/blob/master/securing_apps/topics/oidc/javascript-adapter.adoc) from the official `keycloak-js` documentation to
enables the states of `useGlobalStates` to be injected in the URL before redirecting.  
Note that the states are automatically restored on the other side by `powerhooks`

```typescript
import keycloak_js from "keycloak-js";
import { injectGlobalStatesInSearchParams } from "powerhooks/useGlobalState";
import { createKeycloakAdapter } from "keycloakify";

//...

const keycloakInstance = keycloak_js({
    "url": "http://keycloak-server/auth",
    "realm": "myrealm",
    "clientId": "myapp"
});

keycloakInstance.init({
    "onLoad": 'check-sso',
    "silentCheckSsoRedirectUri": window.location.origin + "/silent-check-sso.html",
    "adapter": createKeycloakAdapter({
        "transformUrlBeforeRedirect": injectGlobalStatesInSearchParams,
        keycloakInstance
    })
});

//...
```

If you really want to go the extra miles and avoid having the white
flash of the blank html before the js bundle have been evaluated
[here is a snippet](https://github.com/InseeFrLab/onyxia-ui/blob/a77eb502870cfe6878edd0d956c646d28746d053/public/index.html#L5-L54) that you can place in your `public/index.html` if you are using `powerhooks/useGlobalState`.
