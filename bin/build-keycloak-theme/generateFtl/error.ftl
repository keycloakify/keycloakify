<script>const _= 
{
    "client": (function (){

            <#if client??>
                return {
                    "baseUrl": "${(client.baseUrl!'')?no_esc}" || undefined
                };
            </#if>

            return undefined;

    })()
}
</script>