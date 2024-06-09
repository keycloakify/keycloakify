import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import { getKcClsx } from "keycloakify/account/lib/kcClsx";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function Account(props: PageProps<Extract<KcContext, { pageId: "account.ftl" }>>) {
    const { kcContext, doUseDefaultCss, Template } = props;

    const classes = {
        ...props.classes,
        kcBodyClass: clsx(props.classes?.kcBodyClass, "user")
    };

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { url, realm, messagesPerField, stateChecker, account, referrer } = kcContext;

    const { msg } = useI18n({ kcContext });

    return (
        <Template {...{ kcContext, doUseDefaultCss, classes }} active="account">
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
                                defaultValue={account.username ?? ""}
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
                        <input type="text" className="form-control" id="email" name="email" autoFocus defaultValue={account.email ?? ""} />
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
                        <input type="text" className="form-control" id="firstName" name="firstName" defaultValue={account.firstName ?? ""} />
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
                        <input type="text" className="form-control" id="lastName" name="lastName" defaultValue={account.lastName ?? ""} />
                    </div>
                </div>

                <div className="form-group">
                    <div id="kc-form-buttons" className="col-md-offset-2 col-md-10 submit">
                        <div>
                            {referrer !== undefined && <a href={referrer?.url}>{msg("backToApplication")}</a>}
                            <button
                                type="submit"
                                className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonLargeClass")}
                                name="submitAction"
                                value="Save"
                            >
                                {msg("doSave")}
                            </button>
                            <button
                                type="submit"
                                className={kcClsx("kcButtonClass", "kcButtonDefaultClass", "kcButtonLargeClass")}
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
