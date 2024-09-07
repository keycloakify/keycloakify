import { generateI18nMessages } from "./generateI18nMessages";
import { createAccountV1Dir } from "./createAccountV1Dir";
import { createResourcesDir } from "./createResourcesDir";

(async () => {
    console.log("Pulling i18n messages...");
    await generateI18nMessages();
    console.log("Creating account-v1 dir...");
    await createAccountV1Dir();
    console.log("Creating resources dir...");
    await createResourcesDir();
    console.log("Done!");
})();
