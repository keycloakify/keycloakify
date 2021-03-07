
import { createUseGlobalState } from "powerhooks";
import { kcContext } from "../KcContext";
import { getBestMatchAmongKcLanguageTag } from "./KcLanguageTag";

//export const { useKcLanguageTag, evtKcLanguageTag } = createUseGlobalState(
const wrap = createUseGlobalState(
    "kcLanguageTag",
    () => getBestMatchAmongKcLanguageTag(
        kcContext?.locale?.current ??
        navigator.language
    ),
    { "persistance": "cookie" }
);

export const { useKcLanguageTag } = wrap;

export function getEvtKcLanguage() {
    return wrap.evtKcLanguageTag;
}



