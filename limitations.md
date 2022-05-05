# ⚠ Limitations

### Some pages still have the default theme. Why?

This project only support out of the box the most common user facing pages of Keycloak login.

To see the complete list of pages that Keycloak provide you can download the base theme with the following command

`npx -p keycloakify download-builtin-keycloak-theme`&#x20;

Most Keycloakify component are based on the base theme of Keycloak v11.0.3 ([Video demo](https://user-images.githubusercontent.com/6702424/164304458-934b0e1d-9de7-4bb4-8a1c-e06a70b1636a.mov)). &#x20;

[Here](https://github.com/InseeFrLab/keycloakify/tree/main/src/lib/components) are the pages currently implemented by this module. &#x20;

#### I have established that a page that I need isn't supported out of the box by Keycloakify, now what? &#x20;

{% tabs %}
{% tab title="I submit a PR to Keycloakify" %}
Keycloakify is a comunity driven project. &#x20;

If you could add support for the page you are missing your contribution would be much apreciated. &#x20;

[Here is an example of a good PR](https://github.com/InseeFrLab/keycloakify/pull/92) that adds support for a page. &#x20;
{% endtab %}

{% tab title="I do it only for my project" %}
Keycloakify also enables you to declare custom ftl pages. &#x20;

Check out how `my-extra-page-1.ftl` and `my-extra-page-2.ftl` where added to [the demo project](https://github.com/garronej/keycloakify-demo-app/tree/look\_and\_feel). &#x20;

Main takeaways are:

* You must declare your custom pages in the package.json. [example](https://github.com/garronej/keycloakify-demo-app/blob/4eb2a9f63e9823e653b2d439495bda55e5ecc134/package.json#L17-L22)
* (TS only) You must declare theses page in the type argument of the getter function for the `kcContext` in order to have the correct typings. [example](https://github.com/garronej/keycloakify-demo-app/blob/4eb2a9f63e9823e653b2d439495bda55e5ecc134/src/KcApp/kcContext.ts#L16-L21)
* (TS only) If you use Keycloak plugins that defines non standard `.ftl` values (Like for example [this plugin](https://github.com/micedre/keycloak-mail-whitelisting) that define `authorizedMailDomains` in `register.ftl`) you should declare theses value to get the type. [example](https://github.com/garronej/keycloakify-demo-app/blob/4eb2a9f63e9823e653b2d439495bda55e5ecc134/src/KcApp/kcContext.ts#L6-L13)
* You should provide sample data for all the non standard value if you want to be able to debug the page outside of keycloak. [example](https://github.com/garronej/keycloakify-demo-app/blob/4eb2a9f63e9823e653b2d439495bda55e5ecc134/src/KcApp/kcContext.ts#L28-L43)
{% endtab %}
{% endtabs %}

### `process.env.PUBLIC_URL` not supported.

You won't be able to [import things from your public directory **in your JavaScript code** (it's supported in `public/index.html`)](https://create-react-app.dev/docs/using-the-public-folder/#adding-assets-outside-of-the-module-system). (This isn't recommended anyway).

### `@font-face` importing fonts from the `src/` dir

If you are building the theme with [--external-assets](page-1.md) this limitation doesn't apply, you can import fonts however you see fit.

#### Example of setup that **won't** work

* We have a `fonts/` directory in `src/`
* We import the font like this [`src: url("/fonts/my-font.woff2") format("woff2");`](https://github.com/garronej/keycloakify-demo-app/blob/07d54a3012ef354ee12b1374c6f7ad1cb125d56b/src/fonts.scss#L4) in a `.scss` a file.

#### Possible workarounds

* [Use `--external-assets`](page-1.md).
* If it is possible, use Google Fonts or any other font provider.
* If you want to host your font recommended approach is to move your fonts into the `public` directory and to place your `@font-face` statements in the `public/index.html`.\
  Example [here](https://github.com/garronej/keycloakify-demo-app/blob/9aa2dbaec28a7786d6b2983c9a59d393dec1b2d6/public/index.html#L27-L73) (and the font are [here](https://github.com/garronej/keycloakify-demo-app/tree/main/public/fonts/WorkSans)).
* If you can't or wont move your `@font-face` statements in the `public/index.html`, you can still [use non relative url](https://github.com/garronej/keycloakify-demo-app/blob/2de8a9eb6f5de9c94f9cd3991faad0377e63268c/src/fonts.scss#L16), you will need to enable [`Access-Control-Allow-Origin`](https://github.com/garronej/keycloakify-demo-app/blob/2de8a9eb6f5de9c94f9cd3991faad0377e63268c/nginx.conf#L17-L19) for your font files, even on the same domain.

### login and email only

![](<.gitbook/assets/image (1).png>)

As of now Keycloakify only enable you to create a theme that covers the Login pages and the emails. `Acount` and `Admin Console` aren't supported yet.

If you are missing this feature [open an issue about it](https://github.com/InseeFrLab/keycloakify/issues/new).
