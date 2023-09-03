package org.keycloak.services;

import jakarta.ws.rs.core.UriBuilder;
import java.net.URI;
import lombok.extern.jbosslog.JBossLog;
import org.keycloak.OAuth2Constants;
import org.keycloak.protocol.oidc.OIDCLoginProtocol;
import org.keycloak.protocol.oidc.OIDCLoginProtocolService;
import org.keycloak.services.resources.LoginActionsService;
import org.keycloak.services.resources.RealmsResource;
import org.keycloak.services.resources.account.AccountFormService;

@JBossLog
public class AccountUrls extends Urls {

  private static UriBuilder realmLogout(URI baseUri) {
    return tokenBase(baseUri).path(OIDCLoginProtocolService.class, "logout");
  }

  public static UriBuilder accountBase(URI baseUri) {
    return realmBase(baseUri).path(RealmsResource.class, "getAccountService");
  }

  private static UriBuilder tokenBase(URI baseUri) {
    return realmBase(baseUri).path("{realm}/protocol/" + OIDCLoginProtocol.LOGIN_PROTOCOL);
  }

  public static URI accountApplicationsPage(URI baseUri, String realmName) {
    return accountBase(baseUri).path(AccountFormService.class, "applicationsPage").build(realmName);
  }

  public static URI accountPage(URI baseUri, String realmName) {
    return accountPageBuilder(baseUri).build(realmName);
  }

  public static UriBuilder accountPageBuilder(URI baseUri) {
    return accountBase(baseUri).path(AccountFormService.class, "accountPage");
  }

  public static URI accountPasswordPage(URI baseUri, String realmName) {
    return accountBase(baseUri).path(AccountFormService.class, "passwordPage").build(realmName);
  }

  public static URI accountFederatedIdentityPage(URI baseUri, String realmName) {
    return accountBase(baseUri)
        .path(AccountFormService.class, "federatedIdentityPage")
        .build(realmName);
  }

  public static URI accountFederatedIdentityUpdate(URI baseUri, String realmName) {
    return accountBase(baseUri)
        .path(AccountFormService.class, "processFederatedIdentityUpdate")
        .build(realmName);
  }

  public static URI accountTotpPage(URI baseUri, String realmName) {
    return accountBase(baseUri).path(AccountFormService.class, "totpPage").build(realmName);
  }

  public static URI accountLogPage(URI baseUri, String realmName) {
    return accountBase(baseUri).path(AccountFormService.class, "logPage").build(realmName);
  }

  public static URI accountSessionsPage(URI baseUri, String realmName) {
    return accountBase(baseUri).path(AccountFormService.class, "sessionsPage").build(realmName);
  }

  public static URI accountLogout(
      URI baseUri, URI redirectUri, String realmName, String idTokenHint) {
    return realmLogout(baseUri)
        .queryParam(OAuth2Constants.POST_LOGOUT_REDIRECT_URI, redirectUri)
        .queryParam(OAuth2Constants.ID_TOKEN_HINT, idTokenHint)
        .build(realmName);
  }

  public static URI accountResourcesPage(URI baseUri, String realmName) {
    return accountBase(baseUri).path(AccountFormService.class, "resourcesPage").build(realmName);
  }

  public static URI accountResourceDetailPage(String resourceId, URI baseUri, String realmName) {
    return accountBase(baseUri)
        .path(AccountFormService.class, "resourceDetailPage")
        .build(realmName, resourceId);
  }

  public static URI accountResourceGrant(String resourceId, URI baseUri, String realmName) {
    return accountBase(baseUri)
        .path(AccountFormService.class, "grantPermission")
        .build(realmName, resourceId);
  }

  public static URI accountResourceShare(String resourceId, URI baseUri, String realmName) {
    return accountBase(baseUri)
        .path(AccountFormService.class, "shareResource")
        .build(realmName, resourceId);
  }

  public static URI loginActionUpdatePassword(URI baseUri, String realmName) {
    return loginActionsBase(baseUri)
        .path(LoginActionsService.class, "updatePassword")
        .build(realmName);
  }

  public static URI loginActionUpdateTotp(URI baseUri, String realmName) {
    return loginActionsBase(baseUri).path(LoginActionsService.class, "updateTotp").build(realmName);
  }

  public static URI loginActionEmailVerification(URI baseUri, String realmName) {
    return loginActionEmailVerificationBuilder(baseUri).build(realmName);
  }

  public static String localeCookiePath(URI baseUri, String realmName) {
    return realmBase(baseUri).path(realmName).build().getRawPath();
  }
}
