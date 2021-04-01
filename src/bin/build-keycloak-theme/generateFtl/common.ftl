<script>const _= 
{
    "url": (function (){

        <#if !url?has_content>
            return undefined;
        </#if>

        return {
            "loginAction": "${(url.loginAction!'')?no_esc}",
            "resourcesPath": "${(url.resourcesPath!'')?no_esc}",
            "resourcesCommonPath": "${(url.resourcesCommonPath!'')?no_esc}",
            "loginRestartFlowUrl": "${(url.loginRestartFlowUrl!'')?no_esc}",
            "loginUrl": "${(url.loginUrl!'')?no_esc}"
        };

    })(),
    "realm": {
        "displayName": "${realm.displayName!''}" || undefined,
        "displayNameHtml": "${realm.displayNameHtml!''}" || undefined,
        "internationalizationEnabled": ${(realm.internationalizationEnabled!false)?c},
        "registrationEmailAsUsername": ${(realm.registrationEmailAsUsername!false)?c},
    },
    "locale": (function (){

        <#if !realm.internationalizationEnabled>
            return undefined;
        </#if>

        return {
            "supported": (function(){

                <#if !realm.internationalizationEnabled>
                    return undefined;
                </#if>

                var out= [];

                <#list locale.supported as lng>
                    out.push({ 
                        "url": "${lng.url?no_esc}", 
                        "label": "${lng.label}",
                        "languageTag": "${lng.languageTag}"
                    });
                </#list>

                return out;

            })(),
            "current": "${locale.current}"
        };

    })(),
    "auth": (function (){

        <#if !auth?has_content>
            return undefined;
        </#if>

        var out= {
            "showUsername": ${auth.showUsername()?c},
            "showResetCredentials": ${auth.showResetCredentials()?c},
            "showTryAnotherWayLink": ${auth.showTryAnotherWayLink()?c},
        };

        <#if auth.showUsername() && !auth.showResetCredentials()>
            Object.assign(
                out,
                {
                    "attemptedUsername": "${auth.attemptedUsername}"
                }
            );
        </#if>

        return out;

    })(),
    "scripts": (function(){

        var out = [];

        <#if scripts??>
            <#list scripts as script>
                out.push("${script}");
            </#list>
        </#if>

        return out;

    })(),
    "message": (function (){

        <#if !message?has_content>
            return undefined;
        </#if>

        return { 
            "type": "${message.type}",
            "summary": String.htmlUnescape("${message.summary}")
        };

    })(),
    "isAppInitiatedAction": (function (){

        <#if isAppInitiatedAction??>
            return true;
        </#if>
        return false;

    })()
}
</script>