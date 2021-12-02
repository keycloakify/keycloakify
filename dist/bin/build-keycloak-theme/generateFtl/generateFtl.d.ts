export declare const pageIds: readonly ["login.ftl", "register.ftl", "register-user-profile.ftl", "info.ftl", "error.ftl", "login-reset-password.ftl", "login-verify-email.ftl", "terms.ftl", "login-otp.ftl", "login-update-profile.ftl", "login-idp-link-confirm.ftl", "login-config-totp.ftl", "saml-post-form.ftl"];
export declare type PageId = typeof pageIds[number];
export declare function generateFtlFilesCodeFactory(params: {
    cssGlobalsToDefine: Record<string, string>;
    indexHtmlCode: string;
    urlPathname: string;
    urlOrigin: undefined | string;
}): {
    generateFtlFilesCode: (params: {
        pageId: string;
    }) => {
        ftlCode: string;
    };
};
