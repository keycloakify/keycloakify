import * as fs from "fs";
import {
    join as pathJoin,
    relative as pathRelative,
    dirname as pathDirname,
    sep as pathSep
} from "path";
import { assert, type Equals } from "tsafe/assert";
import { same } from "evt/tools/inDepth";
import { crawl } from "../src/bin/tools/crawl";
import { downloadKeycloakDefaultTheme } from "./shared/downloadKeycloakDefaultTheme";
import { getThisCodebaseRootDirPath } from "../src/bin/tools/getThisCodebaseRootDirPath";
import { deepAssign } from "../src/tools/deepAssign";
import { THEME_TYPES } from "../src/bin/shared/constants";
import { transformCodebase } from "../src/bin/tools/transformCodebase";
import propertiesParser from "properties-parser";

if (require.main === module) {
    generateI18nMessages();
}

async function generateI18nMessages() {
    const thisCodebaseRootDirPath = getThisCodebaseRootDirPath();

    const accountI18nDirPath = pathJoin(
        thisCodebaseRootDirPath,
        "src",
        "account",
        "i18n"
    );

    if (fs.existsSync(accountI18nDirPath)) {
        fs.rmSync(accountI18nDirPath, { recursive: true });
    }

    type Dictionary = { [idiomId: string]: string };

    const record: { [themeType: string]: { [language: string]: Dictionary } } = {};

    for (const themeType of THEME_TYPES) {
        const { extractedDirPath } = await downloadKeycloakDefaultTheme({
            keycloakVersionId: (() => {
                switch (themeType) {
                    case "login":
                        return "FOR_LOGIN_THEME";
                    case "account":
                        return "FOR_ACCOUNT_MULTI_PAGE";
                }
                assert<Equals<typeof themeType, never>>();
            })()
        });

        {
            const baseThemeDirPath = pathJoin(extractedDirPath, "base");
            const re = new RegExp(
                `^([^\\${pathSep}]+)\\${pathSep}messages\\${pathSep}messages_([^.]+).properties$`
            );

            crawl({
                dirPath: baseThemeDirPath,
                returnedPathsType: "relative to dirPath"
            }).forEach(filePath => {
                const match = filePath.match(re);

                if (match === null) {
                    return;
                }

                const [, themeType_here, language] = match;

                if (themeType_here !== themeType) {
                    return;
                }

                (record[themeType] ??= {})[language.replace(/_/g, "-")] =
                    Object.fromEntries(
                        Object.entries(
                            propertiesParser.parse(
                                fs
                                    .readFileSync(pathJoin(baseThemeDirPath, filePath))
                                    .toString("utf8")
                            ) as Record<string, string>
                        )
                            .map(([key, value]) => [key, value.replace(/''/g, "'")])
                            .map(([key, value]) => [
                                key === "locale_pt_BR" ? "locale_pt-BR" : key,
                                value
                            ])
                            .map(([key, value]) => [
                                key,
                                key === "termsText" ? "" : value
                            ])
                    );
            });
        }

        const recordForThemeType = record[themeType];

        const languages = Object.keys(recordForThemeType);

        const keycloakifyExtraMessages = (() => {
            switch (themeType) {
                case "login":
                    return keycloakifyExtraMessages_login;
                case "account":
                    return keycloakifyExtraMessages_account;
            }
            assert(false);
        })();

        /* Migration helper

        console.log({ themeType });

        {

            const all = new Set<string>();

            languages.forEach(languages => all.add(languages));
            const currentlySupportedLanguages = Object.keys(keycloakifyExtraMessages);
            currentlySupportedLanguages.forEach(languages => all.add(languages));

            all.forEach(language => {
                console.log([
                    `"${language}": `,
                    `isInLanguages: ${languages.includes(language)}`,
                    `isInKeycloakifyExtraMessages: ${currentlySupportedLanguages.includes(language)}`
                ].join(" "))
            });

        }
        */

        assert(
            same(languages, Object.keys(keycloakifyExtraMessages), {
                takeIntoAccountArraysOrdering: false
            })
        );

        deepAssign({
            target: recordForThemeType,
            source: keycloakifyExtraMessages
        });

        const messagesDirPath = pathJoin(
            thisCodebaseRootDirPath,
            "src",
            themeType,
            "i18n",
            "messages_defaultSet"
        );

        if (!fs.existsSync(messagesDirPath)) {
            fs.mkdirSync(messagesDirPath, { recursive: true });
        }

        fs.writeFileSync(
            pathJoin(messagesDirPath, "types.ts"),
            Buffer.from(
                [
                    ``,
                    `export const languageTags = ${JSON.stringify(languages, null, 2)} as const;`,
                    ``,
                    `export type LanguageTag = typeof languageTags[number];`,
                    ``,
                    `export type MessageKey = keyof typeof import("./en")["default"];`,
                    ``
                ].join("\n"),
                "utf8"
            )
        );

        const generatedFileHeader = [
            `//This code was automatically generated by running ${pathRelative(
                thisCodebaseRootDirPath,
                __filename
            )}`,
            "//PLEASE DO NOT EDIT MANUALLY"
        ].join("\n");

        languages.forEach(language => {
            const filePath = pathJoin(messagesDirPath, `${language}.ts`);

            fs.mkdirSync(pathDirname(filePath), { recursive: true });

            fs.writeFileSync(
                filePath,
                Buffer.from(
                    [
                        generatedFileHeader,
                        "",
                        "/* spell-checker: disable */",
                        `const messages= ${JSON.stringify(
                            recordForThemeType[language],
                            null,
                            2
                        )};`,
                        "",
                        "export default messages;",
                        "/* spell-checker: enable */"
                    ].join("\n"),
                    "utf8"
                )
            );

            //console.log(`${filePath} wrote`);
        });

        fs.writeFileSync(
            pathJoin(messagesDirPath, "index.ts"),
            Buffer.from(
                [
                    generatedFileHeader,
                    `import * as en from "./en";`,
                    "",
                    "export async function fetchMessages_defaultSet(currentLanguageTag: string) {",
                    "    const { default: messages_defaultSet } = await (() => {",
                    "        switch (currentLanguageTag) {",
                    `            case "en": return en;`,
                    ...languages
                        .filter(language => language !== "en")
                        .map(
                            language =>
                                `            case "${language}": return import("./${language}");`
                        ),
                    '            default: return { "default": {} };',
                    "        }",
                    "    })();",
                    "    return messages_defaultSet;",
                    "}"
                ].join("\n"),
                "utf8"
            )
        );
    }

    transformCodebase({
        srcDirPath: pathJoin(thisCodebaseRootDirPath, "src", "login", "i18n"),
        destDirPath: accountI18nDirPath,
        transformSourceCode: ({ fileRelativePath, sourceCode }) => {
            if (fileRelativePath.startsWith("messages_defaultSet")) {
                return undefined;
            }

            return { modifiedSourceCode: sourceCode };
        }
    });
}

