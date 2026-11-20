import { afterEach, describe, expect, it, vi } from "vitest";
import * as child_process from "child_process";
import { getContainerRuntime } from "keycloakify/bin/start-keycloak/getContainerRuntime";

vi.mock("child_process", () => ({
    execSync: vi.fn()
}));

describe("getContainerRuntime", () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    it("returns 'docker' when docker is installed", () => {
        vi.mocked(child_process.execSync).mockImplementation((command: string) => {
            if (command === "docker --version") {
                return Buffer.from("Docker version 27.0.3, build 7d4bcd8\n");
            }
            throw new Error("Command not found");
        });

        expect(getContainerRuntime()).toBe("docker");
    });

    it("returns 'docker' when docker CLI is a podman-docker shim", () => {
        vi.mocked(child_process.execSync).mockImplementation((command: string) => {
            if (command === "docker --version") {
                return Buffer.from("podman version 5.2.0\n");
            }
            throw new Error("Command not found");
        });

        expect(getContainerRuntime()).toBe("docker");
    });

    it("falls back to 'podman' when docker is not installed and podman is installed", () => {
        vi.mocked(child_process.execSync).mockImplementation((command: string) => {
            if (command === "podman --version") {
                return Buffer.from("podman version 5.2.0\n");
            }
            throw new Error("Command not found");
        });

        expect(getContainerRuntime()).toBe("podman");
    });

    it("returns undefined when neither docker nor podman is installed", () => {
        vi.mocked(child_process.execSync).mockImplementation(() => {
            throw new Error("Command not found");
        });

        expect(getContainerRuntime()).toBeUndefined();
    });

    it("returns undefined when version output does not mention docker or podman", () => {
        vi.mocked(child_process.execSync).mockImplementation(() => {
            return Buffer.from("unknown container tool 1.0.0\n");
        });

        expect(getContainerRuntime()).toBeUndefined();
    });
});
