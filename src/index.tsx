import { createRoot } from "react-dom/client";
import { App } from "App";
import { ThemeProvider } from "theme";
import { I18nProvider } from "i18n/I18nProvider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <I18nProvider>
      <App />
    </I18nProvider>
  </ThemeProvider>
);
