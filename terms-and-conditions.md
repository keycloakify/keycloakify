# ✒ Terms and conditions

{% embed url="https://user-images.githubusercontent.com/6702424/164942769-0d5420e3-c62f-4187-977e-316a113fb037.mp4" %}

Many organizations have a requirement that when a new user logs in for the first time, they need to agree to the terms and conditions of the website.

First you need to enable the required action on the Keycloak server admin console:\


![](https://user-images.githubusercontent.com/6702424/114280501-dad2e600-9a39-11eb-9c39-a225572dd38a.png)

Then you'll have to do [something like this](https://github.com/garronej/keycloakify-demo-app/blob/a5b6a50f24bc25e082931f5ad9ebf47492acd12a/src/index.tsx#L46-L63).
