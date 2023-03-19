import Fallback from "keycloakify/login/Fallback";

export default Fallback;

export { createKeycloakAdapter } from "keycloakify/login/lib/keycloakJsAdapter";
export { useDownloadTerms } from "keycloakify/login/lib/useDownloadTerms";
export { getKcContext } from "keycloakify/login/kcContext/getKcContext";
export { createUseI18n } from "keycloakify/login/i18n/i18n";

export type { PageProps } from "keycloakify/login/pages/PageProps";
