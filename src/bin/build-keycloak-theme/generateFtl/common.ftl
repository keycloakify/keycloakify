<script>const _= 
<#macro objectToJson object depth>
    <@compress>

        <#local isHash = false>
        <#attempt>
            <#local isHash = object?is_hash || object?is_hash_ex>
        <#recover>
            /* can't evaluate if object is hash */
            undefined
            <#return>
        </#attempt>
        <#if isHash>

            <#local keys = "">

            <#attempt>
                <#local keys = object?keys>
            <#recover>
                /* can't list keys of object */
                undefined
                <#return>
            </#attempt>

            {${'\n'}

            <#list keys as key>

                <#if key == "class">
                    /* skipping "class" property of object */
                    <#continue>
                </#if>

                <#local value = "">

                <#attempt>
                    <#local value = object[key]>
                <#recover>
                    /* couldn't dereference ${key} of object */
                    <#continue>
                </#attempt>

                <#if depth gt 4>
                    /* Avoid calling recustively too many times depth: ${depth}, key: ${key} */
                    <#continue>
                </#if>

                "${key}": <@objectToJson object=value depth=depth+1/>,

            </#list>

            }${'\n'}

            <#return>

        </#if>


        <#local isMethod = "">
        <#attempt>
            <#local isMethod = object?is_method>
        <#recover>
            /* can't test if object is a method */
            undefined
            <#return>
        </#attempt>

        <#if isMethod>
            undefined
            <#return>
        </#if>



        <#local isBoolean = "">
        <#attempt>
            <#local isBoolean = object?is_boolean>
        <#recover>
            /* can't test if object is a boolean */
            undefined
            <#return>
        </#attempt>

        <#if isBoolean>
            ${object?c}
            <#return>
        </#if>


        <#local isEnumerable = "">
        <#attempt>
            <#local isEnumerable = object?is_enumerable>
        <#recover>
            /* can't test if object is enumerable */
            undefined
            <#return>
        </#attempt>

        <#if isEnumerable>

            [${'\n'}

            <#list object as item>

                <@objectToJson object=item depth=depth+1/>,

            </#list>

            ]${'\n'}

            <#return>
        </#if>


        <#attempt>
            "${object?replace('"', '\\"')?no_esc}"
        <#recover>
            /* couldn't convert into string non hash, non method, non boolean, non enumerable object */
            undefined;
            <#return>
        </#attempt>


    </@compress>
</#macro>

(()=>{

    //Removing all the undefined
    const obj = JSON.parse(JSON.stringify(<@objectToJson object=.data_model depth=0 />));

    //Freemarker values that can't be automatically converted into a JavaScript object.
    Object.deepAssign(
        obj,
        { 
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
            "msg": function(){ throw new Error("use import { useKcMessage } from 'keycloakify'"); },
            "advancedMsg": function(){ throw new Error("use import { useKcMessage } from 'keycloakify'"); },
        }
    );

    return obj;

})()

</script>