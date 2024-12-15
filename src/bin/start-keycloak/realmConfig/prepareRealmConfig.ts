import { assert } from "tsafe/assert";
import type { ParsedRealmJson } from "./ParsedRealmJson";
import { getDefaultConfig } from "./defaultConfig";
import type { BuildContext } from "../../shared/buildContext";
import { objectKeys } from "tsafe/objectKeys";

export type BuildContextLike = {
    themeNames: BuildContext["themeNames"];
    implementedThemeTypes: BuildContext["implementedThemeTypes"];
};

assert<BuildContext extends BuildContextLike ? true : false>;

export function prepareRealmConfig(params: {
    parsedRealmJson: ParsedRealmJson;
    keycloakMajorVersionNumber: number;
    buildContext: BuildContextLike;
}): {
    realmName: string;
    clientName: string;
    username: string;
} {
    const { parsedRealmJson, keycloakMajorVersionNumber, buildContext } = params;

    const { username } = addOrEditTestUser({
        parsedRealmJson,
        keycloakMajorVersionNumber
    });

    const { clientId } = addOrEditClient({
        parsedRealmJson,
        keycloakMajorVersionNumber
    });

    editAccountConsoleAndSecurityAdminConsole({ parsedRealmJson });

    enableCustomThemes({
        parsedRealmJson,
        themeName: buildContext.themeNames[0],
        implementedThemeTypes: buildContext.implementedThemeTypes
    });

    enable_custom_events_listeners: {
        const name = "keycloakify-logging";

        if (parsedRealmJson.eventsListeners.includes(name)) {
            break enable_custom_events_listeners;
        }

        parsedRealmJson.eventsListeners.push(name);
    }

    return {
        realmName: parsedRealmJson.realm,
        clientName: clientId,
        username
    };
}

function enableCustomThemes(params: {
    parsedRealmJson: ParsedRealmJson;
    themeName: string;
    implementedThemeTypes: BuildContextLike["implementedThemeTypes"];
}) {
    const { parsedRealmJson, themeName, implementedThemeTypes } = params;

    for (const themeType of objectKeys(implementedThemeTypes)) {
        parsedRealmJson[`${themeType}Theme` as const] = implementedThemeTypes[themeType]
            .isImplemented
            ? themeName
            : "";
    }
}

function addOrEditTestUser(params: {
    parsedRealmJson: ParsedRealmJson;
    keycloakMajorVersionNumber: number;
}): { username: string } {
    const { parsedRealmJson, keycloakMajorVersionNumber } = params;

    const parsedRealmJson_default = getDefaultConfig({ keycloakMajorVersionNumber });

    const [defaultUser_default] = parsedRealmJson_default.users;

    assert(defaultUser_default !== undefined);

    const defaultUser_preexisting = parsedRealmJson.users.find(
        user => user.username === defaultUser_default.username
    );

    const newUser = structuredClone(
        defaultUser_preexisting ??
            (() => {
                const firstUser = parsedRealmJson.users[0];

                if (firstUser === undefined) {
                    return undefined;
                }

                const firstUserCopy = structuredClone(firstUser);

                firstUserCopy.id = defaultUser_default.id;

                return firstUserCopy;
            })() ??
            defaultUser_default
    );

    newUser.username = defaultUser_default.username;
    newUser.email = defaultUser_default.email;

    delete_existing_password_credential_if_any: {
        const i = newUser.credentials.findIndex(
            credential => credential.type === "password"
        );

        if (i === -1) {
            break delete_existing_password_credential_if_any;
        }

        newUser.credentials.splice(i, 1);
    }

    {
        const credential = defaultUser_default.credentials.find(
            credential => credential.type === "password"
        );

        assert(credential !== undefined);

        newUser.credentials.push(credential);
    }

    {
        const nameByClientId = Object.fromEntries(
            parsedRealmJson.clients.map(client => [client.id, client.clientId] as const)
        );

        newUser.clientRoles = {};

        for (const clientRole of Object.values(parsedRealmJson.roles.client).flat()) {
            const clientName = nameByClientId[clientRole.containerId];

            assert(clientName !== undefined);

            (newUser.clientRoles[clientName] ??= []).push(clientRole.name);
        }
    }

    if (defaultUser_preexisting === undefined) {
        parsedRealmJson.users.push(newUser);
    } else {
        const i = parsedRealmJson.users.indexOf(defaultUser_preexisting);
        assert(i !== -1);
        parsedRealmJson.users[i] = newUser;
    }

    return { username: newUser.username };
}

