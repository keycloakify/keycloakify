# ✒ Terms and conditions

{% embed url="https://user-images.githubusercontent.com/6702424/164942769-0d5420e3-c62f-4187-977e-316a113fb037.mp4" %}

Many organizations have a requirement that when a new user logs in for the first time, they need to agree to the terms and conditions of the website.

First you need to enable the required action on the Keycloak server admin console:\


![](https://user-images.githubusercontent.com/6702424/114280501-dad2e600-9a39-11eb-9c39-a225572dd38a.png)

Then you load your own therms in Markdown format like this: &#x20;

[src/KcApp/KcApp.tsx](https://github.com/garronej/keycloakify-starter/blob/main/src/KcApp/KcApp.tsx)

```jsx
import type { KcContext } from "./kcContext";
import KcAppBase, { defaultKcProps, useDownloadTerms } from "keycloakify";
import tos_en_url from "./tos_en.md";
import tos_fr_url from "./tos_fr.md";

export type Props = {
    kcContext: KcContext;
};

export default function KcApp(props: Props) {
    const { kcContext } = props;

    useDownloadTerms({
        kcContext,
        "downloadTermMarkdown": async ({ currentLanguageTag }) => {
        
            const markdownString = await fetch(
                (() => {
                    switch (currentLanguageTag) {
                        case "fr": return tos_fr_url;
                        default: return tos_en_url;
                    }
                })(),
            ).then(response => response.text());

            return markdownString;
        }
    });

    return (
        <KcAppBase
            kcContext={kcContext}
            {...defaultKcProps}
        />
    );
}
```
