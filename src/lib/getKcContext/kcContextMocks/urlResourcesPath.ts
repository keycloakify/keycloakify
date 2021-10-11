import { join as pathJoin } from "path";

export const subDirOfPublicDirBasename = "keycloak_static";
export const resourcesPath = pathJoin(subDirOfPublicDirBasename, "/resources");
export const resourcesCommonPath = pathJoin(
    subDirOfPublicDirBasename,
    "/resources_common",
);
