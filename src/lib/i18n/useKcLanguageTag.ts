
import { createUseGlobalState } from "powerhooks";
import { kcContext } from "../kcContext";
import { getBestMatchAmongKcLanguageTag } from "./KcLanguageTag";

export const { useKcLanguageTag } = createUseGlobalState(
    "kcLanguageTag",
    () => getBestMatchAmongKcLanguageTag(
        kcContext?.locale?.current ??
        navigator.language
    ),
    { "persistance": "cookie" }
);
