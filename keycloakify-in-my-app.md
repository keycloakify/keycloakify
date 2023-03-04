# 🔩 Keycloakify in my App

A Keycloakify theme do not need to be a standalone project.  \
If you are building an SPA React application that you bundle with Webpack, which is the case when you use [create-react-app](https://create-react-app.dev/), you can install Keycloakify right into your project and build your login pages alongside the other pages of your app. &#x20;

{% hint style="warning" %}
Before moving on and setting up Keycloakify in your project, first, mess around with [the starter project](https://github.com/codegouvfr/keycloakify-starter) to familiarize yourself with Keycloakify.      &#x20;
{% endhint %}

Once you think you are ready to move on: &#x20;

```bash
yarn add keycloakify
```

add the following script

{% code title="package.json" %}
```json
{
  "scripts": {
     ...
     "build-keyclak-theme": "yarn build && keycloakify"
  }
}
```
{% endcode %}

Git ignore the keycloak build directory: &#x20;

{% code title=".gitignore" %}
```diff
...
/build_keycloak
```
{% endcode %}

That's it. You can build your App as a Keycloak theme with `yarn build-keycloak-theme`\
``You might now want to have a look at the available build options:&#x20;

{% content-ref url="build-options.md" %}
[build-options.md](build-options.md)
{% endcontent-ref %}
