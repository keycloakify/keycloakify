import { clsx } from "keycloakify/tools/clsx";
import { type PageProps, defaultClasses } from "keycloakify/pages/PageProps";
import { useGetClassName } from "keycloakify/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18nBase as I18n } from "../i18n";

export default function LoginUpdateProfile(props: PageProps<Extract<KcContext, { pageId: "login-update-profile.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        "defaultClasses": !doUseDefaultCss ? undefined : defaultClasses,
        classes
    });

    const { msg, msgStr } = i18n;

    const { url, user, messagesPerField, isAppInitiatedAction } = kcContext;

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
            headerNode={msg("loginProfileTitle")}
            formNode={
                <form id="kc-update-profile-form" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
                    {user.editUsernameAllowed && (
                        <div
                            className={clsx(
                                getClassName("kcFormGroupClass"),
                                messagesPerField.printIfExists("username", getClassName("kcFormGroupErrorClass"))
                            )}
                        >
                            <div className={getClassName("kcLabelWrapperClass")}>
                                <label htmlFor="username" className={getClassName("kcLabelClass")}>
                                    {msg("username")}
                                </label>
                            </div>
                            <div className={getClassName("kcInputWrapperClass")}>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    defaultValue={user.username ?? ""}
                                    className={getClassName("kcInputClass")}
                                />
                            </div>
                        </div>
                    )}

                    <div
                        className={clsx(
                            getClassName("kcFormGroupClass"),
                            messagesPerField.printIfExists("email", getClassName("kcFormGroupErrorClass"))
                        )}
                    >
                        <div className={getClassName("kcLabelWrapperClass")}>
                            <label htmlFor="email" className={getClassName("kcLabelClass")}>
                                {msg("email")}
                            </label>
                        </div>
                        <div className={getClassName("kcInputWrapperClass")}>
                            <input type="text" id="email" name="email" defaultValue={user.email ?? ""} className={getClassName("kcInputClass")} />
                        </div>
                    </div>

                    <div
                        className={clsx(
                            getClassName("kcFormGroupClass"),
                            messagesPerField.printIfExists("firstName", getClassName("kcFormGroupErrorClass"))
                        )}
                    >
                        <div className={getClassName("kcLabelWrapperClass")}>
                            <label htmlFor="firstName" className={getClassName("kcLabelClass")}>
                                {msg("firstName")}
                            </label>
                        </div>
                        <div className={getClassName("kcInputWrapperClass")}>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                defaultValue={user.firstName ?? ""}
                                className={getClassName("kcInputClass")}
                            />
                        </div>
                    </div>

                    <div
                        className={clsx(
                            getClassName("kcFormGroupClass"),
                            messagesPerField.printIfExists("lastName", getClassName("kcFormGroupErrorClass"))
                        )}
                    >
                        <div className={getClassName("kcLabelWrapperClass")}>
                            <label htmlFor="lastName" className={getClassName("kcLabelClass")}>
                                {msg("lastName")}
                            </label>
                        </div>
                        <div className={getClassName("kcInputWrapperClass")}>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                defaultValue={user.lastName ?? ""}
                                className={getClassName("kcInputClass")}
                            />
                        </div>
                    </div>

                    <div className={getClassName("kcFormGroupClass")}>
                        <div id="kc-form-options" className={getClassName("kcFormOptionsClass")}>
                            <div className={getClassName("kcFormOptionsWrapperClass")} />
                        </div>

                        <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                            {isAppInitiatedAction ? (
                                <>
                                    <input
                                        className={clsx(
                                            getClassName("kcButtonClass"),
                                            getClassName("kcButtonPrimaryClass"),
                                            getClassName("kcButtonLargeClass")
                                        )}
                                        type="submit"
                                        defaultValue={msgStr("doSubmit")}
                                    />
                                    <button
                                        className={clsx(
                                            getClassName("kcButtonClass"),
                                            getClassName("kcButtonDefaultClass"),
                                            getClassName("kcButtonLargeClass")
                                        )}
                                        type="submit"
                                        name="cancel-aia"
                                        value="true"
                                    >
                                        {msg("doCancel")}
                                    </button>
                                </>
                            ) : (
                                <input
                                    className={clsx(
                                        getClassName("kcButtonClass"),
                                        getClassName("kcButtonPrimaryClass"),
                                        getClassName("kcButtonBlockClass"),
                                        getClassName("kcButtonLargeClass")
                                    )}
                                    type="submit"
                                    defaultValue={msgStr("doSubmit")}
                                />
                            )}
                        </div>
                    </div>
                </form>
            }
        />
    );
}
