
import { createUseGlobalState } from "powerhooks";
import { kcContext } from "../kcContext";
import { getBestMatchAmongKcLanguageTag } from "./KcLanguageTag";
import { assert } from "evt/tools/typeSafety/assert";

export const { useKcLanguageTag } = createUseGlobalState(
    "kcLanguageTag",
    () => getBestMatchAmongKcLanguageTag((
        assert(kcContext !== undefined, "Page not served by KeyCloak"),
        kcContext.locale?.["current" as never] ??
        navigator.language
    )),
    { "persistance": "cookies" }
);
