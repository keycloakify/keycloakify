import { resolve as pathResolve, sep as pathSep } from "path";

export function resolveViteBuildDir(params: { projectDirPath: string; outDir: string }) {
    const { projectDirPath, outDir } = params;

    const buildDirPath = pathResolve(projectDirPath, outDir);

    const hasTrailingSeparator = /[\\/]$/.test(outDir) && !buildDirPath.endsWith(pathSep);

    return {
        buildDirPath,
        serializedBuildDir: hasTrailingSeparator ? buildDirPath + pathSep : buildDirPath
    };
}
