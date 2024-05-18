import { isAbsolute as pathIsAbsolute, sep as pathSep, join as pathJoin, resolve as pathResolve } from "path";
import * as os from "os";

export function getAbsoluteAndInOsFormatPath(params: { pathIsh: string; cwd: string }): string {
    const { pathIsh, cwd } = params;

    let pathOut = pathIsh;

    pathOut = pathOut.replace(/\//g, pathSep);

    if (pathOut.startsWith("~")) {
        pathOut = pathOut.replace("~", os.homedir());
    }

    pathOut = pathOut.endsWith(pathSep) ? pathOut.slice(0, -1) : pathOut;

    if (!pathIsAbsolute(pathOut)) {
        pathOut = pathJoin(cwd, pathOut);
    }

    pathOut = pathResolve(pathOut);

    return pathOut;
}
