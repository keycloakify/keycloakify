# 📖 Build options

### CLI options

Options that can be passed to the `npx build-keycloak-theme` command.

#### `--external-assets`

Build the theme without bundling the assets (static js files, images ect). Keycloakify will read the package.json -> homepage field to know where to download the assets. &#x20;

This enable to you to enable CDN and enable big shared file to be cached by the user's browser. &#x20;

See also isAppAndKeycloakServerSharingSameDomain. &#x20;

#### `--silent` TODO

Prevent the build command from generating outputs. &#x20;

### package.json options

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

#### keycloakify.extraThemeProperties

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
