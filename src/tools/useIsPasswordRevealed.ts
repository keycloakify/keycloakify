import { useEffect, useReducer } from "react";
import { assert } from "keycloakify/tools/assert";

/**
 * Initially false, state that enables to dynamically control if
 * the type of a password input is "password" (false) or "text" (true).
 */
export function useIsPasswordRevealed(params: { passwordInputId: string }) {
    const { passwordInputId } = params;

    const [isPasswordRevealed, toggleIsPasswordRevealed] = useReducer(
        (isPasswordRevealed: boolean) => !isPasswordRevealed,
        false
    );

    useEffect(() => {
        const passwordInputElement = document.getElementById(passwordInputId);

        assert(passwordInputElement instanceof HTMLInputElement);

        const type = isPasswordRevealed ? "text" : "password";

        passwordInputElement.type = type;

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName !== "type") {
                    return;
                }
                if (passwordInputElement.type === type) {
                    return;
                }
                passwordInputElement.type = type;
            });
        });

        observer.observe(passwordInputElement, { attributes: true });

        return () => {
            observer.disconnect();
        };
    }, [isPasswordRevealed]);

    return { isPasswordRevealed, toggleIsPasswordRevealed };
}
