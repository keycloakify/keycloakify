<script>const _= 
{
    "url": {
        "loginResetCredentialsUrl": "${url.loginResetCredentialsUrl?no_esc}",
        "registrationUrl": "${url.registrationUrl?no_esc}"
    },
    "realm": {
        "loginWithEmailAllowed": ${realm.loginWithEmailAllowed?c},
        "rememberMe": ${realm.rememberMe?c},
        "resetPasswordAllowed": ${realm.resetPasswordAllowed?c},
        "registrationAllowed": ${realm.registrationAllowed?c}
    },
    "auth": (function (){

        <#if auth?has_content>

            var out= {
                "selectedCredential": "${auth.selectedCredential!''}" || undefined
            };

            return out;

        </#if>

        return undefined;

    })(),
    "social": {
        "displayInfo": ${social.displayInfo?c},
        "providers": (()=>{

            <#if social.providers??>

                var out= [];

                <#list social.providers as p>
                    out.push({ 
                        "loginUrl": "${p.loginUrl?no_esc}",
                        "alias": "${p.alias}",
                        "providerId": "${p.providerId}",
                        "displayName": "${p.displayName}"
                    });
                </#list>

                return out;

            </#if>

            return undefined;

        })()
    },
    "usernameEditDisabled": (function () {

        <#if usernameEditDisabled??>
            return true;
        </#if>
        return false;

    })(),
    "login": {
        "username": "${login.username!''}" || undefined,
        "rememberMe": (function (){

            <#if login.rememberMe??>
                return true;
            </#if>
            return false;


        })()
    },
    "registrationDisabled": (function (){

        <#if registrationDisabled??>
            return true;
        </#if>
        return false;

    })()
}
</script>