import { describe, it, expect } from "vitest";
import { KcSanitizer } from "keycloakify/tools/kcSanitize/KcSanitizer";

// Implementation of Keycloak Java method KeycloakSanitizerTest with bunch of more test for p tag styling
// https://github.com/keycloak/keycloak/blob/8ce8a4ba089eef25a0e01f58e09890399477b9ef/services/src/test/java/org/keycloak/theme/KeycloakSanitizerTest.java#L32
describe("KeycloakSanitizerMethod", () => {
    it("should handle escapes correctly", () => {
        let html: string | null = "";
        let expectedResult: string | null;

        html =
            "<div class=\"kc-logo-text\"><script>alert('foo');</script><span>Keycloak</span></div>";
        expectedResult = '<div class="kc-logo-text"><span>Keycloak</span></div>';
        assertResult(expectedResult, html);

        html = "<h1>Foo</h1>";
        expectedResult = "<h1>Foo</h1>";
        assertResult(expectedResult, html);

        html =
            '<div class="kc-logo-text"><span>Keycloak</span></div><svg onload=alert(document.cookie);>';
        expectedResult = '<div class="kc-logo-text"><span>Keycloak</span></div>';
        assertResult(expectedResult, html);

        html = null; // Type assertion to handle null
        expectedResult = null;
        expect(() => assertResult(expectedResult, html)).toThrow(
            "Cannot escape null value."
        );

        html = "";
        expectedResult = "";
        assertResult(expectedResult, html);
    });

    it("should handle URLs correctly", () => {
        let html: string = "";

        html = "<p><a href='https://localhost'>link</a></p>";
        assertResult('<p><a href="https://localhost" rel="nofollow">link</a></p>', html);

        html = '<p><a href="">link</a></p>';
        assertResult("<p>link</p>", html);

        html = "<p><a href=\"javascript:alert('hello!');\">link</a></p>";
        assertResult("<p>link</p>", html);

        html = '<p><a href="javascript:alert(document.domain);">link</a></p>';
        assertResult("<p>link</p>", html);

        html = '<p><a href="javascript&colon;alert(document.domain);">link</a></p>';
        assertResult("<p>link</p>", html);

        html = '<p><a href="javascript&\0colon;alert(document.domain);">link</a></p>';
        assertResult("<p>link</p>", html);

        html =
            '<p><a href="javascript&amp;amp;\0colon;alert(document.domain);">link</a></p>';
        assertResult("<p>link</p>", html);

        html =
            '<p><a href="javascript&amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;\0colon;alert(document.domain);">link</a></p>';
        assertResult("<p>link</p>", html);

        html = '<p><a href="https://localhost?key=123&msg=abc">link</a></p>';
        assertResult(
            '<p><a href="https://localhost?key=123&msg=abc" rel="nofollow">link</a></p>',
            html
        );

        html =
            "<p><a href='https://localhost?key=123&msg=abc'>link1</a><a href=\"https://localhost?key=abc&msg=123\">link2</a></p>";
        assertResult(
            '<p><a href="https://localhost?key=123&msg=abc" rel="nofollow">link1</a><a href="https://localhost?key=abc&msg=123" rel="nofollow">link2</a></p>',
            html
        );
    });
    it("should handle text styles correctly", () => {
        let html: string = "";

        html = "<p><strong>text</strong></p>";
        assertResult("<p><strong>text</strong></p>", html);

        html = "<p><b>text</b></p>";
        assertResult("<p><b>text</b></p>", html);

        html = `<p class="red"> red text </p>`;
        assertResult(`<p class="red"> red text </p>`, html);

        html = `<p align="center"> <b>red text </b></p>`;
        assertResult(`<p align="center"> <b>red text </b></p>`, html);

        html = `<p style="font-size: 20px;">This is a paragraph with larger text.</p>`;
        assertResult(
            `<p style="font-size: 20px;">This is a paragraph with larger text.</p>`,
            html
        );

        html = `<h3> או נושא שתבחר</h3>`;
        assertResult(`<h3> או נושא שתבחר</h3>`, html);
    });

    function assertResult(expectedResult: string | null, html: string | null): void {
        if (expectedResult === null) {
            expect(KcSanitizer.sanitize(html)).toThrow("Cannot escape null value.");
        } else {
            const result = KcSanitizer.sanitize(html);
            console.log("expectedResult is ", expectedResult);
            console.log("Result is ", result);
            expect(result).toBe(expectedResult);
        }
    }
});
