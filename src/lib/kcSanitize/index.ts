import { KcSanitizer } from "./KcSanitizer";

export function kcSanitize(html: string): string {
    return KcSanitizer.sanitize(html, {});
}
