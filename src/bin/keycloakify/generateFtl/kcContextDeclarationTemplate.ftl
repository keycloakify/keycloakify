<#assign xKeycloakify={
    "messages": {},
    "pageId": "{{pageId}}",
    "ftlTemplateFileName": "{{ftlTemplateFileName}}",
    "themeType": "{{themeType}}",
    "themeName": "{{themeName}}",
    "keycloakifyVersion": "{{keycloakifyVersion}}",
    "themeVersion": "{{themeVersion}}",
    "resourcesPath": ""
}>

<#if url?? && url?is_hash && url.resourcesPath?? && url.resourcesPath?is_string>
    <#assign xKeycloakify = xKeycloakify + { "resourcesPath": url.resourcesPath }>
</#if>
<#if resourceUrl?? && resourceUrl?is_string>
    <#assign xKeycloakify = xKeycloakify + { "resourcesPath": resourceUrl }>
</#if>

const kcContext = ${toJsDeclarationString(.data_model, [])?no_esc};
kcContext.keycloakifyVersion = "${xKeycloakify.keycloakifyVersion}";
kcContext.themeVersion = "${xKeycloakify.themeVersion}";
kcContext.themeType = "${xKeycloakify.themeType}";
kcContext.themeName = "${xKeycloakify.themeName}";
kcContext.pageId = "${xKeycloakify.pageId}";
kcContext.ftlTemplateFileName = "${xKeycloakify.ftlTemplateFileName}";

<@addNonAutomaticallyGatherableMessagesToXKeycloakifyMessages />

kcContext["x-keycloakify"] = {};

kcContext["x-keycloakify"].resourcesPath = "${xKeycloakify.resourcesPath}";

{
    var messages = {};
    <#list xKeycloakify.messages as key, resolvedMsg>
        messages["${key}"] = decodeHtmlEntities("${resolvedMsg?js_string}");
    </#list>
    kcContext["x-keycloakify"].messages = messages;
}

if( 
    kcContext.url instanceof Object &&
    typeof kcContext.url.resourcesPath === "string"
){
    kcContext.url.resourcesCommonPath = kcContext.url.resourcesPath + "/{{RESOURCES_COMMON}}";
}

if( kcContext.messagesPerField ){
    var existsError_singleFieldName = kcContext.messagesPerField.existsError;
    kcContext.messagesPerField.existsError = function (){
        for( let i = 0; i < arguments.length; i++ ){
            if( existsError_singleFieldName(arguments[i]) ){
                return true;
            }
        }
        return false;
    };
    kcContext.messagesPerField.exists = function (fieldName) {
        return kcContext.messagesPerField.get(fieldName) !== "";
    };
    kcContext.messagesPerField.printIfExists = function (fieldName, text) {
        return kcContext.messagesPerField.exists(fieldName) ? text : undefined;
    };
    kcContext.messagesPerField.getFirstError = function () {
        for( let i = 0; i < arguments.length; i++ ){
            const fieldName = arguments[i];
            if( kcContext.messagesPerField.existsError(fieldName) ){
                return kcContext.messagesPerField.get(fieldName);
            }
        }
    };
}
attributes_to_attributesByName: {
    if( !kcContext.profile ){
        break attributes_to_attributesByName;
    }
    if( !kcContext.profile.attributes ){
        break attributes_to_attributesByName;
    }
    var attributes = kcContext.profile.attributes;
    delete kcContext.profile.attributes;
    kcContext.profile.attributesByName = {};
    attributes.forEach(function(attribute){
        kcContext.profile.attributesByName[attribute.name] = attribute;
    });
}
window.kcContext = kcContext;

<#if xKeycloakify.themeType == "login" >
    {
        const script = document.createElement("script");
        script.type = "importmap";
        script.textContent = JSON.stringify({
          imports: {
            "rfc4648": kcContext.url.resourcesCommonPath + "/node_modules/rfc4648/lib/rfc4648.js"
          }
        }, null, 2); 

        document.head.appendChild(script);
    }
