import {
    createThemeProvider,
    defaultGetTypographyDesc
} from "onyxia-ui";
import { createMakeStyles } from "tss-react";
import { createLanguageSelect } from "onyxia-ui/LanguageSelect";
import type { Language } from "i18n";
import { createText } from "onyxia-ui/Text";
import { createButton } from "onyxia-ui/Button";
import { createIcon } from "onyxia-ui/Icon";
import { francePalette } from "onyxia-ui";
//import { ultravioletPalette } from "onyxia-ui";

export const { ThemeProvider, useTheme } = createThemeProvider({
    "getTypographyDesc": params => ({
        ...defaultGetTypographyDesc(params),
        "fontFamily": 'Marianne, sans-serif',
    }),
    "palette": francePalette
});

export const { makeStyles } = createMakeStyles({ useTheme });

export const { Text } = createText({ useTheme });

const { Icon } = createIcon({});

export const { Button } = createButton({ Icon });

export const { LanguageSelect } = createLanguageSelect<Language>({
    "languagesPrettyPrint": {
        "en": "English",
        "fr": "Français",
        "zh-CN": "简体中文"
    }
});