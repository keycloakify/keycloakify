export declare type ParsedPackageJson = {
    name: string;
    version: string;
    homepage?: string;
};
export declare function generateJavaStackFiles(params: {
    parsedPackageJson: ParsedPackageJson;
    keycloakThemeBuildingDirPath: string;
}): void;
