import { useEffect, useState } from "react";
import { createGetI18n, type GenericI18n_noJsx, type KcContextLike, type MessageKey_defaultSet } from "./i18n";
import { GenericI18n } from "./GenericI18n";
import { Reflect } from "tsafe/Reflect";

export function createUseI18n<MessageKey_themeDefined extends string = never>(messagesByLanguageTag: {
    [languageTag: string]: { [key in MessageKey_themeDefined]: string };
}) {
    type MessageKey = MessageKey_defaultSet | MessageKey_themeDefined;

    type I18n = GenericI18n<MessageKey>;

    const { withJsx } = (() => {
        const cache = new WeakMap<GenericI18n_noJsx<MessageKey>, GenericI18n<MessageKey>>();

        function renderHtmlString(htmlString: string): JSX.Element {
            return (
                <div
                    style={{ display: "inline-block" }}
                    dangerouslySetInnerHTML={{
                        __html: htmlString
                    }}
                />
            );
        }

        function withJsx(i18n_noJsx: GenericI18n_noJsx<MessageKey>): I18n {
            use_cache: {
                const i18n = cache.get(i18n_noJsx);

                if (i18n === undefined) {
                    break use_cache;
                }

                return i18n;
            }

            const i18n: I18n = {
                ...i18n_noJsx,
                msg: (...args) => renderHtmlString(i18n_noJsx.msgStr(...args)),
                advancedMsg: (...args) => renderHtmlString(i18n_noJsx.advancedMsgStr(...args))
            };

            cache.set(i18n_noJsx, i18n);

            return i18n;
        }

        return { withJsx };
    })();

    const { getI18n } = createGetI18n(messagesByLanguageTag);

    function useI18n(params: { kcContext: KcContextLike }): { i18n: I18n } {
        const { kcContext } = params;

        const { i18n, prI18n_currentLanguage } = getI18n({ kcContext });

        const [i18n_toReturn, setI18n_toReturn] = useState<I18n>(withJsx(i18n));

        useEffect(() => {
            let isActive = true;

            prI18n_currentLanguage?.then(i18n => {
                if (!isActive) {
                    return;
                }

                setI18n_toReturn(withJsx(i18n));
            });

            return () => {
                isActive = false;
            };
        }, []);

        return { i18n: i18n_toReturn };
    }

    return { useI18n, ofTypeI18n: Reflect<I18n>() };
}
