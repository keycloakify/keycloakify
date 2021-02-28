
import { basename as pathBasename } from "path";
import child_process from "child_process";
import fs from "fs";

export function downloadAndUnzip(
    params: {
        url: string;
        destDirPath: string;
    }
) {

    const { url, destDirPath } = params;

    fs.mkdirSync(destDirPath, { "recursive": true });

    [
        `wget ${url}`,
        ...["unzip", "rm"].map(prg => `${prg} ${pathBasename(url)}`),
    ].forEach(cmd => child_process.execSync(cmd, { "cwd": destDirPath }));

}