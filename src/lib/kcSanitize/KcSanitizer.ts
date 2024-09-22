import { KcSanitizerPolicy } from "./KcSanitizerPolicy";
import type { DOMPurify as ofTypeDomPurify } from "keycloakify/tools/vendor/dompurify";

// implementation of keycloak java sanitize method ( KeycloakSanitizerMethod )
// https://github.com/keycloak/keycloak/blob/8ce8a4ba089eef25a0e01f58e09890399477b9ef/services/src/main/java/org/keycloak/theme/KeycloakSanitizerMethod.java#L33
export class KcSanitizer {
    private static HREF_PATTERN = /\s+href="([^"]*)"/g;
    private static textarea: HTMLTextAreaElement | null = null;

    public static sanitize(
        html: string,
        dependencyInjections: Partial<{
            DOMPurify: typeof ofTypeDomPurify;
            htmlEntitiesDecode: (html: string) => string;
        }>
    ): string {
        if (html === "") return "";

        html =
            dependencyInjections?.htmlEntitiesDecode !== undefined
                ? dependencyInjections.htmlEntitiesDecode(html)
                : this.decodeHtml(html);
        const sanitized = KcSanitizerPolicy.sanitize(html, dependencyInjections);
        return this.fixURLs(sanitized);
    }

    private static decodeHtml(html: string): string {
        if (!KcSanitizer.textarea) {
            KcSanitizer.textarea = document.createElement("textarea");
        }
        KcSanitizer.textarea.innerHTML = html;
        return KcSanitizer.textarea.value;
    }

    // This will remove unwanted characters from url
    private static fixURLs(msg: string): string {
        const HREF_PATTERN = this.HREF_PATTERN;
        const result = [];
        let last = 0;
        let match: RegExpExecArray | null;

        do {
            match = HREF_PATTERN.exec(msg);
            if (match) {
                const href = match[0]
                    .replace(/&#61;/g, "=")
                    .replace(/\.\./g, ".")
                    .replace(/&amp;/g, "&");

                result.push(msg.substring(last, match.index!));
                result.push(href);

                last = HREF_PATTERN.lastIndex;
            }
        } while (match);

        result.push(msg.substring(last));
        return result.join("");
    }
}
