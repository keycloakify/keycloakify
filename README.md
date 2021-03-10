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

TODO: Insert video after.

- [Motivations](#motivations)
- [How to use](#how-to-use)
  - [Setting up the build tool](#setting-up-the-build-tool)
  - [Developing your login and register pages in your React app](#developing-your-login-and-register-pages-in-your-react-app)
    - [Just changing the look](#just-changing-the-look)
    - [Changing the look **and** feel](#changing-the-look-and-feel)
    - [Hot reload](#hot-reload)
- [How to implement context persistance](#how-to-implement-context-persistance)
  - [If your keycloak is a subdomain of your app.](#if-your-keycloak-is-a-subdomain-of-your-app)
  - [Else](#else)
- [GitHub Actions](#github-actions)
- [REQUIREMENTS](#requirements)
- [API Reference](#api-reference)
  - [The build tool](#the-build-tool)
  - [The fronted lib ( imported into your react app )](#the-fronted-lib--imported-into-your-react-app-)

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
    "build": "react-scripts build && build-keycloak-theme"
},
```

Then build your app with `yarn run build` or `npm run build`, you will be provided with instructions
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


*NOTE: keycloak-react-theming was renamed keycloakify since this video was recorded*
[![kickstart_video](https://user-images.githubusercontent.com/6702424/108877866-f146ee80-75ff-11eb-8120-003b3c5f6dd8.png)](https://youtu.be/xTz0Rj7i2v8)
# How to implement context persistance

If you want dark mode preference, language and others users preferences 
to persist within the page served by keycloak here are the methods you can
adopt.

## If your keycloak is a subdomain of your app.

E.g: Your app url is `my-app.com` and your keycloak url is `auth.my-app.com`.

In this case there is a very straightforward approach and it is to use [`powerhooks/useGlobalState`](https://github.com/garronej/powerhooks).
Instead of `{ "persistance": "localStorage" }` use `{ "persistance": "cookie" }`.

## Else

You will have to use URL parameters to passes states when you redirect to 
the login page.

TOTO: Provide a clean way, as abstracted as possible, way to do that.

# GitHub Actions

![image](https://user-images.githubusercontent.com/6702424/110417203-6bae4e80-8095-11eb-8211-2592a5758668.png)

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

## The fronted lib ( imported into your react app )

Part of the lib that you import in your react project and runs on the browser.

**TODO**

