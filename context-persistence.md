# 🌉 Context persistence

If, before logging in, a user has selected a specific language you don't want it to be reset to default when the user gets redirected to the login or register pages.

Same goes for the dark mode, you don't want, if the user had it enabled to show the login page with light themes.

The problem is that you are probably using `localStorage` to persist theses values across reload but, as the Keycloak pages are not served on the same domain that the rest of your app you won't be able to carry over states using `localStorage`.

The only reliable solution is to inject parameters into the URL before redirecting to Keycloak. We integrate with [`keycloak-js`](https://github.com/keycloak/keycloak-documentation/blob/master/securing\_apps/topics/oidc/javascript-adapter.adoc), by providing you a way to tell `keycloak-js` that you would like to inject some search parameters before redirecting.

The method also works with [`@react-keycloak/web`](https://www.npmjs.com/package/@react-keycloak/web) (use the `initOptions`).

You can implement your own mechanism to pass the states in the URL and restore it on the other side but we recommend using [`powerhooks/useGlobalState`](https://github.com/garronej/powerhooks#useglobalstate) from the library [`powerhooks`](https://www.powerhooks.dev) that provide an elegant way to handle states such as `isDarkModeEnabled`.

Let's modify [the example](https://github.com/keycloak/keycloak-documentation/blob/master/securing\_apps/topics/oidc/javascript-adapter.adoc) from the official `keycloak-js` documentation to enables the relevant states of our app to be injected in the URL before redirecting.

Let's say we have a boolean state `isDarkModeEnabled` that define if the dark theme should be enabled.   &#x20;

`useIsDarkModeEnabled.ts`

```tsx
import { createUseGlobalState } from "powerhooks/useGlobalState";

export const { useIsDarkModeEnabled, evtIsDarkModeEnabled } = createUseGlobalState({
	"name": "isDarkModeEnabled",
  //If we don't have a previous state stored in local storage nor an URL query param
  //that explicitly set the state, we initialize using the browser preferred color scheme.
	"initialState": ()=> (
		window.matchMedia &&
		window.matchMedia("(prefers-color-scheme: dark)").matches
	),
  //Do use localStorage to persist across reloads.
	"doPersistAcrossReloads": true
});
```

Now let's see how we would use this state in our react app.

`MyComponent.tsx`

```tsx
import { useIsDarkModeEnabled } from "./useIsDarkModeEnabled";

export function MyComponent(){

  const { isDarkModeEnabled, setIsDarkModeEnabled }= useIsDarkModeEnabled();

  return (
    <div>
      <p>The dark mode is currently: {isDarkModeEnabled?"enabled":"disabled"}</p>
      <button onClick={()=> setIsDarkModeEnabled(!isDarkModeEnabled)}>
        Click to toggle dark mode
      <button>
    </dvi>
  );

}
```

We can also update the state and track it's updates outside of react: &#x20;

```tsx
import { evtIsDarkModeEnabled } from "./useIsDarkModeEnabled";

//After 4 seconds, enable dark mode
setTimeout(
  ()=>{
      //This triggers re-renders of all the components that uses the state.
      //(the assignation has side effect)
      evtIsDarkModeEnabled.state = true;

  },
  4000
);

//Print something in the console anytime the state changes:  

evtIsDarkModeEnabled.attach(isDarkModeEnabled=> {
  console.log(`idDarkModeEnabled changed, new value: ${isDarkModeEnabled}`);
});
```

{% hint style="info" %}
A more production ready implementation of `useIsDarkModeEnabled` is available [here](https://github.com/garronej/powerhooks/blob/master/src/test/spa/src/TestUseGlobalState/useIsDarkModeEnabled.tsx).
{% endhint %}

Now let's see how we would carry our isDarkModeEnabled to our login theme. &#x20;

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
                //This will make sure our isDarkModeEnabled and other global states
                //created with powerhooks/useGlobalState are restored on the other side. 
                .map(injectGlobalStatesInSearchParams)
                [0],
        keycloakInstance,
    }),
});

//...
```

If you really want to go the extra miles and avoid having the white flash of the blank html before the `js` bundle have been evaluated [here is a snippet](https://github.com/InseeFrLab/onyxia-web/blob/e1c1f309aaa3d5f860df39ba0b75cce89c88a9de/public/index.html#L117-L166) that you can place in your `public/index.html` if you are using `powerhooks/useGlobalState`.
