### **5.4.5** (2022-06-14)  
  
- Merge pull request #119 from dro-sh/fix-locale-on-useFormValidationSlice

pass locale to getGetErrors to get correct messages  
- pass locale to getGetErrors to get correct messages    
  
### **5.4.4** (2022-06-05)  
  
  
  
### **5.4.3** (2022-06-01)  
  
  
  
### **5.4.2** (2022-06-01)  
  
- Prevent rate limite in CI by authenticating    
  
### **5.4.1** (2022-06-01)  
  
  
  
## **5.4.0** (2022-05-23)  
  
- #109    
  
### **5.3.2** (2022-05-04)  
  
- Merge pull request #101 from Romcol/bugfix/99

Issue #99 - Make replace less greedy in remplaceImportFromStatic  
- [IMP] Issue #99 - Make replace less greedy in remplaceImportFromStatic    
  
### **5.3.1** (2022-04-29)  
  
- Comment out missleading informations    
  
## **5.3.0** (2022-04-28)  
  
- Rename keycloak_theme_email to keycloak_email (it's shorter)    
  
## **5.2.0** (2022-04-27)  
  
- Export KcApp    
  
## **5.1.0** (2022-04-27)  
  
- Export kcLanguageTags    
  
# **5.0.0** (2022-04-27)  
  
- i18n rebuild from the ground up    
  
## **4.10.0** (2022-04-26)  
  
- Merge pull request #92 from Tasyp/add-login-idp-link-email

feat: add login-idp-link-email page  
- feat: add mock data for login-idp-link-email page  
- feat: supply broker context with context    
  
## **4.9.0** (2022-04-25)  
  
- Test by default with kc 18. Update instructions to use quay.io/keycloak/keycloak instead of jboss/keycloak #93    
  
### **4.8.7** (2022-04-25)  
  
- Update instructions to test on Keycloak 18 https://github.com/keycloak/keycloak-web/issues/306 #93  
- Move the documentation form the readme to docs.keycloakify.dev  
- Update README.md  
- Update demo video    
  
### **4.8.6** (2022-04-22)  
  
- always offer to download v11.0.3    
  
### **4.8.5** (2022-04-22)  
  
- #91    
  
### **4.8.4** (2022-04-22)  
  
- #90    
  
### **4.8.3** (2022-04-20)  
  
  
  
### **4.8.2** (2022-04-20)  
  
- Tell pepoles they can test with different keycloak version    
  
### **4.8.1** (2022-04-20)  
  
- Add missing shebang  
- Add video demo for npx download-builtin-keycloak-theme    
  
## **4.8.0** (2022-04-20)  
  
- Document email template customization feature #9  
- Add mention of download-builtin-keycloak-theme  
- Let the choice of kc version be auto in GH Action  
- Only test on node v15 and v14 (bellow is no longer supported (rmSync)  
- Feature email customization #9    
  
### **4.7.6** (2022-04-12)  
  
- Fix bugs with language switch #85    
  
### **4.7.5** (2022-04-09)  
  
- Fix #85    
  
### **4.7.4** (2022-04-09)  
  
- M1 Mac compat (for real this time)    
  
### **4.7.3** (2022-04-08)  
  
- Mention that there is still problems with M1 Mac    
  
### **4.7.2** (2022-04-06)  
  
-  #43: M1 Mac support    
  
### **4.7.1** (2022-03-30)  
  
- Improve browser autofill  
- factorization    
  
## **4.7.0** (2022-03-17)  
  
- Add support for options validator  
- remove duplicate dependency    
  
## **4.6.0** (2022-03-07)  
  
- Remove powerhooks as dev dependency    
  
### **4.5.5** (2022-03-07)  
  
- Update tss-react    
  
### **4.5.4** (2022-03-06)  
  
- Remove tss-react from peerDependencies (it becomes a dependency)  
- (dev script) Use tsconfig.json to tell we are at the root of the project    
  
### **4.5.3** (2022-01-26)  
  
- Themes no longer have to break on minor Keycloakify update    
  
### **4.5.2** (2022-01-20)  
  
- Test container uses Keycloak 16.1.0  
- Merge pull request #78 from InseeFrLab/Ann2827/pull

Ann2827/pull  
- Refactor #78  
- Compat with Keycloak 16 (and probably 17, 18) #79  
- Warning about compat issues with Keycloak 16  
- fix: changes  
- fix: Errors on pages login-idp-link-confirm and login-idp-link-email

ref: https://github.com/InseeFrLab/keycloakify/issues/75    
  
### **4.5.1** (2022-01-18)  
  
- fix previous version    
  
## **4.5.0** (2022-01-18)  
  
- Read public/CNAME for domain name in --externel-assets mode    
  
## **4.4.0** (2022-01-01)  
  
- Merge pull request #73 from lazToum/main

(feature) added login-page-expired.ftl  
- added login-page-expired.ftl  
- Add update instruction for 4.3.0    
  
## **4.3.0** (2021-12-27)  
  
- Merge pull request #72 from praiz/main

feat(*): added login-update-password  
- feat(*): added login-update-password    
  
### **4.2.21** (2021-12-27)  
  
- update dependencies    
  
### **4.2.19** (2021-12-21)  
  
- Merge pull request #70 from VBustamante/patch-1  
- Added realm name field to KcContext mocks object  
- Merge pull request #69 from VBustamante/patch-1

Adding name field to realm in KcContext type  
- Adding name field to realm in KcContext type    
  
### **4.2.18** (2021-12-17)  
  
- Improve css url() import (fix CRA 5)    
  
### **4.2.17** (2021-12-16)  
  
- Fix path.join polyfill    
  
### **4.2.16** (2021-12-16)  
  
  
  
### **4.2.15** (2021-12-16)  
  
- use custom polyfill for path.join (fix webpack 5 build)    
  
### **4.2.14** (2021-12-12)  
  
- Merge pull request #65 from InseeFrLab/doge_ftl_errors

Prevent ftl errors in Keycloak log  
- Encourage users to report errors in logs  
- Fix ftl error related to url.loginAction in saml-post-form.ftl  
- Ftl prevent error with updateProfileCtx  
- Ftl prevent error with auth.attemptedUsername  
- Fix ftl error as comment formatting  
- Merge remote-tracking branch 'origin/main' into doge_ftl_errors  
- Update README, remove all instruction about errors in logs  
- Avoid error in Keycloak logs, fix long template loading time  
- Add missing collon in README sample code

Add miss ','    
  
### **4.2.13** (2021-12-08)  
  
- Fix broken link about how to import fonts #62  
- Add a video to show how to test the theme in a local container    
  
### **4.2.12** (2021-12-08)  
  
- Update post build instructions    
  
### **4.2.11** (2021-12-07)  
  
  
  
### **4.2.10** (2021-11-12)  
  
- Export an exaustive list of KcLanguageTag    
  
### **4.2.9** (2021-11-11)  
  
- Fix useAdvancedMsg    
  
### **4.2.8** (2021-11-10)  
  
- Update doc about pattern that can be used for user attributes #50  
- Bring back Safari compat    
  
### **4.2.7** (2021-11-09)  
  
- Fix useFormValidationSlice    
  
### **4.2.6** (2021-11-08)  
  
- Fix deepClone so we can overwrite with undefined in when we mock kcContext    
  
### **4.2.5** (2021-11-07)  
  
- Better debugging experience with user profile    
  
### **4.2.4** (2021-11-01)  
  
- Better autoComplete typings    
  
### **4.2.3** (2021-11-01)  
  
- Make it more easy to understand that error in the log are expected    
  
### **4.2.2** (2021-10-27)  
  
- Replace 'path' by 'browserify-path' #47    
  
### **4.2.1** (2021-10-26)  
  
- useFormValidationSlice: update when params have changed  
- Explains that the password can't be validated    
  
## **4.2.0** (2021-10-26)  
  
- Export types definitions for Attribue and Validator    
  
## **4.1.0** (2021-10-26)  
  
- Document what's new in v4    
  
# **4.0.0** (2021-10-26)  
  
- fix RegisterUserProfile password confirmation field  
- Much better support for frontend field validation  
- Fix css injection order  
- Makes the download output predictable. This fixes the case where GitHub redirects and wget was trying to download a filename called "15.0.2", and then unzip wouldn't pick it up.
Changes wget to curl because curl is awesome. -L is to follow the GitHub redirects.  
- Remove duplicates    
  
### **3.0.2** (2021-10-18)  
  
- Scan deeper to retreive user attribute    
  
### **3.0.1** (2021-10-17)  
  
- Add client.description in type kcContext type def    
  
# **3.0.0** (2021-10-16)  
  
  
  
### **2.5.3** (2021-10-16)  
  
  
  
### **2.5.2** (2021-10-13)  
  
  
  
### **2.5.1** (2021-10-13)  
  
- Update tss-react    
  
## **2.5.0** (2021-10-12)  
  
- register-user-profile.ftl tested working  
- Make kcMessage more easily hackable  
- fix useKcMessage  
- Implement and type validators  
- Remove syntax error in ftl and make it more directly debugable  
- Support register-user-profile.ftl    
  
## **2.4.0** (2021-10-08)  
  
-  #38: Implement messagesPerField existsError and get    
  
## **2.3.0** (2021-10-07)  
  
- #20: Support advancedMsg    
  
## **2.2.0** (2021-10-07)  
  
- Feat scrip: download-builtin-keycloak-theme for downloading any version of the builtin themes  
- Use the latest version of keycloak for testing  
- Test locally with 15.0.2 instead of 11.0.3    
  
## **2.1.0** (2021-10-06)  
  
- Support Hungarian and Danish (use Keycloak 15 language resources)    
  
### **2.0.20** (2021-10-05)  
  
- Update README.md    
  
### **2.0.19** (2021-09-17)  
  
- Fix kcContext type definitions    
  
### **2.0.18** (2021-09-14)  
  
  
  
### **2.0.17** (2021-09-14)  
  
  
  
### **2.0.16** (2021-09-12)  
  
- Add explaination about errors in logs    
  
### **2.0.15** (2021-08-31)  
  
- Update tss-react    
  
### **2.0.14** (2021-08-20)  
  
- Update tss-react    
  
### **2.0.13** (2021-08-04)  
  
- Merge pull request #28 from marcmrf/main

fix(mvn): scoped packages compatibility  
- fix(mvn): scoped packages compatibility    
  
### **2.0.12** (2021-07-28)  
  
- Merge pull request #27 from jchn-codes/patch-1

add maven to requirements  
- add maven to requirements  
- Add #bluehats in the keyworks    
  
### **2.0.11** (2021-07-21)  
  
- Spaces in file path #22  
- uptdate dependnecies  
- Inport specific powerhooks files to reduce bundle size    
  
### **2.0.10** (2021-07-16)  
  
- Update dependencies    
  
### **2.0.9** (2021-07-14)  
  
- Fix #21    
  
### **2.0.8** (2021-07-12)  
  
- Fix previous release  
- #20: Add def for clientId and name on kcContext.client    
  
### **2.0.6** (2021-07-08)  
  
- Merge pull request #18 from asashay/add-custom-props-to-theme-properties

Add possibility to add custom properties to theme.properties file  
- add possibility to add custom properties to theme.properties file    
  
### **2.0.5** (2021-07-05)  
  
- Fix broken url for big stylesheet #16    
  
### **2.0.4** (2021-07-03)  
  
- Fix: #7    
  
### **2.0.3** (2021-06-30)  
  
- Escape double quote in ftl to js conversion #15  
- Update readme    
  
### **2.0.2** (2021-06-28)  
  
- Updagte README for implementing non incuded pages    
  
### **2.0.1** (2021-06-28)  
  
- Update documentation for v2    
  
# **2.0.0** (2021-06-28)  
  
- Fix last bugs before relasing v2  
- Implement a mechanism to overload kcContext  
- Give the option in template to pull the default assets or not  
- Enable possiblity to support custom pages (without forking keycloakify)  
- Implement a getter for kcContext  
- Update README.md    
  
# **2.0.0** (2021-06-28)  
  
- Fix last bugs before relasing v2  
- Implement a mechanism to overload kcContext  
- Give the option in template to pull the default assets or not  
- Enable possiblity to support custom pages (without forking keycloakify)  
- Implement a getter for kcContext  
- Update README.md    
  
### **1.2.1** (2021-06-22)  
  
- Remove unessesary log    
  
## **1.2.0** (2021-06-22)  
  
- Generate kcContext automatically :rocket:    
  
### **1.1.6** (2021-06-21)  
  
- Fix: Alert messages sometimes includes HTML that is not rendered  
- Update dist    
  
### **1.1.5** (2021-06-15)  
  
- #11: Provide socials in the register    
  
### **1.1.4** (2021-06-15)  
  
- Merge pull request #12 from InseeFrLab/email-typo

Fix typo on email  
- Fix typo on email    
  
### **1.1.3** (2021-06-14)  
  
- Add missing key in Login for providers    
  
### **1.1.2** (2021-06-14)  
  
  
  
### **1.1.1** (2021-06-14)  
  
  
  
## **1.1.0** (2021-06-14)  
  
- Add login-idp-link-confirm.ftl  
- Fix login-update-profile.ftl  
- Add login-update-profile.ftl page  
- Fix default background bug  
- Remove unused 'markdown' dependency  
- Fix warning related to powerhooks_useGlobalState_kcLanguageTag  
- Update README.md    
  
### **1.0.4** (2021-05-28)  
  
- Instructions for custom themes with custom components    
  
### **1.0.3** (2021-05-23)  
  
- Instuction about how to integrate with non CRA projects  
- Add mention to awesome list    
  
### **1.0.2** (2021-05-01)  
  
  
  
### **1.0.1** (2021-05-01)  
  
- Fix: LoginOtp (and not otc)    
  
# **1.0.0** (2021-05-01)  
  
- #4: Guide for implementing a missing page  
- Support OTP #4    
  
### **0.4.4** (2021-04-29)  
  
- Fix previous release    
  
### **0.4.3** (2021-04-29)  
  
- Add infos about the plugin that defines authorizedMailDomains    
  
### **0.4.2** (2021-04-29)  
  
- Client side validation of allowed email domains  
- Support email whitlisting  
- Restore kickstart video in the readme  
- Update README.md  
- Update README.md  
- Important readme update    
  
### **0.4.1** (2021-04-11)  
  
- Quietly re-introduce --external-assets  
- Give example of customization    
  
## **0.4.0** (2021-04-09)  
  
- Acual support of Therms of services    
  
### **0.3.24** (2021-04-08)  
  
- Add missing dependency: markdown    
  
### **0.3.23** (2021-04-08)  
  
- Allow to lazily load therms    
  
### **0.3.22** (2021-04-08)  
  
- update powerhooks  
- Support terms and condition  
- Fix info.ftl  
- For useKcMessage we prefer returning callbacks with a changing references    
  
### **0.3.21** (2021-04-04)  
  
- Update powerhooks    
  
### **0.3.20** (2021-04-01)  
  
- Always catch freemarker errors    
  
### **0.3.19** (2021-04-01)  
  
- Fix previous release    
  
### **0.3.18** (2021-04-01)  
  
- Fix error.ftt, Adopt best effort strategy to convert ftl values into JS    
  
### **0.3.17** (2021-03-29)  
  
- Use push instead of replace in keycloak-js adapter to enable going back    
  
### **0.3.15** (2021-03-28)  
  
- Remove all reference to --external-assets, broken feature    
  
### **0.3.14** (2021-03-28)  
  
- Fix standalone mode: imports from js    
  
### **0.3.13** (2021-03-26)  
  
  
  
### **0.3.12** (2021-03-26)  
  
- Fix mocksContext    
  
### **0.3.11** (2021-03-26)  
  
- Fix previous build, improve README    
  
### **0.3.10** (2021-03-26)  
  
- Handle <style> tag, improve documentation    
  
### **0.3.9** (2021-03-25)  
  
- Update readme  
- Document  --external-assets  
- Update README.md  
- Update README.md  
- Update README.md    
  
### **0.3.8** (2021-03-22)  
  
- Make standalone mode the default    
  
### **0.3.7** (2021-03-22)  
  
- (test) external asset mode by default    
  
### **0.3.6** (2021-03-22)  
  
- Fix previous release    
  
### **0.3.5** (2021-03-22)  
  
- support homepage with urlPath    
  
### **0.3.4** (2021-03-22)  
  
- Bugfix: Import assets from CSS    
  
### **0.3.3** (2021-03-22)  
  
- Fix submit not receving correct text    
  
### **0.3.2** (2021-03-21)  
  
- Fix broken previous release    
  
### **0.3.1** (2021-03-21)  
  
- kcHeaderClass can be updated after initial mount    
  
## **0.3.0** (2021-03-20)  
  
- Bump version  
- Feat: Cary over states using URL search params  
- Bugfix: with kcHtmlClass    
  
### **0.2.10** (2021-03-19)  
  
- Remove dependency to denoify    
  
### **0.2.9** (2021-03-19)  
  
- Update deps and CI workflow    
  
### **0.2.8** (2021-03-19)  
  
- Bugfix: keycloak_build that grow and grow in size  
- Add disclaimer about maitainment strategy  
- Add a note for tested version support    
  
### **0.2.7** (2021-03-13)  
  
- Bump version  
- Update README.md  
- Update README.md    
  
### **0.2.6** (2021-03-10)  
  
- Fix generated gitignore    
  
### **0.2.5** (2021-03-10)  
  
- Fix generated .gitignore    
  
### **0.2.4** (2021-03-10)  
  
- Update README.md    
  
### **0.2.3** (2021-03-09)  
  
- fix gitignore generation    
  
### **0.2.2** (2021-03-08)  
  
- Add table of content  
- Update README.md  
- Update README.md    
  
## **0.2.1** (2021-03-08)  
  
- Update ci.yaml  
- Update readme  
- Update readme  
- update deps  
- Update readme  
- Add all mocks for testing  
- many small fixes    
  
### **0.1.6** (2021-03-07)  
  
- Fix Turkish    
  
### **0.1.5** (2021-03-07)  
  
- Fix getKcLanguageLabel    
  
### **0.1.4** (2021-03-07)  
  
  
  
### **0.1.3** (2021-03-07)  
  
- Implement LoginVerifyEmail  
- Implement login-reset-password.ftl    
  
### **0.1.2** (2021-03-07)  
  
- Fix build  
- Fix build    
  
### **0.1.1** (2021-03-06)  
  
- Implement Error page  
- rename pageBasename by pageId  
- Implement reactive programing for language switching  
- Add Info page, refactor    
  
## **0.1.0** (2021-03-05)  
  
- Rename keycloakify    
  
### **0.0.33** (2021-03-05)  
  
- Fix syncronization with non react pages    
  
### **0.0.32** (2021-03-05)  
  
- bump version  
- Add log to tell when we are using react  
- Fix missing parentesis    
  
### **0.0.31** (2021-03-05)  
  
- Fix typo  
- Fix register page 500    
  
### **0.0.30** (2021-03-05)  
  
- Edit language statistique    
  
### **0.0.30** (2021-03-05)  
  
- avoid escaping urls  
- Use default value instead of value  
- Fix double single quote problem in messages  
- Fix typo  
- Fix non editable username  
- Fix some bugs  
- Fix Object.deepAssign  
- Make the dongle to download smaller  
- Split kcContext among pages  
- Implement register    
  
### **0.0.29** (2021-03-04)  
  
- Fix build  
- Fix i18n  
- Login appear to be working now  
- closer but not there yet    
  
### **0.0.28** (2021-03-03)  
  
- fix build  
- There is no reason not to let use translations outside of keycloak    
  
### **0.0.27** (2021-03-02)  
  
- Implement entrypoint    
  
### **0.0.26** (2021-03-02)  
  
- Login page implemented  
- Implement login  
- remove unesseary log    
  
### **0.0.25** (2021-03-02)  
  
- Fix build and reduce size  
- Implement the template    
  
### **0.0.24** (2021-03-01)  
  
- update  
- update  
- update    
  
### **0.0.23** (2021-03-01)  
  
- update    
  
### **0.0.23** (2021-03-01)  
  
- update  
- update    
  
### **0.0.23** (2021-03-01)  
  
- update  
- update    
  
### **0.0.23** (2021-03-01)  
  
- update  
- Handle formatting in translation function    
  
### **0.0.22** (2021-02-28)  
  
- Split page messages    
  
### **0.0.21** (2021-02-28)  
  
- Restore yarn file  
- Multiple fixes  
- Update deps  
- Update deps  
- includes translations  
- Update README.md  
- improve docs  
- update  
- Update README.md  
- update  
- update  
- update  
- update    
  
### **0.0.20** (2021-02-27)  
  
- update  
- update    
  
### **0.0.19** (2021-02-27)  
  
- update  
- update    
  
### **0.0.18** (2021-02-23)  
  
- Bump version number  
- Moving on with implementation of the lib  
- Update readme  
- Readme eddit  
- Fixing video link    
  
### **0.0.16** (2021-02-23)  
  
- Bump version  
- Give test container credentials    
  
### **0.0.14** (2021-02-23)  
  
- Bump version number  
- enable the docker container to be run from the root of the react project    
  
### **0.0.13** (2021-02-23)  
  
- bump version    
  
### **0.0.12** (2021-02-23)  
  
- update readme    
  
### **0.0.11** (2021-02-23)  
  
- Add documentation    
  
### **0.0.10** (2021-02-23)  
  
- Remove extra closing bracket    
  
### **0.0.9** (2021-02-22)  
  
- fix container startup script  
- minor update    
  
### **0.0.8** (2021-02-21)  
  
- Include theme properties    
  
### **0.0.7** (2021-02-21)  
  
- fix build  
- Fix bundle    
  
### **0.0.6** (2021-02-21)  
  
- Include missing files in the release bundle    
  
### **0.0.5** (2021-02-21)  
  
- Bump version number  
- Make the install faster    
  
### **0.0.4** (2021-02-21)  
  
- Fix script visibility    
  
### **0.0.3** (2021-02-21)  
  
- Do not run tests on window  
- Add script for downloading base themes  
- Generate debug files to be able to test the container  
- Fix many little bugs  
- refactor  
- Almoste there  
- Things are starting to take form  
- Seems to be working  
- First draft  
- Remove eslint and prettyer    
  
### **0.0.2** (2021-02-20)  
  
- Update package.json    
  
