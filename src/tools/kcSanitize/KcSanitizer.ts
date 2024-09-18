import { KcSanitizerPolicy } from "keycloakify/tools/kcSanitize/KcSanitizerPolicy";

// implementation of keycloak java sanitize method ( KeycloakSanitizerMethod )
// https://github.com/keycloak/keycloak/blob/8ce8a4ba089eef25a0e01f58e09890399477b9ef/services/src/main/java/org/keycloak/theme/KeycloakSanitizerMethod.java#L33
export class KcSanitizer {
    private static HREF_PATTERN = /\s+href="([^"]*)"/g;
    private static textarea: HTMLTextAreaElement | null = null;

    public static sanitize(html: string | null): string {
        if (html == null) {
            throw new Error("Cannot escape null value.");
        }
        if (html === "") return "";

        html = this.decodeHtmlFull(html);
        const sanitized = KcSanitizerPolicy.sanitize(html);
        return this.fixURLs(sanitized);
    }

    private static decodeHtmlFull(html: string): string {
        if (typeof window !== "undefined" && typeof document !== "undefined") {
            return KcSanitizer.decodeHtmlOnClient(html);
        } else {
            throw new Error("not implemented");
            // return await KcSanitizer.decodeHtmlOnServer(html);
        }
    }

    // private static async decodeHtmlOnServer(html: string): Promise<string> {
    //     // Dynamically import html-entities only on the server side
    //     const { decode } = await import("html-entities");
    //     return decode(html);
    // }

    private static decodeHtmlOnClient(html: string): string {
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
