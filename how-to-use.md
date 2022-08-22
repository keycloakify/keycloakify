# 👨💻 Quick start

{% hint style="success" %}
It's a good idea to first read this quick start section to understand the basic of how Keycloakify works.

However, we recommend you start hacking from [**the starter project**](https://github.com/garronej/keycloakify-starter) instead of setting up Keycloakify from scratch.
{% endhint %}

{% hint style="warning" %}
Save yourself some time, have quick look at the [requirements page](./). **Windows** users in particular!
{% endhint %}

```
yarn add keycloakify @emotion/react
```

[`package.json`](https://github.com/garronej/keycloakify-demo-app/blob/main/package.json)

```json
"scripts": {
    "keycloak": "yarn build && keycloakify",
}
```

{% hint style="info" %}
Running `yarn keycloak` willl generate the **keycloak-theme.jar** file that you'll be able to import in Keycloak.
{% endhint %}

{% tabs %}
{% tab title="CSS Only customization" %}
The first approach is to only customize the style of the default Keycloak login theme by providing your own class names.

`src/index.tsx`

```tsx
import { createRoot } from "react-dom/client";
import KcApp from "keycloakify/components/KcApp";
import { defaultKcProps, getKcContext } from "keycloakify";

//We assume the file contains: ".my-class { color: red; }"
import "./index.css";

const { kcContext } = getKcContext();

if( kcContex === undefined ){
    throw new Error(
        "This app is a Keycloak theme" +
        "It isn't meant to be deployed outside of Keycloak"
    );
}

createRoot(document.getElementById("root")!).render(
    <KcApp
        kcContext={kcContext}
        {...{
            ...defaultKcProps,
            kcHeaderWrapperClass: "my-class",
        }}
    />
);
```

The above snippet of code assumes you are in a react project which only purpose is to be a Keycloak theme.

If you want to make your Keycloak theme an integral part of a preexisting React app you would apply the following modification to the above snippet:

```diff
import { createRoot } from "react-dom/client";
+import { lazy, Suspense } from "react";
-import KcApp from "keycloakify/components/KcApp";
 import { defaultKcProps, getKcContext } from "keycloakify";
 
 import "./index.css";

 const { kcContext } = getKcContext();

-if( kcContex === undefined ){
-    throw new Error(
-        "This app is a Keycloak theme" +
-        "It isn't meant to be deployed outside of Keycloak"
-    );
-}

+const App = lazy(() => import("<path of the root component of your app>"));
+const KcApp= lazy(()=> import("keycloakify/components/KcApp"));

 createRoot(document.getElementById("root")!).render(
+    <Suspence>
+        {
+            kcContext === undefined ?
+                <App /> :
                 <KcApp
                     kcContext={kcContext}
                     {...{
                         ...defaultKcProps,
                         kcHeaderWrapperClass: myClassName
                     }}
                 />
+        }
+    </Suspence>
 );
```

![Result: MYREALM is red](https://user-images.githubusercontent.com/6702424/114326299-6892fc00-9b34-11eb-8d75-85696e55458f.png)

#### Real world example

To give you an idea of what you can already achieve by only customizing the style the style,

Here is [**the code**](https://github.com/InseeFrLab/onyxia-web/blob/012639d62327a9a56be80c46e32c32c9497b82db/src/app/components/KcApp.tsx) that produces:&#x20;

![Results obtained with CSS only customization of the default theme](https://github.com/InseeFrLab/keycloakify/releases/download/v0.3.8/keycloakify\_after.gif)

{% hint style="info" %}
The keycloakify components are a plain React translation of the default theme that comes with Keycloak v11.0.3. &#x20;

You can download the FTL/CSS source files the components are based on with the following command:

`npx -p keycloakify download-builtin-keycloak-theme`&#x20;

then select version 11.0.3 ([Video demo](https://user-images.githubusercontent.com/6702424/164304458-934b0e1d-9de7-4bb4-8a1c-e06a70b1636a.mov)).
{% endhint %}
{% endtab %}

{% tab title="Component level customization" %}
If you want to go beyond only customizing the CSS you can re-implement some of the pages or even add new ones.

If you want to go this way checkout the demo setup provided [here](https://github.com/garronej/keycloakify-advanced-starter). If you prefer a real life example you can checkout [onyxia-web's source](https://github.com/InseeFrLab/onyxia-web/tree/main/src/ui/components/KcApp). The web app is in production [here](https://datalab.sspcloud.fr).

See also [this documentation section](limitations.md#i-have-established-that-a-page-that-i-need-isnt-supported-out-of-the-box-by-keycloakify-now-what) for more info on how to add support for extra `ftl` pages.&#x20;
{% endtab %}
{% endtabs %}

### How to import the .jar in Keycloak

Before loading you theme into Keycloak you probably want to give it a spin locally. Read up the following section:&#x20;

{% content-ref url="developpement.md" %}
[developpement.md](developpement.md)
{% endcontent-ref %}
