/*
 * Copyright 2016 Red Hat, Inc. and/or its affiliates
 * and other contributors as indicated by the @author tags.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.keycloak.forms.account.freemarker.model;

import java.io.IOException;
import java.net.URI;
import org.jboss.logging.Logger;
import org.keycloak.models.RealmModel;
import org.keycloak.services.AccountUrls;
import org.keycloak.theme.Theme;

/**
 * @author <a href="mailto:sthorger@redhat.com">Stian Thorgersen</a>
 */
public class UrlBean {

  private static final Logger logger = Logger.getLogger(UrlBean.class);
  private String realm;
  private Theme theme;
  private URI baseURI;
  private URI baseQueryURI;
  private URI currentURI;
  private String idTokenHint;

  public UrlBean(
      RealmModel realm,
      Theme theme,
      URI baseURI,
      URI baseQueryURI,
      URI currentURI,
      String idTokenHint) {
    this.realm = realm.getName();
    this.theme = theme;
    this.baseURI = baseURI;
    this.baseQueryURI = baseQueryURI;
    this.currentURI = currentURI;
    this.idTokenHint = idTokenHint;
  }

  public String getApplicationsUrl() {
    return AccountUrls.accountApplicationsPage(baseQueryURI, realm).toString();
  }

  public String getAccountUrl() {
    return AccountUrls.accountPage(baseQueryURI, realm).toString();
  }

  public String getPasswordUrl() {
    return AccountUrls.accountPasswordPage(baseQueryURI, realm).toString();
  }

  public String getSocialUrl() {
    return AccountUrls.accountFederatedIdentityPage(baseQueryURI, realm).toString();
  }

  public String getTotpUrl() {
    return AccountUrls.accountTotpPage(baseQueryURI, realm).toString();
  }

  public String getLogUrl() {
    return AccountUrls.accountLogPage(baseQueryURI, realm).toString();
  }

  public String getSessionsUrl() {
    return AccountUrls.accountSessionsPage(baseQueryURI, realm).toString();
  }

  public String getLogoutUrl() {
    return AccountUrls.accountLogout(baseQueryURI, currentURI, realm, idTokenHint).toString();
  }

  public String getResourceUrl() {
    return AccountUrls.accountResourcesPage(baseQueryURI, realm).toString();
  }

  public String getResourceDetailUrl(String id) {
    return AccountUrls.accountResourceDetailPage(id, baseQueryURI, realm).toString();
  }

  public String getResourceGrant(String id) {
    return AccountUrls.accountResourceGrant(id, baseQueryURI, realm).toString();
  }

  public String getResourceShare(String id) {
    return AccountUrls.accountResourceShare(id, baseQueryURI, realm).toString();
  }

  public String getResourcesPath() {
    URI uri = AccountUrls.themeRoot(baseURI);
    return uri.getPath() + "/" + theme.getType().toString().toLowerCase() + "/" + theme.getName();
  }

  public String getResourcesCommonPath() {
    URI uri = AccountUrls.themeRoot(baseURI);
    String commonPath = "";
    try {
      commonPath = theme.getProperties().getProperty("import");
    } catch (IOException ex) {
      logger.warn("Failed to load properties", ex);
    }
    if (commonPath == null || commonPath.isEmpty()) {
      commonPath = "/common/keycloak";
    }
    return uri.getPath() + "/" + commonPath;
  }
}
