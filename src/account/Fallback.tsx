import { lazy, Suspense } from "react";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { I18n } from "keycloakify/account/i18n";
import type { KcContext } from "./kcContext";
import { assert, type Equals } from "tsafe/assert";

const Password = lazy(() => import("keycloakify/account/pages/Password"));
const Account = lazy(() => import("keycloakify/account/pages/Account"));

export default function Fallback(props: PageProps<KcContext, I18n>) {
    const { kcContext, ...rest } = props;

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "password.ftl":
                        return <Password kcContext={kcContext} {...rest} />;
                    case "account.ftl":
                        return <Account kcContext={kcContext} {...rest} />;
                }
                assert<Equals<typeof kcContext, never>>(false);
            })()}
        </Suspense>
    );
}
