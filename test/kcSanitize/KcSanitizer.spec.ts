import { describe, it, expect, vi, beforeAll } from "vitest";
import { KcSanitizer } from "keycloakify/tools/kcSanitize/KcSanitizer";

// Implementation of Keycloak Java method KeycloakSanitizerTest with bunch of more test for p tag styling
// https://github.com/keycloak/keycloak/blob/8ce8a4ba089eef25a0e01f58e09890399477b9ef/services/src/test/java/org/keycloak/theme/KeycloakSanitizerTest.java#L32
const testCases = [
    {
        description: "should handle escapes correctly",
        cases: [
            {
                html: "<div class=\"kc-logo-text\"><script>alert('foo');</script><span>Keycloak</span></div>",
                expectedResult: '<div class="kc-logo-text"><span>Keycloak</span></div>'
            },
            {
                html: "<h1>Foo</h1>",
                expectedResult: "<h1>Foo</h1>"
            },
            {
                html: '<div class="kc-logo-text"><span>Keycloak</span></div><svg onload=alert(document.cookie);>',
                expectedResult: '<div class="kc-logo-text"><span>Keycloak</span></div>'
            },
            {
                html: null,
                expectedResult: null
            },
            {
                html: "",
                expectedResult: ""
            }
        ]
    },
    {
        description: "should handle URLs correctly",
        cases: [
            {
                html: "<p><a href='https://localhost'>link</a></p>",
                expectedResult:
                    '<p><a href="https://localhost" rel="nofollow">link</a></p>'
            },
            {
                html: '<p><a href="">link</a></p>',
                expectedResult: "<p>link</p>"
            },
            {
                html: "<p><a href=\"javascript:alert('hello!');\">link</a></p>",
                expectedResult: "<p>link</p>"
            },
            {
                html: '<p><a href="javascript:alert(document.domain);">link</a></p>',
                expectedResult: "<p>link</p>"
            },
            {
                html: '<p><a href="javascript&colon;alert(document.domain);">link</a></p>',
                expectedResult: "<p>link</p>"
            },
            {
                html: '<p><a href="javascript&\\0colon;alert(document.domain);">link</a></p>',
                expectedResult: "<p>link</p>"
            },
            {
                html: '<p><a href="javascript&amp;amp;\\0colon;alert(document.domain);">link</a></p>',
                expectedResult: "<p>link</p>"
            },
            {
                html: '<p><a href="https://localhost?key=123&msg=abc">link</a></p>',
                expectedResult:
                    '<p><a href="https://localhost?key=123&msg=abc" rel="nofollow">link</a></p>'
            },
            {
                html: '<p><a href="https://localhost?key=abc&msg=123">link2</a></p>',
                expectedResult:
                    '<p><a href="https://localhost?key=abc&msg=123" rel="nofollow">link2</a></p>'
            }
        ]
    },
    {
        description: "should handle ordinary texts correctly",
        cases: [
            {
                html: "Some text",
                expectedResult: "Some text"
            },
            {
                html: `text with "double quotation"`,
                expectedResult: `text with "double quotation"`
            },
            {
                html: `text with 'single quotation'`,
                expectedResult: `text with 'single quotation'`
            }
        ]
    },
    {
        description: "should handle text styles correctly",
        cases: [
            {
                html: "<p><strong>text</strong></p>",
                expectedResult: "<p><strong>text</strong></p>"
            },
            {
                html: "<p><b>text</b></p>",
                expectedResult: "<p><b>text</b></p>"
            },
            {
                html: '<p class="red"> red text </p>',
                expectedResult: '<p class="red"> red text </p>'
            },
            {
                html: '<p align="center"> <b>red text </b></p>',
                expectedResult: '<p align="center"> <b>red text </b></p>'
            },
            {
                html: '<p align="CenTer"> <b> Case-insensitive</b></p>',
                expectedResult: '<p align="CenTer"> <b> Case-insensitive</b></p>'
            },
            {
                html: '<p align="xyz"> <b>wrong value for align</b></p>',
                expectedResult: "<p> <b>wrong value for align</b></p>"
            },
            {
                html: '<p align="centercenter"> <b>wrong value for align</b></p>',
                expectedResult: "<p> <b>wrong value for align</b></p>"
            },
            {
                html: '<p style="font-size: 20px;">This is a paragraph with larger text.</p>',
                expectedResult:
                    '<p style="font-size: 20px;">This is a paragraph with larger text.</p>'
            },
            {
                html: "<h3> או נושא שתבחר</h3>",
                expectedResult: "<h3> או נושא שתבחר</h3>"
            }
        ]
    },
    {
        description: "should handle styles correctly",
        cases: [
            {
                html: '<table border="5"> </table>',
                expectedResult: '<table border="5"> </table>'
            },
            {
                html: '<table border="xyz"> </table>',
                expectedResult: "<table> </table>"
            },
            {
                html: '<font color="red"> Content </font>',
                expectedResult: '<font color="red"> Content </font>'
            }
        ]
    }
];
const assertResult = async (
    expectedResult: string | null,
    html: string | null
): Promise<void> => {
    if (html === null) {
        await expect(KcSanitizer.sanitize(html)).rejects.toThrow(
            "Cannot escape null value."
        );
    } else {
        const result = await KcSanitizer.sanitize(html);
        expect(result).toBe(expectedResult);
    }
};

// Server-side tests
describe("KcSanitizer - Server Side", () => {
    for (const group of testCases) {
        describe(group.description, () => {
            for (const test of group.cases) {
                it(`should handle ${test.html}`, async () => {
                    await assertResult(test.expectedResult, test.html);
                });
            }
        });
    }
});

// Client-side tests
describe("KcSanitizer - Client Side (jsdom)", () => {
    const decodeHtmlEntities = (html: string): string => {
        const entitiesMap: { [key: string]: string } = {
            "&amp;": "&",
            "&lt;": "<",
            "&gt;": ">",
            "&quot;": '"',
            "&#039;": "'"
        };

        return html.replace(
            /&amp;|&lt;|&gt;|&quot;|&#039;/g,
            entity => entitiesMap[entity] || entity
        );
    };

    beforeAll(() => {
        // Mocking the `document.createElement` to simulate textarea behavior
        vi.stubGlobal("document", {
            createElement: (tagName: string) => {
                if (tagName === "textarea") {
                    let _innerHTML = "";
                    return {
                        get innerHTML() {
                            return _innerHTML;
                        },
                        set innerHTML(html) {
                            _innerHTML = html;
                            this.value = decodeHtmlEntities(html); // Simulate decoding
                        },
                        value: "" // Mimic the textarea behavior where innerHTML -> value
                    };
                }
                throw new Error("Unsupported element");
            }
        });
    });

    for (const group of testCases) {
        describe(group.description, () => {
            for (const test of group.cases) {
                it(`should handle ${test.html}`, async () => {
                    await assertResult(test.expectedResult, test.html);
                });
            }
        });
    }
});
