---
description: Test and debug your theme
---

# 🧪 Development

### Seeing the result live

When building your page you want to see the result of your edit live.

To acheave that with Keycloakify simply eddit:

```diff
 import { getKcContext } from "keycloakify";

 const { kcContext } = getKcContext({
+    "mockPageId": "login.ftl"
 });
```

then if you run `yarn start` you will see your login page display. **Dont forget to remove mockPageId before releasing** 😉.

{% hint style="success" %}
The page is loaded with a default mock context.

To customize the mock kcContext please refer to [this example](https://github.com/garronej/keycloakify-demo-app/blob/a316ea0046976e6d435a33e896cb9e3d1873c124/src/KcApp/kcContext.ts#L28-L78).
{% endhint %}

### Testing in a real Keycloak instance

Once you are done developping you want to test in an actual Keycloak instance to see if everything is working as expected.

Please refer to the related instruction printed on the console when running `yarn keycloak` in your project.
