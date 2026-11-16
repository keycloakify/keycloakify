import { resolve as pathResolve, relative as pathRelative } from "path";

export function resolveViteBuildDir(params: { projectDirPath: string; outDir: string }) {
    const { projectDirPath, outDir } = params;

    const buildDirPath = pathResolve(projectDirPath, outDir);

    return {
        buildDirPath,
        buildDirRelativePath: pathRelative(projectDirPath, buildDirPath)
    };
}
