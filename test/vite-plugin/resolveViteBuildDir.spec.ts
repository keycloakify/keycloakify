import { resolveViteBuildDir } from "keycloakify/vite-plugin/resolveViteBuildDir";
import { join as pathJoin, resolve as pathResolve, sep as pathSep } from "path";
import { describe, expect, it } from "vitest";

describe("resolveViteBuildDir", () => {
    const projectDirPath = pathResolve("/home/someone/keycloakify-starter");

    it("handles a relative outDir", () => {
        expect(resolveViteBuildDir({ projectDirPath, outDir: "dist" })).toEqual({
            buildDirPath: pathJoin(projectDirPath, "dist"),
            serializedBuildDir: pathJoin(projectDirPath, "dist")
        });
    });

    it("handles an absolute outDir inside the project", () => {
        expect(
            resolveViteBuildDir({
                projectDirPath,
                outDir: pathJoin(projectDirPath, "dist", "client")
            })
        ).toEqual({
            buildDirPath: pathJoin(projectDirPath, "dist", "client"),
            serializedBuildDir: pathJoin(projectDirPath, "dist", "client")
        });
    });

    it("handles an outDir outside the project", () => {
        expect(resolveViteBuildDir({ projectDirPath, outDir: "../dist" })).toEqual({
            buildDirPath: pathResolve(projectDirPath, "..", "dist"),
            serializedBuildDir: pathResolve(projectDirPath, "..", "dist")
        });
    });

    it("keeps a trailing separator on the outDir", () => {
        expect(resolveViteBuildDir({ projectDirPath, outDir: "dist/" })).toEqual({
            buildDirPath: pathJoin(projectDirPath, "dist"),
            serializedBuildDir: `${pathJoin(projectDirPath, "dist")}${pathSep}`
        });
    });

    it("keeps a trailing backslash on the outDir", () => {
        expect(
            resolveViteBuildDir({
                projectDirPath,
                outDir: "dist\\"
            }).serializedBuildDir.endsWith(pathSep)
        ).toBe(true);
    });

    it("keeps the project directory for a root-relative outDir", () => {
        expect(resolveViteBuildDir({ projectDirPath, outDir: "./" })).toEqual({
            buildDirPath: projectDirPath,
            serializedBuildDir: `${projectDirPath}${pathSep}`
        });
    });

    it("stays absolute when the CLI runs from another directory", () => {
        const viteRootDirPath = pathJoin(projectDirPath, "app");

        const { serializedBuildDir } = resolveViteBuildDir({
            projectDirPath: viteRootDirPath,
            outDir: "dist"
        });

        expect(pathResolve(projectDirPath, serializedBuildDir)).toBe(
            pathJoin(viteRootDirPath, "dist")
        );
    });
});
