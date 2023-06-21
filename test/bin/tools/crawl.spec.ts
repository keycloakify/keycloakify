import path from "path";
import { it, describe, expect, vi, beforeAll, afterAll } from "vitest";
import { crawlRec } from "keycloakify/bin/tools/crawl";

describe("crawl", () => {
    describe("crawRec", () => {
        beforeAll(() => {
            vi.mock("node:fs", async () => {
                const mod = await vi.importActual<typeof import("fs")>("fs");
                return {
                    ...mod,
                    readdirSync: vi.fn().mockImplementation((dir_path: string) => {
                        switch (dir_path) {
                            case "root_dir":
                                return ["sub_1_dir", "file_1", "sub_2_dir", "file_2"];
                            case path.join("root_dir", "sub_1_dir"):
                                return ["file_3", "sub_3_dir", "file_4"];
                            case path.join("root_dir", "sub_1_dir", "sub_3_dir"):
                                return ["file_5"];
                            case path.join("root_dir", "sub_2_dir"):
                                return [];
                            default: {
                                const enoent = new Error(`ENOENT: no such file or directory, scandir '${dir_path}'`);
                                // @ts-ignore
                                enoent.code = "ENOENT";
                                // @ts-ignore
                                enoent.syscall = "open";
                                // @ts-ignore
                                enoent.path = dir_path;
                                throw enoent;
                            }
                        }
                    }),
                    lstatSync: vi.fn().mockImplementation((file_path: string) => {
                        return { isDirectory: () => file_path.endsWith("_dir") };
                    })
                };
            });
        });
        afterAll(() => {
            vi.resetAllMocks();
        });
        it("returns files under a given dir_path", async () => {
            const paths: string[] = [];
            crawlRec("root_dir/sub_1_dir/sub_3_dir", paths);
            expect(paths).toEqual(["root_dir/sub_1_dir/sub_3_dir/file_5"]);
        });
        it("returns files recursively under a given dir_path", async () => {
            const paths: string[] = [];
            crawlRec("root_dir", paths);
            expect(paths).toEqual([
                "root_dir/sub_1_dir/file_3",
                "root_dir/sub_1_dir/sub_3_dir/file_5",
                "root_dir/sub_1_dir/file_4",
                "root_dir/file_1",
                "root_dir/file_2"
            ]);
        });
        it("return empty file list if dir_path does not exist", async () => {
            const paths: string[] = [];
            crawlRec("404", paths);
            expect(paths).toEqual([]);
        });
    });
});
