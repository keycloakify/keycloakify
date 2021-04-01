<script>const _= 
{
    "url": {
        "loginResetCredentialsUrl": (function (){
            <#attempt>
                return "${url.loginResetCredentialsUrl?no_esc}";
            <#recover>
            </#attempt>
        })(),
        "registrationUrl": (function (){
            <#attempt>
                return "${url.registrationUrl?no_esc}";
            <#recover>
            </#attempt>
        })()
    },
    "realm": {
        "loginWithEmailAllowed": (function(){
            <#attempt>
                return ${realm.loginWithEmailAllowed?c};
            <#recover>
            </#attempt>
        })(),
        "rememberMe": (function (){
            <#attempt>
                return ${realm.rememberMe?c};
            <#recover>
            </#attempt>
        })(),
        "password": (function (){
            <#attempt>
                return ${realm.password?c};
            <#recover>
            </#attempt>
        })(),
        "resetPasswordAllowed": (function (){
            <#attempt>
                return ${realm.resetPasswordAllowed?c};
            <#recover>
            </#attempt>
        })(),
        "registrationAllowed": (function (){
            <#attempt>
                return ${realm.registrationAllowed?c};
            <#recover>
            </#attempt>
        })()
    },
    "auth": (function (){

        <#attempt>
        <#if auth?has_content>

            return {
                "selectedCredential": (function (){
                    <#attempt>
                        return "${auth.selectedCredential!''}" || undefined;
                    <#recover>
                    </#attempt>
                })()
            };

        </#if>
        <#recover>
        </#attempt>

    })(),
    "social": {
        "displayInfo": (function (){
            <#attempt>
                return ${social.displayInfo?c};
            <#recover>
            </#attempt>
        })(),
        "providers": (()=>{

            <#attempt>
            <#if social.providers??>

                var out= [];

                <#attempt>
                <#list social.providers as p>
                    out.push({ 
                        "loginUrl": (function (){
                            <#attempt>
                                return "${p.loginUrl?no_esc}";
                            <#recover>
                            </#attempt>
                        })(),
                        "alias": (function (){
                            <#attempt>
                                return "${p.alias}";
                            <#recover>
                            </#attempt>
                        })(),
                        "providerId": (function (){
                            <#attempt>
                                return "${p.providerId}";
                            <#recover>
                            </#attempt>
                        })(),
                        "displayName": (function (){
                            <#attempt>
                                return "${p.displayName}";
                            <#recover>
                            </#attempt>
                        })()
                    });
                </#list>
                <#recover>
                </#attempt>

                return out;

            </#if>
            <#recover>
            </#attempt>

        })()
    },
    "usernameEditDisabled": (function () {

        <#attempt>
        <#if usernameEditDisabled??>
            return true;
        </#if>
        <#recover>
        </#attempt>
        return false;

    })(),
    "login": {
        "username": (function (){
            <#attempt>
                return "${login.username!''}" || undefined;
            <#recover>
            </#attempt>
        })(),
        "rememberMe": (function (){
            <#attempt>
            <#if login.rememberMe??>
                return true;
            </#if>
            <#recover>
            </#attempt>
            return false;
        })()
    },
    "registrationDisabled": (function (){
        <#attempt>
        <#if registrationDisabled??>
            return true;
        </#if>
        <#recover>
        </#attempt>
        return false;
    })()
}
</script>