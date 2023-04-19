import { pathJoin } from "./tools/pathJoin";

export const basenameOfKeycloakDirInPublicDir = "keycloak-resources";
export const resourcesDirPathRelativeToPublicDir = pathJoin(basenameOfKeycloakDirInPublicDir, "resources");
export const resourcesCommonDirPathRelativeToPublicDir = pathJoin(basenameOfKeycloakDirInPublicDir, "resources_common");
