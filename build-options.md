# 📖 Build options

## CLI options

Options that can be passed to the `npx keycloakify` command.

### `--external-assets`

{% hint style="info" %}
`This is for performance optimisation.`
{% endhint %}

Build the theme without bundling the assets (static js files, images ect). Keycloakify will read the `package.json` -> `homepage` field to know from where the assets should be downloaded. &#x20;

This enables to you to levrage CDN and cache big resource files that are used by both the main app and the login pages. &#x20;

Step to make `--external-assets` work: &#x20;

* Provide the url of your app in the `homepage` field of `package.json` [example](https://github.com/garronej/keycloakify-demo-app/blob/7847cc70ef374ab26a6cc7953461cf25603e9a6d/package.json#L2) or in a `public/CNAME` file [example.](https://github.com/garronej/keycloakify-demo-app/blob/main/public/CNAME) (Or use [`keycloakify.areAppAndKeycloakServerSharingSameDomain=true`](build-options.md#keycloakify.isappandkeycloakserversharingsamedomain)`)`
* Build the theme using `npx build-keycloak-theme --external-assets` [ex](https://github.com/garronej/keycloakify-demo-app/blob/7847cc70ef374ab26a6cc7953461cf25603e9a6d/.github/workflows/ci.yaml#L21)
* (Optional) Enable [long-term assets caching](https://create-react-app.dev/docs/production-build/#static-file-caching) on the server hosting your app. [This is how you would do it with Ngnix](https://github.com/garronej/keycloakify-demo-app/blob/f08e02e1bd0c67b3cc8d49c03d4dd6d7916f457b/nginx.conf#L17-L29).
* Make sure not to build your app and the keycloak theme separately (run [`yarn build-keycloak-theme`](https://github.com/codegouvfr/keycloakify-starter/blob/ae6bcd89d5898d8de3dea417e4e0acaf1e8ec30c/package.json#L13) only once in your CI) and remember to update the Keycloak theme every time you update your app.
* Be mindful that if your app is down your login pages are down as well.

Checkout a complete setup [here](https://github.com/codegouvfr/keycloakify-starter)

### `--silent`

Prevent the build command from generating outputs. &#x20;

## `package.json` options

You can read [here](https://github.com/InseeFrLab/keycloakify/blob/832434095eac722207c55062fd2b825d1f691722/src/bin/build-keycloak-theme/BuildOptions.ts#L7-L16) the package.json fields that are used by Keyclaokify.&#x20;

### `keycloakify.extraPages`

Tells Keycloakify to generate extra pages. &#x20;

If you have in your `package.json`: &#x20;

<pre class="language-json" data-title="package.json"><code class="lang-json">{
    "keycloakify": {
<strong>        "extraPages": [ 
</strong><strong>            "my-extra-page-1.ftl", 
</strong><strong>            "my-extra-page-2.ftl" 
</strong><strong>        ]
</strong>    }
}
</code></pre>

Keycloakify will generate `my-extra-page-1.ftl` and `my-extra-page-2.ftl` alongside `login.ftl`, r`egister-user-profile.ftl` ect...

More info about this in [this section (I do it only for my project)](limitations.md#i-have-established-that-a-page-that-i-need-isnt-supported-out-of-the-box-by-keycloakify-now-what). &#x20;

### `keycloakify.extraThemeProperties`

By default the `theme.properties` files located in `build_keycloak/src/main/resources/theme/<your app>/login/theme.properties` only contains:&#x20;

```
parent=keycloak
```

If, for some reason, you need to add extra properties like for example `env=dev` you can do it by editing your `package.json` this way: &#x20;

<pre class="language-json" data-title="package.json"><code class="lang-json">{
    "keycloakify": {
<strong>        "extraThemeProperties": [ 
</strong><strong>            "env=dev"
</strong><strong>        ]
</strong>    }
}
</code></pre>

### `keycloakify.areAppAndKeycloakServerSharingSameDomain`

This option is only considered when building with [`--external-assets`](build-options.md#external-assets).  &#x20;

Set to `true` it tels Keycloakify that you have configured your reverse proxy so that your app and your Keycloak server are under the same domain, example: &#x20;

* _https://example.com/auth_: Keycloak.
* _https://example.com (or https://example.com/x/y/z)_: Your App

Example: &#x20;

<pre class="language-json" data-title="package.json"><code class="lang-json">{
    "keycloakify": {
<strong>        "areAppAndKeycloakServerSharingSameDomain": true
</strong>    }
}
</code></pre>

When enabled you don't need to specify a `homepage` field in the `package.json`

### keycloakify.bundler&#x20;

_Introduced in 6.11.4_

Configure if you want Keycloakify to build the final `.jar` for you or not. &#x20;

{% code title="package.json" %}
```json
{
    "keycloakify": {
        "bundler": "none"
    }
}
```
{% endcode %}

Possibles values are: &#x20;

* `"keycloakify"` (default): Keycloakify will build the .jar file.
* `"none"`: Keycloakify will not create a .jar file.
* `"mvn"` (legacy): Keycloakify will use Maven to bundle the .jar file. This option is to use only if you experience problem with "keycloakify". It require mvn to be installed. If you have to resort to this option [please open an issue about it](https://github.com/InseeFrLab/keycloakify/issues/new) so we can see wha't wrong with our way of building the `.jar` file.&#x20;

You can also convigure this value using an environement variable:&#x20;

```bash
KEYCLOAKIFY_BUNDLER=none npx keycloakify
```

### keycloakify.groupId

_Introduced in 6.11_

Configure the `groupId` that will appear in the `pom.xml` file. &#x20;

<figure><img src=".gitbook/assets/image (4).png" alt=""><figcaption></figcaption></figure>

{% code title="package.json" %}
```json
{
    "keycloakify": {
        "groupId": "dev.keycloakify.demo-app-advanced.keycloak"
    }
}
```
{% endcode %}

By default it's the package.json hompage field at reverse with .keycloak at the end. &#x20;

You can overwrite this using an environement variable:&#x20;

```bash
KEYCLOAKIFY_GROUP_ID="com.your-company.your-project.keycloak" npx keycloakify
```

### keycloakify.artifactId

_Introduced in 6.11_

Configure the `artifactId` that will appear in the `pom.xml` file. &#x20;

<figure><img src=".gitbook/assets/image (2).png" alt=""><figcaption></figcaption></figure>

{% code title="package.json" %}
```json
{
    "keycloakify": {
        "artifactId": "keycloakify-advanced-starter-keycloak-theme"
    }
}
```
{% endcode %}

By default it's `package.json["name"]-keycloak-theme`

You can overwrite this using an environement variable:&#x20;

```bash
KEYCLOAKIFY_ARTIFACT_ID="my-cool-theme" npx keycloakify
```

{% hint style="info" %}
The `artifactId` also affects [the name of the `.jar` file](https://github.com/InseeFrLab/keycloakify/blob/9f72024c61b1b36d71a42b242c05d7ac793e049b/src/bin/keycloakify/generateJavaStackFiles.ts#L85).
{% endhint %}

### version

Configure the version that will appear in the `pom.xml` file. &#x20;

<figure><img src=".gitbook/assets/image (3).png" alt=""><figcaption></figcaption></figure>

By default the version that is used is the one in the package.json of your project

{% code title="package.json" %}
```json
{
    "version": "1.3.4"
}
```
{% endcode %}

But you can overwrite this value using an environnement variable (_Introduced in 6.11)_:&#x20;

```bash
KEYCLOAKIFY_VERSION="4.5.6" npx keycloakify
```

{% hint style="info" %}
The version also affects [the name of the `.jar` file](https://github.com/InseeFrLab/keycloakify/blob/9f72024c61b1b36d71a42b242c05d7ac793e049b/src/bin/keycloakify/generateJavaStackFiles.ts#L85).
{% endhint %}
