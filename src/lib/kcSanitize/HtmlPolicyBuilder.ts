import { DOMPurify } from "keycloakify/tools/vendor/dompurify";

type TagType = {
    name: string;
    attributes: AttributeType[];
};
type AttributeType = {
    name: string;
    matchRegex?: RegExp;
    matchFunction?: (value: string) => boolean;
};

// implementation for org.owasp.html.HtmlPolicyBuilder
// https://www.javadoc.io/static/com.googlecode.owasp-java-html-sanitizer/owasp-java-html-sanitizer/20160628.1/index.html?org/owasp/html/HtmlPolicyBuilder.html
// It supports the methods that KCSanitizerPolicy needs and nothing more

export class HtmlPolicyBuilder {
    private globalAttributesAllowed: Set<AttributeType> = new Set();
    private tagsAllowed: Map<string, TagType> = new Map();
    private tagsAllowedWithNoAttribute: Set<string> = new Set();
    private currentAttribute: AttributeType | null = null;
    private isStylingAllowed: boolean = false;
    private allowedProtocols: Set<string> = new Set();
    private enforceRelNofollow: boolean = false;
    private DOMPurify: typeof DOMPurify;

    // add a constructor
    constructor(
        dependencyInjections: Partial<{
            DOMPurify: typeof DOMPurify;
        }>
    ) {
        this.DOMPurify = dependencyInjections.DOMPurify ?? DOMPurify;
    }

    allowWithoutAttributes(tag: string): this {
        this.tagsAllowedWithNoAttribute.add(tag);
        return this;
    }

    // Adds the attributes for validation
    allowAttributes(...args: string[]): this {
        if (args.length) {
            const attr = args[0];
            this.currentAttribute = { name: attr }; // Default regex, will be set later
        }
        return this;
    }

    // Matching regex for value of allowed attributes
    matching(matchingPattern: RegExp | ((value: string) => boolean)): this {
        if (this.currentAttribute) {
            if (matchingPattern instanceof RegExp) {
                this.currentAttribute.matchRegex = matchingPattern;
            } else {
                this.currentAttribute.matchFunction = matchingPattern;
            }
        }
        return this;
    }

    // Make attributes in prev call global
    globally(): this {
        if (this.currentAttribute) {
            this.currentAttribute.matchRegex = /.*/;
            this.globalAttributesAllowed.add(this.currentAttribute);
            this.currentAttribute = null; // Reset after global application
        }
        return this;
    }

    // Allow styling globally
    allowStyling(): this {
        this.isStylingAllowed = true;
        return this;
    }

    // Save attributes for specific tag
    onElements(...tags: string[]): this {
        if (this.currentAttribute) {
            tags.forEach(tag => {
                const element = this.tagsAllowed.get(tag) || {
                    name: tag,
                    attributes: []
                };
                element.attributes.push(this.currentAttribute!);
                this.tagsAllowed.set(tag, element);
            });
            this.currentAttribute = null; // Reset after applying to elements
        }
        return this;
    }

    // Make specific tag allowed
    allowElements(...tags: string[]): this {
        tags.forEach(tag => {
            if (!this.tagsAllowed.has(tag)) {
                this.tagsAllowed.set(tag, { name: tag, attributes: [] });
            }
        });
        return this;
    }

    // Handle rel=nofollow on links
    requireRelNofollowOnLinks(): this {
        this.enforceRelNofollow = true;
        return this;
    }

    // Allow standard URL protocols (could include further implementation)
    allowStandardUrlProtocols(): this {
        this.allowedProtocols.add("http");
        this.allowedProtocols.add("https");
        this.allowedProtocols.add("mailto");
        return this;
    }

    apply(html: string): string {
        //Clear all previous configs first ( in case we used DOMPurify somewhere else )
        this.DOMPurify.clearConfig();
        this.DOMPurify.removeAllHooks();
        this.setupHooks();
        return this.DOMPurify.sanitize(html, {
            ALLOWED_TAGS: Array.from(this.tagsAllowed.keys()),
            ALLOWED_ATTR: this.getAllowedAttributes(),
            ALLOWED_URI_REGEXP: this.getAllowedUriRegexp(),
            ADD_TAGS: this.isStylingAllowed ? ["style"] : [],
            ADD_ATTR: this.isStylingAllowed ? ["style"] : []
        });
    }

