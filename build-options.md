# 📖 Build options

### CLI options

Options that can be passed to the `npx build-keycloak-theme` command.

#### `--external-assets`

{% hint style="info" %}
`This is for performance optimisation.`
{% endhint %}

Build the theme without bundling the assets (static js files, images ect). Keycloakify will read the `package.json` -> `homepage` field to know from where the assets should be downloaded. &#x20;

This enable to you to enable CDN and enable big shared file to be cached by the user's browser. &#x20;

Step to make `--external-assets` work: &#x20;

* Provide the url of your app in the `homepage` field of `package.json` [example](https://github.com/garronej/keycloakify-demo-app/blob/7847cc70ef374ab26a6cc7953461cf25603e9a6d/package.json#L2) or in a `public/CNAME` file [example.](https://github.com/garronej/keycloakify-demo-app/blob/main/public/CNAME) (Or use [`keycloakify.areAppAndKeycloakServerSharingSameDomain=true`](build-options.md#keycloakify.isappandkeycloakserversharingsamedomain)`)`
* Build the theme using `npx build-keycloak-theme --external-assets` [ex](https://github.com/garronej/keycloakify-demo-app/blob/7847cc70ef374ab26a6cc7953461cf25603e9a6d/.github/workflows/ci.yaml#L21)
* (Optional) Enable [long-term assets caching](https://create-react-app.dev/docs/production-build/#static-file-caching) on the server hosting your app. [This is how you would do it with Ngnix](https://github.com/garronej/keycloakify-demo-app/blob/f08e02e1bd0c67b3cc8d49c03d4dd6d7916f457b/nginx.conf#L17-L29).
* Make sure not to build your app and the keycloak theme separately (run `yarn keycloak` only once in your CI) and remember to update the Keycloak theme every time you update your app.
* Be mindful that if your app is down your login pages are down as well.

Checkout a complete setup [here](https://github.com/garronej/keycloakify-demo-app#about-keycloakify)

#### `--silent` [TODO](https://github.com/InseeFrLab/keycloakify/issues/151)

Prevent the build command from generating outputs. &#x20;

### `package.json` options

You can read [here](https://github.com/InseeFrLab/keycloakify/blob/832434095eac722207c55062fd2b825d1f691722/src/bin/build-keycloak-theme/BuildOptions.ts#L7-L16) the package.json fields that are used by Keyclaokify.&#x20;

#### `keycloakify.extraPages`

Tells Keycloakify to generate extra pages. &#x20;

If you have in your `package.json`: &#x20;

```json
{
    "keycloakify": {
        "extraPages": [ 
            "my-extra-page-1.ftl", 
            "my-extra-page-2.ftl" 
        ]
    }
}
```

Keycloakify will generate `my-extra-page-1.ftl` and `my-extra-page-2.ftl` alongside `login.ftl`, r`egister-user-profile.ftl` ect...

More info about this in [this section (I do it only for my project)](limitations.md#i-have-established-that-a-page-that-i-need-isnt-supported-out-of-the-box-by-keycloakify-now-what). &#x20;

#### `keycloakify.extraThemeProperties`

By default the `theme.properties` files located in `build_keycloak/src/main/resources/theme/<your app>/login/theme.properties` only contains:&#x20;

```
parent=keycloak
```

If, for some reason, you need to add extra properties like for example `env=dev` you can do it by editing your `package.json` this way: &#x20;

```json
{
    "keycloakify": {
        "extraThemeProperties": [ 
            "env=dev"
        ]
    }
}
```

#### `keycloakify.areAppAndKeycloakServerSharingSameDomain`

This option is only considered when building with [`--external-assets`](build-options.md#external-assets).  &#x20;

Set to `true` it tels Keycloakify that you have configured your reverse proxy so that your app and your Keycloak server are under the same domain, example: &#x20;

* _https://example.com/auth_: Keycloak.
* _https://example.com/x/y/z_: Your App

Example: &#x20;

```json
{
    "keycloakify": {
        "areAppAndKeycloakServerSharingSameDomain": true
    }
}
```

When enabled you don't need to specify a `homepage` field in the `package.json`
