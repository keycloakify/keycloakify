<script>const _= 
{
    "client": (function (){

        <#attempt>
            <#if client??>
                return {
                    "baseUrl": (function (){

                        <#attempt>
                            return "${(client.baseUrl!'')?no_esc}" || undefined;
                        <#recover>
                        </#attempt>

                    })()
                };
            </#if>
        <#recover>
        </#attempt>

    })()
}
</script>