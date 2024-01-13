/**
 * Required for xPortal Hub integration
 * Based on sdk-dapp webview provider implementation
 * It will probably be replaced with separate library in the future
 */

export enum PlatformsEnum {
  ios = 'ios',
  reactNative = 'reactNative',
  web = 'web',
  webWallet = 'webWallet',
}

export enum WebViewProviderResponseBaseEnums {
  reloginResponse = 'RELOGIN_RESPONSE',
}

enum CrossWindowProviderResponseEnums {
  handshakeResponse = 'HANDSHAKE_RESPONSE',
  loginResponse = 'LOGIN_RESPONSE',
  disconnectResponse = 'DISCONNECT_RESPONSE',
  cancelResponse = 'CANCEL_RESPONSE',
  signTransactionsResponse = 'SIGN_TRANSACTIONS_RESPONSE',
  signMessageResponse = 'SIGN_MESSAGE_RESPONSE',
  noneResponse = 'NONE_RESPONSE',
}

export const WebViewProviderResponseEnums = {
  ...CrossWindowProviderResponseEnums,
  ...WebViewProviderResponseBaseEnums,
};

export enum WebViewProviderRequestBaseEnums {
  signTransactionsWithGuardianResponse = 'SIGN_TRANSACTIONS_WITH_GUARDIAN_RESPONSE',
  reloginRequest = 'RELOGIN_REQUEST',
}

enum CrossWindowProviderRequestEnums {
  signTransactionsRequest = 'SIGN_TRANSACTIONS_REQUEST',
  signMessageRequest = 'SIGN_MESSAGE_REQUEST',
  loginRequest = 'LOGIN_REQUEST',
  logoutRequest = 'LOGOUT_REQUEST',
  cancelAction = 'CANCEL_ACTION_REQUEST',
  finalizeHandshakeRequest = 'FINALIZE_HANDSHAKE_REQUEST',
}

export const WebViewProviderRequestEnums = {
  ...CrossWindowProviderRequestEnums,
  ...WebViewProviderRequestBaseEnums,
};
