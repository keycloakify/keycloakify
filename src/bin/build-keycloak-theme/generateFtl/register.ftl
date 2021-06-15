<script>const _= 
{
    "url": {
        "registrationAction": (function (){

            <#attempt>
                return "${url.registrationAction?no_esc}";
            <#recover>
            </#attempt>

        })()
    },
    "messagesPerField": {
        "printIfExists": function (key, x) {
            switch(key){
                case "userLabel": return (function (){

                    <#attempt>
                        return "${messagesPerField.printIfExists('userLabel','1')}" ? x : undefined;
                    <#recover>
                    </#attempt>

                })();
                case "username": return (function (){

                    <#attempt>
                        return "${messagesPerField.printIfExists('username','1')}" ? x : undefined;
                    <#recover>
                    </#attempt>

                })();
                case "email": return (function (){

                    <#attempt>
                        return "${messagesPerField.printIfExists('email','1')}" ? x : undefined;
                    <#recover>
                    </#attempt>

                })();
                case "firstName": return (function (){

                    <#attempt>
                        return "${messagesPerField.printIfExists('firstName','1')}" ? x : undefined;
                    <#recover>
                    </#attempt>

                })();
                case "lastName": return (function (){

                    <#attempt>
                        return "${messagesPerField.printIfExists('lastName','1')}" ? x : undefined;
                    <#recover>
                    </#attempt>

                })();
                case "password": return (function (){

                    <#attempt>
                        return "${messagesPerField.printIfExists('password','1')}" ? x : undefined;
                    <#recover>
                    </#attempt>

                })();
                case "password-confirm": return (function (){

                    <#attempt>
                        return "${messagesPerField.printIfExists('password-confirm','1')}" ? x : undefined;
                    <#recover>
                    </#attempt>

                })();
            }
        }
    },
    "register": {
        "formData": {
            "firstName": (function (){

                <#attempt>
                    return "${register.formData.firstName!''}" || undefined;
                <#recover>
                </#attempt>

            })(),
            "displayName": (function (){

                <#attempt>
                    return "${register.formData.displayName!''}" || undefined;
                <#recover>
                </#attempt>

            })(),
            "lastName": (function (){

                <#attempt>
                    return "${register.formData.lastName!''}" || undefined;
                <#recover>
                </#attempt>

            })(),
            "email": (function(){

                <#attempt>
                    return "${register.formData.email!''}" || undefined;
                <#recover>
                </#attempt>

            })(),
            "username": (function (){

                <#attempt>
                    return "${register.formData.username!''}" || undefined;
                <#recover>
                </#attempt>

            })()
        }
    },
    "passwordRequired": (function (){

        <#attempt>
        <#if passwordRequired??>
            return true;
        </#if>
        <#recover>
        </#attempt>

        return false;

    })(),
    "recaptchaRequired": (function (){

        <#attempt>
        <#if passwordRequired??>
            return true;
        </#if>
        <#recover>
        </#attempt>

        return false;

    })(),
    "recaptchaSiteKey": (function (){

        <#attempt>
            return "${recaptchaSiteKey!''}" || undefined;
        <#recover>
        </#attempt>

    })(),
    "authorizedMailDomains": (function (){

        <#attempt>
            return "${authorizedMailDomains!''}" || undefined;
        <#recover>
        </#attempt>

    })(),
    "authorizedMailDomains": (function(){

        var out = undefined;

        <#attempt>
            <#if authorizedMailDomains??>

                out = [];

                <#attempt>
                    <#list authorizedMailDomains as authorizedMailDomain>
                        out.push((function (){

                            <#attempt>
                                return "${authorizedMailDomain}";
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
    }
}
</script>