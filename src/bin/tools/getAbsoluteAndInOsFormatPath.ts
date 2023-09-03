import { isAbsolute as pathIsAbsolute, sep as pathSep, join as pathJoin } from "path";

export function getAbsoluteAndInOsFormatPath(params: { pathIsh: string; cwd: string }): string {
    const { pathIsh, cwd } = params;

    let pathOut = pathIsh;

    pathOut = pathOut.replace(/\//g, pathSep);

    if (!pathIsAbsolute(pathOut)) {
        pathOut = pathJoin(cwd, pathOut);
    }

    return pathOut;
}
