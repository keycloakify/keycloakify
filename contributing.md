---
description: Looking for submitting a PR? Thank you!
---

# 💟 Contributing

### Adding support for a new page

[Here is an example of a good PR](https://github.com/InseeFrLab/keycloakify/pull/92) that adds support for a page. &#x20;

If you need to edit the i18n resources it should be done [here](https://github.com/InseeFrLab/keycloakify/blob/58c8306cf467f5884757683cf34428deba55ce57/src/lib/i18n/index.tsx#L9-L30) (and not in the `src/lib/i18n/generated_kcMessages` dir).

### Testing your changes in the demo app (or in your project)

Let's assume you have made some change to the `keycloakify` codebase and you want to test those changes before submitting a PR.

Assuming you have cloned keycloakify in `~/github/keycloakify` this is how you would proceed. &#x20;

```bash
cd ~/github # Navigate to the dir where you have the keycloakify project
git clone https://github.com/garronej/keycloakify-demo-app
cd keycloakify
yarn 
yarn build
yarn link_in_test_app
npx tsc -w #This will start the compilation of Keycloakify in watch mode
           #You will be able to perform changes on the keycloakify code
           #and see them apply live in the keycloakify-demo-app
```

Open a new terminal window

```bash
cd ~/github
cd keycloakify-demo-app
yarn start
```

Now you are able to test your local version of Keycloakify in the test app and make sure everything works as expected. &#x20;

{% hint style="info" %}
If you want to link your local version of `keycloakify` in your own app instead of the `keycloakify-demo-app` just run `yarn link_in_test_app <your_app>`
{% endhint %}

Heads over the development instruction if you are not already familiar with the process of testing your Keycloakify themes:

{% content-ref url="developpement.md" %}
[developpement.md](developpement.md)
{% endcontent-ref %}
