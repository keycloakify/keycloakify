---
description: What to do if you want to add entries in messages_xx.properties
---

# 🌐 Adding i18n messages keys

![](.gitbook/assets/Untitled.png)

In Keycloakify you can't directly eddit the `messages_xx.properties` files, the way to go it to reproduce [this approach](https://github.com/garronej/keycloakify-demo-app/blob/main/src/kcMessagesExtension.ts) ( don't forget to [evaluate the code](https://github.com/garronej/keycloakify-demo-app/blob/9d92307361d19cdfb06a23f46a7003662fae3b34/src/index.tsx#L14) ).

{% hint style="warning" %}
This approach is a bit hacky as it doesn't provide type safety, it needs to be improved. &#x20;

In the meantime see [this issue](https://github.com/InseeFrLab/keycloakify/issues/17) for other workarounds.
{% endhint %}
