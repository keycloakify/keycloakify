

/*
export function Template() {
    return (
        <div className="kcLoginClass">
            <div id="kc-header" className="kcHeaderClass">
                <div id="kc-header-wrapper" className="kcHeaderWrapperClass">
                    ${kcSanitize(msg("loginTitleHtml", (realm.displayNameHtml!'')))?no_esc}
                </div>
            </div>
            <div class="${properties.kcFormCardClass!} <#if displayWide>${properties.kcFormCardAccountClass!}</#if>">
                <header class="${properties.kcFormHeaderClass!}">
                    <#if realm.internationalizationEnabled  && locale.supported?size gt 1>
            <div id="kc-locale">
                        <div id="kc-locale-wrapper" class="${properties.kcLocaleWrapperClass!}">
                            <div class="kc-dropdown" id="kc-locale-dropdown">
                                <a href="#" id="kc-current-locale-link">${locale.current}</a>
                                <ul>
                                    <#list locale.supported as l>
                                <li class="kc-dropdown-item"><a href="${l.url}">${l.label}</a></li>
                            </#list>
                        </ul>
                        </div>
                    </div>
            </div>
        </#if>
            <#if !(auth?has_content && auth.showUsername() && !auth.showResetCredentials())>
            <#if displayRequiredFields>
                <div class="${properties.kcContentWrapperClass!}">
                    <div class="${properties.kcLabelWrapperClass!} subtitle">
                        <span class="subtitle"><span class="required">*</span> ${msg("requiredFields")}</span>
                    </div>
                    <div class="col-md-10">
                        <h1 id="kc-page-title"><#nested "header"></h1>
                    </div>
                </div>
                <#else>
                    <h1 id="kc-page-title"><#nested "header"></h1>
            </#if>
                <#else>
                    <#if displayRequiredFields>
                        <div class="${properties.kcContentWrapperClass!}">
                            <div class="${properties.kcLabelWrapperClass!} subtitle">
                                <span class="subtitle"><span class="required">*</span> ${msg("requiredFields")}</span>
                            </div>
                            <div class="col-md-10">
                                <#nested "show-username">
                        <div class="${properties.kcFormGroupClass!}">
                                    <div id="kc-username">
                                        <label id="kc-attempted-username">${auth.attemptedUsername}</label>
                                        <a id="reset-login" href="${url.loginRestartFlowUrl}">
                                            <div class="kc-login-tooltip">
                                                <i class="${properties.kcResetFlowIcon!}"></i>
                                                <span class="kc-tooltip-text">${msg("restartLoginTooltip")}</span>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <#else>
                            <#nested "show-username">
                <div class="${properties.kcFormGroupClass!}">
                                <div id="kc-username">
                                    <label id="kc-attempted-username">${auth.attemptedUsername}</label>
                                    <a id="reset-login" href="${url.loginRestartFlowUrl}">
                                        <div class="kc-login-tooltip">
                                            <i class="${properties.kcResetFlowIcon!}"></i>
                                            <span class="kc-tooltip-text">${msg("restartLoginTooltip")}</span>
                                        </div>
                                    </a>
                                </div>
                            </div>
            </#if>
                    </#if>
      </header>
                <div id="kc-content">
                    <div id="kc-content-wrapper">

                        <#-- App-initiated actions should not see warning messages about the need to complete the action -->
          <#-- during login.                                                                               -->
          <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
              <div class="alert alert-${message.type}">
                            <#if message.<span class="${properties.kcFeedbackSuccessIcon!}"></span></#if>
                        <#if message.<span class="${properties.kcFeedbackWarningIcon!}"></span></#if>
                    <#if message.<span class="${properties.kcFeedbackErrorIcon!}"></span></#if>
                <#if message.<span class="${properties.kcFeedbackInfoIcon!}"></span></#if>
            <span class="kc-feedback-text">${kcSanitize(message.summary) ? no_esc}</span>
        </div>
          </#if >

        <#nested "form" >

            <#if auth?has_content && auth.showTryAnotherWayLink() && showAnotherWayIfPresent >
          <form id="kc-select-try-another-way-form" action="${url.loginAction}" method="post" <#if displayWide>class="${properties.kcContentWrapperClass!}"</#if> >
            <div <#if displayWide>class="${properties.kcFormSocialAccountContentClass!} ${properties.kcFormSocialAccountClass!}"</#if> >
            <div class="${properties.kcFormGroupClass!}">
                <input type="hidden" name="tryAnotherWay" value="on" />
                <a href="#" id="try-another-way" onclick="document.forms['kc-select-try-another-way-form'].submit();return false;">${msg("doTryAnotherWay")}</a>
            </div>
              </div >
          </form >
          </#if >

        <#if displayInfo>
            <div id="kc-info" class="${properties.kcSignUpClass!}">
                <div id="kc-info-wrapper" class="${properties.kcInfoAreaWrapperClass!}">
                    <#nested "info">
                  </div>
            </div>
        </#if>
        </div >
      </div >

    </div >
  </div >



    );

}
*/

export {};