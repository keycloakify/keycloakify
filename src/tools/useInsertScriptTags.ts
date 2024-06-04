import { useCallback, useState } from "react";
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

/**
 * NOTE: The component that use this hook can only be mounded once!
 * And can'r rerender with different scriptTags.
 * If it's mounted again the page will be reloaded.
 * This simulates the behavior of a server rendered page that imports javascript in the head.
 */
export function createUseInsertScriptTags() {
    let areScriptsInserted = false;

    let isFistMount = true;

    function useInsertScriptTags(params: { scriptTags: ScriptTag[] }) {
        const { scriptTags } = params;

        useState(() => {
            if (!isFistMount) {
                window.location.reload();
                return;
            }

            isFistMount = false;
        });

        const insertScriptTags = useCallback(() => {
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
