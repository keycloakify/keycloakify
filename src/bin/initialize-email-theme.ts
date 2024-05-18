import { downloadBuiltinKeycloakTheme } from "./shared/downloadBuiltinKeycloakTheme";
import { join as pathJoin, relative as pathRelative } from "path";
import { transformCodebase } from "./tools/transformCodebase";
import { promptKeycloakVersion } from "./shared/promptKeycloakVersion";
import { readBuildOptions } from "./shared/buildOptions";
import * as fs from "fs";
import { getLogger } from "./tools/logger";
import { getThemeSrcDirPath } from "./shared/getThemeSrcDirPath";
import { rmSync } from "./tools/fs.rmSync";
import type { CliCommandOptions } from "./main";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildOptions = readBuildOptions({ cliCommandOptions });

    const logger = getLogger({ "isSilent": buildOptions.isSilent });

    const { themeSrcDirPath } = getThemeSrcDirPath({
        "reactAppRootDirPath": buildOptions.reactAppRootDirPath
    });

    const emailThemeSrcDirPath = pathJoin(themeSrcDirPath, "email");

    if (fs.existsSync(emailThemeSrcDirPath)) {
        logger.warn(`There is already a ${pathRelative(process.cwd(), emailThemeSrcDirPath)} directory in your project. Aborting.`);

        process.exit(-1);
    }

    console.log("Initialize with the base email theme from which version of Keycloak?");

    const { keycloakVersion } = await promptKeycloakVersion({
        // NOTE: This is arbitrary
        "startingFromMajor": 17
    });

    const builtinKeycloakThemeTmpDirPath = pathJoin(buildOptions.cacheDirPath, "initialize-email-theme_tmp");

    rmSync(builtinKeycloakThemeTmpDirPath, { "recursive": true, "force": true });

    await downloadBuiltinKeycloakTheme({
        keycloakVersion,
        "destDirPath": builtinKeycloakThemeTmpDirPath,
        buildOptions
    });

    transformCodebase({
        "srcDirPath": pathJoin(builtinKeycloakThemeTmpDirPath, "base", "email"),
        "destDirPath": emailThemeSrcDirPath
    });

    {
        const themePropertyFilePath = pathJoin(emailThemeSrcDirPath, "theme.properties");

        fs.writeFileSync(themePropertyFilePath, Buffer.from(`parent=base\n${fs.readFileSync(themePropertyFilePath).toString("utf8")}`, "utf8"));
    }

    logger.log(`The \`${pathJoin(".", pathRelative(process.cwd(), emailThemeSrcDirPath))}\` directory have been created`);
    logger.log("You can delete any file you don't modify.");

    rmSync(builtinKeycloakThemeTmpDirPath, { "recursive": true });
}
