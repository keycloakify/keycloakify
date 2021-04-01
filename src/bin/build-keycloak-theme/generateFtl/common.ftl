<script>const _= 
{
    "url": {
        "loginAction": (function (){

            <#attempt>
                return "${url.loginAction?no_esc}";
            <#recover>
            </#attempt>

        })(),
        "resourcesPath": (function (){

            <#attempt>
                return "${url.resourcesPath?no_esc}";
            <#recover>
            </#attempt>

        })(),
        "resourcesCommonPath": (function (){

            <#attempt>
                return "${url.resourcesCommonPath?no_esc}";
            <#recover>
            </#attempt>

        })(),
        "loginRestartFlowUrl": (function (){

            <#attempt>
                return "${url.loginRestartFlowUrl?no_esc}";
            <#recover>
            </#attempt>

        })(),
        "loginUrl": (function (){

            <#attempt>
                return "${url.loginUrl?no_esc}";
            <#recover>
            </#attempt>

        })()
    },
    "realm": {
        "displayName": (function (){

            <#attempt>
                return "${realm.displayName!''}" || undefined;
            <#recover>
            </#attempt>

        })(),
        "displayNameHtml": (function (){

            <#attempt>
                return "${realm.displayNameHtml!''}" || undefined;
            <#recover>
            </#attempt>

        })(),
        "internationalizationEnabled": (function (){

            <#attempt>
                return ${realm.internationalizationEnabled?c};
            <#recover>
            </#attempt>

        })(),
        "registrationEmailAsUsername": (function (){

            <#attempt>
                return ${realm.registrationEmailAsUsername?c};
            <#recover>
            </#attempt>

        })()
    },
    "locale": (function (){

        <#attempt>
            <#if realm.internationalizationEnabled>

                return {
                    "supported": (function(){

                        var out= [];

                        <#attempt>
                            <#list locale.supported as lng>
                                out.push({ 
                                    "url": (function (){

                                        <#attempt>
                                            return "${lng.url?no_esc}";
                                        <#recover>
                                        </#attempt>

                                    })(),
                                    "label": (function (){

                                        <#attempt>
                                            return "${lng.label}";
                                        <#recover>
                                        </#attempt>

                                    })(),
                                    "languageTag": (function (){

                                        <#attempt>
                                            return "${lng.languageTag}";
                                        <#recover>
                                        </#attempt>

                                    })()
                                });
                            </#list>
                        <#recover>
                        </#attempt>

                        return out;

                    })(),
                    "current": (function (){

                        <#attempt>
                            return "${locale.current}";
                        <#recover>
                        </#attempt>

                    })()
                };

            </#if>
        <#recover>
        </#attempt>

    })(),
    "auth": (function (){

        <#attempt>
        <#if auth?has_content>

            var out= {
                "showUsername": (function (){

                    <#attempt>
                        return ${auth.showUsername()?c};
                    <#recover>
                    </#attempt>

                })(),
                "showResetCredentials": (function (){

                    <#attempt>
                        return ${auth.showResetCredentials()?c};
                    <#recover>
                    </#attempt>

                })(),
                "showTryAnotherWayLink": (function(){

                    <#attempt>
                        return ${auth.showTryAnotherWayLink()?c};
                    <#recover>
                    </#attempt>

                })()
            };

            <#attempt>
            <#if auth.showUsername() && !auth.showResetCredentials()>
                Object.assign(
                    out,
                    {
                        "attemptedUsername": (function (){
                            <#attempt>
                                return "${auth.attemptedUsername}";
                            <#recover>
                            </#attempt>
                        })()
                    }
                );
            </#if>
            <#recover>
            </#attempt>

            return out;

        </#if>
        <#recover>
        </#attempt>

    })(),
    "scripts": (function(){

        var out = [];

        <#attempt>
            <#if scripts??>
                <#attempt>
                    <#list scripts as script>
                        out.push((function (){

                            <#attempt>
                                return "${script}";
                            <#recover>
                            </#attempt>

                        })());
                    </#list>
                <#recover>
                </#attempt>
            </#if>
        <#recover>
        </#attempt>

        return out;

    })(),
    "message": (function (){

        <#attempt>
            <#if message?has_content>

                return { 
                    "type": (function (){

                        <#attempt>
                            return "${message.type}";
                        <#recover>
                        </#attempt>

                    })(),
                    "summary": (function (){

                        <#attempt>
                            return String.htmlUnescape("${message.summary}");
                        <#recover>
                        </#attempt>

                    })()
                };

            </#if>
        <#recover>
        </#attempt>

    })(),
    "isAppInitiatedAction": (function (){

        <#attempt>
            <#if isAppInitiatedAction??>
                return true;
            </#if>
        <#recover>
        </#attempt>

        return false;

    })()
}
</script>