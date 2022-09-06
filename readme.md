# 🏁 Requirements

{% hint style="warning" %}
This tool will only run natively on **Linux** and **Mac OS**.

**Windows** users will haver to use it via [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10). More info [here](https://github.com/InseeFrLab/keycloakify/issues/54#issuecomment-984834217).
{% endhint %}

{% hint style="success" %}
This tool will be maintained to stay compatible with every Keycloak version starting from [Keycloak Version 11](https://github.com/keycloak/keycloak/releases/tag/11.0.3).

However, the default pages you will get (before you customize them) will always be the ones of Keycloak [v11.0.3](https://github.com/keycloak/keycloak/releases/tag/11.0.3) and some extra pages that didn't existed back then like `register-user-profile.ftl.` &#x20;
{% endhint %}

### Supported Keycloak version

<details>

<summary>See versions Keycloakify have been tested with</summary>

* [11.0.3](https://hub.docker.com/layers/jboss/keycloak/11.0.3/images/sha256-4438f1e51c1369371cb807dffa526e1208086b3ebb9cab009830a178de949782?context=explore)
* [12.0.4](https://hub.docker.com/layers/jboss/keycloak/12.0.4/images/sha256-67e0c88e69bd0c7aef972c40bdeb558a974013a28b3668ca790ed63a04d70584?context=explore)
* [15.0.2](https://hub.docker.com/layers/jboss/keycloak/15.0.2/images/sha256-d8ed1ee5df42a178c341f924377da75db49eab08ea9f058ff39a8ed7ee05ec93?context=explore)
* [16.1.0](https://hub.docker.com/layers/jboss/keycloak/16.1.0/images/sha256-6ecb9492224c6cfbb55d43f64a5ab634145d8cc1eba14eae8c37e3afde89546e?context=explore)
* [17.0.1](https://github.com/keycloak/keycloak/releases/tag/17.0.1)
* [18.0.0](https://quay.io/repository/keycloak/keycloak?tab=tags\&tag=18.0.0)
* [18.0.2](https://quay.io/repository/keycloak/keycloak?tab=tags\&tag=18.0.2)

Latest release isn't in the list yet? It probably works fine, we just can't confirm it yet. &#x20;

Older version are likely to be supported as well.&#x20;

</details>

### Supported React frameworks

{% hint style="success" %}
If you aren't trying to integrate the theme with a preexisting react app, save yourself some time and just use [create-react-app](https://create-react-app.dev).
{% endhint %}

<details>

<summary>See more</summary>

This tool assumes you are bundling your app with [Webpack](https://webpack.js.org/).&#x20;

It assumes there is a `build/` directory at the root of your react project directory, it's usually generated after running `yarn build`.

The `build/` directory is expected to contain an `index.html` file and a `build/static/` directory. &#x20;

Keycloakify also assumes there is a public/ directory at the root of your react project that is used to make static files available. &#x20;

Concretely Keycloakify assumes that if there is a `public/a/b.c/foo.txt` file. This file should be available at `https://localhost:<some_port>/a/b/c.foo.txt` when running your app in test mode (usually by firing yarn start).&#x20;

For more detailed information see [this issue](https://github.com/InseeFrLab/keycloakify/issues/5#issuecomment-832296432).

#### My framework doesn’t seem to be supported, what can I do?

Currently Keycloakify is only compatible with SPA React apps. It doesn’t mean that you can't use Keycloakify if you are using Next.js, Express or any other framework that involves a server but your Keycloak theme will need to be a standalone project.\
Find specific instructions about how to get started [**here**](https://github.com/garronej/keycloakify-demo-app#keycloak-theme-only).

To share your styles between your main app and your login pages you will need to externalize your design system by making it a separate module. Checkout [ts\_ci](https://github.com/garronej/ts\_ci), it can help with that (example with [our design system](https://github.com/InseeFrLab/onyxia-ui)).

</details>

### Utility that needs to be installed

* `mvn` ([Maven](https://maven.apache.org)), `rm`, `mkdir`, `curl`, `unzip`.
* `docker` must be up and running when running `start_keycloak_testing_container.sh`&#x20;
