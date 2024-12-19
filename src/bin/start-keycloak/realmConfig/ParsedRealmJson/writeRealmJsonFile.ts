import * as fsPr from "fs/promises";
import { getIsPrettierAvailable, runPrettier } from "../../../tools/runPrettier";
import { canonicalStringify } from "../../../tools/canonicalStringify";
import type { ParsedRealmJson } from "./ParsedRealmJson";
import { getDefaultConfig } from "../defaultConfig";

export async function writeRealmJsonFile(params: {
    realmJsonFilePath: string;
    parsedRealmJson: ParsedRealmJson;
    keycloakMajorVersionNumber: number;
}): Promise<void> {
    const { realmJsonFilePath, parsedRealmJson, keycloakMajorVersionNumber } = params;

    let sourceCode = canonicalStringify({
        data: parsedRealmJson,
        referenceData: getDefaultConfig({
            keycloakMajorVersionNumber
        })
    });

    if (await getIsPrettierAvailable()) {
        sourceCode = await runPrettier({
            sourceCode: sourceCode,
            filePath: realmJsonFilePath
        });
    }

    await fsPr.writeFile(realmJsonFilePath, Buffer.from(sourceCode, "utf8"));
}
