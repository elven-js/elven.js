/**
 * Required for xPortal Hub integration
 * Based on sdk-dapp webview provider implementation
 * It will probably be replaced with separate library in the future
 */
export declare enum PlatformsEnum {
    ios = "ios",
    reactNative = "reactNative",
    web = "web",
    webWallet = "webWallet"
}
export declare enum WebViewProviderResponseBaseEnums {
    reloginResponse = "RELOGIN_RESPONSE"
}
declare enum CrossWindowProviderResponseEnums {
    handshakeResponse = "HANDSHAKE_RESPONSE",
    loginResponse = "LOGIN_RESPONSE",
    disconnectResponse = "DISCONNECT_RESPONSE",
    cancelResponse = "CANCEL_RESPONSE",
    signTransactionsResponse = "SIGN_TRANSACTIONS_RESPONSE",
    signMessageResponse = "SIGN_MESSAGE_RESPONSE",
    noneResponse = "NONE_RESPONSE"
}
export declare const WebViewProviderResponseEnums: {
    reloginResponse: WebViewProviderResponseBaseEnums.reloginResponse;
    handshakeResponse: CrossWindowProviderResponseEnums.handshakeResponse;
    loginResponse: CrossWindowProviderResponseEnums.loginResponse;
    disconnectResponse: CrossWindowProviderResponseEnums.disconnectResponse;
    cancelResponse: CrossWindowProviderResponseEnums.cancelResponse;
    signTransactionsResponse: CrossWindowProviderResponseEnums.signTransactionsResponse;
    signMessageResponse: CrossWindowProviderResponseEnums.signMessageResponse;
    noneResponse: CrossWindowProviderResponseEnums.noneResponse;
};
export declare enum WebViewProviderRequestBaseEnums {
    signTransactionsWithGuardianResponse = "SIGN_TRANSACTIONS_WITH_GUARDIAN_RESPONSE",
    reloginRequest = "RELOGIN_REQUEST"
}
declare enum CrossWindowProviderRequestEnums {
    signTransactionsRequest = "SIGN_TRANSACTIONS_REQUEST",
    signMessageRequest = "SIGN_MESSAGE_REQUEST",
    loginRequest = "LOGIN_REQUEST",
    logoutRequest = "LOGOUT_REQUEST",
    cancelAction = "CANCEL_ACTION_REQUEST",
    finalizeHandshakeRequest = "FINALIZE_HANDSHAKE_REQUEST"
}
export declare const WebViewProviderRequestEnums: {
    signTransactionsWithGuardianResponse: WebViewProviderRequestBaseEnums.signTransactionsWithGuardianResponse;
    reloginRequest: WebViewProviderRequestBaseEnums.reloginRequest;
    signTransactionsRequest: CrossWindowProviderRequestEnums.signTransactionsRequest;
    signMessageRequest: CrossWindowProviderRequestEnums.signMessageRequest;
    loginRequest: CrossWindowProviderRequestEnums.loginRequest;
    logoutRequest: CrossWindowProviderRequestEnums.logoutRequest;
    cancelAction: CrossWindowProviderRequestEnums.cancelAction;
    finalizeHandshakeRequest: CrossWindowProviderRequestEnums.finalizeHandshakeRequest;
};
export {};
