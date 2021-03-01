
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

    console.log({ url, destDirPath });

    [
        `wget ${url}`,
        ...["unzip", "rm"].map(prg => `${prg} ${pathBasename(url)}`),
    ].forEach(cmd => child_process.execSync(cmd, { "cwd": destDirPath }));

}