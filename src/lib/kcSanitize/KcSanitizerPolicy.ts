import { HtmlPolicyBuilder } from "./HtmlPolicyBuilder";
import type { DOMPurify as ofTypeDomPurify } from "keycloakify/tools/vendor/dompurify";

//implementation of java Sanitizer policy ( KeycloakSanitizerPolicy )
// All regex directly copied from the keycloak source but some of them changed slightly to work with typescript(ONSITE_URL and OFFSITE_URL)
// Also replaced ?i with "i" tag as second parameter of RegExp
//https://github.com/keycloak/keycloak/blob/8ce8a4ba089eef25a0e01f58e09890399477b9ef/services/src/main/java/org/keycloak/theme/KeycloakSanitizerPolicy.java#L29
export class KcSanitizerPolicy {
    public static readonly COLOR_NAME = new RegExp(
        "(?:aqua|black|blue|fuchsia|gray|grey|green|lime|maroon|navy|olive|purple|red|silver|teal|white|yellow)"
    );

    public static readonly COLOR_CODE = new RegExp(
        "(?:#(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?))"
    );

    public static readonly NUMBER_OR_PERCENT = new RegExp("[0-9]+%?");

    public static readonly PARAGRAPH = new RegExp(
        "(?:[\\p{L}\\p{N},'\\.\\s\\-_\\(\\)]|&[0-9]{2};)*",
        "u" // Unicode flag for \p{L} and \p{N} in the pattern
    );

    public static readonly HTML_ID = new RegExp("[a-zA-Z0-9\\:\\-_\\.]+");

    public static readonly HTML_TITLE = new RegExp(
        "[\\p{L}\\p{N}\\s\\-_',:\\[\\]!\\./\\\\\\(\\)&]*",
        "u" // Unicode flag for \p{L} and \p{N} in the pattern
    );

    public static readonly HTML_CLASS = new RegExp("[a-zA-Z0-9\\s,\\-_]+");

    public static readonly ONSITE_URL = new RegExp(
        "(?:[\\p{L}\\p{N}.#@\\$%+&;\\-_~,?=/!]+|#(\\w)+)",
        "u" // Unicode flag for \p{L} and \p{N} in the pattern
    );

    public static readonly OFFSITE_URL = new RegExp(
        "\\s*(?:(?:ht|f)tps?://|mailto:)[\\p{L}\\p{N}]+" +
            "[\\p{L}\\p{N}\\p{Zs}.#@\\$%+&;:\\-_~,?=/!()]*\\s*",
        "u" // Unicode flag for \p{L} and \p{N} in the pattern
    );

    public static readonly NUMBER = new RegExp(
        "[+-]?(?:(?:[0-9]+(?:\\.[0-9]*)?)|\\.[0-9]+)"
    );
    public static readonly NAME = new RegExp("[a-zA-Z0-9\\-_\\$]+");

    public static readonly ALIGN = new RegExp(
        "\\b(center|left|right|justify|char)\\b",
        "i" // Case-insensitive flag
    );

    public static readonly VALIGN = new RegExp(
        "\\b(baseline|bottom|middle|top)\\b",
        "i" // Case-insensitive flag
    );

    public static readonly HISTORY_BACK = new RegExp(
        "(?:javascript:)?\\Qhistory.go(-1)\\E"
    );

    public static readonly ONE_CHAR = new RegExp(
        ".?",
        "s" // Dotall flag for . to match newlines
    );

    private static COLOR_NAME_OR_COLOR_CODE(s: string): boolean {
        return (
            KcSanitizerPolicy.COLOR_NAME.test(s) || KcSanitizerPolicy.COLOR_CODE.test(s)
        );
    }

    private static ONSITE_OR_OFFSITE_URL(s: string): boolean {
        return (
            KcSanitizerPolicy.ONSITE_URL.test(s) || KcSanitizerPolicy.OFFSITE_URL.test(s)
        );
    }

