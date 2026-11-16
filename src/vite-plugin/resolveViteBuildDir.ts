import { resolve as pathResolve, relative as pathRelative, sep as pathSep } from "path";

export function resolveViteBuildDir(params: { projectDirPath: string; outDir: string }) {
    const { projectDirPath, outDir } = params;

    const buildDirPath = pathResolve(projectDirPath, outDir);

    const trailingSeparator = /[\\/]$/.test(outDir) ? pathSep : "";

    return {
        buildDirPath,
        buildDirRelativePath:
            pathRelative(projectDirPath, buildDirPath) + trailingSeparator
    };
}
