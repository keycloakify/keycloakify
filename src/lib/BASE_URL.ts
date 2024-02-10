import { assert } from "tsafe/assert";

/**
 * WARNING: Internal use only!!
 * This is just a way to know what's the base url that works
 * both in webpack and vite.
 * THIS DOES NOT WORK IN KEYCLOAK! It's only for resolving mock assets.
 */
export const BASE_URL = (() => {
    vite: {
        let BASE_URL: string;

        try {
            // @ts-expect-error
            BASE_URL = import.meta.env.BASE_URL;

            assert(typeof BASE_URL === "string");
        } catch {
            break vite;
        }

        return BASE_URL;
    }

    webpack: {
        let BASE_URL: string;

        try {
            // @ts-expect-error
            BASE_URL = process.env.PUBLIC_URL;

            assert(typeof BASE_URL === "string");
        } catch {
            break webpack;
        }

        return BASE_URL === "" ? "/" : `${BASE_URL}/`;
    }

    return "/";
})();
