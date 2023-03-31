import jar from "keycloakify/bin/tools/jar";
import { it, describe, vi } from "vitest";

vi.mock("fs", () => ({ promises: { mkdir: () => {} }, createWriteStream: () => {} }));
vi.mock("stream", async () => {
    const readableMock = () => {
        const mockDecorators = {
            on: () => mockDecorators,
            pipe: () => mockDecorators
        };
        return {
            from: () => mockDecorators
        };
    };

    return {
        // @ts-ignore
        ...(await vi.importActual("stream")),
        Readable: readableMock()
    };
});
describe("jar", () => {
    it("creates jar artifacts without error", () => {
        jar({ artifactId: "artifactId", groupId: "groupId", rootPath: "rootPath", targetPath: "targetPath", version: "1.0.0" });
    });
});