const TEST_APP_URL = "https://my-theme.keycloakify.dev";

function addOrEditClient(params: {
    parsedRealmJson: ParsedRealmJson;
    keycloakMajorVersionNumber: number;
}): { clientId: string } {
    const { parsedRealmJson, keycloakMajorVersionNumber } = params;

    const parsedRealmJson_default = getDefaultConfig({ keycloakMajorVersionNumber });

    const testClient_default = (() => {
        const clients = parsedRealmJson_default.clients.filter(client => {
            return JSON.stringify(client).includes(TEST_APP_URL);
        });

        assert(clients.length === 1);

        return clients[0];
    })();

    const clientIds_builtIn = parsedRealmJson_default.clients
        .map(client => client.clientId)
        .filter(clientId => clientId !== testClient_default.clientId);

    const testClient_preexisting = (() => {
        const clients = parsedRealmJson.clients
            .filter(client => !clientIds_builtIn.includes(client.clientId))
            .filter(client => client.protocol === "openid-connect");

        {
            const client = clients.find(
                client => client.clientId === testClient_default.clientId
            );

            if (client !== undefined) {
                return client;
            }
        }

        {
            const client = clients.find(
                client =>
                    client.redirectUris?.find(redirectUri =>
                        redirectUri.startsWith(TEST_APP_URL)
                    ) !== undefined
            );

            if (client !== undefined) {
                return client;
            }
        }

        const [client] = clients;

        if (client === undefined) {
            return undefined;
        }

        return client;
    })();

    let testClient: typeof testClient_default;

    if (testClient_preexisting !== undefined) {
        testClient = testClient_preexisting;
    } else {
        testClient = structuredClone(testClient_default);
        delete testClient.protocolMappers;
        parsedRealmJson.clients.push(testClient);
    }

    {
        for (const redirectUri of [
            `${TEST_APP_URL}/*`,
            "http://localhost*",
            "http://127.0.0.1*"
        ]) {
            for (const propertyName of ["webOrigins", "redirectUris"] as const) {
                const arr = (testClient[propertyName] ??= []);

                if (arr.includes(redirectUri)) {
                    continue;
                }

                arr.push(redirectUri);
            }

            {
                if (testClient.attributes === undefined) {
                    testClient.attributes = {};
                }

                const arr = (testClient.attributes["post.logout.redirect.uris"] ?? "")
                    .split("##")
                    .map(s => s.trim());

                if (!arr.includes(redirectUri)) {
                    arr.push(redirectUri);
                    testClient.attributes["post.logout.redirect.uris"] = arr.join("##");
                }
            }
        }
    }

    return { clientId: testClient.clientId };
}

function editAccountConsoleAndSecurityAdminConsole(params: {
    parsedRealmJson: ParsedRealmJson;
}) {
    const { parsedRealmJson } = params;

    for (const clientId of ["account-console", "security-admin-console"]) {
        const client = parsedRealmJson.clients.find(
            client => client.clientId === clientId
        );

        assert(client !== undefined);

        {
            for (const redirectUri of [
                `${TEST_APP_URL}/*`,
                "http://localhost*",
                "http://127.0.0.1*"
            ]) {
                for (const propertyName of ["webOrigins", "redirectUris"] as const) {
                    const arr = (client[propertyName] ??= []);

                    if (arr.includes(redirectUri)) {
                        continue;
                    }

                    arr.push(redirectUri);
                }

                {
                    if (client.attributes === undefined) {
                        client.attributes = {};
                    }

                    const arr = (client.attributes["post.logout.redirect.uris"] ?? "")
                        .split("##")
                        .map(s => s.trim());

                    if (!arr.includes(redirectUri)) {
                        arr.push(redirectUri);
                        client.attributes["post.logout.redirect.uris"] = arr.join("##");
                    }
                }
            }
        }
    }
}