const keycloakifyExtraMessages_login: Record<
    | "en"
    | "ar"
    | "ca"
    | "cs"
    | "da"
    | "de"
    | "el"
    | "es"
    | "fa"
    | "fi"
    | "fr"
    | "hu"
    | "it"
    | "ja"
    | "lt"
    | "lv"
    | "nl"
    | "no"
    | "pl"
    | "pt"
    | "pt-BR"
    | "ru"
    | "sk"
    | "sv"
    | "th"
    | "tr"
    | "uk"
    | "ka"
    | "zh-CN"
    | "zh-TW",
    Record<
        | "shouldBeEqual"
        | "shouldBeDifferent"
        | "shouldMatchPattern"
        | "mustBeAnInteger"
        | "notAValidOption"
        | "selectAnOption"
        | "remove"
        | "addValue"
        | "languages",
        string
    >
> = {
    en: {
        shouldBeEqual: "{0} should be equal to {1}",
        shouldBeDifferent: "{0} should be different to {1}",
        shouldMatchPattern: "Pattern should match: `/{0}/`",
        mustBeAnInteger: "Must be an integer",
        notAValidOption: "Not a valid option",
        selectAnOption: "Select an option",
        remove: "Remove",
        addValue: "Add value",
        languages: "Languages"
    },
    /* spell-checker: disable */
    ar: {
        shouldBeEqual: "{0} يجب أن يكون مساويًا لـ {1}",
        shouldBeDifferent: "{0} يجب أن يكون مختلفًا عن {1}",
        shouldMatchPattern: "`/يجب أن يطابق النمط: `/{0}/",
        mustBeAnInteger: "يجب أن يكون عددًا صحيحًا",
        notAValidOption: "ليس خيارًا صالحًا",
        selectAnOption: "اختر خيارًا",
        remove: "إزالة",
        addValue: "أضف قيمة",
        languages: "اللغات"
    },
    ca: {
        shouldBeEqual: "{0} hauria de ser igual a {1}",
        shouldBeDifferent: "{0} hauria de ser diferent de {1}",
        shouldMatchPattern: "El patró hauria de coincidir: `/{0}/`",
        mustBeAnInteger: "Ha de ser un enter",
        notAValidOption: "No és una opció vàlida",
        selectAnOption: "Selecciona una opció",
        remove: "Elimina",
        addValue: "Afegeix valor",
        languages: "Idiomes"
    },
    cs: {
        shouldBeEqual: "{0} by měl být roven {1}",
        shouldBeDifferent: "{0} by měl být odlišný od {1}",
        shouldMatchPattern: "Vzor by měl odpovídat: `/{0}/`",
        mustBeAnInteger: "Musí být celé číslo",
        notAValidOption: "Není platná možnost",
        selectAnOption: "Vyberte možnost",
        remove: "Odstranit",
        addValue: "Přidat hodnotu",
        languages: "Jazyky"
    },
    da: {
        shouldBeEqual: "{0} bør være lig med {1}",
        shouldBeDifferent: "{0} bør være forskellig fra {1}",
        shouldMatchPattern: "Mønsteret bør matche: `/{0}/`",
        mustBeAnInteger: "Skal være et heltal",
        notAValidOption: "Ikke en gyldig mulighed",
        selectAnOption: "Vælg en mulighed",
        remove: "Fjern",
        addValue: "Tilføj værdi",
        languages: "Sprog"
    },
    de: {
        shouldBeEqual: "{0} sollte gleich {1} sein",
        shouldBeDifferent: "{0} sollte sich von {1} unterscheiden",
        shouldMatchPattern: "Muster sollte übereinstimmen: `/{0}/`",
        mustBeAnInteger: "Muss eine ganze Zahl sein",
        notAValidOption: "Keine gültige Option",
        selectAnOption: "Wählen Sie eine Option",
        remove: "Entfernen",
        addValue: "Wert hinzufügen",
        languages: "Sprachen"
    },
    el: {
        shouldBeEqual: "Το {0} πρέπει να είναι ίσο με {1}",
        shouldBeDifferent: "Το {0} πρέπει να διαφέρει από το {1}",
        shouldMatchPattern: "Το πρότυπο πρέπει να ταιριάζει: `/{0}/`",
        mustBeAnInteger: "Πρέπει να είναι ακέραιος",
        notAValidOption: "Δεν είναι μια έγκυρη επιλογή",
        selectAnOption: "Επιλέξτε μια επιλογή",
        remove: "Αφαίρεση",
        addValue: "Προσθήκη τιμής",
        languages: "Γλώσσες"
    },
    es: {
        shouldBeEqual: "{0} debería ser igual a {1}",
        shouldBeDifferent: "{0} debería ser diferente a {1}",
        shouldMatchPattern: "El patrón debería coincidir: `/{0}/`",
        mustBeAnInteger: "Debe ser un número entero",
        notAValidOption: "No es una opción válida",
        selectAnOption: "Selecciona una opción",
        remove: "Eliminar",
        addValue: "Añadir valor",
        languages: "Idiomas"
    },
    fa: {
        shouldBeEqual: "{0} باید برابر باشد با {1}",
        shouldBeDifferent: "{0} باید متفاوت باشد از {1}",
        shouldMatchPattern: "الگو باید مطابقت داشته باشد: `/{0}/`",
        mustBeAnInteger: "باید یک عدد صحیح باشد",
        notAValidOption: "یک گزینه معتبر نیست",
        selectAnOption: "یک گزینه انتخاب کنید",
        remove: "حذف",
        addValue: "افزودن مقدار",
        languages: "زبان‌ها"
    },
    fi: {
        shouldBeEqual: "{0} pitäisi olla yhtä suuri kuin {1}",
        shouldBeDifferent: "{0} pitäisi olla erilainen kuin {1}",
        shouldMatchPattern: "Mallin tulisi vastata: `/{0}/`",
        mustBeAnInteger: "On oltava kokonaisluku",
        notAValidOption: "Ei ole kelvollinen vaihtoehto",
        selectAnOption: "Valitse vaihtoehto",
        remove: "Poista",
        addValue: "Lisää arvo",
        languages: "Kielet"
    },
    fr: {
        shouldBeEqual: "{0} devrait être égal à {1}",
        shouldBeDifferent: "{0} devrait être différent de {1}",
        shouldMatchPattern: "Le motif devrait correspondre: `/{0}/`",
        mustBeAnInteger: "Doit être un entier",
        notAValidOption: "Pas une option valide",
        selectAnOption: "Sélectionnez une option",
        remove: "Supprimer",
        addValue: "Ajouter une valeur",
        languages: "Langues"
    },
    hu: {
        shouldBeEqual: "{0} egyenlő kell legyen {1}-vel",
        shouldBeDifferent: "{0} különbözőnek kell lennie, mint {1}",
        shouldMatchPattern: "A mintának egyeznie kell: `/{0}/`",
        mustBeAnInteger: "Egész számnak kell lennie",
        notAValidOption: "Nem érvényes opció",
        selectAnOption: "Válasszon egy lehetőséget",
        remove: "Eltávolítás",
        addValue: "Érték hozzáadása",
        languages: "Nyelvek"
    },
    it: {
        shouldBeEqual: "{0} dovrebbe essere uguale a {1}",
        shouldBeDifferent: "{0} dovrebbe essere diverso da {1}",
        shouldMatchPattern: "Il modello dovrebbe corrispondere: `/{0}/`",
        mustBeAnInteger: "Deve essere un numero intero",
        notAValidOption: "Non è un'opzione valida",
        selectAnOption: "Seleziona un'opzione",
        remove: "Rimuovi",
        addValue: "Aggiungi valore",
        languages: "Lingue"
    },
    ja: {
        shouldBeEqual: "{0} は {1} と等しい必要があります",
        shouldBeDifferent: "{0} は {1} と異なる必要があります",
        shouldMatchPattern: "パターンは一致する必要があります: `/{0}/`",
        mustBeAnInteger: "整数である必要があります",
        notAValidOption: "有効なオプションではありません",
        selectAnOption: "オプションを選択",
        remove: "削除",
        addValue: "値を追加",
        languages: "言語"
    },
    lt: {
        shouldBeEqual: "{0} turėtų būti lygus {1}",
        shouldBeDifferent: "{0} turėtų skirtis nuo {1}",
        shouldMatchPattern: "Šablonas turėtų atitikti: `/{0}/`",
        mustBeAnInteger: "Turi būti sveikasis skaičius",
        notAValidOption: "Netinkama parinktis",
        selectAnOption: "Pasirinkite parinktį",
        remove: "Pašalinti",
        addValue: "Pridėti reikšmę",
        languages: "Kalbos"
    },
    lv: {
        shouldBeEqual: "{0} jābūt vienādam ar {1}",
        shouldBeDifferent: "{0} jābūt atšķirīgam no {1}",
        shouldMatchPattern: "Mustrim jāsakrīt: `/{0}/`",
        mustBeAnInteger: "Jābūt veselam skaitlim",
        notAValidOption: "Nav derīga opcija",
        selectAnOption: "Izvēlieties opciju",
        remove: "Noņemt",
        addValue: "Pievienot vērtību",
        languages: "Valodas"
    },
    nl: {
        shouldBeEqual: "{0} moet gelijk zijn aan {1}",
        shouldBeDifferent: "{0} moet verschillen van {1}",
        shouldMatchPattern: "Patroon moet overeenkomen: `/{0}/`",
        mustBeAnInteger: "Moet een geheel getal zijn",
        notAValidOption: "Geen geldige optie",
        selectAnOption: "Selecteer een optie",
        remove: "Verwijderen",
        addValue: "Waarde toevoegen",
        languages: "Talen"
    },
    no: {
        shouldBeEqual: "{0} skal være lik {1}",
        shouldBeDifferent: "{0} skal være forskjellig fra {1}",
        shouldMatchPattern: "Mønsteret skal matche: `/{0}/`",
        mustBeAnInteger: "Må være et heltall",
        notAValidOption: "Ikke et gyldig alternativ",
        selectAnOption: "Velg et alternativ",
        remove: "Fjern",
        addValue: "Legg til verdi",
        languages: "Språk"
    },
    pl: {
        shouldBeEqual: "{0} powinno być równe {1}",
        shouldBeDifferent: "{0} powinno być różne od {1}",
        shouldMatchPattern: "Wzór pow inien pasować: `/{0}/`",
        mustBeAnInteger: "Musi być liczbą całkowitą",
        notAValidOption: "Nieprawidłowa opcja",
        selectAnOption: "Wybierz opcję",
        remove: "Usuń",
        addValue: "Dodaj wartość",
        languages: "Języki"
    },
    pt: {
        shouldBeEqual: "{0} deve ser igual a {1}",
        shouldBeDifferent: "{0} deve ser diferente de {1}",
        shouldMatchPattern: "O padrão deve corresponder: `/{0}/`",
        mustBeAnInteger: "Deve ser um número inteiro",
        notAValidOption: "Não é uma opção válida",
        selectAnOption: "Selecione uma opção",
        remove: "Remover",
        addValue: "Adicionar valor",
        languages: "Idiomas"
    },
    "pt-BR": {
        shouldBeEqual: "{0} deve ser igual a {1}",
        shouldBeDifferent: "{0} deve ser diferente de {1}",
        shouldMatchPattern: "O padrão deve corresponder: `/{0}/`",
        mustBeAnInteger: "Deve ser um número inteiro",
        notAValidOption: "Não é uma opção válida",
        selectAnOption: "Selecione uma opção",
        remove: "Remover",
        addValue: "Adicionar valor",
        languages: "Idiomas"
    },
    ru: {
        shouldBeEqual: "{0} должно быть равно {1}",
        shouldBeDifferent: "{0} должно отличаться от {1}",
        shouldMatchPattern: "Шаблон должен соответствовать: `/{0}/`",
        mustBeAnInteger: "Должно быть целым числом",
        notAValidOption: "Недопустимый вариант",
        selectAnOption: "Выберите вариант",
        remove: "Удалить",
        addValue: "Добавить значение",
        languages: "Языки"
    },
    sk: {
        shouldBeEqual: "{0} by mal byť rovnaký ako {1}",
        shouldBeDifferent: "{0} by mal byť odlišný od {1}",
        shouldMatchPattern: "Vzor by mal zodpovedať: `/{0}/`",
        mustBeAnInteger: "Musí byť celé číslo",
        notAValidOption: "Nie je platná možnosť",
        selectAnOption: "Vyberte možnosť",
        remove: "Odstrániť",
        addValue: "Pridať hodnotu",
        languages: "Jazyky"
    },
    sv: {
        shouldBeEqual: "{0} bör vara lika med {1}",
        shouldBeDifferent: "{0} bör vara annorlunda än {1}",
        shouldMatchPattern: "Mönstret bör matcha: `/{0}/`",
        mustBeAnInteger: "Måste vara ett heltal",
        notAValidOption: "Inte ett giltigt alternativ",
        selectAnOption: "Välj ett alternativ",
        remove: "Ta bort",
        addValue: "Lägg till värde",
        languages: "Språk"
    },
    th: {
        shouldBeEqual: "{0} ควรเท่ากับ {1}",
        shouldBeDifferent: "{0} ควรแตกต่างจาก {1}",
        shouldMatchPattern: "รูปแบบควรตรงกับ: `/{0}/`",
        mustBeAnInteger: "ต้องเป็นจำนวนเต็ม",
        notAValidOption: "ไม่ใช่ตัวเลือกที่ถูกต้อง",
        selectAnOption: "เลือกตัวเลือก",
        remove: "ลบ",
        addValue: "เพิ่มค่า",
        languages: "ภาษา"
    },
    tr: {
        shouldBeEqual: "{0} {1} eşit olmalıdır",
        shouldBeDifferent: "{0} {1} farklı olmalıdır",
        shouldMatchPattern: "Desen eşleşmelidir: `/{0}/`",
        mustBeAnInteger: "Tam sayı olmalıdır",
        notAValidOption: "Geçerli bir seçenek değil",
        selectAnOption: "Bir seçenek seçin",
        remove: "Kaldır",
        addValue: "Değer ekle",
        languages: "Diller"
    },
    uk: {
        shouldBeEqual: "{0} повинно бути рівним {1}",
        shouldBeDifferent: "{0} повинно відрізнятися від {1}",
        shouldMatchPattern: "Шаблон повинен відповідати: `/{0}/`",
        mustBeAnInteger: "Повинно бути цілим числом",
        notAValidOption: "Не є дійсною опцією",
        selectAnOption: "Виберіть опцію",
        remove: "Видалити",
        addValue: "Додати значення",
        languages: "Мови"
    },
    ka: {
        shouldBeEqual: "{0} უნდა იყოს ტოლი {1}-სთვის",
        shouldBeDifferent: "{0} უნდა იყოს სხვა {1}-სთვის",
        shouldMatchPattern: "შაბლონს უნდა ემთხვევა: `/{0}/`",
        mustBeAnInteger: "უნდა იყოს მთელი რიცხვი",
        notAValidOption: "არასწორი ვარიანტი",
        selectAnOption: "აირჩიეთ ვარიანტი",
        remove: "წაშალეთ",
        addValue: "დაამატეთ მნიშვნელობა",
        languages: "ენები"
    },
    "zh-CN": {
        shouldBeEqual: "{0} 应该等于 {1}",
        shouldBeDifferent: "{0} 应该不同于 {1}",
        shouldMatchPattern: "模式应匹配: `/{0}/`",
        mustBeAnInteger: "必须是整数",
        notAValidOption: "不是有效选项",
        selectAnOption: "选择一个选项",
        remove: "移除",
        addValue: "添加值",
        languages: "语言"
    },
    "zh-TW": {
        shouldBeEqual: "{0} 應該等於 {1}",
        shouldBeDifferent: "{0} 應該不同於 {1}",
        shouldMatchPattern: "模式應匹配: `/{0}/`",
        mustBeAnInteger: "必須是整數",
        notAValidOption: "不是有效選項",
        selectAnOption: "選擇一個選項",
        remove: "移除",
        addValue: "添加值",
        languages: "語言"
    }
    /* spell-checker: enable */
};

