import fs from "fs";
import path from "path";
import zodToJsonSchema from "zod-to-json-schema";
import { zParsedPackageJson } from "../src/bin/keycloakify/parsedPackageJson";

const jsonSchemaName = "keycloakifyPackageJsonSchema";
const jsonSchema = zodToJsonSchema(zParsedPackageJson, jsonSchemaName);

const baseProperties = {
    // merges package.json schema with keycloakify properties
    "allOf": [{ "$ref": "https://json.schemastore.org/package.json" }, { "$ref": jsonSchemaName }]
};

fs.writeFileSync(path.join(process.cwd(), "keycloakify-json-schema.json"), JSON.stringify({ ...baseProperties, ...jsonSchema }, null, 2));
