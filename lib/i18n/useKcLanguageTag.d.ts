import type { StatefulEvt } from "powerhooks";
import { KcLanguageTag } from "./KcLanguageTag";
export declare const useKcLanguageTag: () => import("powerhooks").UseNamedStateReturnType<
    "tr" | "no" | "en" | "fr" | "ca" | "cs" | "da" | "de" | "es" | "hu" | "it" | "ja" | "lt" | "nl" | "pl" | "pt-BR" | "ru" | "sk" | "sv" | "zh-CN",
    "kcLanguageTag"
>;
export declare function getEvtKcLanguage(): StatefulEvt<KcLanguageTag>;
