<script>const _= 
{
    "messageHeader": (function (){

        <#attempt>
            return "${messageHeader!''}" || undefined;
        <#recover>
        </#attempt>

    })(),
    "requiredActions": (function (){

        <#attempt>
        <#if requiredActions??>

            var out =[];

            <#attempt>
            <#list requiredActions>
                <#attempt>
                <#items as reqActionItem>
                    out.push((function (){

                        <#attempt>
                            return "${reqActionItem}";
                        <#recover>
                        </#attempt>

                    })());
                </#items>
                <#recover>
                </#attempt>
            </#list>
            <#recover>
            </#attempt>

            return out;

        </#if>
        <#recover>
        </#attempt>

    })(),
    "skipLink": (function (){

        <#attempt>
        <#if skipLink??>
            return true;
        </#if>
        <#recover>
        </#attempt>
        return false;

    })(),
    "pageRedirectUri": (function (){

        <#attempt>
            return "${(pageRedirectUri!'')?no_esc}" || undefined;
        <#recover>
        </#attempt>

    })(),
    "actionUri": (function (){

        <#attempt>
            return "${(actionUri!'')?no_esc}" || undefined;
        <#recover>
        </#attempt>

    })(),
    "client": {
        "baseUrl": (function(){

            <#attempt>
                return "${(client.baseUrl!'')?no_esc}" || undefined;
            <#recover>
            </#attempt>

        })()
    }
}
</script>