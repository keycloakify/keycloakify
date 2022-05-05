# ⚠ Limitations

### Some pages still have the default theme. Why?  

This project only support out of the box the most common user facing pages of Keycloak login.  

[Here](https://user-images.githubusercontent.com/6702424/116787906-227fe700-aaa7-11eb-92ee-22e7673717c2.png) is the complete list of pages (you get them after running `yarn test`)

and [here](https://github.com/InseeFrLab/keycloakify/tree/main/src/lib/components) are the pages currently implemented by this module.  

If you need to customize pages that are not supported yet or if you need to implement some non standard `.ftl` pages please refer to [Advanced pages configuration](#advanced-pages-configuration).


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
* If you can't or wont move your `@font-face` statements in the `public/index.html`, you can still [use non relative url](https://github.com/garronej/keycloakify-demo-app/blob/2de8a9eb6f5de9c94f9cd3991faad0377e63268c/src/fonts.scss#L16), you will need to enable [`Access-Control-Allow-Origin`](https://github.com/garronej/keycloakify-demo-app/blob/2de8a9eb6f5de9c94f9cd3991faad0377e63268c/nginx.conf#L17-L19) for your font files, even on the same domain.&#x20;

### login and email only

![](<.gitbook/assets/image (1).png>)

As of now Keycloakify only enable you to create a theme that covers the Login pages and the emails. `Acount` and `Admin Console` aren't supported yet. &#x20;

If you are missing this feature [open an issue about it](https://github.com/InseeFrLab/keycloakify/issues/new).&#x20;
