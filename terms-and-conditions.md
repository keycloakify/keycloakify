# ✒ Terms and conditions

{% embed url="https://user-images.githubusercontent.com/6702424/164942769-0d5420e3-c62f-4187-977e-316a113fb037.mp4" %}

Many organizations have a requirement that when a new user logs in for the first time, they need to agree to the terms and conditions of the website.

First you need to enable the required action on the Keycloak server admin console:\


![](https://user-images.githubusercontent.com/6702424/114280501-dad2e600-9a39-11eb-9c39-a225572dd38a.png)

Then you load your own therms in Markdown format like this: &#x20;

<pre class="language-tsx" data-title="KcApp.tsx"><code class="lang-tsx">import { lazy, Suspense } from "react";
import type { KcContext } from "./kcContext";
import { useI18n } from "./i18n";
import Fallback, { defaultKcProps, type KcProps, type PageProps } from "keycloakify";
import Template from "keycloakify/lib/Template";
<strong>import { useDownloadTerms } from "keycloakify/lib/pages/Terms";
</strong><strong>import tos_en_url from "./assets/tos_en.md";
</strong><strong>import tos_fr_url from "./assets/tos_fr.md";
</strong>
export default function App(props: { kcContext: KcContext; }) {

    const { kcContext } = props;

    const i18n = useI18n({ kcContext });
    
<strong>    useDownloadTerms({
</strong><strong>	kcContext,
</strong><strong>	"downloadTermMarkdown": async ({ currentLanguageTag }) => {
</strong><strong>
</strong><strong>	    const markdownString = await fetch((() => {
</strong><strong>		switch (currentLanguageTag) {
</strong><strong>			case "fr": return tos_fr_url;
</strong><strong>			default: return tos_en_url;
</strong><strong>		}
</strong><strong>	    })()).then(response => response.text());
</strong><strong>
</strong><strong>	    return markdownString;
</strong><strong>	}
</strong><strong>    });
</strong>
    if (i18n === null) {
        return null;
    }
    
    const pageProps: Omit&#x3C;PageProps&#x3C;any, typeof i18n>, "kcContext"> = {
        i18n,
        // Here we have overloaded the default template, however you could use the default one with:  
        //Template: DefaultTemplate,
        Template,
        // Wether or not we should download the CSS and JS resources that comes with the default Keycloak theme.  
        doFetchDefaultThemeResources: true,
        ...defaultKcProps,
    };
    
    return (
        &#x3C;Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    default: return &#x3C;Fallback {...{ kcContext, ...pageProps }} />;
                }
            })()}
        &#x3C;/Suspense>
    );

}
</code></pre>

You can also completely rework the page if you're not happy with the default look: &#x20;

{% embed url="https://github.com/codegouvfr/keycloakify-starter/blob/main/src/keycloak-theme/pages/Terms.tsx" %}
