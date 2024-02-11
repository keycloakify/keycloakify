import * as fs from "fs";
import * as path from "path";

function getThisCodebaseRootDirPath_rec(dirPath: string): string {
    if (fs.existsSync(path.join(dirPath, "package.json"))) {
        return dirPath;
    }
    return getThisCodebaseRootDirPath_rec(path.join(dirPath, ".."));
}

let result: string | undefined = undefined;

export function getThisCodebaseRootDirPath(): string {
    if (result !== undefined) {
        return result;
    }

    return (result = getThisCodebaseRootDirPath_rec(__dirname));
}