    public static sanitize(
        html: string,
        dependencyInjections: Partial<{
            DOMPurify: typeof ofTypeDomPurify;
        }>
    ): string {
        return new HtmlPolicyBuilder(dependencyInjections)
            .allowWithoutAttributes("span")

            .allowAttributes("id")
            .matching(this.HTML_ID)
            .globally()

            .allowAttributes("class")
            .matching(this.HTML_CLASS)
            .globally()

            .allowAttributes("lang")
            .matching(/[a-zA-Z]{2,20}/)
            .globally()

            .allowAttributes("title")
            .matching(this.HTML_TITLE)
            .globally()

            .allowStyling()

            .allowAttributes("align")
            .matching(this.ALIGN)
            .onElements("p")

            .allowAttributes("for")
            .matching(this.HTML_ID)
            .onElements("label")

            .allowAttributes("color")
            .matching(this.COLOR_NAME_OR_COLOR_CODE)
            .onElements("font")

            .allowAttributes("face")
            .matching(/[\w;, \-]+/)
            .onElements("font")

            .allowAttributes("size")
            .matching(this.NUMBER)
            .onElements("font")

            .allowAttributes("href")
            .matching(this.ONSITE_OR_OFFSITE_URL)
            .onElements("a")

            .allowStandardUrlProtocols()
            .allowAttributes("nohref")
            .onElements("a")

            .allowAttributes("name")
            .matching(this.NAME)
            .onElements("a")

            .allowAttributes("onfocus", "onblur", "onclick", "onmousedown", "onmouseup")
            .matching(this.HISTORY_BACK)
            .onElements("a")

            .requireRelNofollowOnLinks()
            .allowAttributes("src")
            .matching(this.ONSITE_OR_OFFSITE_URL)
            .onElements("img")

            .allowAttributes("name")
            .matching(this.NAME)
            .onElements("img")

            .allowAttributes("alt")
            .matching(this.PARAGRAPH)
            .onElements("img")

            .allowAttributes("border", "hspace", "vspace")
            .matching(this.NUMBER)
            .onElements("img")

            .allowAttributes("border", "cellpadding", "cellspacing")
            .matching(this.NUMBER)
            .onElements("table")

            .allowAttributes("bgcolor")
            .matching(this.COLOR_NAME_OR_COLOR_CODE)
            .onElements("table")

            .allowAttributes("background")
            .matching(this.ONSITE_URL)
            .onElements("table")

            .allowAttributes("align")
            .matching(this.ALIGN)
            .onElements("table")

            .allowAttributes("noresize")
            .matching(new RegExp("noresize", "i"))
            .onElements("table")

            .allowAttributes("background")
            .matching(this.ONSITE_URL)
            .onElements("td", "th", "tr")

            .allowAttributes("bgcolor")
            .matching(this.COLOR_NAME_OR_COLOR_CODE)
            .onElements("td", "th")

            .allowAttributes("abbr")
            .matching(this.PARAGRAPH)
            .onElements("td", "th")

            .allowAttributes("axis", "headers")
            .matching(this.NAME)
            .onElements("td", "th")

            .allowAttributes("scope")
            .matching(new RegExp("(?:row|col)(?:group)?", "i"))
            .onElements("td", "th")

            .allowAttributes("nowrap")
            .onElements("td", "th")

            .allowAttributes("height", "width")
            .matching(this.NUMBER_OR_PERCENT)
            .onElements("table", "td", "th", "tr", "img")

            .allowAttributes("align")
            .matching(this.ALIGN)
            .onElements(
                "thead",
                "tbody",
                "tfoot",
                "img",
                "td",
                "th",
                "tr",
                "colgroup",
                "col"
            )

            .allowAttributes("valign")
            .matching(this.VALIGN)
            .onElements("thead", "tbody", "tfoot", "td", "th", "tr", "colgroup", "col")

            .allowAttributes("charoff")
            .matching(this.NUMBER_OR_PERCENT)
            .onElements("td", "th", "tr", "colgroup", "col", "thead", "tbody", "tfoot")

            .allowAttributes("char")
            .matching(this.ONE_CHAR)
            .onElements("td", "th", "tr", "colgroup", "col", "thead", "tbody", "tfoot")

            .allowAttributes("colspan", "rowspan")
            .matching(this.NUMBER)
            .onElements("td", "th")

            .allowAttributes("span", "width")
            .matching(this.NUMBER_OR_PERCENT)
            .onElements("colgroup", "col")
            .allowElements(
                "a",
                "label",
                "noscript",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "p",
                "i",
                "b",
                "u",
                "strong",
                "em",
                "small",
                "big",
                "pre",
                "code",
                "cite",
                "samp",
                "sub",
                "sup",
                "strike",
                "center",
                "blockquote",
                "hr",
                "br",
                "col",
                "font",
                "map",
                "span",
                "div",
                "img",
                "ul",
                "ol",
                "li",
                "dd",
                "dt",
                "dl",
                "tbody",
                "thead",
                "tfoot",
                "table",
                "td",
                "th",
                "tr",
                "colgroup",
                "fieldset",
                "legend"
            )
            .apply(html);
    }
}
