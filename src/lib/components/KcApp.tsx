
import { memo } from "react";
import { kcContext } from "../kcContext";
import { assert } from "../tools/assert";
import type { KcProps } from "./KcProps";
import { Login } from "./Login";
import { Register } from "./Register";
import { Info } from "./Info";
import { Error } from "./Error";
import { LoginResetPassword } from "./LoginResetPassword";
import { LoginVerifyEmail } from "./LoginVerifyEmail";

export const KcApp = memo((props: KcProps) => {

    assert(kcContext !== undefined, "App is not currently served by a Keycloak server");

    switch (kcContext.pageId) {
        case "login.ftl": return <Login {...props} />;
        case "register.ftl": return <Register {...props} />;
        case "info.ftl": return <Info {...props} />;
        case "error.ftl": return <Error {...props} />;
        case "login-reset-password.ftl": return <LoginResetPassword {...props} />;
        case "login-verify-email.ftl": return <LoginVerifyEmail {...props} />;
    }

});