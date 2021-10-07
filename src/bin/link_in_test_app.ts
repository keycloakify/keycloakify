
import { execSync } from "child_process";
import { join as pathJoin, relative as pathRelative } from "path";
import * as fs from "fs";

const keycloakifyDirPath = pathJoin(__dirname, "..", "..");

fs.writeFileSync(
    pathJoin(keycloakifyDirPath, "dist", "package.json"),
    Buffer.from(
        JSON.stringify(
            (() => {
                const packageJsonParsed = JSON.parse(
                    fs
                        .readFileSync(pathJoin(keycloakifyDirPath, "package.json"))
                        .toString("utf8"),
                );

                return {
                    ...packageJsonParsed,
                    "main": packageJsonParsed["main"].replace(/^dist\//, ""),
                    "types": packageJsonParsed["types"].replace(/^dist\//, ""),
                };
            })(),
            null,
            2,
        ),
        "utf8",
    ),
);

const commonThirdPartyDeps = (() => {
    const namespaceModuleNames = ["@emotion"];
    const standaloneModuleNames = ["react", "@types/react", "powerhooks", "tss-react", "evt"];

    return [
        ...namespaceModuleNames
            .map(namespaceModuleName =>
                fs
                    .readdirSync(
                        pathJoin(
                            keycloakifyDirPath,
                            "node_modules",
                            namespaceModuleName,
                        ),
                    )
                    .map(
                        submoduleName =>
                            `${namespaceModuleName}/${submoduleName}`,
                    ),
            )
            .reduce((prev, curr) => [...prev, ...curr], []),
        ...standaloneModuleNames,
    ];
})();

const yarnHomeDirPath = pathJoin(keycloakifyDirPath, ".yarn_home");

execSync(
    ["rm -rf", "mkdir"].map(cmd => `${cmd} ${yarnHomeDirPath}`).join(" && "),
);

const execYarnLink = (params: { targetModuleName?: string; cwd: string }) => {
    const { targetModuleName, cwd } = params;

    const cmd = [
        "yarn",
        "link",
        ...(targetModuleName !== undefined ? [targetModuleName] : []),
    ].join(" ");

    console.log(`$ cd ${pathRelative(keycloakifyDirPath, cwd) || "."} && ${cmd}`);

    execSync(cmd, {
        cwd,
        "env": {
            ...process.env,
            "HOME": yarnHomeDirPath,
        },
    });
};

const testAppNames = ["keycloakify-demo-app"] as const;

const getTestAppPath = (testAppName: typeof testAppNames[number]) =>
    pathJoin(keycloakifyDirPath, "..", testAppName);

testAppNames.forEach(testAppName =>
    execSync("yarn install", { "cwd": getTestAppPath(testAppName) }),
);

console.log("=== Linking common dependencies ===");

const total = commonThirdPartyDeps.length;
let current = 0;

commonThirdPartyDeps.forEach(commonThirdPartyDep => {
    current++;

    console.log(`${current}/${total} ${commonThirdPartyDep}`);

    const localInstallPath = pathJoin(
        ...[
            keycloakifyDirPath,
            "node_modules",
            ...(commonThirdPartyDep.startsWith("@")
                ? commonThirdPartyDep.split("/")
                : [commonThirdPartyDep]),
        ],
    );

    execYarnLink({ "cwd": localInstallPath });

    testAppNames.forEach(testAppName =>
        execYarnLink({
            "cwd": getTestAppPath(testAppName),
            "targetModuleName": commonThirdPartyDep,
        }),
    );
});

console.log("=== Linking in house dependencies ===");

execYarnLink({ "cwd": pathJoin(keycloakifyDirPath, "dist") });

testAppNames.forEach(testAppName =>
    execYarnLink({
        "cwd": getTestAppPath(testAppName),
        "targetModuleName": "keycloakify",
    }),
);