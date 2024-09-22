Hello GPT,

So, I'm using recast in a node script to parse a typescript source file and extract the part that I'm intrested in.

Example of the source file:

```ts
import { createUseI18n } from "keycloakify/login";

export const { useI18n, ofTypeI18n } = createUseI18n({
    en: {
        myCustomMessage: "My custom message"
    },
    fr: {
        myCustomMessage: "Mon message personnalisé"
    }
});

export type I18n = typeof ofTypeI18n;
```

The string that I want to extract from this source file is:

```raw
{
    en: {
        myCustomMessage: "My custom message"
    },
    fr: {
        myCustomMessage: "Mon message personnalisé"
    }
}
```

This is my script:

```ts
const root = recast.parse(fs.readFileSync(i18nTsFilePath).toString("utf8"), {
    parser: {
        parse: (code: string) =>
            babelParser.parse(code, {
                sourceType: "module",
                plugins: ["typescript"]
            }),
        generator: babelGenerate,
        types: babelTypes
    }
});

let messageBundleDeclarationTsCode: string | undefined = undefined;

recast.visit(root, {
    visitCallExpression: function (path) {
        if (
            path.node.callee.type === "Identifier" &&
            path.node.callee.name === "createUseI18n"
        ) {
            messageBundleDeclarationTsCode = babelGenerate(
                path.node.arguments[0] as any
            ).code;
            return false;
        }

        this.traverse(path);
    }
});

// Here messageBundleDeclarationTsCode contains the string I want
```

It works, but now, the API has changed. The source file looks like this:

```ts
import { i18nBuilder } from "keycloakify/login/i18n";

const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<"my-theme-1" | "my-theme-2">()
    .withCustomTranslations({
        en: {
            myCustomMessage: "My custom message"
        },
        fr: {
            myCustomMessage: "Mon message personnalisé"
        }
    })
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
```

Can you modify the script to extract the string taking into account the change that have been made to the source file?
(I need to extract the argument that is passed to the `withCustomTranslations` method)
