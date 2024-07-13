<#assign pageId="PAGE_ID_xIgLsPgGId9D8e">
<#assign themeType="KEYCLOAKIFY_THEME_TYPE_dExKd3xEdr">
<#assign xKeycloakifyMessages = {}>
<#assign debugMessage="">

const kcContext = ${ftl_object_to_js_code_declaring_an_object(.data_model, [])?no_esc};

<@addNonAutomaticallyGatherableMessagesToXKeycloakifyMessages />

console.log(`${debugMessage}`);

kcContext["x-keycloakify"] = {};

{
  var messages = {};
  <#list xKeycloakifyMessages as key, resolvedMsg>
    messages["${key}"] = decodeHtmlEntities("${resolvedMsg?js_string}");
  </#list>
  kcContext["x-keycloakify"].messages = messages;
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
kcContext.keycloakifyVersion = "KEYCLOAKIFY_VERSION_xEdKd3xEdr";
kcContext.themeVersion = "KEYCLOAKIFY_THEME_VERSION_sIgKd3xEdr3dx";
kcContext.themeType = "${themeType}";
kcContext.themeName = "KEYCLOAKIFY_THEME_NAME_cXxKd3xEer";
kcContext.pageId = "${pageId}";
if( kcContext.url && kcContext.url.resourcesPath ){
    kcContext.url.resourcesCommonPath = kcContext.url.resourcesPath + "/" + "RESOURCES_COMMON_cLsLsMrtDkpVv";
}
if( kcContext.resourceUrl && !kcContext.url ){
    Object.defineProperty(kcContext, "url", {
        value: {
            resourcesPath: kcContext.resourceUrl
        },
        enumerable: false
    });
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
function decodeHtmlEntities(htmlStr){
    var element = decodeHtmlEntities.element;
    if (!element) {
        element = document.createElement("textarea");
        decodeHtmlEntities.element = element;
    }
    element.innerHTML = htmlStr;
    return element.value;
}

<#function ftl_object_to_js_code_declaring_an_object object path>

        <#local isHash = "">
        <#attempt>
            <#local isHash = object?is_hash || object?is_hash_ex>
        <#recover>
            <#return "ABORT: Can't evaluate if " + path?join(".") + " is hash">
        </#attempt>

        <#if isHash>

            <#if path?size gt 10>
                <#return "ABORT: Too many recursive calls, path: " + path?join(".")>
            </#if>

            <#local keys = "">

            <#attempt>
                <#local keys = object?keys>
            <#recover>
                <#return "ABORT: We can't list keys on this object">
            </#attempt>

            <#local out_seq = []>

            <#list keys as key>

                <#if ["class","declaredConstructors","superclass","declaringClass" ]?seq_contains(key) >
                    <#continue>
                </#if>

                <#if 
                    (
                        ["loginUpdatePasswordUrl", "loginUpdateProfileUrl", "loginUsernameReminderUrl", "loginUpdateTotpUrl"]?seq_contains(key) && 
                        are_same_path(path, ["url"])
                    ) || (
                        key == "updateProfileCtx" && 
                        are_same_path(path, [])
                    ) || (
                        <#-- https://github.com/keycloakify/keycloakify/pull/65#issuecomment-991896344 (reports with saml-post-form.ftl) -->
                        <#-- https://github.com/keycloakify/keycloakify/issues/91#issue-1212319466 (reports with error.ftl and Kc18) -->
                        <#-- https://github.com/keycloakify/keycloakify/issues/109#issuecomment-1134610163 -->
                        <#-- https://github.com/keycloakify/keycloakify/issues/357 -->
                        <#-- https://github.com/keycloakify/keycloakify/discussions/406#discussioncomment-7514787 -->
                        key == "loginAction" && 
                        are_same_path(path, ["url"]) && 
                        ["saml-post-form.ftl", "error.ftl", "info.ftl", "login-oauth-grant.ftl", "logout-confirm.ftl", "login-oauth2-device-verify-user-code.ftl"]?seq_contains(pageId) &&
                        !(auth?has_content && auth.showTryAnotherWayLink())
                    ) || (
                        <#-- https://github.com/keycloakify/keycloakify/issues/362 -->
                        ["secretData", "value"]?seq_contains(key) && 
                        are_same_path(path, [ "totp", "otpCredentials", "*" ])
                    ) || (
                        ["contextData", "idpConfig", "idp", "authenticationSession"]?seq_contains(key) &&
                        are_same_path(path, ["brokerContext"]) &&
                        ["login-idp-link-confirm.ftl", "login-idp-link-email.ftl" ]?seq_contains(pageId)
                    ) || (
                        key == "identityProviderBrokerCtx" && 
                        are_same_path(path, []) &&
                        ["login-idp-link-confirm.ftl", "login-idp-link-email.ftl" ]?seq_contains(pageId)
                    ) ||  (
                        ["masterAdminClient", "delegateForUpdate", "defaultRole"]?seq_contains(key) &&
                        are_same_path(path, ["realm"])
                    ) || (
                        "error.ftl" == pageId &&
                        are_same_path(path, ["realm"]) &&
                        !["name", "displayName", "displayNameHtml", "internationalizationEnabled", "registrationEmailAsUsername" ]?seq_contains(key)
                    ) || (
                        "applications.ftl" == pageId &&
                        ( 
                            key == "realm" || 
                            key == "container" 
                        ) &&
                        is_subpath(path, ["applications", "applications"])
                    ) || (
                        key == "delegateForUpdate" &&
                        are_same_path(path, ["user"])
                    ) || (
                        <#-- Security audit forwarded by Garth (Gmail) -->
                        key == "saml.signing.private.key" &&
                        are_same_path(path, ["client", "attributes"])
                    ) || (
                        <#-- See: https://github.com/keycloakify/keycloakify/issues/534 -->
                        key == "password" &&
                        are_same_path(path, ["login"])
                    ) || (
                        <#-- Remove realmAttributes added by https://github.com/jcputney/keycloak-theme-additional-info-extension for peace of mind. -->
                        key == "realmAttributes" &&
                        are_same_path(path, [])
                    ) || (
                        <#-- attributesByName adds a lot of noise to the output and is not needed, we already have profile.attributes -->
                        key == "attributesByName" &&
                        are_same_path(path, ["profile"]) 
                    ) || (
                        <#-- We already have the attributes in profile speedup the rendering by filtering it out from the register object -->
                        (key == "attributes" || key == "attributesByName") &&
                        are_same_path(path, ["register"])
                    ) || (
                        are_same_path(path, ["properties"]) &&
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
                        are_same_path(path, [])
                    ) || (
                        key == "entity" &&
                        are_same_path(path, ["user"])
                    )
                >
                    <#-- <#local out_seq += ["/*" + path?join(".") + "." + key + " excluded*/"]> -->
                    <#continue>
                </#if>
                
                <#-- https://github.com/keycloakify/keycloakify/discussions/406 -->
                <#if (
                    ["register.ftl", "register-user-profile.ftl", "terms.ftl", "info.ftl", "login.ftl", "login-update-password.ftl", "login-oauth2-device-verify-user-code.ftl"]?seq_contains(pageId) && 
                    key == "attemptedUsername" && are_same_path(path, ["auth"])
                )>
                    <#attempt>
                        <#-- https://github.com/keycloak/keycloak/blob/3a2bf0c04bcde185e497aaa32d0bb7ab7520cf4a/themes/src/main/resources/theme/base/login/template.ftl#L63 -->
                        <#if !(auth?has_content && auth.showUsername() && !auth.showResetCredentials())>
                            <#local out_seq += ["/*" + path?join(".") + "." + key + " excluded*/"]>
                            <#continue>
                        </#if>
                    <#recover>
                        <#local out_seq += ["/*Accessing attemptedUsername throwed an exception */"]>
                    </#attempt>
                </#if>

                USER_DEFINED_EXCLUSIONS_eKsaY4ZsZ4eMr2
                
                <#attempt>
                    <#if !object[key]??>
                        <#continue>
                    </#if>
                <#recover>
                    <#local out_seq += ["/*Couldn't test if '" + key + "' is available on this object*/"]>
                    <#continue>
                </#attempt>

                <#local propertyValue = "">

                <#attempt>
                    <#local propertyValue = object[key]>
                <#recover>
                    <#local out_seq += ["/*Couldn't dereference '" + key + "' on this object*/"]>
                    <#continue>
                </#attempt>

                <#local rec_out = ftl_object_to_js_code_declaring_an_object(propertyValue, path + [ key ])>

                <#if rec_out?starts_with("ABORT:")>

                    <#local errorMessage = rec_out?remove_beginning("ABORT:")>

                    <#if errorMessage != " It's a method" >
                        <#local out_seq += ["/*" + key + ": " + errorMessage + "*/"]>
                    </#if>

                    <#continue>
                </#if>

                <#local out_seq +=  ['"' + key + '": ' + rec_out + ","]>

            </#list>

            <#return (["{"] + out_seq?map(str -> ""?right_pad(4 * (path?size + 1)) + str) + [ ""?right_pad(4 * path?size) + "}"])?join("\n")>

        </#if>

        <#local isMethod = "">
        <#attempt>
            <#local isMethod = object?is_method>
        <#recover>
            <#return "ABORT: Can't test if it'sa method.">
        </#attempt>

        <#if isMethod>

            <#if are_same_path(path, ["auth", "showUsername"])>
                <#attempt>
                    <#return auth.showUsername()?c>
                <#recover>
                    <#return "ABORT: Couldn't evaluate auth.showUsername()">
                </#attempt>
            </#if>

            <#if are_same_path(path, ["auth", "showResetCredentials"])>
                <#attempt>
                    <#return auth.showResetCredentials()?c>
                <#recover>
                    <#return "ABORT: Couldn't evaluate auth.showResetCredentials()">
                </#attempt>
            </#if>

            <#if are_same_path(path, ["auth", "showTryAnotherWayLink"])>
                <#attempt>
                    <#return auth.showTryAnotherWayLink()?c>
                <#recover>
                    <#return "ABORT: Couldn't evaluate auth.showTryAnotherWayLink()">
                </#attempt>
            </#if>

            <#if are_same_path(path, ["url", "getLogoutUrl"])>
                <#local returnValue = "">
                <#attempt>
                    <#local returnValue = url.getLogoutUrl()>
                <#recover>
                    <#return "ABORT: Couldn't evaluate url.getLogoutUrl()">
                </#attempt>
                <#return 'function(){ return "' + returnValue + '"; }'>
            </#if>

            <#if are_same_path(path, ["totp", "policy", "getAlgorithmKey"])>
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

            <#assign fieldNames = [ FIELD_NAMES_eKsIY4ZsZ4xeM ]>
            <#if profile?? && profile.attributes??>
                <#list profile.attributes as attribute>
                    <#if fieldNames?seq_contains(attribute.name)>
                        <#continue>
                    </#if>
                    <#assign fieldNames += [attribute.name]>
                </#list>
            </#if>

            <#if are_same_path(path, ["messagesPerField", "get"])>

                <#local jsFunctionCode = "function (fieldName) { ">

                <#list fieldNames as fieldName>

                    <#-- See: https://github.com/keycloakify/keycloakify/issues/217 -->
                    <#if pageId == "login.ftl" >

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

            <#if are_same_path(path, ["messagesPerField", "existsError"])>

                <#local jsFunctionCode = "function (fieldName) { ">

                <#list fieldNames as fieldName>

                    <#-- See: https://github.com/keycloakify/keycloakify/issues/217 -->
                    <#if pageId == "login.ftl" >
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

            <#if themeType == "account" && are_same_path(path, ["realm", "isInternationalizationEnabled"])>
                <#attempt>
                    <#return realm.isInternationalizationEnabled()?c>
                <#recover>
                    <#return "ABORT: Couldn't evaluate realm.isInternationalizationEnabled()">
                </#attempt>
            </#if>

            <#return "ABORT: It's a method">
        </#if>

        <#local isBoolean = "">
        <#attempt>
            <#local isBoolean = object?is_boolean>
        <#recover>
            <#return "ABORT: Can't test if it's a boolean">
        </#attempt>

        <#if isBoolean>
            <#return object?c>
        </#if>

        <#local isEnumerable = "">
        <#attempt>
            <#local isEnumerable = object?is_enumerable>
        <#recover>
            <#return "ABORT: Can't test if it's an enumerable">
        </#attempt>


        <#if isEnumerable>

            <#local out_seq = []>

            <#local i = 0>

            <#list object as array_item>

                <#if !array_item??>
                    <#local out_seq += ["null,"]>
                    <#continue>
                </#if>

                <#local rec_out = ftl_object_to_js_code_declaring_an_object(array_item, path + [ i ])>

                <#local i = i + 1>

                <#if rec_out?starts_with("ABORT:")>

                    <#local errorMessage = rec_out?remove_beginning("ABORT:")>

                    <#if errorMessage != " It's a method" >
                        <#local out_seq += ["/*" + i?string + ": " + errorMessage + "*/"]>
                    </#if>

                    <#continue>
                </#if>

                <#local out_seq += [rec_out + ","]>

            </#list>

            <#return (["["] + out_seq?map(str -> ""?right_pad(4 * (path?size + 1)) + str) + [ ""?right_pad(4 * path?size) + "]"])?join("\n")>

        </#if>

        <#local isDate = "">
        <#attempt>
            <#local isDate = object?is_date_like>
        <#recover>
            <#return "ABORT: Can't test if it's a date">
        </#attempt>

        <#if isDate>
            <#return '"' + object?datetime?iso_utc + '"'>
        </#if>

        <#local isNumber = "">
        <#attempt>
            <#local isNumber = object?is_number>
        <#recover>
            <#return "ABORT: Can't test if it's a number">
        </#attempt>

        <#if isNumber>
            <#return object?c>
        </#if>

        <#local isString = "">
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
<#function is_subpath path searchedPath>

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

<#function are_same_path path searchedPath>
    <#return path?size == searchedPath?size && is_subpath(path, searchedPath)>
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
    <#assign xKeycloakifyMessages = xKeycloakifyMessages + { "${key}": resolvedMsg }>
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
    <#if pageId == "terms.ftl" || termsAcceptanceRequired?? && termsAcceptanceRequired>
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


