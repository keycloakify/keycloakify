---
description: Only allow specific emails to register.
---

# 💂 Email domain acceptlist

{% embed url="https://user-images.githubusercontent.com/6702424/164943571-560cdccb-2c68-40b8-bd45-c229401f3fd4.mp4" %}
Can't register with a @gmail.com address
{% endembed %}

{% tabs %}
{% tab title="With user profile" %}
Using user profile capabilities of keycloak you can define a Regexp on the email field that will only allow certain domails to register. &#x20;

The Regexp should look [something like this](https://github.com/etalab/sill-web/blob/20e1500166708da75fcad4ebfb9f6e1d39b462c0/src/ui/components/KcApp/kcContext.ts#L53) and can be generated easily with [this helper](https://github.com/etalab/sill-web/blob/main/src/bin/emails\_domain\_accept\_list\_helper.ts). &#x20;

Find the source code of the register page showed in the video [here](https://github.com/etalab/sill-web/blob/main/src/ui/components/KcApp/RegisterUserProfile.tsx).
{% endtab %}

{% tab title="With a third party Keycloak plugin" %}
The legacy way of doing it would be with [this plugin](https://github.com/micedre/keycloak-mail-whitelisting) and using`kcContext["authorizedMailDomains"]` to validate in realtime. &#x20;

Relevent code [here](https://github.com/garronej/keycloakify-demo-app/blob/a316ea0046976e6d435a33e896cb9e3d1873c124/src/KcApp/kcContext.ts#L11) and [here](https://github.com/garronej/keycloakify-demo-app/blob/a316ea0046976e6d435a33e896cb9e3d1873c124/src/KcApp/kcContext.ts#L35-L41).
{% endtab %}
{% endtabs %}