</#if>

function decodeHtmlEntities(htmlStr){
    var element = decodeHtmlEntities.element;
    if (!element) {
        element = document.createElement("textarea");
        decodeHtmlEntities.element = element;
    }
    element.innerHTML = htmlStr;
    return element.value;
}

<#function toJsDeclarationString object path>
    <#local isHash = -1>
    <#attempt>
        <#local isHash = object?is_hash || object?is_hash_ex>
    <#recover>
        <#return "ABORT: Can't evaluate if " + path?join(".") + " is a hash">
    </#attempt>

    <#if isHash>
        <#if path?size gt 10>
            <#return "ABORT: Too many recursive calls, path: " + path?join(".")>
        </#if>
        <#local keys = -1>

        <#attempt>
            <#local keys = object?keys>
        <#recover>
            <#return "ABORT: We can't list keys on object">
        </#attempt>

        <#local outSeq = []>

        <#list keys as key>
            <#if ["class","declaredConstructors","superclass","declaringClass" ]?seq_contains(key) >
                <#continue>
            </#if>

            <#if (
                    areSamePath(path, ["url"]) &&
                    ["loginUpdatePasswordUrl", "loginUpdateProfileUrl", "loginUsernameReminderUrl", "loginUpdateTotpUrl"]?seq_contains(key)
                ) || (
                    key == "updateProfileCtx" && 
                    areSamePath(path, [])
                ) || (
                    <#-- https://github.com/keycloakify/keycloakify/pull/65#issuecomment-991896344 (reports with saml-post-form.ftl) -->
                    <#-- https://github.com/keycloakify/keycloakify/issues/91#issue-1212319466 (reports with error.ftl and Kc18) -->
                    <#-- https://github.com/keycloakify/keycloakify/issues/109#issuecomment-1134610163 -->
                    <#-- https://github.com/keycloakify/keycloakify/issues/357 -->
                    <#-- https://github.com/keycloakify/keycloakify/discussions/406#discussioncomment-7514787 -->
                    key == "loginAction" && 
                    areSamePath(path, ["url"]) && 
                    ["saml-post-form.ftl", "error.ftl", "info.ftl", "login-oauth-grant.ftl", "logout-confirm.ftl", "login-oauth2-device-verify-user-code.ftl"]?seq_contains(xKeycloakify.pageId) &&
                    !(auth?has_content && auth.showTryAnotherWayLink())
                ) || (
                    <#-- https://github.com/keycloakify/keycloakify/issues/362 -->
                    ["secretData", "value"]?seq_contains(key) && 
                    areSamePath(path, [ "totp", "otpCredentials", "*" ])
                ) || (
                    ["contextData", "idpConfig", "idp", "authenticationSession"]?seq_contains(key) &&
                    areSamePath(path, ["brokerContext"]) &&
                    ["login-idp-link-confirm.ftl", "login-idp-link-email.ftl" ]?seq_contains(xKeycloakify.pageId)
                ) || (
                    key == "identityProviderBrokerCtx" && 
                    areSamePath(path, []) &&
                    ["login-idp-link-confirm.ftl", "login-idp-link-email.ftl" ]?seq_contains(xKeycloakify.pageId)
                ) ||  (
                    ["masterAdminClient", "delegateForUpdate", "defaultRole"]?seq_contains(key) &&
                    areSamePath(path, ["realm"])
                ) || (
                    xKeycloakify.pageId == "error.ftl" &&
                    areSamePath(path, ["realm"]) &&
                    !["name", "displayName", "displayNameHtml", "internationalizationEnabled", "registrationEmailAsUsername" ]?seq_contains(key)
                ) || (
                    xKeycloakify.pageId == "applications.ftl" &&
                    ( 
                        key == "realm" || 
                        key == "container" 
                    ) &&
                    isSubpath(path, ["applications", "applications"])
                ) || (
                    key == "delegateForUpdate" &&
                    areSamePath(path, ["user"])
                ) || (
                    <#-- Security audit forwarded by Garth (Gmail) -->
                    key == "saml.signing.private.key" &&
                    areSamePath(path, ["client", "attributes"])
                ) || (
                    <#-- See: https://github.com/keycloakify/keycloakify/issues/534 -->
                    key == "password" &&
                    areSamePath(path, ["login"])
                ) || (
                    <#-- Remove realmAttributes added by https://github.com/jcputney/keycloak-theme-additional-info-extension for peace of mind. -->
                    key == "realmAttributes" &&
                    areSamePath(path, [])
                ) || (
                    <#-- attributesByName adds a lot of noise to the output and is not needed, we already have profile.attributes -->
                    key == "attributesByName" &&
                    areSamePath(path, ["profile"]) 
                ) || (
                    <#-- We already have the attributes in profile speedup the rendering by filtering it out from the register object -->
                    (key == "attributes" || key == "attributesByName") &&
                    areSamePath(path, ["register"])
                ) || (
                    areSamePath(path, ["properties"]) &&
                    (
                        key?starts_with("kc") || 
                        key == "locales" || 
                        key == "import" || 
                        key == "parent" || 
                        key == "meta" ||
                        key == "stylesCommon" ||
                        key == "styles" ||
                        key == "accountResourceProvider"
                    )
                ) || (
                    key == "execution" &&
                    areSamePath(path, [])
                ) || (
                    key == "entity" &&
                    areSamePath(path, ["user"])
                ) || (
                    key == "attributes" &&
                    areSamePath(path, ["realm"])
                ) || (
                    xKeycloakify.pageId == "index.ftl" &&
                    xKeycloakify.themeType == "account" &&
                    areSamePath(path, ["realm"]) &&
                    ![ 
                        "name",
                        "registrationEmailAsUsername",
                        "editUsernameAllowed",
                        "isInternationalizationEnabled",
                        "identityFederationEnabled",
                        "userManagedAccessAllowed"
                    ]?seq_contains(key)
                )
            >
                <#-- <#local outSeq += ["/*" + path?join(".") + "." + key + " excluded*/"]> -->
                <#continue>
            </#if>

            <#-- https://github.com/keycloakify/keycloakify/discussions/406 -->
            <#if (
                key == "attemptedUsername" &&
                areSamePath(path, ["auth"]) &&
                [ 
                    "register.ftl", "terms.ftl", "info.ftl", "login.ftl", 
                    "login-update-password.ftl", "login-oauth2-device-verify-user-code.ftl"
                ]?seq_contains(xKeycloakify.pageId)
            )>
                <#attempt>
                    <#-- https://github.com/keycloak/keycloak/blob/3a2bf0c04bcde185e497aaa32d0bb7ab7520cf4a/themes/src/main/resources/theme/base/login/template.ftl#L63 -->
                    <#if !(auth?has_content && auth.showUsername() && !auth.showResetCredentials())>
                        <#local outSeq += ["/*" + path?join(".") + "." + key + " excluded*/"]>
                        <#continue>
                    </#if>
                <#recover>
                    <#local outSeq += ["/*Accessing attemptedUsername throwed an exception */"]>
                </#attempt>
            </#if>

            {{userDefinedExclusions}}

            <#attempt>
                <#if !object[key]??>
                    <#continue>
                </#if>
            <#recover>
                <#local outSeq += ["/*Couldn't test if '" + key + "' is available on this object*/"]>
                <#continue>
            </#attempt>

            <#local propertyValue = -1>

            <#attempt>
                <#local propertyValue = object[key]>
            <#recover>
                <#local outSeq += ["/*Couldn't dereference '" + key + "' on this object*/"]>
                <#continue>
            </#attempt>

            <#local recOut = toJsDeclarationString(propertyValue, path + [ key ])>

            <#if recOut?starts_with("ABORT:")>

                <#local errorMessage = recOut?remove_beginning("ABORT:")>

                <#if errorMessage != " It's a method" >
                    <#local outSeq += ["/*" + key + ": " + errorMessage + "*/"]>
                </#if>

                <#continue>
            </#if>

            <#local outSeq +=  ['"' + key + '": ' + recOut + ","]>

        </#list>

        <#return (["{"] + outSeq?map(str -> ""?right_pad(4 * (path?size + 1)) + str) + [ ""?right_pad(4 * path?size) + "}"])?join("\n")>

    </#if>

    <#local isMethod = -1>
    <#attempt>
        <#local isMethod = object?is_method>
    <#recover>
        <#return "ABORT: Can't test if it'sa method.">
    </#attempt>

    <#if isMethod>

        <#if areSamePath(path, ["auth", "showUsername"])>
            <#attempt>
                <#return auth.showUsername()?c>
            <#recover>
                <#return "ABORT: Couldn't evaluate auth.showUsername()">
            </#attempt>
        </#if>

        <#if areSamePath(path, ["auth", "showResetCredentials"])>
            <#attempt>
                <#return auth.showResetCredentials()?c>
            <#recover>
                <#return "ABORT: Couldn't evaluate auth.showResetCredentials()">
            </#attempt>
        </#if>

        <#if areSamePath(path, ["auth", "showTryAnotherWayLink"])>
            <#attempt>
                <#return auth.showTryAnotherWayLink()?c>
            <#recover>
                <#return "ABORT: Couldn't evaluate auth.showTryAnotherWayLink()">
            </#attempt>
        </#if>

        <#if areSamePath(path, ["url", "getLogoutUrl"])>
            <#local returnValue = -1>
            <#attempt>
                <#local returnValue = url.getLogoutUrl()>
            <#recover>
                <#return "ABORT: Couldn't evaluate url.getLogoutUrl()">
            </#attempt>
            <#return 'function(){ return "' + returnValue + '"; }'>
        </#if>

        <#if areSamePath(path, ["totp", "policy", "getAlgorithmKey"])>
            <#local returnValue = "error">
            <#if mode?? && mode = "manual">
                <#attempt>
                    <#local returnValue = totp.policy.getAlgorithmKey()>
                <#recover>
                    <#return "ABORT: Couldn't evaluate totp.policy.getAlgorithmKey()">
                </#attempt>
            </#if>
            <#return 'function(){ return "' + returnValue + '"; }'>
        </#if>

        <#assign fieldNames = [{{fieldNames}}]>
        <#if profile?? && profile.attributes??>
            <#list profile.attributes as attribute>
                <#if fieldNames?seq_contains(attribute.name)>
                    <#continue>
                </#if>
                <#assign fieldNames += [attribute.name]>
            </#list>
        </#if>

        <#if areSamePath(path, ["messagesPerField", "get"])>

            <#local jsFunctionCode = "function (fieldName) { ">

            <#list fieldNames as fieldName>

                <#-- See: https://github.com/keycloakify/keycloakify/issues/217 -->
                <#if xKeycloakify.pageId == "login.ftl" >

                    <#if fieldName == "username">

                        <#local jsFunctionCode += "if(fieldName === 'username' || fieldName === 'password' ){ ">

                        <#if messagesPerField.exists('username') || messagesPerField.exists('password')>
                            <#local jsFunctionCode += "return kcContext.message && kcContext.message.summary ? kcContext.message.summary : 'error'; ">
                        <#else>
                            <#local jsFunctionCode += "return ''; ">
                        </#if>

                        <#local jsFunctionCode += "} ">

                        <#continue>
                    </#if>

                    <#if fieldName == "password">
                        <#continue>
                    </#if>

                </#if>

                <#local jsFunctionCode += "if(fieldName === '" + fieldName + "'){ ">

                <#if messagesPerField.exists('${fieldName}')>
                    <#local jsFunctionCode += 'return decodeHtmlEntities("' + messagesPerField.get('${fieldName}')?js_string + '"); '>
                <#else>
                    <#local jsFunctionCode += "return ''; ">
                </#if>

                <#local jsFunctionCode += "} ">

            </#list>

            <#local jsFunctionCode += "}">

            <#return jsFunctionCode>

        </#if>

        <#if areSamePath(path, ["messagesPerField", "existsError"])>

            <#local jsFunctionCode = "function (fieldName) { ">

            <#list fieldNames as fieldName>

                <#-- See: https://github.com/keycloakify/keycloakify/issues/217 -->
                <#if xKeycloakify.pageId == "login.ftl" >
                    <#if fieldName == "username">

                        <#local jsFunctionCode += "if(fieldName === 'username' || fieldName === 'password' ){ ">

                        <#if messagesPerField.existsError('username') || messagesPerField.existsError('password')>
                            <#local jsFunctionCode += "return true; ">
                        <#else>
                            <#local jsFunctionCode += "return false; ">
                        </#if>

                        <#local jsFunctionCode += "} ">

                        <#continue>
                    </#if>

                    <#if fieldName == "password">
                        <#continue>
                    </#if>
                </#if>

                <#local jsFunctionCode += "if(fieldName === '" + fieldName + "' ){ ">

                <#if messagesPerField.existsError('${fieldName}')>
                    <#local jsFunctionCode += 'return true; '>
                <#else>
                    <#local jsFunctionCode += "return false; ">
                </#if>

                <#local jsFunctionCode += "}">

            </#list>

            <#local jsFunctionCode += "}">

            <#return jsFunctionCode>

        </#if>

        <#if xKeycloakify.themeType == "account" && areSamePath(path, ["realm", "isInternationalizationEnabled"])>
            <#attempt>
                <#return realm.isInternationalizationEnabled()?c>
            <#recover>
                <#return "ABORT: Couldn't evaluate realm.isInternationalizationEnabled()">
            </#attempt>
        </#if>

        <#return "ABORT: It's a method">
    </#if>

    <#local isBoolean = -1>
    <#attempt>
        <#local isBoolean = object?is_boolean>
    <#recover>
        <#return "ABORT: Can't test if it's a boolean">
    </#attempt>

    <#if isBoolean>
        <#return object?c>
    </#if>

    <#local isEnumerable = -1>
    <#attempt>
        <#local isEnumerable = object?is_enumerable>
    <#recover>
        <#return "ABORT: Can't test if it's an enumerable">
    </#attempt>


    <#if isEnumerable>

        <#local outSeq = []>

        <#local i = 0>

        <#list object as array_item>

            <#if !array_item??>
                <#local outSeq += ["null,"]>
                <#continue>
            </#if>

            <#local recOut = toJsDeclarationString(array_item, path + [ i ])>

            <#local i = i + 1>

            <#if recOut?starts_with("ABORT:")>

                <#local errorMessage = recOut?remove_beginning("ABORT:")>

                <#if errorMessage != " It's a method" >
                    <#local outSeq += ["/*" + i?string + ": " + errorMessage + "*/"]>
                </#if>

                <#continue>
            </#if>

            <#local outSeq += [recOut + ","]>

        </#list>

        <#return (["["] + outSeq?map(str -> ""?right_pad(4 * (path?size + 1)) + str) + [ ""?right_pad(4 * path?size) + "]"])?join("\n")>

    </#if>

    <#local isDate = -1>
    <#attempt>
        <#local isDate = object?is_date_like>
    <#recover>
        <#return "ABORT: Can't test if it's a date">
    </#attempt>

    <#if isDate>
        <#return '"' + object?datetime?iso_utc + '"'>
    </#if>

    <#local isNumber = -1>
    <#attempt>
        <#local isNumber = object?is_number>
    <#recover>
        <#return "ABORT: Can't test if it's a number">
    </#attempt>

    <#if isNumber>
        <#return object?c>
    </#if>

    <#local isString = -1>
    <#attempt>
        <#local isString = object?is_string>
    <#recover>
        <#return "ABORT: Can't test if it's a string">
    </#attempt>

    <#if isString>
        <@addToXKeycloakifyMessagesIfMessageKey str=object />
    </#if>

    <#attempt>
        <#return '"' + object?js_string + '"'>;
    <#recover>
    </#attempt>

    <#return "ABORT: Couldn't convert into string non hash, non method, non boolean, non number, non enumerable object">

