import { resolveViteBuildDir } from "keycloakify/vite-plugin/resolveViteBuildDir";
import { join as pathJoin, resolve as pathResolve } from "path";
import { describe, expect, it } from "vitest";

describe("resolveViteBuildDir", () => {
    const projectDirPath = pathResolve("/home/someone/keycloakify-starter");

    it("handles a relative outDir", () => {
        expect(resolveViteBuildDir({ projectDirPath, outDir: "dist" })).toEqual({
            buildDirPath: pathJoin(projectDirPath, "dist"),
            buildDirRelativePath: "dist"
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
            buildDirRelativePath: pathJoin("dist", "client")
        });
    });

    it("handles an outDir outside the project", () => {
        expect(resolveViteBuildDir({ projectDirPath, outDir: "../dist" })).toEqual({
            buildDirPath: pathResolve(projectDirPath, "..", "dist"),
            buildDirRelativePath: pathJoin("..", "dist")
        });
    });
});
