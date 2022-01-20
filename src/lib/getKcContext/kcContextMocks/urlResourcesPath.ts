import { pathJoin } from "../../tools/pathJoin";

export const subDirOfPublicDirBasename = "keycloak_static";
export const resourcesPath = pathJoin(subDirOfPublicDirBasename, "resources");
export const resourcesCommonPath = pathJoin(resourcesPath, "resources_common");
