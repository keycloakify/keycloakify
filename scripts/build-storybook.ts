import * as child_process from "child_process";
import { transformCodebase } from "../src/bin/tools/transformCodebase";
import { join as pathJoin, sep as pathSep } from "path";
import { assert } from "tsafe/assert";

run("yarn build");
run("npx build-storybook");

const storybookStaticDirPath = "storybook-static";

{
    let hasPatched = false;

    transformCodebase({
        srcDirPath: storybookStaticDirPath,
        destDirPath: storybookStaticDirPath,
        transformSourceCode: ({ fileRelativePath, sourceCode }) => {
            replace_dot_keycloakify: {
                if (fileRelativePath.includes(pathSep)) {
                    break replace_dot_keycloakify;
                }

                if (!fileRelativePath.endsWith(".js")) {
                    break replace_dot_keycloakify;
                }

                const search = `DOT_KEYCLOAKIFY:".keycloakify"`;

                if (!sourceCode.includes(search)) {
                    break replace_dot_keycloakify;
                }

                hasPatched = true;

                return {
                    modifiedSourceCode: Buffer.from(
                        sourceCode
                            .toString("utf8")
                            .replace(search, `DOT_KEYCLOAKIFY:"dot_keycloakify"`),
                        "utf8"
                    )
                };
            }

            return { modifiedSourceCode: sourceCode };
        }
    });

    assert(hasPatched);
}

transformCodebase({
    srcDirPath: pathJoin(storybookStaticDirPath, ".keycloakify"),
    destDirPath: pathJoin(storybookStaticDirPath, "dot_keycloakify")
});

function run(command: string, options?: { env?: NodeJS.ProcessEnv }) {
    console.log(`$ ${command}`);

    child_process.execSync(command, { stdio: "inherit", ...options });
}
