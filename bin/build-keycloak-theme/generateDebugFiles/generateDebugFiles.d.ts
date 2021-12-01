export declare const containerLaunchScriptBasename = "start_keycloak_testing_container.sh";
/** Files for being able to run a hot reload keycloak container */
export declare function generateDebugFiles(params: {
    keycloakVersion: "11.0.3" | "15.0.2";
    themeName: string;
    keycloakThemeBuildingDirPath: string;
}): void;
