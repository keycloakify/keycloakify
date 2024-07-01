import { downloadKeycloakDefaultTheme } from "./shared/downloadKeycloakDefaultTheme";
import { join as pathJoin, relative as pathRelative } from "path";
import { transformCodebase } from "./tools/transformCodebase";
import { promptKeycloakVersion } from "./shared/promptKeycloakVersion";
import { getBuildContext } from "./shared/buildContext";
import * as fs from "fs";
import type { CliCommandOptions } from "./main";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildContext = getBuildContext({ cliCommandOptions });

    const emailThemeSrcDirPath = pathJoin(buildContext.themeSrcDirPath, "email");

    if (fs.existsSync(emailThemeSrcDirPath)) {
        console.warn(
            `There is already a ${pathRelative(
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
        cacheDirPath: buildContext.cacheDirPath
    });

    const { defaultThemeDirPath } = await downloadKeycloakDefaultTheme({
        keycloakVersion,
        buildContext
    });

    transformCodebase({
        srcDirPath: pathJoin(defaultThemeDirPath, "base", "email"),
        destDirPath: emailThemeSrcDirPath
    });

    {
        const themePropertyFilePath = pathJoin(emailThemeSrcDirPath, "theme.properties");

        fs.writeFileSync(
            themePropertyFilePath,
            Buffer.from(
                `parent=base\n${fs.readFileSync(themePropertyFilePath).toString("utf8")}`,
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
