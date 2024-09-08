import { join as pathJoin, relative as pathRelative } from "path";
import { transformCodebase } from "./tools/transformCodebase";
import { promptKeycloakVersion } from "./shared/promptKeycloakVersion";
import { getBuildContext } from "./shared/buildContext";
import * as fs from "fs";
import type { CliCommandOptions } from "./main";
import { downloadAndExtractArchive } from "./tools/downloadAndExtractArchive";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildContext = getBuildContext({ cliCommandOptions });

    const emailThemeSrcDirPath = pathJoin(buildContext.themeSrcDirPath, "email");

    if (
        fs.existsSync(emailThemeSrcDirPath) &&
        fs.readdirSync(emailThemeSrcDirPath).length > 0
    ) {
        console.warn(
            `There is already a non empty ${pathRelative(
                process.cwd(),
                emailThemeSrcDirPath
            )} directory in your project. Aborting.`
        );

        process.exit(-1);
    }

    console.log("Initialize with the base email theme from which version of Keycloak?");

    const { keycloakVersion } = await promptKeycloakVersion({
        // NOTE: This is arbitrary
        startingFromMajor: 17,
        excludeMajorVersions: [],
        doOmitPatch: false,
        buildContext
    });

    const { extractedDirPath } = await downloadAndExtractArchive({
        url: `https://repo1.maven.org/maven2/org/keycloak/keycloak-themes/${keycloakVersion}/keycloak-themes-${keycloakVersion}.jar`,
        cacheDirPath: buildContext.cacheDirPath,
        fetchOptions: buildContext.fetchOptions,
        uniqueIdOfOnArchiveFile: "extractOnlyEmailTheme",
        onArchiveFile: async ({ fileRelativePath, writeFile }) => {
            const fileRelativePath_target = pathRelative(
                pathJoin("theme", "base", "email"),
                fileRelativePath
            );

            if (fileRelativePath_target.startsWith("..")) {
                return;
            }

            await writeFile({ fileRelativePath: fileRelativePath_target });
        }
    });

    transformCodebase({
        srcDirPath: extractedDirPath,
        destDirPath: emailThemeSrcDirPath
    });

    {
        const themePropertyFilePath = pathJoin(emailThemeSrcDirPath, "theme.properties");

        fs.writeFileSync(
            themePropertyFilePath,
            Buffer.from(
                [
                    `parent=base`,
                    fs.readFileSync(themePropertyFilePath).toString("utf8")
                ].join("\n"),
                "utf8"
            )
        );
    }

    console.log(
        `The \`${pathJoin(
            ".",
            pathRelative(process.cwd(), emailThemeSrcDirPath)
        )}\` directory have been created.`
    );
    console.log("You can delete any file you don't modify.");
}
