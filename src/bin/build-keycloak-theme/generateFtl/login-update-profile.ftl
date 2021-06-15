<script>const _= 
{
    "user": {
        "editUsernameAllowed": (function (){
            <#attempt>
                return ${user.editUsernameAllowed?c};
            <#recover>
            </#attempt>
        })(),
        "username": (function (){
            <#attempt>
                return "${user.username!''}" || undefined;
            <#recover>
            </#attempt>
        })(),
        "email": (function (){
            <#attempt>
                return "${user.email!''}" || undefined;
            <#recover>
            </#attempt>
        })(),
        "firstName": (function (){
            <#attempt>
                return "${user.firstName!''}" || undefined;
            <#recover>
            </#attempt>
        })(),
        "lastName": (function (){
            <#attempt>
                return "${user.lastName!''}" || undefined;
            <#recover>
            </#attempt>
        })()
    },
    "messagesPerField": {
        "printIfExists": function (key, x) {
            switch(key){
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
            }
        }
    },

}
</script>
