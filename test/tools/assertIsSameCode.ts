import { assert } from "tsafe/assert";

export function assetIsSameCode(code1: string, code2: string, message?: string): void {
    const removeSpacesAndNewLines = (code: string) => code.replace(/\s/g, "").replace(/\n/g, "");

    assert(removeSpacesAndNewLines(code1) === removeSpacesAndNewLines(code2), message);
}
