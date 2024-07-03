import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import './LoginResetPassword.scss';

export default function LoginResetPassword(props: PageProps<Extract<KcContext, { pageId: "login-reset-password.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { url, realm, auth, messagesPerField } = kcContext;

   /*  const { msg, msgStr } = i18n; */

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            //displayInfo
            //displayMessage={!messagesPerField.existsError("username")}
            //infoNode={realm.duplicateEmailsAllowed ? msg("emailInstructionUsername") : msg("emailInstruction")}
            headerNode={""}
        >
            {/* <form id="kc-reset-password-form" className={kcClsx("kcFormClass")} action={url.loginAction} method="post">
                <div className={kcClsx("kcFormGroupClass")}>
                    <div className={kcClsx("kcLabelWrapperClass")}>
                        <label htmlFor="username" className={kcClsx("kcLabelClass")}>
                            {!realm.loginWithEmailAllowed
                                ? msg("username")
                                : !realm.registrationEmailAsUsername
                                  ? msg("usernameOrEmail")
                                  : msg("email")}
                        </label>
                    </div>
                    <div className={kcClsx("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className={kcClsx("kcInputClass")}
                            autoFocus
                            defaultValue={auth.attemptedUsername ?? ""}
                            aria-invalid={messagesPerField.existsError("username")}
                        />
                        {messagesPerField.existsError("username") && (
                            <span id="input-error-username" className={kcClsx("kcInputErrorMessageClass")} aria-live="polite">
                                {messagesPerField.get("username")}
                            </span>
                        )}
                    </div>
                </div>
                <div className={kcClsx("kcFormGroupClass", "kcFormSettingClass")}>
                    <div id="kc-form-options" className={kcClsx("kcFormOptionsClass")}>
                        <div className={kcClsx("kcFormOptionsWrapperClass")}>
                            <span>
                                <a href={url.loginUrl}>{msg("backToLogin")}</a>
                            </span>
                        </div>
                    </div>

                    <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                        <input
                            className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass")}
                            type="submit"
                            value={msgStr("doSubmit")}
                        />
                    </div>
                </div>
            </form> */}
            <div className="container-reset">
				<div className="header-reset">
					Reset Password
				</div>
				<div className="reset-fields">
                    <form 
                        id="kc-reset-password-form" 
                        className={kcClsx("kcFormClass")} 
                        action={url.loginAction} 
                        method="post"
                    >

					{!realm.loginWithEmailAllowed ? (
						<div /* className={kcClsx("kcInputClass")} */>
                            <p style={{marginTop:'-10px', fontWeight:'550', color:'#5e5e5e'}}>Please submit your new password </p>
							
                            <label style={{fontSize:'0.8rem', color: '#1E678F'}} htmlFor="password" className={kcClsx("kcLabelClass")}>
								Password
							</label>
							<input
								tabIndex={2}
								id="password"
								className={kcClsx("kcInputClass")}
								name="password"
								type="password"
								autoComplete="off"
							/>
						</div>
					) : (
					<>
						<label style={{fontSize:'0.8rem', color: '#1E678F'}} className={kcClsx("kcLabelClass")}>
							Email
						</label>
						<input
                            id="username"
                            name="username"
							tabIndex={1}
							className={kcClsx("kcInputClass")}
							type="text"
							autoFocus={true}
							autoComplete="off"
                            aria-invalid={messagesPerField.existsError("username")}
                            defaultValue={auth.attemptedUsername ?? ""}
						/>
                         {messagesPerField.existsError("username") && (
                            <span id="input-error-username" className={kcClsx("kcInputErrorMessageClass")} aria-live="polite">
                                {messagesPerField.get("username")}
                            </span>
                        )}
					</>
					)}

					<input
						className="button-reset"
						name="reset"
						id="kc-reset"
						type="submit"
						value={!realm.loginWithEmailAllowed?"Submit":"Reset Password"}
					/>

                        {realm.loginWithEmailAllowed &&
                            <>
                                <hr className="divider" />

                                <a href={url.loginUrl} className="button-back">
                                    Back
                                </a>
                            </>
                        }
                    </form>
				</div>
			</div>
        </Template>
    );
}