</#function>
<#function isSubpath path searchedPath>

    <#if path?size < searchedPath?size>
        <#return false>
    </#if>

    <#local i=0>

    <#list path as property>

        <#if i == searchedPath?size >
            <#continue>
        </#if>

        <#local searchedProperty=searchedPath[i]>

        <#local i+= 1>

        <#if searchedProperty?is_string && searchedProperty == "*">
            <#continue>
        </#if>

        <#if searchedProperty?is_string && !property?is_string>
            <#return false>
        </#if>

        <#if searchedProperty?is_number && !property?is_number>
            <#return false>
        </#if>

        <#if searchedProperty?string != property?string>
            <#return false>
        </#if>

    </#list>

    <#return true>

</#function>

<#function areSamePath path searchedPath>
    <#return path?size == searchedPath?size && isSubpath(path, searchedPath)>
</#function>

<#macro addToXKeycloakifyMessagesIfMessageKey str>
    <#if !msg?? || !msg?is_method>
        <#return>
    </#if>
    <#if (str?length > 200)>
        <#return>
    </#if>
    <#local key=removeBrackets(str)>
    <#if key?length==0>
        <#return>
    </#if>
    <#if !(key?matches(r"^[a-zA-Z0-9-_.]*$"))>
        <#return>
    </#if>
    <#local resolvedMsg=msg(key)>
    <#if resolvedMsg==key>
        <#return>
    </#if>
    <#local messages=xKeycloakify.messages>
    <#local messages = messages + { key: resolvedMsg }>
    <#assign xKeycloakify = xKeycloakify + { "messages": messages }>
