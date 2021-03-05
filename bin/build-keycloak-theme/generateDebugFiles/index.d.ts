export declare const containerLaunchScriptBasename = "start_keycloak_testing_container.sh";
/** Files for being able to run a hot reload keycloak container */
export declare function generateDebugFiles(params: {
    packageJsonName: string;
    keycloakThemeBuildingDirPath: string;
}): void;
