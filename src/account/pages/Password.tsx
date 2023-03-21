import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import { useGetClassName } from "keycloakify/account/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

export default function LogoutConfirm(props: PageProps<Extract<KcContext, { pageId: "password.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        "classes": {
            ...classes,
            "kcBodyClass": clsx(classes?.kcBodyClass, "password")
        }
    });

    const { url, password, account } = kcContext;

    const { msg } = i18n;

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} active="password">
            <div className="row">
                <div className="col-md-10">
                    <h2>{msg("changePasswordHtmlTitle")}</h2>
                </div>
                <div className="col-md-2 subtitle">
                    <span className="subtitle">${msg("allFieldsRequired")}</span>
                </div>
            </div>

            <form action={url.passwordUrl} className="form-horizontal" method="post">
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={account.username ?? ""}
                    autoComplete="username"
                    readOnly
                    style={{ "display": "none;" }}
                />

                {password.passwordSet && (
                    <div className="form-group">
                        <div className="col-sm-2 col-md-2">
                            <label htmlFor="password" className="control-label">
                                {msg("password")}
                            </label>
                        </div>

                        <div className="col-sm-10 col-md-10">
                            <input type="password" className="form-control" id="password" name="password" autoFocus autoComplete="current-password" />
                        </div>
                    </div>
                )}

                <input type="hidden" id="stateChecker" name="stateChecker" value="${stateChecker}" />

                <div className="form-group">
                    <div className="col-sm-2 col-md-2">
                        <label htmlFor="password-new" className="control-label">
                            {msg("passwordNew")}
                        </label>
                    </div>

                    <div className="col-sm-10 col-md-10">
                        <input type="password" className="form-control" id="password-new" name="password-new" autoComplete="new-password" />
                    </div>
                </div>

                <div className="form-group">
                    <div className="col-sm-2 col-md-2">
                        <label htmlFor="password-confirm" className="control-label two-lines">
                            {msg("passwordConfirm")}
                        </label>
                    </div>

                    <div className="col-sm-10 col-md-10">
                        <input type="password" className="form-control" id="password-confirm" name="password-confirm" autoComplete="new-password" />
                    </div>
                </div>

                <div className="form-group">
                    <div id="kc-form-buttons" className="col-md-offset-2 col-md-10 submit">
                        <div>
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
                        </div>
                    </div>
                </div>
            </form>
        </Template>
    );
}
