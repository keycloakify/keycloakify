import { resolveViteBuildDir } from "keycloakify/vite-plugin/resolveViteBuildDir";
import { posix, win32 } from "path";
import { describe, expect, it } from "vitest";

describe.each([
    { name: "posix", path: posix, projectDirPath: "/home/someone/keycloakify-starter" },
    {
        name: "win32",
        path: win32,
        projectDirPath: "C:\\Users\\someone\\keycloakify-starter"
    }
])("resolveViteBuildDir ($name)", ({ path, projectDirPath }) => {
    it("handles a relative outDir", () => {
        expect(resolveViteBuildDir({ projectDirPath, outDir: "dist", path })).toEqual({
            buildDirPath: path.join(projectDirPath, "dist"),
            serializedBuildDir: path.join(projectDirPath, "dist")
        });
    });

    it("handles an absolute outDir inside the project", () => {
        expect(
            resolveViteBuildDir({
                projectDirPath,
                outDir: path.join(projectDirPath, "dist", "client"),
                path
            })
        ).toEqual({
            buildDirPath: path.join(projectDirPath, "dist", "client"),
            serializedBuildDir: path.join(projectDirPath, "dist", "client")
        });
    });

    it("handles an outDir outside the project", () => {
        expect(resolveViteBuildDir({ projectDirPath, outDir: "../dist", path })).toEqual({
            buildDirPath: path.resolve(projectDirPath, "..", "dist"),
            serializedBuildDir: path.resolve(projectDirPath, "..", "dist")
        });
    });

    it("keeps a trailing forward slash on the outDir", () => {
        expect(resolveViteBuildDir({ projectDirPath, outDir: "dist/", path })).toEqual({
            buildDirPath: path.join(projectDirPath, "dist"),
            serializedBuildDir: `${path.join(projectDirPath, "dist")}${path.sep}`
        });
    });

    it("keeps the project directory for a root-relative outDir", () => {
        expect(resolveViteBuildDir({ projectDirPath, outDir: "./", path })).toEqual({
            buildDirPath: projectDirPath,
            serializedBuildDir: `${projectDirPath}${path.sep}`
        });
    });

    it("stays absolute when the CLI runs from another directory", () => {
        const viteRootDirPath = path.join(projectDirPath, "app");

        const { serializedBuildDir } = resolveViteBuildDir({
            projectDirPath: viteRootDirPath,
            outDir: "dist",
            path
        });

        expect(path.resolve(projectDirPath, serializedBuildDir)).toBe(
            path.join(viteRootDirPath, "dist")
        );
    });
});

describe("resolveViteBuildDir trailing backslash", () => {
    it("treats it as a separator on win32", () => {
        expect(
            resolveViteBuildDir({
                projectDirPath: "C:\\app",
                outDir: "dist\\",
                path: win32
            })
        ).toEqual({
            buildDirPath: "C:\\app\\dist",
            serializedBuildDir: "C:\\app\\dist\\"
        });
    });

    it("treats it as a literal filename character on posix", () => {
        expect(
            resolveViteBuildDir({
                projectDirPath: "/app",
                outDir: "dist\\",
                path: posix
            })
        ).toEqual({
            buildDirPath: "/app/dist\\",
            serializedBuildDir: "/app/dist\\"
        });
    });
});
