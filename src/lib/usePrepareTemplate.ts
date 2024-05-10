import { useEffect } from "react";
import { assert } from "tsafe/assert";
import { createUseInsertScriptTags, type ScriptTag } from "keycloakify/tools/useInsertScriptTags";
import { createUseInsertLinkTags } from "keycloakify/tools/useInsertLinkTags";
import { useSetClassName } from "keycloakify/tools/useSetClassName";

const { useInsertLinkTags } = createUseInsertLinkTags();
const { useInsertScriptTags } = createUseInsertScriptTags();

export function usePrepareTemplate(params: {
    styleSheetHrefs: string[];
    scriptTags: ScriptTag[];
    htmlClassName: string | undefined;
    bodyClassName: string | undefined;
    htmlLangProperty: string | undefined;
    documentTitle: string | undefined;
}) {
    const { styleSheetHrefs, scriptTags, htmlClassName, bodyClassName, htmlLangProperty, documentTitle } = params;

    useEffect(() => {
        if (htmlLangProperty === undefined) {
            return;
        }

        const html = document.querySelector("html");
        assert(html !== null);
        html.lang = htmlLangProperty;
    }, [htmlLangProperty]);

    useEffect(() => {
        if (documentTitle === undefined) {
            return;
        }

        document.title = documentTitle;
    }, [documentTitle]);

    const { areAllStyleSheetsLoaded } = useInsertLinkTags({ "hrefs": styleSheetHrefs });

    const { insertScriptTags } = useInsertScriptTags({ scriptTags });

    useEffect(() => {
        if (!areAllStyleSheetsLoaded) {
            return;
        }

        insertScriptTags();
    }, [areAllStyleSheetsLoaded]);

    useSetClassName({
        "qualifiedName": "html",
        "className": htmlClassName
    });

    useSetClassName({
        "qualifiedName": "body",
        "className": bodyClassName
    });

    return { areAllStyleSheetsLoaded };
}
