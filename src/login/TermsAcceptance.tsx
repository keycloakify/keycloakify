import type { ClassKey } from "keycloakify/login/TemplateProps";
import { useRerenderOnStateChange } from "evt/hooks";
import { Markdown } from "keycloakify/tools/Markdown";
import { evtTermMarkdown } from "keycloakify/login/lib/useDownloadTerms";
import type { KcContext } from "keycloakify/login/kcContext/KcContext";
import type { I18n } from "./i18n";

export type PropsOfTermsAcceptance = {
    kcContext: KcContextLike;
    i18n: I18n;
    getClassName: (classKey: ClassKey) => string;
};

type KcContextLike = {
    termsAcceptanceRequired?: boolean;
    messagesPerField: Pick<KcContext.Common["messagesPerField"], "existsError" | "get">;
};

export function TermsAcceptance(props: PropsOfTermsAcceptance) {
    const {
        kcContext: { termsAcceptanceRequired = false }
    } = props;

    if (!termsAcceptanceRequired) {
        return null;
    }

    return <TermsAcceptanceEnabled {...props} />;
}

export function TermsAcceptanceEnabled(props: PropsOfTermsAcceptance) {
    const {
        i18n,
        getClassName,
        kcContext: { messagesPerField }
    } = props;

    const { msg } = i18n;

    useRerenderOnStateChange(evtTermMarkdown);

    const termMarkdown = evtTermMarkdown.state;

    if (termMarkdown === undefined) {
        return null;
    }

    return (
        <>
            <div className="form-group">
                <div className={getClassName("kcInputWrapperClass")}>
                    {msg("termsTitle")}
                    <div id="kc-registration-terms-text">
                        <Markdown>{termMarkdown}</Markdown>
                    </div>
                </div>
            </div>
            <div className="form-group">
                <div className={getClassName("kcLabelWrapperClass")}>
                    <input
                        type="checkbox"
                        id="termsAccepted"
                        name="termsAccepted"
                        className={getClassName("kcCheckboxInputClass")}
                        aria-invalid={messagesPerField.existsError("termsAccepted")}
                    />
                    <label htmlFor="termsAccepted" className={getClassName("kcLabelClass")}>
                        {msg("acceptTerms")}
                    </label>
                </div>
                {messagesPerField.existsError("termsAccepted") && (
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <span id="input-error-terms-accepted" className={getClassName("kcInputErrorMessageClass")} aria-live="polite">
                            {messagesPerField.get("termsAccepted")}
                        </span>
                    </div>
                )}
            </div>
        </>
    );
}
