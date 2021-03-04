
import { useState, memo } from "react";
import { Template } from "./Template";
import type { KcPagesProperties } from "./KcProperties";
import { defaultKcPagesProperties } from "./KcProperties";
import { assert } from "../tools/assert";
import { kcContext } from "../kcContext";
import { useKcTranslation } from "../i18n/useKcTranslation";
import { cx } from "tss-react";
import { useConstCallback } from "powerhooks";

export type LoginProps = {
    kcProperties?: KcPagesProperties;
};

export const Login = memo((props: LoginProps) => {

    const { kcProperties = {} } = props;

    const { t, tStr } = useKcTranslation();

    Object.assign(kcProperties, defaultKcPagesProperties);

    const [{
        social, realm, url,
        usernameEditDisabled, login,
        auth, registrationDisabled
    }] = useState(() => {

        assert(
            kcContext !== undefined && 
            kcContext.pageBasename === "login.ftl"
        );

        return kcContext;

    });

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const onSubmit = useConstCallback(() =>
        (setIsLoginButtonDisabled(true), true)
    );


    return (
        <Template
            displayInfo={social.displayInfo}
            displayWide={realm.password && social.providers !== undefined}
            kcProperties={kcProperties}
            headerNode={t("doLogIn")}
            formNode={
                <div
                    id="kc-form"
                    className={cx(realm.password && social.providers !== undefined && kcProperties.kcContentWrapperClass)}
                >
                    <div
                        id="kc-form-wrapper"
                        className={cx(realm.password && social.providers && [kcProperties.kcFormSocialAccountContentClass, kcProperties.kcFormSocialAccountClass])}
                    >
                        {
                            realm.password &&
                            (
                                <form id="kc-form-login" onSubmit={onSubmit} action={url.loginAction} method="post">
                                    <div className={cx(kcProperties.kcFormGroupClass)}>
                                        <label htmlFor="username" className={cx(kcProperties.kcLabelClass)}>
                                            {
                                                !realm.loginWithEmailAllowed ?
                                                    t("username")
                                                    :
                                                    (
                                                        !realm.registrationEmailAsUsername ?
                                                            t("usernameOrEmail") :
                                                            t("email")
                                                    )
                                            }
                                        </label>
                                        <input
                                            tabIndex={1}
                                            id="username"
                                            className={cx(kcProperties.kcInputClass)}
                                            name="username"
                                            value={login.username ?? ''}
                                            type="text"
                                            {...(usernameEditDisabled ? { "disabled": true } : { "autofocus": true, "autocomplete": "off" })}
                                        />
                                    </div>
                                    <div className={cx(kcProperties.kcFormGroupClass)}>
                                        <label htmlFor="password" className={cx(kcProperties.kcLabelClass)}>
                                            {t("password")}
                                        </label>
                                        <input tabIndex={2} id="password" className={cx(kcProperties.kcInputClass)} name="password" type="password" autoComplete="off" />
                                    </div>
                                    <div className={cx(kcProperties.kcFormGroupClass, kcProperties.kcFormSettingClass)}>
                                        <div id="kc-form-options">
                                            {
                                                (
                                                    realm.rememberMe &&
                                                    !usernameEditDisabled
                                                ) &&
                                                <div className="checkbox">
                                                    <label>
                                                        <input tabIndex={3} id="rememberMe" name="rememberMe" type="checkbox" {...(login.rememberMe ? { "checked": true } : {})}> {t("rememberMe")}</input>
                                                    </label>
                                                </div>
                                            }
                                        </div>
                                        <div className={cx(kcProperties.kcFormOptionsWrapperClass)}>
                                            {
                                                realm.resetPasswordAllowed &&
                                                <span>
                                                    <a tabIndex={5} href={url.loginResetCredentialsUrl}>{t("doForgotPassword")}</a>
                                                </span>
                                            }
                                        </div>

                                    </div>
                                    <div id="kc-form-buttons" className={cx(kcProperties.kcFormGroupClass)}>
                                        <input
                                            type="hidden"
                                            id="id-hidden-input"
                                            name="credentialId"
                                            {...(auth?.selectedCredential !== undefined ? { "value": auth.selectedCredential } : {})}
                                        />
                                        <input
                                            tabIndex={4}
                                            className={cx(kcProperties.kcButtonClass, kcProperties.kcButtonPrimaryClass, kcProperties.kcButtonBlockClass, kcProperties.kcButtonLargeClass)} name="login" id="kc-login" type="submit"
                                            value={tStr("doLogIn")}
                                            disabled={isLoginButtonDisabled}
                                        />
                                    </div>
                                </form>
                            )
                        }
                    </div>
                    {
                        (realm.password && social.providers !== undefined) &&
                        <div id="kc-social-providers" className={cx(kcProperties.kcFormSocialAccountContentClass, kcProperties.kcFormSocialAccountClass)}>
                            <ul className={cx(kcProperties.kcFormSocialAccountListClass, social.providers.length > 4 && kcProperties.kcFormSocialAccountDoubleListClass)}>
                                {
                                    social.providers.map(p =>
                                        <li className={cx(kcProperties.kcFormSocialAccountListLinkClass)}>
                                            <a href={p.loginUrl} id={`zocial-${p.alias}`} className={cx("zocial", p.providerId)}>
                                                <span>{p.displayName}</span>
                                            </a>
                                        </li>
                                    )
                                }
                            </ul>
                        </div>
                    }
                </div>
            }
            displayInfoNode={
                (
                    realm.password &&
                    realm.resetPasswordAllowed &&
                    !registrationDisabled
                ) &&
                <div id="kc-registration">
                    <span>
                        {t("noAccount")}
                        <a tabIndex={6} href={url.registrationUrl}>
                            {t("doRegister")}
                        </a>
                    </span>
                </div>
            }
        />
    );
});