    private setupHooks(): void {
        // Check allowed attribute and global attributes and it doesnt exist in them remove it
        this.DOMPurify.addHook("uponSanitizeAttribute", (currentNode, hookEvent) => {
            if (!hookEvent) return;

            const tagName = currentNode.tagName.toLowerCase();
            const allowedAttributes = this.tagsAllowed.get(tagName)?.attributes || [];

            //Add global attributes to allowed attributes
            this.globalAttributesAllowed.forEach(attribute => {
                allowedAttributes.push(attribute);
            });

            //Add style attribute to allowed attributes
            if (this.isStylingAllowed) {
                let styleAttribute: AttributeType = { name: "style", matchRegex: /.*/ };
                allowedAttributes.push(styleAttribute);
            }

            // Check if the attribute is allowed
            if (!allowedAttributes.some(attr => attr.name === hookEvent.attrName)) {
                hookEvent.forceKeepAttr = false;
                hookEvent.keepAttr = false;
                currentNode.removeAttribute(hookEvent.attrName);
                return;
            } else {
                const attributeType = allowedAttributes.find(
                    attr => attr.name === hookEvent.attrName
                );
                if (attributeType) {
                    //Check if attribute value is allowed
                    if (
                        attributeType.matchRegex &&
                        !attributeType.matchRegex.test(hookEvent.attrValue)
                    ) {
                        hookEvent.forceKeepAttr = false;
                        hookEvent.keepAttr = false;
                        currentNode.removeAttribute(hookEvent.attrName);
                        return;
                    }
                    if (
                        attributeType.matchFunction &&
                        !attributeType.matchFunction(hookEvent.attrValue)
                    ) {
                        hookEvent.forceKeepAttr = false;
                        hookEvent.keepAttr = false;
                        currentNode.removeAttribute(hookEvent.attrName);
                        return;
                    }
                }
            }
            // both attribute and value already checked so they should be ok
            // set forceKeep to true to make sure next hooks won't delete them
            // except for href that we will check later
            if (hookEvent.attrName !== "href") {
                hookEvent.keepAttr = true;
                hookEvent.forceKeepAttr = true;
            }
        });

        this.DOMPurify.addHook("afterSanitizeAttributes", currentNode => {
            // if tag is not allowed to have no attribute then remove it completely
            if (
                currentNode.attributes.length == 0 &&
                currentNode.childNodes.length == 0
            ) {
                if (!this.tagsAllowedWithNoAttribute.has(currentNode.tagName)) {
                    currentNode.remove();
                }
            } else {
                //in case of <a> or <img> if we have no attribute we need to remove them even if they have child
                if (currentNode.tagName === "A" || currentNode.tagName === "IMG") {
                    if (currentNode.attributes.length == 0) {
                        //add currentNode children to parent node
                        while (currentNode.firstChild) {
                            currentNode?.parentNode?.insertBefore(
                                currentNode.firstChild,
                                currentNode
                            );
                        }
                        // Remove the currentNode itself
                        currentNode.remove();
                    }
                }
                //
                if (currentNode.tagName === "A") {
                    if (this.enforceRelNofollow) {
                        if (!currentNode.hasAttribute("rel")) {
                            currentNode.setAttribute("rel", "nofollow");
                        } else if (
                            !currentNode.getAttribute("rel")?.includes("nofollow")
                        ) {
                            currentNode.setAttribute(
                                "rel",
                                currentNode.getAttribute("rel") + " nofollow"
                            );
                        }
                    }
                }
            }
        });
    }

    private getAllowedAttributes(): string[] {
        const allowedAttributes: Set<string> = new Set();
        this.tagsAllowed.forEach(element => {
            element.attributes.forEach(attribute => {
                allowedAttributes.add(attribute.name);
            });
        });
        this.globalAttributesAllowed.forEach(attribute => {
            allowedAttributes.add(attribute.name);
        });
        return Array.from(allowedAttributes);
    }

    private getAllowedUriRegexp(): RegExp {
        const protocols = Array.from(this.allowedProtocols).join("|");
        return new RegExp(`^(?:${protocols})://`, "i");
    }
}
