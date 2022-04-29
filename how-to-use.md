# 👨💻 Quick start

{% hint style="success" %}
It's a good idea to first read this quick start section to understand the basic of how Keycloakify works.

However, we recommend you start hacking from [**the demo setup**](https://github.com/garronej/keycloakify-demo-app) instead of setting up Keycloakify from scratch.
{% endhint %}

{% hint style="warning" %}
Save yourself some time, have quick look at the [requirements page](./). (Windows users in particular)
{% endhint %}

```
yarn add keycloakify @emotion/react
```

[`package.json`](https://github.com/garronej/keycloakify-demo-app/blob/main/package.json)

```json
"scripts": {
    "keycloak": "yarn build && build-keycloak-theme",
}
```

```bash
yarn keycloak # generates the keycloak-theme.jar
```

On the console will be printed all the instructions about how to load the generated theme in Keycloak

{% tabs %}
{% tab title="CSS Only customization" %}
The first approach is to only customize the style of the default Keycloak login theme by providing your own class names.

{% hint style="info" %}
The keycloakify components are a plain React translation of the default theme that comes with Keycloak v11.0.3. &#x20;

You can download the FTL/CSS source files the components are based on with the following command:

`npx -p keycloakify download-builtin-keycloak-theme`&#x20;

then select version 11.0.3 ([Video demo](https://user-images.githubusercontent.com/6702424/164304458-934b0e1d-9de7-4bb4-8a1c-e06a70b1636a.mov)).
{% endhint %}

`src/index.tsx`

```tsx
import { KcApp, defaultKcProps, getKcContext } from "keycloakify";
//We assume the file contains: ".my-class { color: red; }"
import "./index.css";

const { kcContext } = getKcContext();

if( kcContex === undefined ){
    throw new Error(
        "This app is a Keycloak theme" +
        "It isn't meant to be deployed outside of Keycloak"
    );
}

reactDom.render(
    <KcApp
        kcContext={kcContext}
        {...{
            ...defaultKcProps,
            "kcHeaderWrapperClass": "my-class",
        }}
    />,
    document.getElementById("root"),
);
```

The above snippet of code assumes you are in a react project wich only purpose is to be a Keycloak theme.

But if you want to make your keycloak theme an integral part of a preexisting React app you would apply the following modification to the above snipet:

```diff
+import { App } from "<you know where";
 import { KcApp, defaultKcProps, getKcContext } from "keycloakify";
 import "./index.css";

 const { kcContext } = getKcContext();

-if( kcContex === undefined ){
-    throw new Error(
-        "This app is a Keycloak theme" +
-        "It isn't meant to be deployed outside of Keycloak"
-    );
-}

 reactDom.render(
+    kcContext === undefined ?
+        <App /> :
         <KcApp
             kcContext={kcContext}
             {...{
                 ...defaultKcProps,
                 "kcHeaderWrapperClass": myClassName,
             }}
         />,
     document.getElementById("root"),
);
```

![Result: MYREALM is red](https://user-images.githubusercontent.com/6702424/114326299-6892fc00-9b34-11eb-8d75-85696e55458f.png)

#### Real world example

To give you an idea of what you can already achieve by only customizing the style the style,

Here is [**the code**](https://github.com/InseeFrLab/onyxia-web/blob/012639d62327a9a56be80c46e32c32c9497b82db/src/app/components/KcApp.tsx) that produces:&#x20;

![Results obtained with CSS only customization of the default theme](https://github.com/InseeFrLab/keycloakify/releases/download/v0.3.8/keycloakify\_after.gif)
{% endtab %}

{% tab title="Component level customization" %}
If you want to go beyond only customizing the CSS you can re-implement some of the pages or even add new ones.

If you want to go this way checkout the demo setup provided [here](https://github.com/garronej/keycloakify-demo-app/tree/look\_and\_feel). If you prefer a real life example you can checkout [onyxia-web's source](https://github.com/InseeFrLab/onyxia-web/tree/main/src/ui/components/KcApp). The web app is in production [here](https://datalab.sspcloud.fr).

Main takeaways are:

* You must declare your custom pages in the package.json. [example](https://github.com/garronej/keycloakify-demo-app/blob/4eb2a9f63e9823e653b2d439495bda55e5ecc134/package.json#L17-L22)
* (TS only) You must declare theses page in the type argument of the getter function for the `kcContext` in order to have the correct typings. [example](https://github.com/garronej/keycloakify-demo-app/blob/4eb2a9f63e9823e653b2d439495bda55e5ecc134/src/KcApp/kcContext.ts#L16-L21)
* (TS only) If you use Keycloak plugins that defines non standard `.ftl` values (Like for example [this plugin](https://github.com/micedre/keycloak-mail-whitelisting) that define `authorizedMailDomains` in `register.ftl`) you should declare theses value to get the type. [example](https://github.com/garronej/keycloakify-demo-app/blob/4eb2a9f63e9823e653b2d439495bda55e5ecc134/src/KcApp/kcContext.ts#L6-L13)
* You should provide sample data for all the non standard value if you want to be able to debug the page outside of keycloak. [example](https://github.com/garronej/keycloakify-demo-app/blob/4eb2a9f63e9823e653b2d439495bda55e5ecc134/src/KcApp/kcContext.ts#L28-L43)
{% endtab %}
{% endtabs %}

### How to import the theme in Keycloak

Specific instruction on how to proceed will be printed in the console with `yarn keycloak`.&#x20;

