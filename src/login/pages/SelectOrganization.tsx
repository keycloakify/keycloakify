import { MouseEvent, useRef, useState } from "react";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function SelectOrganization(props: PageProps<Extract<KcContext, { pageId: "select-organization.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { url, user } = kcContext;

    const { msg } = i18n;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const organizationInputRef = useRef<HTMLInputElement>(null);

    const onOrganizationClick = (organizationAlias: string) => (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (!organizationInputRef.current || !formRef.current) {
            return;
        }

        organizationInputRef.current.value = organizationAlias;
        setIsSubmitting(true);

        if (typeof formRef.current.requestSubmit === "function") {
            formRef.current.requestSubmit();
            return;
        }

        formRef.current.submit();
    };

    const organizations = user.organizations ?? [];
    const shouldDisplayGrid = organizations.length > 3;

    return (
        <Template kcContext={kcContext} i18n={i18n} doUseDefaultCss={doUseDefaultCss} classes={classes} headerNode={null}>
            <form ref={formRef} action={url.loginAction} className="form-vertical" method="post">
                <div id="kc-user-organizations" className={kcClsx("kcFormGroupClass")}>
                    <h2>{msg("organization.select")}</h2>
                    <ul className={kcClsx("kcFormSocialAccountListClass", shouldDisplayGrid && "kcFormSocialAccountListGridClass")}>
                        {organizations.map(({ alias, name }) => (
                            <li key={alias}>
                                <button
                                    id={`organization-${alias}`}
                                    className={kcClsx("kcFormSocialAccountListButtonClass", shouldDisplayGrid && "kcFormSocialAccountGridItem")}
                                    type="button"
                                    onClick={onOrganizationClick(alias)}
                                    disabled={isSubmitting}
                                >
                                    <span className={kcClsx("kcFormSocialAccountNameClass")}>{name ?? alias}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <input ref={organizationInputRef} type="hidden" name="kc.org" />
            </form>
        </Template>
    );
}
