import * as nodePath from "path";

export function resolveViteBuildDir(params: {
    projectDirPath: string;
    outDir: string;
    path?: nodePath.PlatformPath;
}) {
    const { projectDirPath, outDir, path = nodePath } = params;

    const buildDirPath = path.resolve(projectDirPath, outDir);

    const hasTrailingSeparator =
        (outDir.endsWith("/") || outDir.endsWith(path.sep)) &&
        !buildDirPath.endsWith(path.sep);

    return {
        buildDirPath,
        serializedBuildDir: hasTrailingSeparator ? buildDirPath + path.sep : buildDirPath
    };
}
