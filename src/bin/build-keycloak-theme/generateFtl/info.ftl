<script>const _= 
{
    "messageHeader": "${messageHeader!''}" || undefined,
    "requiredActions": (function (){

        <#if requiredActions??>

            var out =[];

            <#list requiredActions>
                <#items as reqActionItem>
                    out.push("${reqActionItem}");
                </#items></b>
            </#list>

            return out;

        <#else>

        return undefined;

    })(),
    "skipLink": (function (){

        <#if skipLink??>
            return true;
        </#if>
        return false;

    })(),
    "pageRedirectUri": "${(pageRedirectUri!'')?no_esc}" || undefined,
    "actionUri": "${(actionUri!'')?no_esc}" || undefined,
    "client": {
        "baseUrl": "${(actionUri!'')?no_esc}" || undefined
    }
}
</script>