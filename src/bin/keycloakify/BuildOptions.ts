import { z } from "zod";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { id } from "tsafe/id";
import { parse as urlParse } from "url";
import { typeGuard } from "tsafe/typeGuard";

const BUNDLERS = ["mvn", "keycloakify", "none"] as const;
type Bundler = typeof BUNDLERS[number];
type ParsedPackageJson = {
    name: string;
    version: string;
    homepage?: string;
    keycloakify?: {
        extraPages?: string[];
        extraThemeProperties?: string[];
        areAppAndKeycloakServerSharingSameDomain?: boolean;
        artifactId?: string;
        groupId?: string;
        bundler?: Bundler;
    };
};

const zParsedPackageJson = z.object({
    "name": z.string(),
    "version": z.string(),
    "homepage": z.string().optional(),
    "keycloakify": z
        .object({
            "extraPages": z.array(z.string()).optional(),
            "extraThemeProperties": z.array(z.string()).optional(),
            "areAppAndKeycloakServerSharingSameDomain": z.boolean().optional(),
            "artifactId": z.string().optional(),
            "groupId": z.string().optional(),
            "bundler": z.enum(BUNDLERS).optional()
        })
        .optional()
});

assert<Equals<ReturnType<typeof zParsedPackageJson["parse"]>, ParsedPackageJson>>();

/** Consolidated build option gathered form CLI arguments and config in package.json */
export type BuildOptions = BuildOptions.Standalone | BuildOptions.ExternalAssets;

export namespace BuildOptions {
    export type Common = {
        isSilent: boolean;
        version: string;
        themeName: string;
        extraPages?: string[];
        extraThemeProperties?: string[];
        groupId: string;
        artifactId?: string;
        bundler?: Bundler;
    };

    export type Standalone = Common & {
        isStandalone: true;
        urlPathname: string | undefined;
    };

    export type ExternalAssets = ExternalAssets.SameDomain | ExternalAssets.DifferentDomains;

    export namespace ExternalAssets {
        export type CommonExternalAssets = Common & {
            isStandalone: false;
        };

        export type SameDomain = CommonExternalAssets & {
            areAppAndKeycloakServerSharingSameDomain: true;
        };

        export type DifferentDomains = CommonExternalAssets & {
            areAppAndKeycloakServerSharingSameDomain: false;
            urlOrigin: string;
            urlPathname: string | undefined;
        };
    }
}

export function readBuildOptions(params: {
    packageJson: string;
    CNAME: string | undefined;
    isExternalAssetsCliParamProvided: boolean;
    isSilent: boolean;
}): BuildOptions {
    const { packageJson, CNAME, isExternalAssetsCliParamProvided, isSilent } = params;

    const parsedPackageJson = zParsedPackageJson.parse(JSON.parse(packageJson));

    const url = (() => {
        const { homepage } = parsedPackageJson;

        let url: URL | undefined = undefined;

        if (homepage !== undefined) {
            url = new URL(homepage);
        }

        if (CNAME !== undefined) {
            url = new URL(`https://${CNAME.replace(/\s+$/, "")}`);
        }

        if (url === undefined) {
            return undefined;
        }

        return {
            "origin": url.origin,
            "pathname": (() => {
                const out = url.pathname.replace(/([^/])$/, "$1/");

                return out === "/" ? undefined : out;
            })()
        };
    })();

    const common: BuildOptions.Common = (() => {
        const { name, keycloakify = {}, version, homepage } = parsedPackageJson;

        const { extraPages, extraThemeProperties, groupId, artifactId, bundler } = keycloakify ?? {};

        const themeName = name
            .replace(/^@(.*)/, "$1")
            .split("/")
            .join("-");

        return {
            themeName,
            "bundler": (() => {
                const { KEYCLOAKIFY_BUNDLER } = process.env;

                assert(
                    typeGuard<Bundler | undefined>(
                        KEYCLOAKIFY_BUNDLER,
                        KEYCLOAKIFY_BUNDLER === undefined || id<readonly string[]>(BUNDLERS).includes(KEYCLOAKIFY_BUNDLER)
                    )
                );

                return KEYCLOAKIFY_BUNDLER ?? bundler;
            })(),
            "artifactId": process.env.KEYCLOAKIFY_ARTIFACT_ID ?? artifactId,
            "groupId": (() => {
                const fallbackGroupId = `${themeName}.keycloak`;

                return (
                    process.env.KEYCLOAKIFY_GROUP_ID ??
                    groupId ??
                    (!homepage
                        ? fallbackGroupId
                        : urlParse(homepage)
                              .host?.replace(/:[0-9]+$/, "")
                              ?.split(".")
                              .reverse()
                              .join(".") ?? fallbackGroupId) + ".keycloak"
                );
            })(),
            "version": process.env.KEYCLOAKIFY_VERSION ?? version,
            extraPages,
            extraThemeProperties,
            isSilent
        };
    })();

    if (isExternalAssetsCliParamProvided) {
        const commonExternalAssets = id<BuildOptions.ExternalAssets.CommonExternalAssets>({
            ...common,
            "isStandalone": false
        });

        if (parsedPackageJson.keycloakify?.areAppAndKeycloakServerSharingSameDomain) {
            return id<BuildOptions.ExternalAssets.SameDomain>({
                ...commonExternalAssets,
                "areAppAndKeycloakServerSharingSameDomain": true
            });
        } else {
            assert(
                url !== undefined,
                [
                    "Can't compile in external assets mode if we don't know where",
                    "the app will be hosted.",
                    "You should provide a homepage field in the package.json (or create a",
                    "public/CNAME file.",
                    "Alternatively, if your app and the Keycloak server are on the same domain, ",
                    "eg https://example.com is your app and https://example.com/auth is the keycloak",
                    'admin UI, you can set "keycloakify": { "areAppAndKeycloakServerSharingSameDomain": true }',
                    "in your package.json"
                ].join(" ")
            );

            return id<BuildOptions.ExternalAssets.DifferentDomains>({
                ...commonExternalAssets,
                "areAppAndKeycloakServerSharingSameDomain": false,
                "urlOrigin": url.origin,
                "urlPathname": url.pathname
            });
        }
    }

    return id<BuildOptions.Standalone>({
        ...common,
        "isStandalone": true,
        "urlPathname": url?.pathname
    });
}
