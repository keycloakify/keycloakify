<script>const _= 
{
    "realm": {
        "loginWithEmailAllowed": (function (){

            <#attempt>
                return ${realm.loginWithEmailAllowed?c};
            <#recover>
            </#attempt>

        })()
    }
}
</script>