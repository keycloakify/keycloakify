# 🌉 Context persistence

Let's explore how we can pass query params to the URL before redirecting to the login page so that we can transport some state from the main app to the login page. &#x20;

It's up to you to implement it however you want but here's a solution off the shelf for you to use

{% embed url="https://github.com/codegouvfr/keycloakify-starter/blob/main/src/keycloak-theme/valuesTransferredOverUrl.ts" %}
Declare the varialbes that we want to pass over, here foo and bar
{% endembed %}

{% embed url="https://github.com/codegouvfr/keycloakify-starter/blob/00059fbb805b61a7363bf58040ba471a1b1b7c43/src/App/App.tsx#L16-L23" %}
Add the value to the url before redirecting
{% endembed %}

{% embed url="https://github.com/codegouvfr/keycloakify-starter/blob/00059fbb805b61a7363bf58040ba471a1b1b7c43/src/keycloak-theme/KcApp.tsx#L8-L10" %}
Using the values in the login pages
{% endembed %}