</#macro>

<#function removeBrackets str>
    <#if str?starts_with("${") && str?ends_with("}")>
        <#return str[2..(str?length-2)]>
    <#else>
        <#return str>
    </#if>
</#function>

<#macro addNonAutomaticallyGatherableMessagesToXKeycloakifyMessages>
    <#if profile?? && profile?is_hash && profile.attributes?? && profile.attributes?is_enumerable>
        <#list profile.attributes as attribute>
            <#if !(
                attribute.annotations?? && attribute.annotations?is_hash &&
                attribute.annotations.inputOptionLabelsI18nPrefix?? && attribute.annotations.inputOptionLabelsI18nPrefix?is_string
            )>
                <#continue>
            </#if>
            <#local prefix=attribute.annotations.inputOptionLabelsI18nPrefix>
            <#if !(
                attribute.validators?? && attribute.validators?is_hash &&
                attribute.validators.options?? && attribute.validators.options?is_hash &&
                attribute.validators.options.options?? && attribute.validators.options.options?is_enumerable
            )>
                <#continue>
            </#if>
            <#list attribute.validators.options.options as option>
                <#if !option?is_string>
                    <#continue>
                </#if>
                <@addToXKeycloakifyMessagesIfMessageKey str="${prefix}.${option}" />
            </#list>
        </#list>
    </#if>
    <#if xKeycloakify.pageId == "terms.ftl" || termsAcceptanceRequired?? && termsAcceptanceRequired>
        <@addToXKeycloakifyMessagesIfMessageKey str="termsText" />
    </#if>
    <#if requiredActions?? && requiredActions?is_enumerable>
        <#list requiredActions as requiredAction>
            <#if !requiredAction?is_string>
                <#continue>
            </#if>
            <@addToXKeycloakifyMessagesIfMessageKey str="requiredAction.${requiredAction}" />
        </#list>
    </#if>
</#macro>
