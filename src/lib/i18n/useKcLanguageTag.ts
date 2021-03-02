
import { createUseGlobalState } from "powerhooks";
import { kcContext } from "../kcContext";
import { getBestMatchAmongKcLanguageTag } from "./KcLanguageTag";

export const { useKcLanguageTag } = createUseGlobalState(
    "kcLanguageTag",
    () => getBestMatchAmongKcLanguageTag(
        kcContext?.locale?.["current" as never] ??
        navigator.language
    ),
    { "persistance": "cookies" }
);
