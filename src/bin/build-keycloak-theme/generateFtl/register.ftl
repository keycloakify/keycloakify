<script>const _= 
{
    "url": {
        "registrationAction": "${url.registrationAction?no_esc}"
    },
    "messagesPerField": {
        "printIfExists": function (key, x) {
            switch(key){
                case "userLabel": "${messagesPerField.printIfExists('userLabel','1'}" ? x : undefined;
                case "username": "${messagesPerField.printIfExists('username','1'}" ? x : undefined;
                case "email": "${messagesPerField.printIfExists('email','1'}" ? x : undefined;
                case "firstName": "${messagesPerField.printIfExists('firstName','1'}" ? x : undefined;
                case "lastName": "${messagesPerField.printIfExists('lastName','1'}" ? x : undefined;
                case "password": "${messagesPerField.printIfExists('password','1'}" ? x : undefined;
                case "password-confirm": "${messagesPerField.printIfExists('password-confirm','1'}" ? x : undefined;
            }
        }
    },
    "register": {
        "formData": {
            "firstName": "${register.formData.firstName!''}" || undefined,
            "displayName": "${register.formData.displayName!''}" || undefined,
            "lastName": "${register.formData.lastName!''}" || undefined,
            "email": "${register.formData.email!''}" || undefined,
            "username": "${register.formData.username!''}" || undefined
        }
    },
    "passwordRequired": (function (){

        <#if passwordRequired??>
            return true;
        </#if>
        return false;

    })(),
    "recaptchaRequired": (function (){

        <#if passwordRequired??>
            return true;
        </#if>
        return false;

    })(),
    "recaptchaSiteKey": "${recaptchaSiteKey}"
}
</script>