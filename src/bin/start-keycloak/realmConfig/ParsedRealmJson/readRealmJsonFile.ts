import { assert } from "tsafe/assert";
import { is } from "tsafe/is";
import * as fs from "fs";
import { type ParsedRealmJson, zParsedRealmJson } from "./ParsedRealmJson";

export function readRealmJsonFile(params: {
    realmJsonFilePath: string;
}): ParsedRealmJson {
    const { realmJsonFilePath } = params;

    const parsedRealmJson = JSON.parse(
        fs.readFileSync(realmJsonFilePath).toString("utf8")
    ) as unknown;

    zParsedRealmJson.parse(parsedRealmJson);

    assert(is<ParsedRealmJson>(parsedRealmJson));

    return parsedRealmJson;
}
