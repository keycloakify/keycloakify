---
description: Looking for submitting a PR? Thank you!
---

# 💟 Contributing

### Adding support for a new page

[Here is an example of a good PR](https://github.com/InseeFrLab/keycloakify/pull/92) that adds support for a page.

If you need to edit the i18n resources it should be done [here](https://github.com/InseeFrLab/keycloakify/blob/58c8306cf467f5884757683cf34428deba55ce57/src/lib/i18n/index.tsx#L9-L30) (and not in the `src/lib/i18n/generated_kcMessages` dir).

The keycloakify components are a plain React translation of the default theme that comes with Keycloak v11.0.3.

You can download the FTL/CSS source files the components are based on with the following command:

`npx -p keycloakify download-builtin-keycloak-theme`

then select version 11.0.3 ([Video demo](https://user-images.githubusercontent.com/6702424/164304458-934b0e1d-9de7-4bb4-8a1c-e06a70b1636a.mov)).

### Testing your changes in the demo app (or in your project)

Let's assume you have made some change to the `keycloakify` codebase and you want to test those changes before submitting a PR.

Assuming you have cloned keycloakify in `~/github/keycloakify` this is how you would proceed.

```bash
cd ~/github # Navigate to the dir where you have the keycloakify project
git clone https://github.com/garronej/keycloakify-starter
#OR: git clone https://github.com/garronej/keycloakify-advanced-starter
cd keycloakify
yarn 
yarn build
yarn link_in_test_app
# The following command will start the compilation of Keycloakify
# in watch mode. You will be able to perform changes on the keycloakify code
# and see them apply live in the keycloakify-demo-app
npx tsc -p src/bin -w & npx tsc -p src/lib -w 
```

Open a new terminal window

```bash
cd ~/github
cd keycloakify-starter
#OR: cd keycloakify-advanced-starter
yarn start
```

Now you are able to test your local version of Keycloakify in the test app and make sure everything works as expected.

{% hint style="success" %}
If you want to link your local version of `keycloakify` in your own app instead of the `keycloakify-starter` just run `yarn link_in_test_app <your_app>` (Assuming `../<your_app>` exsist)
{% endhint %}

Heads over the development instruction if you are not already familiar with the process of testing your Keycloakify themes:

{% content-ref url="developpement.md" %}
[developpement.md](developpement.md)
{% endcontent-ref %}
