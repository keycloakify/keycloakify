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

                <#assign fieldNames = ["global", "userLabel", "username", "email", "firstName", "lastName", "password", "password-confirm"]>

                <#attempt>
	                <#list profile.attributes as attribute>
                        <#assign fieldNames += [attribute.name]>
		            </#list>
                <#recover>
                </#attempt>

                "printIfExists": function (fieldName, x) {
	                <#list fieldNames as fieldName>
				        if(fieldName === "${fieldName}" ){
                            <#attempt>
                                return "${messagesPerField.printIfExists(fieldName,'1')}" ? x : undefined;
                            <#recover>
                            </#attempt>
                        }
		            </#list>
				    throw new Error("There is no " + fieldName " field");
                },
                "existsError": function (fieldName) {
	                <#list fieldNames as fieldName>
				        if(fieldName === "${fieldName}" ){
                            <#attempt>
					            return <#if messagesPerField.existsError('${fieldName}')>true<#else>false</#if>;
                            <#recover>
                            </#attempt>
                        }
		            </#list>
				    throw new Error("There is no " + fieldName " field");
                },
                "get": function (fieldName) {
	                <#list fieldNames as fieldName>
				        if(fieldName === "${fieldName}" ){
                            <#attempt>
		        	            <#if messagesPerField.existsError('${fieldName}')>
						            if(fieldName === "${fieldName}" ){
							            return "${messagesPerField.get('${fieldName}')?no_esc}";
							        }
						        </#if>
                            <#recover>
                            </#attempt>
                        }
		            </#list>
				    throw new Error("There is no " + fieldName " field");
			    },
                "exists": function (fieldName) {
	                <#list fieldNames as fieldName>
				        if(fieldName === "${fieldName}" ){
                            <#attempt>
					            return <#if messagesPerField.exists('${fieldName}')>true<#else>false</#if>;
                            <#recover>
                            </#attempt>
                        }
		            </#list>
				    throw new Error("There is no " + fieldName " field");
                }
            },
            "msg": function(){ throw new Error("use import { useKcMessage } from 'keycloakify'"); },
            "advancedMsg": function(){ throw new Error("use import { useKcMessage } from 'keycloakify'"); }
        }
    );

    return obj;

})()

</script>