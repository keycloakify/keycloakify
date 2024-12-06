import { describe, it, expect } from "vitest";
import { createFixtures, readFsToListing } from "../../../tools/testUtils";
import { generateEmailResources } from "./genereateEmailResources";

describe("generateEmailResources", () => {
    it("Should replace `xKeycloakify.themeName` in .ftl and resolve theme prefix in .properties", async () => {
        const fixturePath = await createFixtures({
            "email/html/email-test.ftl": `<div>\${xKeycloakify.themeName}</div>`,
            "email/messages/messages_en.properties": `
emailTestSubject=Default Value
vanilla.emailTestSubject=Vanilla Value
chocolate.emailTestSubject=Chocolate Value
emailVerificationBody=Common Value
`.trim()
        });

        generateEmailResources({
            resourcesDirPath: fixturePath + "/actual",
            themeSrcDirPath: fixturePath,
            themeNames: ["vanilla", "chocolate"]
        });

        const actual = readFsToListing(fixturePath + "/actual");

        expect(actual).toMatchInlineSnapshot(`
          {
            "theme/chocolate/email/html/email-test.ftl": "<div>\${"chocolate"}</div>",
            "theme/chocolate/email/messages/messages_en.properties": "emailTestSubject=Chocolate Value
          emailVerificationBody=Common Value",
            "theme/vanilla/email/html/email-test.ftl": "<div>\${"vanilla"}</div>",
            "theme/vanilla/email/messages/messages_en.properties": "emailTestSubject=Vanilla Value
          emailVerificationBody=Common Value",
          }
        `);
    });
});
