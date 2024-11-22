import { describe, it, expect } from "vitest";
import { mergePropertiesFiles } from "./mergePropertiesFiles";
import { createFixtures } from "../../tools/testUtils";

describe("mergePropertiesFiles", () => {
    it("Should merge files in order", async () => {
        const fixturePath = await createFixtures({
            "a.properties": `
propertyA=File A, Property A
propertyB=File A, Property B
propertyC=File A, Property C
propertyD=File A, Property D
`.trim(),
            "b.properties": `
propertyA=File B, Property A
propertyD=File B, Property D
propertyE=File B, Property E
`.trim(),
            "c.properties": `
propertyB=File C, Property B
propertyD=File C, Property D
propertyF=File B, Property F
`.trim()
        });

        const actual = mergePropertiesFiles(
            fixturePath + "/a.properties",
            fixturePath + "/b.properties",
            fixturePath + "/c.properties"
        );

        expect(actual).toMatchInlineSnapshot(`
          "propertyA=File B, Property A
          propertyB=File C, Property B
          propertyC=File A, Property C
          propertyD=File C, Property D
          propertyE=File B, Property E
          propertyF=File B, Property F"
        `);
    });
});
