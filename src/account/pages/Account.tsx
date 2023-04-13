import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import { useGetClassName } from "keycloakify/account/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

export default function LogoutConfirm(props: PageProps<Extract<KcContext, { pageId: "account.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        "classes": {
            ...classes,
            "kcBodyClass": clsx(classes?.kcBodyClass, "user")
        }
    });

    const { url, realm, messagesPerField, stateChecker, account } = kcContext;

    const { msg } = i18n;

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} active="account">
            <div className="row">
                <div className="col-md-10">
                    <h2>{msg("editAccountHtmlTitle")}</h2>
                </div>
                <div className="col-md-2 subtitle">
                    <span className="subtitle">
                        <span className="required">*</span> {msg("requiredFields")}
                    </span>
                </div>
            </div>

            <form action={url.accountUrl} className="form-horizontal" method="post">
                <input type="hidden" id="stateChecker" name="stateChecker" value={stateChecker} />

                {!realm.registrationEmailAsUsername && (
                    <div className={clsx("form-group", messagesPerField.printIfExists("username", "has-error"))}>
                        <div className="col-sm-2 col-md-2">
                            <label htmlFor="username" className="control-label">
                                {msg("username")}
                            </label>
                            {realm.editUsernameAllowed && <span className="required">*</span>}
                        </div>

                        <div className="col-sm-10 col-md-10">
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                name="username"
                                disabled={!realm.editUsernameAllowed}
                                value={account.username ?? ""}
                            />
                        </div>
                    </div>
                )}

                <div className={clsx("form-group", messagesPerField.printIfExists("email", "has-error"))}>
                    <div className="col-sm-2 col-md-2">
                        <label htmlFor="email" className="control-label">
                            {msg("email")}
                        </label>{" "}
                        <span className="required">*</span>
                    </div>

                    <div className="col-sm-10 col-md-10">
                        <input type="text" className="form-control" id="email" name="email" autoFocus value={account.email ?? ""} />
                    </div>
                </div>

                <div className={clsx("form-group", messagesPerField.printIfExists("firstName", "has-error"))}>
                    <div className="col-sm-2 col-md-2">
                        <label htmlFor="firstName" className="control-label">
                            {msg("firstName")}
                        </label>{" "}
                        <span className="required">*</span>
                    </div>

                    <div className="col-sm-10 col-md-10">
                        <input type="text" className="form-control" id="firstName" name="firstName" value={account.firstName ?? ""} />
                    </div>
                </div>

                <div className={clsx("form-group", messagesPerField.printIfExists("lastName", "has-error"))}>
                    <div className="col-sm-2 col-md-2">
                        <label htmlFor="lastName" className="control-label">
                            {msg("lastName")}
                        </label>{" "}
                        <span className="required">*</span>
                    </div>

                    <div className="col-sm-10 col-md-10">
                        <input type="text" className="form-control" id="lastName" name="lastName" value={account.lastName ?? ""} />
                    </div>
                </div>

                <div className="form-group">
                    <div id="kc-form-buttons" className="col-md-offset-2 col-md-10 submit">
                        <div>
                            {url.referrerURI !== undefined && <a href={url.referrerURI}>${msg("backToApplication")}</a>}
                            <button
                                type="submit"
                                className={clsx(
                                    getClassName("kcButtonClass"),
                                    getClassName("kcButtonPrimaryClass"),
                                    getClassName("kcButtonLargeClass")
                                )}
                                name="submitAction"
                                value="Save"
                            >
                                {msg("doSave")}
                            </button>
                            <button
                                type="submit"
                                className={clsx(
                                    getClassName("kcButtonClass"),
                                    getClassName("kcButtonDefaultClass"),
                                    getClassName("kcButtonLargeClass")
                                )}
                                name="submitAction"
                                value="Cancel"
                            >
                                {msg("doCancel")}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </Template>
    );
}
