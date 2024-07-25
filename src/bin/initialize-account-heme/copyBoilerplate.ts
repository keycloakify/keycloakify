import * as fs from "fs";
import { join as pathJoin } from "path";
import { getThisCodebaseRootDirPath } from "../tools/getThisCodebaseRootDirPath";
import { assert, type Equals } from "tsafe/assert";

export function copyBoilerplate(params: {
    accountThemeType: "Single-Page" | "Multi-Page";
    accountThemeSrcDirPath: string;
}) {
    const { accountThemeType, accountThemeSrcDirPath } = params;

    fs.cpSync(
        pathJoin(
            getThisCodebaseRootDirPath(),
            "src",
            "bin",
            "initialize-account-theme",
            "src",
            (() => {
                switch (accountThemeType) {
                    case "Single-Page":
                        return "single-page";
                    case "Multi-Page":
                        return "multi-page";
                }
                assert<Equals<typeof accountThemeType, never>>(false);
            })()
        ),
        accountThemeSrcDirPath,
        { recursive: true }
    );
}
