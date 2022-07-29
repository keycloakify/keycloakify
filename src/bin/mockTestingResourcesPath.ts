import { pathJoin } from "./tools/pathJoin";

export const mockTestingSubDirOfPublicDirBasename = "keycloak_static";
export const mockTestingResourcesPath = pathJoin(mockTestingSubDirOfPublicDirBasename, "resources");
export const mockTestingResourcesCommonPath = pathJoin(mockTestingResourcesPath, "resources_common");
