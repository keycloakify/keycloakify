import { describe, it, expect } from "vitest";
import { KcSanitizer } from "keycloakify/lib/kcSanitize/KcSanitizer";
import { decode } from "html-entities";
import DOMPurify from "isomorphic-dompurify";

// Implementation of Keycloak Java method KeycloakSanitizerTest with bunch of more test for p tag styling
// https://github.com/keycloak/keycloak/blob/8ce8a4ba089eef25a0e01f58e09890399477b9ef/services/src/test/java/org/keycloak/theme/KeycloakSanitizerTest.java#L32
describe("KeycloakSanitizerMethod", () => {
    it("should handle escapes correctly", () => {
        let html: string = "";
        let expectedResult: string;

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

    it("should handle ordinary texts correctly", () => {
        let html: string = "";

        html = "Some text";
        assertResult("Some text", html);

        html = `text with "double quotation"`;
        assertResult(`text with "double quotation"`, html);

        html = `text with 'single quotation'`;
        assertResult(`text with 'single quotation'`, html);
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

        html = `<p align="CenTer"> <b> Case-insensitive</b></p>`;
        assertResult(`<p align="CenTer"> <b> Case-insensitive</b></p>`, html);

        html = `<p align="xyz"> <b>wrong value for align</b></p>`;
        assertResult(`<p> <b>wrong value for align</b></p>`, html);

        html = `<p align="centercenter"> <b>wrong value for align</b></p>`;
        assertResult(`<p> <b>wrong value for align</b></p>`, html);

        html = `<p style="font-size: 20px;">This is a paragraph with larger text.</p>`;
        assertResult(
            `<p style="font-size: 20px;">This is a paragraph with larger text.</p>`,
            html
        );

        html = `<h3> או נושא שתבחר</h3>`;
        assertResult(`<h3> או נושא שתבחר</h3>`, html);
    });

    it("should handle  styles correctly", () => {
        let html = "";
        html = `<table border="5"> </table>`;
        assertResult(`<table border="5"> </table>`, html);

        html = `<table border="xyz"> </table>`;
        assertResult(`<table> </table>`, html);

        html = `<font color = "red"> Content </font>`;
        assertResult(`<font color="red"> Content </font>`, html);
    });

    function assertResult(expectedResult: string, html: string): void {
        const result = KcSanitizer.sanitize(html, {
            DOMPurify: DOMPurify as any,
            htmlEntitiesDecode: decode
        });
        expect(result).toBe(expectedResult);
    }
});
