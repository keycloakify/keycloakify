import { useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { getKcClsx } from "keycloakify/account/lib/kcClsx";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function Password(props: PageProps<Extract<KcContext, { pageId: "password.ftl" }>>) {
    const { kcContext, doUseDefaultCss, Template } = props;

    const classes = {
        ...props.classes,
        kcBodyClass: clsx(props.classes?.kcBodyClass, "password")
    };

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { url, password, account, stateChecker } = kcContext;

    const { msgStr, msg } = useI18n({ kcContext });

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");
    const [newPasswordConfirmError, setNewPasswordConfirmError] = useState("");
    const [hasNewPasswordBlurred, setHasNewPasswordBlurred] = useState(false);
    const [hasNewPasswordConfirmBlurred, setHasNewPasswordConfirmBlurred] = useState(false);

    const checkNewPassword = (newPassword: string) => {
        if (!password.passwordSet) {
            return;
        }

        if (newPassword === currentPassword) {
            setNewPasswordError(msgStr("newPasswordSameAsOld"));
        } else {
            setNewPasswordError("");
        }
    };

    const checkNewPasswordConfirm = (newPasswordConfirm: string) => {
        if (newPasswordConfirm === "") {
            return;
        }

        if (newPassword !== newPasswordConfirm) {
            setNewPasswordConfirmError(msgStr("passwordConfirmNotMatch"));
        } else {
            setNewPasswordConfirmError("");
        }
    };

    return (
        <Template
            {...{
                kcContext: {
                    ...kcContext,
                    message: (() => {
                        if (newPasswordError !== "") {
                            return {
                                type: "error",
                                summary: newPasswordError
                            };
                        }

                        if (newPasswordConfirmError !== "") {
                            return {
                                type: "error",
                                summary: newPasswordConfirmError
                            };
                        }

                        return kcContext.message;
                    })()
                },
                doUseDefaultCss,
                classes
            }}
            active="password"
        >
            <div className="row">
                <div className="col-md-10">
                    <h2>{msg("changePasswordHtmlTitle")}</h2>
                </div>
                <div className="col-md-2 subtitle">
                    <span className="subtitle">{msg("allFieldsRequired")}</span>
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
                    style={{ display: "none" }}
                />

                {password.passwordSet && (
                    <div className="form-group">
                        <div className="col-sm-2 col-md-2">
                            <label htmlFor="password" className="control-label">
                                {msg("password")}
                            </label>
                        </div>
                        <div className="col-sm-10 col-md-10">
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                name="password"
                                autoFocus
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={event => setCurrentPassword(event.target.value)}
                            />
                        </div>
                    </div>
                )}

                <input type="hidden" id="stateChecker" name="stateChecker" value={stateChecker} />

                <div className="form-group">
                    <div className="col-sm-2 col-md-2">
                        <label htmlFor="password-new" className="control-label">
                            {msg("passwordNew")}
                        </label>
                    </div>
                    <div className="col-sm-10 col-md-10">
                        <input
                            type="password"
                            className="form-control"
                            id="password-new"
                            name="password-new"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={event => {
                                const newPassword = event.target.value;

                                setNewPassword(newPassword);
                                if (hasNewPasswordBlurred) {
                                    checkNewPassword(newPassword);
                                }
                            }}
                            onBlur={() => {
                                setHasNewPasswordBlurred(true);
                                checkNewPassword(newPassword);
                            }}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="col-sm-2 col-md-2">
                        <label htmlFor="password-confirm" className="control-label two-lines">
                            {msg("passwordConfirm")}
                        </label>
                    </div>

                    <div className="col-sm-10 col-md-10">
                        <input
                            type="password"
                            className="form-control"
                            id="password-confirm"
                            name="password-confirm"
                            autoComplete="new-password"
                            value={newPasswordConfirm}
                            onChange={event => {
                                const newPasswordConfirm = event.target.value;

                                setNewPasswordConfirm(newPasswordConfirm);
                                if (hasNewPasswordConfirmBlurred) {
                                    checkNewPasswordConfirm(newPasswordConfirm);
                                }
                            }}
                            onBlur={() => {
                                setHasNewPasswordConfirmBlurred(true);
                                checkNewPasswordConfirm(newPasswordConfirm);
                            }}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div id="kc-form-buttons" className="col-md-offset-2 col-md-10 submit">
                        <div>
                            <button
                                disabled={newPasswordError !== "" || newPasswordConfirmError !== ""}
                                type="submit"
                                className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonLargeClass")}
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
