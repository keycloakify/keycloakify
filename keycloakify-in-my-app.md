---
description: >-
  Keycloakify can be integrated to a React app, it's great when you're looking
  to create a theme for a specific app.
---

# 🔩 Keycloakify in my App

First of, be aware that Keycloakify will only will only work with React SPA build with Webpack. &#x20;

Second, before anything study and mess around with the starter project to familiarize yourself with how Keycloakify works. &#x20;

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

That's it. You can build your App as a Keycloak theme with `yarn build-keycloak-theme`