export const accountMultiPageSupportedLanguages = [
    "en",
    "ar",
    "ca",
    "cs",
    "da",
    "de",
    "es",
    "fi",
    "fr",
    "hu",
    "it",
    "ja",
    "lt",
    "lv",
    "nl",
    "no",
    "pl",
    "pt-BR",
    "ru",
    "sk",
    "sv",
    "tr",
    "zh-CN"
] as const;

const keycloakifyExtraMessages_account: Record<
    (typeof accountMultiPageSupportedLanguages)[number],
    Record<"newPasswordSameAsOld" | "passwordConfirmNotMatch", string>
> = {
    en: {
        newPasswordSameAsOld: "New password must be different from the old one",
        passwordConfirmNotMatch: "Password confirmation does not match"
    },
    /* spell-checker: disable */
    ar: {
        newPasswordSameAsOld: "يجب أن تكون كلمة المرور الجديدة مختلفة عن القديمة",
        passwordConfirmNotMatch: "تأكيد كلمة المرور لا يتطابق"
    },
    ca: {
        newPasswordSameAsOld: "La nova contrasenya ha de ser diferent de l'anterior",
        passwordConfirmNotMatch: "La confirmació de la contrasenya no coincideix"
    },
    cs: {
        newPasswordSameAsOld: "Nové heslo musí být odlišné od starého",
        passwordConfirmNotMatch: "Potvrzení hesla se neshoduje"
    },
    da: {
        newPasswordSameAsOld: "Det nye kodeord skal være forskelligt fra det gamle",
        passwordConfirmNotMatch: "Adgangskodebekræftelse matcher ikke"
    },
    de: {
        newPasswordSameAsOld: "Das neue Passwort muss sich vom alten unterscheiden",
        passwordConfirmNotMatch: "Passwortbestätigung stimmt nicht überein"
    },
    es: {
        newPasswordSameAsOld: "La nueva contraseña debe ser diferente de la anterior",
        passwordConfirmNotMatch: "La confirmación de la contraseña no coincide"
    },
    fi: {
        newPasswordSameAsOld: "Uusi salasana on oltava erilainen kuin vanha",
        passwordConfirmNotMatch: "Salasanan vahvistus ei täsmää"
    },
    fr: {
        newPasswordSameAsOld: "Le nouveau mot de passe doit être différent de l'ancien",
        passwordConfirmNotMatch: "La confirmation du mot de passe ne correspond pas"
    },
    hu: {
        newPasswordSameAsOld: "Az új jelszónak különböznie kell az előzőtől",
        passwordConfirmNotMatch: "A jelszó megerősítése nem egyezik"
    },
    it: {
        newPasswordSameAsOld:
            "La nuova password deve essere diversa da quella precedente",
        passwordConfirmNotMatch: "La conferma della password non corrisponde"
    },
    ja: {
        newPasswordSameAsOld: "新しいパスワードは古いパスワードと異なる必要があります",
        passwordConfirmNotMatch: "パスワード確認が一致しません"
    },
    lt: {
        newPasswordSameAsOld: "Naujas slaptažodis turi skirtis nuo seno",
        passwordConfirmNotMatch: "Slaptažodžio patvirtinimas neatitinka"
    },
    lv: {
        newPasswordSameAsOld: "Jaunajam parolam jābūt atšķirīgam no vecā",
        passwordConfirmNotMatch: "Paroles apstiprināšana neatbilst"
    },
    nl: {
        newPasswordSameAsOld: "Het nieuwe wachtwoord moet verschillend zijn van het oude",
        passwordConfirmNotMatch: "Wachtwoordbevestiging komt niet overeen"
    },
    no: {
        newPasswordSameAsOld: "Det nye passordet må være forskjellig fra det gamle",
        passwordConfirmNotMatch: "Passordbekreftelsen stemmer ikke"
    },
    pl: {
        newPasswordSameAsOld: "Nowe hasło musi być inne niż stare",
        passwordConfirmNotMatch: "Potwierdzenie hasła nie pasuje"
    },
    "pt-BR": {
        newPasswordSameAsOld: "A nova senha deve ser diferente da antiga",
        passwordConfirmNotMatch: "A confirmação da senha não corresponde"
    },
    ru: {
        newPasswordSameAsOld: "Новый пароль должен отличаться от старого",
        passwordConfirmNotMatch: "Подтверждение пароля не совпадает"
    },
    sk: {
        newPasswordSameAsOld: "Nové heslo musí byť odlišné od starého",
        passwordConfirmNotMatch: "Potvrdenie hesla sa nezhoduje"
    },
    sv: {
        newPasswordSameAsOld: "Det nya lösenordet måste skilja sig från det gamla",
        passwordConfirmNotMatch: "Lösenordsbekräftelsen matchar inte"
    },
    tr: {
        newPasswordSameAsOld: "Yeni şifre eskisinden farklı olmalıdır",
        passwordConfirmNotMatch: "Şifre doğrulama eşleşmiyor"
    },
    "zh-CN": {
        newPasswordSameAsOld: "新密码必须与旧密码不同",
        passwordConfirmNotMatch: "密码确认不匹配"
    }
    /* spell-checker: enable */
};
