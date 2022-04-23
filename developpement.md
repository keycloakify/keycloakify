# 🧪 Developpement

### Seeing the result live

When building your page you want to see the result of your edit live. &#x20;

To acheave that with Keycloakify simply eddit: &#x20;

```diff
 import { getKcContext } from "keycloakify";

 const { kcContext } = getKcContext({
+    "mockPageId": "login.ftl"
 });
```

then if you run yarn start you will see your login page display (Dont forget to remove mockPageId before releasing 😉). &#x20;

The page is loaded with a default mock context. To customize the mock kcContext please refer&#x20;

```tsx
import {
    KcApp,
    defaultKcProps,
    getKcContext
} from "keycloakify";

const { kcContext } = getKcContext({
    "mockPageId": "login.ftl"
});

reactDom.render(
        <KcApp
            kcContext={kcContextMocks.kcLoginContext}
            {...defaultKcProps}
        />
    document.getElementById("root")
);
```
