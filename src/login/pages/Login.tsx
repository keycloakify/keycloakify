import { useState, useEffect, useReducer } from "react";
import { assert } from "keycloakify/tools/assert";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { getKcClsx, type KcClsx } from "keycloakify/login/lib/kcClsx";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import './Login.scss';
import checkedimg from '../../img/checked.png';
import crossimg from '../../img/cross.png';

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { realm, url, usernameHidden, login, registrationDisabled, messagesPerField, social, message } = kcContext;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);
    const [active, setActive ] = useState(true);

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("username", "password")}
            headerNode={""}
            displayInfo={realm.password && realm.registrationAllowed && !registrationDisabled}
        >
            <>
                {login?.username && message===undefined && active &&
                    <div className="notification">
                        <img src={checkedimg} className="check-icon" width="20px" height="20px" />
                        <div style={{marginLeft: '10px'}}>
                            <div className="header-notification">
                                Check Your Inbox!
                            </div>
                            <div className="content-notification">
                                We've sent an email to <b>{login.username}</b> to verify your email address and
                                registration.
                            </div>
                        </div>
                        <img onClick={()=>setActive(false)} src={crossimg} className="cross-icon" width="20px" height="20px" />
                    </div>
                }
                {login?.username && message && message.type === "success" && active &&
                    <div className="notification">
                    <img src={checkedimg} className="check-icon" width="20px" height="20px" />
                    <div style={{marginLeft: '10px'}}>
                        <div className="header-notification">
                            Check Your Inbox!
                        </div>
                        <div className="content-notification">
                            We've sent an email to <b>{login.username}</b> so that you can reset your password.
                        </div>
                    </div>
                    <img onClick={()=>setActive(false)} src={crossimg} className="cross-icon" width="20px" height="20px" />
                </div>
                }
                <div className="main-container">
                    <div className="field-container">
                        <section className="header-1">
                            Login with ORS
                        </section>
                        <form
                            id="kc-form-login"
                            onSubmit={() => {
                                setIsLoginButtonDisabled(true);
                                return true;
                            }}
                            action={url.loginAction}
                            method="post"
                        >
                            <div className="data-fields">
                                <>
                                    <label style={{ fontSize: '0.8rem', color: '#1E678F' }} className={kcClsx("kcLabelClass")}>
                                        Email
                                    </label>
                                    <input
                                        tabIndex={2}
                                        id="username"
                                        className={kcClsx("kcInputClass")}
                                        name="username"
                                        defaultValue={login.username ?? ""}
                                        type="text"
                                        autoFocus
                                        autoComplete="username"
                                        aria-invalid={messagesPerField.existsError("username", "password")}
                                    />
                                    {messagesPerField.existsError("username", "password") && (
                                        <span id="input-error" className={kcClsx("kcInputErrorMessageClass")} aria-live="polite">
                                            {messagesPerField.getFirstError("username", "password")}
                                        </span>
                                    )}
                                </>
                                <div className={kcClsx("kcFormGroupClass")}>
                                    <label style={{ marginTop: '20px', fontSize: '0.8rem', color: '#1E678F' }} htmlFor="password" className={kcClsx("kcLabelClass")}>
                                        Password
                                    </label>
                                    <PasswordWrapper kcClsx={kcClsx} i18n={i18n} passwordInputId="password">
                                        <input
                                            tabIndex={3}
                                            id="password"
                                            className={kcClsx("kcInputClass")}
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            aria-invalid={messagesPerField.existsError("username", "password")}
                                        />
                                    </PasswordWrapper>
                                    {usernameHidden && messagesPerField.existsError("username", "password") && (
                                        <span id="input-error" className={kcClsx("kcInputErrorMessageClass")} aria-live="polite">
                                            {messagesPerField.getFirstError("username", "password")}
                                        </span>
                                    )}
                                </div>
                                <div className="links">
                                    <p>
                                        <a href={url.loginResetCredentialsUrl}>
                                            Forgot password?
                                        </a>

                                        <br />
                                        {social?.providers &&
                                            <a href={social.providers[1]?.loginUrl}>
                                                Staff login
                                            </a>
                                        }
                                    </p>
                                </div>
                                <input
                                    tabIndex={4}
                                    className="button-login"
                                    name="login"
                                    id="kc-login"
                                    type="submit"
                                    value="Login"
                                    disabled={isLoginButtonDisabled}
                                />
                            </div>
                        </form>
                    </div>
                    <div style={{ width: '50%' }} className="create-account">
                        <h1 style={{ fontSize: '1.99rem', fontWeight: 'bold' }}>Create An Account</h1>
                        <p style={{ fontSize: '0.9rem', marginBottom: '30px' }}>
                            Create an account to add your voice to Public Reviews <br /> and receive notifications about new Public Reviews.
                        </p>
                        <a href={url.registrationUrl} className="button-account">
                            Create New Account
                        </a>
                    </div>
                </div>
            </>

        </Template>
    );
}

function PasswordWrapper(props: { kcClsx: KcClsx; i18n: I18n; passwordInputId: string; children: JSX.Element }) {
    const { kcClsx, i18n, passwordInputId, children } = props;

    const { msgStr } = i18n;

    const [isPasswordRevealed, toggleIsPasswordRevealed] = useReducer((isPasswordRevealed: boolean) => !isPasswordRevealed, false);

    useEffect(() => {
        const passwordInputElement = document.getElementById(passwordInputId);

        assert(passwordInputElement instanceof HTMLInputElement);

        passwordInputElement.type = isPasswordRevealed ? "text" : "password";
    }, [isPasswordRevealed]);

    return (
        <div className={kcClsx("kcInputGroup")}>
            {children}
            <button
                type="button"
                className={kcClsx("kcFormPasswordVisibilityButtonClass")}
                aria-label={msgStr(isPasswordRevealed ? "hidePassword" : "showPassword")}
                aria-controls={passwordInputId}
                onClick={toggleIsPasswordRevealed}
            >
                <i className={kcClsx(isPasswordRevealed ? "kcFormPasswordVisibilityIconHide" : "kcFormPasswordVisibilityIconShow")} aria-hidden />
            </button>
        </div>
    );
}
