# 🌉 Context persistence

If, before logging in, a user has selected a specific language you don't want it to be reset to default when the user gets redirected to the login or register pages.

Same goes for the dark mode, you don't want, if the user had it enabled to show the login page with light themes.

The problem is that you are probably using `localStorage` to persist theses values across reload but, as the Keycloak pages are not served on the same domain that the rest of your app you won't be able to carry over states using `localStorage`.

The only reliable solution is to inject parameters into the URL before redirecting to Keycloak. We integrate with [`keycloak-js`](https://github.com/keycloak/keycloak-documentation/blob/master/securing\_apps/topics/oidc/javascript-adapter.adoc), by providing you a way to tell `keycloak-js` that you would like to inject some search parameters before redirecting.

The method also works with [`@react-keycloak/web`](https://www.npmjs.com/package/@react-keycloak/web) (use the `initOptions`).

You can implement your own mechanism to pass the states in the URL and restore it on the other side but we recommend using [`powerhooks/useGlobalState`](https://github.com/garronej/powerhooks%23useglobalstate) from the library [`powerhooks`](https://www.powerhooks.dev) that provide an elegant way to handle states such as `isDarkModeEnabled` or `selectedLanguage`.

Let's modify [the example](https://github.com/keycloak/keycloak-documentation/blob/master/securing\_apps/topics/oidc/javascript-adapter.adoc) from the official `keycloak-js` documentation to enables the states of `useGlobalStates` to be injected in the URL before redirecting.\
Note that the states are automatically restored on the other side by `powerhooks`

```typescript
import keycloak_js from "keycloak-js";
import { injectGlobalStatesInSearchParams } from "powerhooks/useGlobalState";
import { createKeycloakAdapter } from "keycloakify";
import { addParamToUrl } from "powerhooks/tools/urlSearchParams";

//...

const keycloakInstance = keycloak_js({
    "url": "http://keycloak-server/auth",
    "realm": "myrealm",
    "clientId": "myapp",
});

keycloakInstance.init({
    "onLoad": "check-sso",
    "silentCheckSsoRedirectUri": window.location.origin + "/silent-check-sso.html",
    "adapter": createKeycloakAdapter({
        "transformUrlBeforeRedirect": url=>
            [url]
                //This will append &ui_locales=fr at on the login page url we are about to 
                //redirect to. 
                //This will tell keycloak that the login should be in french. 
                //Replace "fr" by any KcLanguageTag you have enabled on your Keycloak server.
                .map(url => addParamToUrl({ url, "name": "ui_locales", "value": "fr" }).newUrl)
                //If you are using https://github.com/garronej/powerhooks#useglobalstate
                //for controlling if the dark mode is enabled this will persiste the state.
                .map(injectGlobalStatesInSearchParams)
                [0],
        keycloakInstance,
    }),
});

//...
```

If you really want to go the extra miles and avoid having the white flash of the blank html before the `js` bundle have been evaluated [here is a snippet](https://github.com/InseeFrLab/onyxia-web/blob/e1c1f309aaa3d5f860df39ba0b75cce89c88a9de/public/index.html#L117-L166) that you can place in your `public/index.html` if you are using `powerhooks/useGlobalState`.
