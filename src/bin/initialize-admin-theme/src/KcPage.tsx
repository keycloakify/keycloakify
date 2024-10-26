import { lazy } from "react";
import { KcAdminUiLoader } from "@keycloakify/keycloak-admin-ui";
import type { KcContext } from "./KcContext";

const KcAdminUi = lazy(() => import("@keycloakify/keycloak-admin-ui/KcAdminUi"));

export default function KcPage(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    return <KcAdminUiLoader kcContext={kcContext} KcAdminUi={KcAdminUi} />;
}
