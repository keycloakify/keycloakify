import { clsx } from "keycloakify/tools/clsx";
import { getKcClsx } from "keycloakify/account/lib/kcClsx";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function Totp(props: PageProps<Extract<KcContext, { pageId: "totp.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { totp, mode, url, messagesPerField, stateChecker } = kcContext;

    const { msg, msgStr, advancedMsg } = i18n;

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} active="totp">
            <>
                <div className="row">
                    <div className="col-md-10">
                        <h2>{msg("authenticatorTitle")}</h2>
                    </div>
                    {totp.otpCredentials.length === 0 && (
                        <div className="subtitle col-md-2">
                            <span className="required">*</span>
                            {msg("requiredFields")}
                        </div>
                    )}
                </div>
                {totp.enabled && (
                    <table className="table table-bordered table-striped">
                        <thead>
                            {totp.otpCredentials.length > 1 ? (
                                <tr>
                                    <th colSpan={4}>{msg("configureAuthenticators")}</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th colSpan={3}>{msg("configureAuthenticators")}</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {totp.otpCredentials.map((credential, index) => (
                                <tr key={index}>
                                    <td className="provider">{msg("mobile")}</td>
                                    {totp.otpCredentials.length > 1 && <td className="provider">{credential.id}</td>}
                                    <td className="provider">{credential.userLabel || ""}</td>
                                    <td className="action">
                                        <form action={url.totpUrl} method="post" className="form-inline">
                                            <input type="hidden" id="stateChecker" name="stateChecker" value={stateChecker} />
                                            <input type="hidden" id="submitAction" name="submitAction" value="Delete" />
                                            <input type="hidden" id="credentialId" name="credentialId" value={credential.id} />
                                            <button id={`remove-mobile-${index}`} className="btn btn-default">
                                                <i className="pficon pficon-delete"></i>
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!totp.enabled && (
                    <div>
                        <hr />
                        <ol id="kc-totp-settings">
                            <li>
                                <p>{msg("totpStep1")}</p>

                                <ul id="kc-totp-supported-apps">{totp.supportedApplications?.map(app => <li key={app}>{advancedMsg(app)}</li>)}</ul>
                            </li>

                            {mode && mode == "manual" ? (
                                <>
                                    <li>
                                        <p>{msg("totpManualStep2")}</p>
                                        <p>
                                            <span id="kc-totp-secret-key">{totp.totpSecretEncoded}</span>
                                        </p>
                                        <p>
                                            <a href={totp.qrUrl} id="mode-barcode">
                                                {msg("totpScanBarcode")}
                                            </a>
                                        </p>
                                    </li>
                                    <li>
                                        <p>{msg("totpManualStep3")}</p>
                                        <ul>
                                            <li id="kc-totp-type">
                                                {msg("totpType")}: {msg(`totp.${totp.policy.type}`)}
                                            </li>
                                            <li id="kc-totp-algorithm">
                                                {msg("totpAlgorithm")}: {totp.policy.getAlgorithmKey()}
                                            </li>
                                            <li id="kc-totp-digits">
                                                {msg("totpDigits")}: {totp.policy.digits}
                                            </li>
                                            {totp.policy.type === "totp" ? (
                                                <li id="kc-totp-period">
                                                    {msg("totpInterval")}: {totp.policy.period}
                                                </li>
                                            ) : (
                                                <li id="kc-totp-counter">
                                                    {msg("totpCounter")}: {totp.policy.initialCounter}
                                                </li>
                                            )}
                                        </ul>
                                    </li>
                                </>
                            ) : (
                                <li>
                                    <p>{msg("totpStep2")}</p>
                                    <p>
                                        <img
                                            id="kc-totp-secret-qr-code"
                                            src={`data:image/png;base64, ${totp.totpSecretQrCode}`}
                                            alt="Figure: Barcode"
                                        />
                                    </p>
                                    <p>
                                        <a href={totp.manualUrl} id="mode-manual">
                                            {msg("totpUnableToScan")}
                                        </a>
                                    </p>
                                </li>
                            )}
                            <li>
                                <p>{msg("totpStep3")}</p>
                                <p>{msg("totpStep3DeviceName")}</p>
                            </li>
                        </ol>
                        <hr />
                        <form action={url.totpUrl} className={kcClsx("kcFormClass")} id="kc-totp-settings-form" method="post">
                            <input type="hidden" id="stateChecker" name="stateChecker" value={stateChecker} />
                            <div className={kcClsx("kcFormGroupClass")}>
                                <div className="col-sm-2 col-md-2">
                                    <label htmlFor="totp" className="control-label">
                                        {msg("authenticatorCode")}
                                    </label>
                                    <span className="required">*</span>
                                </div>
                                <div className="col-sm-10 col-md-10">
                                    <input
                                        type="text"
                                        id="totp"
                                        name="totp"
                                        autoComplete="off"
                                        className={kcClsx("kcInputClass")}
                                        aria-invalid={messagesPerField.existsError("totp")}
                                    />

                                    {messagesPerField.existsError("totp") && (
                                        <span
                                            id="input-error-otp-code"
                                            className={kcClsx("kcInputErrorMessageClass")}
                                            aria-live="polite"
                                            dangerouslySetInnerHTML={{
                                                __html: kcSanitize(messagesPerField.get("totp"))
                                            }}
                                        />
                                    )}
                                </div>
                                <input type="hidden" id="totpSecret" name="totpSecret" value={totp.totpSecret} />
                                {mode && <input type="hidden" id="mode" value={mode} />}
                            </div>

                            <div className={kcClsx("kcFormGroupClass")}>
                                <div className="col-sm-2 col-md-2">
                                    <label htmlFor="userLabel" className={kcClsx("kcLabelClass")}>
                                        {msg("totpDeviceName")}
                                    </label>
                                    {totp.otpCredentials.length >= 1 && <span className="required">*</span>}
                                </div>
                                <div className="col-sm-10 col-md-10">
                                    <input
                                        type="text"
                                        id="userLabel"
                                        name="userLabel"
                                        autoComplete="off"
                                        className={kcClsx("kcInputClass")}
                                        aria-invalid={messagesPerField.existsError("userLabel")}
                                    />
                                    {messagesPerField.existsError("userLabel") && (
                                        <span
                                            id="input-error-otp-label"
                                            className={kcClsx("kcInputErrorMessageClass")}
                                            aria-live="polite"
                                            dangerouslySetInnerHTML={{
                                                __html: kcSanitize(messagesPerField.get("userLabel"))
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            <div id="kc-form-buttons" className={clsx(kcClsx("kcFormGroupClass"), "text-right")}>
                                <div className={kcClsx("kcInputWrapperClass")}>
                                    <input
                                        type="submit"
                                        className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonLargeClass")}
                                        id="saveTOTPBtn"
                                        value={msgStr("doSave")}
                                    />
                                    <button
                                        type="submit"
                                        className={kcClsx("kcButtonClass", "kcButtonDefaultClass", "kcButtonLargeClass", "kcButtonLargeClass")}
                                        id="cancelTOTPBtn"
                                        name="submitAction"
                                        value="Cancel"
                                    >
                                        {msg("doCancel")}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </>
        </Template>
    );
}
