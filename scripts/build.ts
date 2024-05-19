import * as child_process from "child_process";
import * as fs from "fs";
import { join } from "path";
import { assert } from "tsafe/assert";
import { transformCodebase } from "../src/bin/tools/transformCodebase";

if (fs.existsSync(join("dist", "bin", "main.original.js"))) {
    fs.renameSync(join("dist", "bin", "main.original.js"), join("dist", "bin", "main.js"));

    fs.readdirSync(join("dist", "bin")).forEach(fileBasename => {
        if (/[0-9]\.index.js/.test(fileBasename)) {
            fs.rmSync(join("dist", "bin", fileBasename));
        }
    });
}

run(`npx tsc -p ${join("src", "bin", "tsconfig.json")}`);

fs.cpSync(join("dist", "bin", "main.js"), join("dist", "bin", "main.original.js"));

run(`npx ncc build ${join("dist", "bin", "main.js")} -o ${join("dist", "ncc_out")}`);

transformCodebase({
    "srcDirPath": join("dist", "ncc_out"),
    "destDirPath": join("dist", "bin"),
    "transformSourceCode": ({ fileRelativePath, sourceCode }) => {
        if (fileRelativePath === "index.js") {
            return {
                "newFileName": "main.js",
                "modifiedSourceCode": sourceCode
            };
        }

        return { "modifiedSourceCode": sourceCode };
    }
});

fs.rmSync(join("dist", "ncc_out"), { "recursive": true });

{
    const before = fs.readFileSync(join("dist", "bin", "main.js")).toString("utf8");

    const search = `fs
        .readFileSync((0, path_1.join)(__dirname, "ftl_object_to_js_code_declaring_an_object.ftl"))`;

    const after = before.replace(
        search,
        [
            `Buffer.from("`,
            fs.readFileSync(join("src", "bin", "keycloakify", "generateFtl", "ftl_object_to_js_code_declaring_an_object.ftl")).toString("base64"),
            `", "base64")`
        ].join("")
    );

    assert(after !== before, "Ned to update the code that bundles the ftl file");

    fs.writeFileSync(join("dist", "bin", "main.js"), Buffer.from(after, "utf8"));
}

fs.chmodSync(
    join("dist", "bin", "main.js"),
    fs.statSync(join("dist", "bin", "main.js")).mode | fs.constants.S_IXUSR | fs.constants.S_IXGRP | fs.constants.S_IXOTH
);

run(`npx tsc -p ${join("src", "tsconfig.json")}`);
run(`npx tsc-alias -p ${join("src", "tsconfig.json")}`);

if (fs.existsSync(join("dist", "vite-plugin", "index.original.js"))) {
    fs.renameSync(join("dist", "vite-plugin", "index.original.js"), join("dist", "vite-plugin", "index.js"));
}

run(`npx tsc -p ${join("src", "vite-plugin", "tsconfig.json")}`);

fs.cpSync(join("dist", "vite-plugin", "index.js"), join("dist", "vite-plugin", "index.original.js"));

run(`npx ncc build ${join("dist", "vite-plugin", "index.js")} -o ${join("dist", "ncc_out")}`);

transformCodebase({
    "srcDirPath": join("dist", "ncc_out"),
    "destDirPath": join("dist", "vite-plugin"),
    "transformSourceCode": ({ fileRelativePath, sourceCode }) => {
        assert(fileRelativePath === "index.js");

        return { "modifiedSourceCode": sourceCode };
    }
});

fs.rmSync(join("dist", "ncc_out"), { "recursive": true });

function run(command: string) {
    console.log(`$ ${command}`);

    child_process.execSync(command, { "stdio": "inherit" });
}
