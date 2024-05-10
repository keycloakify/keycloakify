import { useCallback } from "react";
import { useConst } from "keycloakify/tools/useConst";
import { assert } from "tsafe/assert";

export type ScriptTag = ScriptTag.TextContent | ScriptTag.Src;

export namespace ScriptTag {
    type Common = {
        type: "text/javascript" | "module";
    };

    export type TextContent = Common & {
        textContent: string;
    };
    export type Src = Common & {
        src: string;
    };
}

export function createUseInsertScriptTags() {
    let areScriptsInserted = false;

    function useInsertScriptTags(params: { scriptTags: ScriptTag[] }) {
        const { scriptTags } = params;

        const currentScriptTagsRef = useConst(() => ({ "current": scriptTags }));

        currentScriptTagsRef.current = scriptTags;

        const insertScriptTags = useCallback(() => {
            {
                const getFingerprint = (scriptTags: ScriptTag[]) =>
                    scriptTags
                        .map((scriptTag): string => {
                            if ("textContent" in scriptTag) {
                                return scriptTag.textContent;
                            }
                            if ("src" in scriptTag) {
                                return scriptTag.src;
                            }
                            assert(false);
                        })
                        .join("---");

                if (getFingerprint(scriptTags) !== getFingerprint(currentScriptTagsRef.current)) {
                    // NOTE: This is for when the scripts imported in the Template have changed switching
                    // from one page to another in storybook.
                    window.location.reload();

                    return;
                }
            }

            if (areScriptsInserted) {
                return;
            }

            scriptTags.forEach(scriptTag => {
                // NOTE: Avoid loading same script twice. (Like jQuery for example)
                {
                    const scripts = document.getElementsByTagName("script");
                    for (let i = 0; i < scripts.length; i++) {
                        const script = scripts[i];
                        if ("textContent" in scriptTag) {
                            if (script.textContent === scriptTag.textContent) {
                                return;
                            }
                            continue;
                        }
                        if ("src" in scriptTag) {
                            if (script.getAttribute("src") === scriptTag.src) {
                                return;
                            }
                            continue;
                        }
                        assert(false);
                    }
                }

                const htmlElement = document.createElement("script");

                htmlElement.type = scriptTag.type;

                (() => {
                    if ("textContent" in scriptTag) {
                        htmlElement.textContent = scriptTag.textContent;
                        return;
                    }
                    if ("src" in scriptTag) {
                        htmlElement.src = scriptTag.src;
                        return;
                    }
                    assert(false);
                })();

                document.head.appendChild(htmlElement);
            });

            areScriptsInserted = true;
        }, []);

        return { insertScriptTags };
    }

    return { useInsertScriptTags };
}
