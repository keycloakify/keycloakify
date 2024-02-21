import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import { useGetClassName } from "keycloakify/account/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

function isArrayWithEmptyObject(variable: any): boolean {
    return Array.isArray(variable) && variable.length === 1 && typeof variable[0] === "object" && Object.keys(variable[0]).length === 0;
}

export default function Applications(props: PageProps<Extract<KcContext, { pageId: "applications.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, classes, Template } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const {
        url,
        applications: { applications },
        stateChecker
    } = kcContext;

    const { msg, advancedMsg } = i18n;

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} active="applications">
            <div className="row">
                <div className="col-md-10">
                    <h2>{msg("applicationsHtmlTitle")}</h2>
                </div>

                <form action={url.applicationsUrl} method="post">
                    <input type="hidden" id="stateChecker" name="stateChecker" value={stateChecker} />
                    <input type="hidden" id="referrer" name="referrer" value={stateChecker} />

                    <table className="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <td>{msg("application")}</td>
                                <td>{msg("availableRoles")}</td>
                                <td>{msg("grantedPermissions")}</td>
                                <td>{msg("additionalGrants")}</td>
                                <td>{msg("action")}</td>
                            </tr>
                        </thead>

                        <tbody>
                            {applications.map(application => (
                                <tr key={application.client.clientId}>
                                    <td>
                                        {application.effectiveUrl && (
                                            <a href={application.effectiveUrl}>
                                                {(application.client.name && advancedMsg(application.client.name)) || application.client.clientId}
                                            </a>
                                        )}
                                        {!application.effectiveUrl &&
                                            ((application.client.name && advancedMsg(application.client.name)) || application.client.clientId)}
                                    </td>

                                    <td>
                                        {!isArrayWithEmptyObject(application.realmRolesAvailable) &&
                                            application.realmRolesAvailable.map(role => (
                                                <span key={role.name}>
                                                    {role.description ? advancedMsg(role.description) : advancedMsg(role.name)}
                                                    {role !== application.realmRolesAvailable[application.realmRolesAvailable.length - 1] && ", "}
                                                </span>
                                            ))}
                                        {!isArrayWithEmptyObject(application.realmRolesAvailable) && application.resourceRolesAvailable && ", "}
                                        {application.resourceRolesAvailable &&
                                            Object.keys(application.resourceRolesAvailable).map(resource => (
                                                <span key={resource}>
                                                    {!isArrayWithEmptyObject(application.realmRolesAvailable) && ", "}
                                                    {application.resourceRolesAvailable[resource].map(clientRole => (
                                                        <span key={clientRole.roleName}>
                                                            {clientRole.roleDescription
                                                                ? advancedMsg(clientRole.roleDescription)
                                                                : advancedMsg(clientRole.roleName)}{" "}
                                                            {msg("inResource")}{" "}
                                                            <strong>
                                                                {clientRole.clientName ? advancedMsg(clientRole.clientName) : clientRole.clientId}
                                                            </strong>
                                                            {clientRole !==
                                                                application.resourceRolesAvailable[resource][
                                                                    application.resourceRolesAvailable[resource].length - 1
                                                                ] && ", "}
                                                        </span>
                                                    ))}
                                                </span>
                                            ))}
                                    </td>

                                    <td>
                                        {application.client.consentRequired ? (
                                            application.clientScopesGranted.map(claim => (
                                                <span key={claim}>
                                                    {advancedMsg(claim)}
                                                    {claim !== application.clientScopesGranted[application.clientScopesGranted.length - 1] && ", "}
                                                </span>
                                            ))
                                        ) : (
                                            <strong>{msg("fullAccess")}</strong>
                                        )}
                                    </td>

                                    <td>
                                        {application.additionalGrants.map(grant => (
                                            <span key={grant}>
                                                {advancedMsg(grant)}
                                                {grant !== application.additionalGrants[application.additionalGrants.length - 1] && ", "}
                                            </span>
                                        ))}
                                    </td>

                                    <td>
                                        {(application.client.consentRequired && application.clientScopesGranted.length > 0) ||
                                        application.additionalGrants.length > 0 ? (
                                            <button
                                                type="submit"
                                                className={clsx(getClassName("kcButtonPrimaryClass"), getClassName("kcButtonClass"))}
                                                id={`revoke-${application.client.clientId}`}
                                                name="clientId"
                                                value={application.client.id}
                                            >
                                                {msg("revoke")}
                                            </button>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </form>
            </div>
        </Template>
    );
}
