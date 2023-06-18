import { crawl } from "../../tools/crawl";
import { removeDuplicates } from "evt/tools/reducers/removeDuplicates";
import { join as pathJoin } from "path";
import * as fs from "fs";
import type { ThemeType } from "../generateFtl";
import { exclude } from "tsafe/exclude";

export function readFieldNameUsage(params: {
    keycloakifySrcDirPath: string;
    themeSrcDirPath: string | undefined;
    themeType: ThemeType | "email";
}): string[] {
    const { keycloakifySrcDirPath, themeSrcDirPath, themeType } = params;

    const fieldNames: string[] = [];

    if (themeSrcDirPath === undefined) {
        //If we can't detect the user theme directory we restore the fieldNames we had previously to prevent errors.
        fieldNames.push(
            ...[
                "global",
                "userLabel",
                "username",
                "email",
                "firstName",
                "lastName",
                "password",
                "password-confirm",
                "totp",
                "totpSecret",
                "SAMLRequest",
                "SAMLResponse",
                "relayState",
                "device_user_code",
                "code",
                "password-new",
                "rememberMe",
                "login",
                "authenticationExecution",
                "cancel-aia",
                "clientDataJSON",
                "authenticatorData",
                "signature",
                "credentialId",
                "userHandle",
                "error",
                "authn_use_chk",
                "authenticationExecution",
                "isSetRetry",
                "try-again",
                "attestationObject",
                "publicKeyCredentialId",
                "authenticatorLabel"
            ]
        );
    }

    for (const srcDirPath of (
        [
            pathJoin(keycloakifySrcDirPath, themeType),
            (() => {
                if (themeSrcDirPath === undefined) {
                    return undefined;
                }

                const srcDirPath = pathJoin(themeSrcDirPath, themeType);

                if (!fs.existsSync(srcDirPath)) {
                    return undefined;
                }

                return srcDirPath;
            })()
        ] as const
    ).filter(exclude(undefined))) {
        const filePaths = crawl(srcDirPath)
            .filter(filePath => /\.(ts|tsx|js|jsx)$/.test(filePath))
            .map(filePath => pathJoin(srcDirPath, filePath));

        for (const filePath of filePaths) {
            const rawSourceFile = fs.readFileSync(filePath).toString("utf8");

            if (!rawSourceFile.includes("messagesPerField")) {
                continue;
            }

            fieldNames.push(
                ...Array.from(rawSourceFile.matchAll(/(?:(?:printIfExists)|(?:existsError)|(?:get)|(?:exists))\(["']([^"']+)["']/g), m => m[1])
            );
        }
    }

    const out = fieldNames.reduce(...removeDuplicates<string>());

    return out;
}
