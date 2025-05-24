import * as fs from "fs";
import * as path from "path";

let result: string | undefined = undefined;

export function getThisCodebaseRootDirPath(): string {
    if (result !== undefined) {
        return result;
    }

    return (result = getNearestPackageJsonDirPath(__dirname));
}

export function getNearestPackageJsonDirPath(dirPath: string): string {
    if (fs.existsSync(path.join(dirPath, "package.json"))) {
        return dirPath;
    }
    return getNearestPackageJsonDirPath(path.join(dirPath, ".."));
}
