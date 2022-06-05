import { App } from "./App";
import { ThemeProvider } from "theme";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
            <ThemeProvider >
                <App />
            </ThemeProvider>
    </StrictMode>
);