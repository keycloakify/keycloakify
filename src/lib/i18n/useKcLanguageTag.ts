
import { createUseGlobalState } from "powerhooks";
import { getKcContext } from "../getKcContext";
import { getBestMatchAmongKcLanguageTag } from "./KcLanguageTag";

const { kcContext } = getKcContext();

//export const { useKcLanguageTag, evtKcLanguageTag } = createUseGlobalState(
const wrap = createUseGlobalState(
    "kcLanguageTag",
    () => getBestMatchAmongKcLanguageTag(
        kcContext?.locale?.current ??
        navigator.language
    ),
    { "persistance": "localStorage" }
);

export const { useKcLanguageTag } = wrap;

export function getEvtKcLanguage() {
    return wrap.evtKcLanguageTag;
}



