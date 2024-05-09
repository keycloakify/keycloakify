import { useEffect } from "react";

export type ScriptTag = ScriptTag.TextContent | ScriptTag.Src;

export namespace ScriptTag {
    type Common = {
        type: "text/javascript" | "module";
    };

    export type TextContent = Common & {
        isModule: boolean;
        sourceType: "textContent";
        id: string;
        textContent: string;
    };
    export type Src = Common & {
        isModule: boolean;
        sourceType: "src";
        src: string;
    };
}

// NOTE: Loaded scripts cannot be unloaded so we need to keep track of them
// to avoid loading them multiple times.
const loadedScripts = new Set<string>();

export function useInsertScriptTags(params: { scriptTags: ScriptTag[] }) {
    const { scriptTags } = params;

    useEffect(() => {
        for (const scriptTag of scriptTags) {
            const scriptId = (() => {
                switch (scriptTag.sourceType) {
                    case "src":
                        return scriptTag.src;
                    case "textContent":
                        return scriptTag.textContent;
                }
            })();

            if (loadedScripts.has(scriptId)) {
                continue;
            }

            const htmlElement = document.createElement("script");

            htmlElement.type = scriptTag.type;

            switch (scriptTag.sourceType) {
                case "src":
                    htmlElement.src = scriptTag.src;
                    break;
                case "textContent":
                    htmlElement.textContent = scriptTag.textContent;
                    break;
            }

            document.head.appendChild(htmlElement);

            loadedScripts.add(scriptId);
        }
    });
}
