<script>const _= 
{
    "otpLogin": {
        "userOtpCredentials": (function(){

            var out = [];

            <#attempt>
                <#list otpLogin.userOtpCredentials as otpCredential>
                    out.push({
                        "id": (function (){

                            <#attempt>
                                return "${otpCredential.id}";
                            <#recover>
                            </#attempt>

                        })(),
                        "userLabel": (function (){

                            <#attempt>
                                return "${otpCredential.userLabel}";
                            <#recover>
                            </#attempt>

                        })()
                    });
                </#list>
            <#recover>
            </#attempt>

            return out;

        })()
    }
}
</script>