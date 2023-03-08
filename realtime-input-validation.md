# ✅ Realtime input validation

{% embed url="https://user-images.githubusercontent.com/6702424/175101958-c2fe36a1-1d78-43ed-999e-92e4b482a0cb.mp4" %}

{% hint style="warning" %}
In reality the regexp used in this gif doesn't work server side, the regexp pattern should be `^[^@]@gmail\.com$` (the RegExp should match the whole string) 😬.
{% endhint %}

User Profile is a Keycloak feature that enables to [define, from the admin console](https://user-images.githubusercontent.com/6702424/136872461-1f5b64ef-d2ef-4c6b-bb8d-07d4729552b3.png), what information you want to collect on your users in the register page and to validate inputs [**on the frontend**, in realtime](https://github.com/InseeFrLab/keycloakify/blob/6dca6a93d8cfe634ee4d8574ad0c091641220092/src/lib/getKcContext/KcContextBase.ts#L225-L261)!

NOTE: User profile is only available in Keycloak 15 and it's a beta feature that [needs to be enabled when launching keycloak](https://github.com/InseeFrLab/keycloakify/blob/59f106bf9e210b63b190826da2bf5f75fc8b7644/src/bin/build-keycloak-theme/build-keycloak-theme.ts#L116-L117) and [enabled in the console](https://user-images.githubusercontent.com/6702424/136874428-b071d614-c7f7-440d-9b2e-670faadc0871.png).

Keycloakify provides client side validation out of the box but for customizing the registration experience you'll have customize `register-user-profile.ftl`

Example in the starter project: &#x20;

{% embed url="https://github.com/codegouvfr/keycloakify-starter/blob/main/src/keycloak-theme/pages/RegisterUserProfile.tsx" %}
The RegisterUserProfile page...
{% endembed %}

{% embed url="https://github.com/codegouvfr/keycloakify-starter/blob/main/src/keycloak-theme/pages/shared/UserProfileCommons.tsx" %}
...but this is where the magic happens
{% endembed %}

{% hint style="warning" %}
As for right now [Keycloak dosen't allow to define a pattern for the password](https://keycloak.discourse.group/t/make-password-policies-available-to-freemarker/11632) in the admin console. You can however pass validators for it to the `useFormValidation` function. (this is why useFormValidation returns `attributesWithPassword`)
{% endhint %}

