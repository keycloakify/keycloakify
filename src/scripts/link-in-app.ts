import { execSync } from "child_process";
import { join as pathJoin, relative as pathRelative } from "path";
import * as fs from "fs";

const singletonDependencies: string[] = ["react", "@types/react"];

const rootDirPath = pathJoin(__dirname, "..", "..");

//NOTE: This is only required because of: https://github.com/garronej/ts-ci/blob/c0e207b9677523d4ec97fe672ddd72ccbb3c1cc4/README.md?plain=1#L54-L58
fs.writeFileSync(
    pathJoin(rootDirPath, "dist", "package.json"),
    Buffer.from(
        JSON.stringify(
            (() => {
                const packageJsonParsed = JSON.parse(fs.readFileSync(pathJoin(rootDirPath, "package.json")).toString("utf8"));

                return {
                    ...packageJsonParsed,
                    "main": packageJsonParsed["main"]?.replace(/^dist\//, ""),
                    "types": packageJsonParsed["types"]?.replace(/^dist\//, ""),
                    "module": packageJsonParsed["module"]?.replace(/^dist\//, ""),
                    "exports": !("exports" in packageJsonParsed)
                        ? undefined
                        : Object.fromEntries(
                              Object.entries(packageJsonParsed["exports"]).map(([key, value]) => [
                                  key,
                                  (value as string).replace(/^\.\/dist\//, "./")
                              ])
                          )
                };
            })(),
            null,
            2
        ),
        "utf8"
    )
);

const commonThirdPartyDeps = (() => {
    // For example [ "@emotion" ] it's more convenient than
    // having to list every sub emotion packages (@emotion/css @emotion/utils ...)
    // in singletonDependencies
    const namespaceSingletonDependencies: string[] = [];

    return [
        ...namespaceSingletonDependencies
            .map(namespaceModuleName =>
                fs
                    .readdirSync(pathJoin(rootDirPath, "node_modules", namespaceModuleName))
                    .map(submoduleName => `${namespaceModuleName}/${submoduleName}`)
            )
            .reduce((prev, curr) => [...prev, ...curr], []),
        ...singletonDependencies
    ];
})();

const { yarnLinkFolderPath, yarnGlobalFolderPath } = (() => {
    const yarnGlobalDirPath = pathJoin(rootDirPath, ".yarn_home");

    return {
        "yarnLinkFolderPath": pathJoin(yarnGlobalDirPath, "link"),
        "yarnGlobalFolderPath": pathJoin(yarnGlobalDirPath, "global")
    };
})();

[yarnLinkFolderPath, yarnGlobalFolderPath].forEach(path => {
    fs.rmSync(path, { "recursive": true, "force": true });
    fs.mkdirSync(path, { "recursive": true });
});

const execYarnLink = (params: { targetModuleName?: string; cwd: string }) => {
    const { targetModuleName, cwd } = params;

    const cmd = [
        "yarn",
        "link",
        ...(targetModuleName !== undefined ? [targetModuleName] : []),
        "--link-folder",
        yarnLinkFolderPath,
        "--global-folder",
        yarnGlobalFolderPath
    ].join(" ");

    console.log(`$ cd ${pathRelative(rootDirPath, cwd) || "."} && ${cmd}`);

    execSync(cmd, {
        cwd
    });
};

const testAppPaths = (() => {
    const [, , ...testAppNames] = process.argv;

    return testAppNames
        .map(testAppName => {
            const testAppPath = pathJoin(rootDirPath, "..", testAppName);

            if (fs.existsSync(testAppPath)) {
                return testAppPath;
            }

            console.warn(`Skipping ${testAppName} since it cant be found here: ${testAppPath}`);

            return undefined;
        })
        .filter((path): path is string => path !== undefined);
})();

if (testAppPaths.length === 0) {
    console.error("No test app to link into!");
    process.exit(-1);
}

testAppPaths.forEach(testAppPath => execSync("yarn install", { "cwd": testAppPath }));

console.log("=== Linking common dependencies ===");

const total = commonThirdPartyDeps.length;
let current = 0;

commonThirdPartyDeps.forEach(commonThirdPartyDep => {
    current++;

    console.log(`${current}/${total} ${commonThirdPartyDep}`);

    const localInstallPath = pathJoin(
        ...[rootDirPath, "node_modules", ...(commonThirdPartyDep.startsWith("@") ? commonThirdPartyDep.split("/") : [commonThirdPartyDep])]
    );

    execYarnLink({ "cwd": localInstallPath });
});

commonThirdPartyDeps.forEach(commonThirdPartyDep =>
    testAppPaths.forEach(testAppPath =>
        execYarnLink({
            "cwd": testAppPath,
            "targetModuleName": commonThirdPartyDep
        })
    )
);

console.log("=== Linking in house dependencies ===");

execYarnLink({ "cwd": pathJoin(rootDirPath, "dist") });

testAppPaths.forEach(testAppPath =>
    execYarnLink({
        "cwd": testAppPath,
        "targetModuleName": JSON.parse(fs.readFileSync(pathJoin(rootDirPath, "package.json")).toString("utf8"))["name"]
    })
);

export {};
