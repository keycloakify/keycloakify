import { generateTheme } from "./generateTheme";
import { join as pathJoin, relative as pathRelative, sep as pathSep } from "path";
import * as child_process from "child_process";
import * as fs from "fs";
import { readBuildOptions } from "../shared/buildOptions";
import { getLogger } from "../tools/logger";
import { getThemeSrcDirPath } from "../shared/getThemeSrcDirPath";
import { getThisCodebaseRootDirPath } from "../tools/getThisCodebaseRootDirPath";
import { readThisNpmProjectVersion } from "../tools/readThisNpmProjectVersion";
import { vitePluginSubScriptEnvNames } from "../shared/constants";
import { buildJars } from "./buildJars";
import type { CliCommandOptions } from "../main";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildOptions = readBuildOptions({ cliCommandOptions });

    const logger = getLogger({ "isSilent": buildOptions.isSilent });

    logger.log("🔏 Building the keycloak theme...⌚");

    const { themeSrcDirPath } = getThemeSrcDirPath({ "reactAppRootDirPath": buildOptions.reactAppRootDirPath });

    {
        if (!fs.existsSync(buildOptions.keycloakifyBuildDirPath)) {
            fs.mkdirSync(buildOptions.keycloakifyBuildDirPath, { "recursive": true });
        }

        fs.writeFileSync(pathJoin(buildOptions.keycloakifyBuildDirPath, ".gitignore"), Buffer.from("*", "utf8"));
    }

    await generateTheme({
        themeSrcDirPath,
        "keycloakifySrcDirPath": pathJoin(getThisCodebaseRootDirPath(), "src"),
        "keycloakifyVersion": readThisNpmProjectVersion(),
        buildOptions
    });

    run_post_build_script: {
        if (buildOptions.bundler !== "vite") {
            break run_post_build_script;
        }

        child_process.execSync("npx vite", {
            "cwd": buildOptions.reactAppRootDirPath,
            "env": {
                ...process.env,
                [vitePluginSubScriptEnvNames.runPostBuildScript]: JSON.stringify(buildOptions)
            }
        });
    }

    await buildJars({
        doesImplementAccountTheme,
        buildOptions
    });

    logger.log(
        `✅ Your keycloak theme has been generated and bundled into .${pathSep}${pathJoin(
            pathRelative(process.cwd(), buildOptions.keycloakifyBuildDirPath),
            "keycloak-theme-for-kc-*.jar"
        )}`
    );
}
