"use strict";(self.webpackChunkkeycloakify=self.webpackChunkkeycloakify||[]).push([[4940],{"./dist/login/pages/DeleteAccountConfirm.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{default:()=>DeleteAccountConfirm});__webpack_require__("./node_modules/core-js/modules/es.object.assign.js");var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/react/jsx-runtime.js"),_login_lib_kcClsx__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./dist/login/lib/kcClsx.js");function DeleteAccountConfirm(props){var kcContext=props.kcContext,i18n=props.i18n,doUseDefaultCss=props.doUseDefaultCss,Template=props.Template,classes=props.classes,kcClsx=(0,_login_lib_kcClsx__WEBPACK_IMPORTED_MODULE_2__.$)({doUseDefaultCss,classes}).kcClsx,url=kcContext.url,triggered_from_aia=kcContext.triggered_from_aia,msg=i18n.msg,msgStr=i18n.msgStr;return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(Template,Object.assign({kcContext,i18n,doUseDefaultCss,classes,headerNode:msg("deleteAccountConfirm")},{children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("form",Object.assign({action:url.loginAction,className:"form-vertical",method:"post"},{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("div",Object.assign({className:"alert alert-warning",style:{marginTop:"0",marginBottom:"30px"}},{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("span",{className:"pficon pficon-warning-triangle-o"}),msg("irreversibleAction")]})),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("p",{children:msg("deletingImplies")}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("ul",Object.assign({style:{color:"#72767b",listStyle:"disc",listStylePosition:"inside"}},{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("li",{children:msg("loggingOutImmediately")}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("li",{children:msg("errasingData")})]})),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("p",Object.assign({className:"delete-account-text"},{children:msg("finalDeletionConfirmation")})),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("div",Object.assign({id:"kc-form-buttons"},{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("input",{className:kcClsx("kcButtonClass","kcButtonPrimaryClass","kcButtonLargeClass"),type:"submit",value:msgStr("doConfirmDelete")}),triggered_from_aia&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("button",Object.assign({className:kcClsx("kcButtonClass","kcButtonDefaultClass","kcButtonLargeClass"),style:{marginLeft:"calc(100% - 220px)"},type:"submit",name:"cancel-aia",value:"true"},{children:msgStr("doCancel")}))]}))]}))}))}}}]);