import { describe, expect, it } from "vitest";
import { extractThemeVariantFromProperties } from "./extractThemeVariantFromProperties";

describe("extractThemeVariantFromProperties", () => {
    it("Should extract theme prefixed properties", () => {
        const input = `
propertyKey=Property Value 1
property.key=Verify email
vanilla.property.key=Verify email for Vanilla
chocolate.property.key=Verify email for Chocolate
        `.trim();

        const actual = extractThemeVariantFromProperties(input, "vanilla", [
            "vanilla",
            "chocolate"
        ]);

        expect(actual).toMatchInlineSnapshot(`
          "propertyKey=Property Value 1
          property.key=Verify email for Vanilla"
        `);
    });
});
