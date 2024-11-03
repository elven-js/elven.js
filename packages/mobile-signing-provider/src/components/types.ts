export enum EventStoreEvents {
  // Login
  onLoginStart = 'onLoginStart',
  onLoginSuccess = 'onLoginSuccess',
  onLoginFailure = 'onLoginFailure',
  // Logout
  onLogoutStart = 'onLogoutStart',
  onLogoutSuccess = 'onLogoutSuccess',
  onLogoutFailure = 'onLogoutFailure',
  // Qr
  onQrPending = 'onQrPending',
  onQrLoaded = 'onQrLoaded',
  // Transaction
  onTxStart = 'onTxStart',
  onTxSent = 'onTxSent',
  onTxFinalized = 'onTxFinalized',
  onTxFailure = 'onTxFailure',
  // Signing
  onSignMsgStart = 'onSignMsgStart',
  onSignMsgFinalized = 'onSignMsgFinalized',
  onSignMsgFailure = 'onSignMsgFailure',
  // Query
  onQueryStart = 'onQueryStart',
  onQueryFinalized = 'onQueryFinalized',
  onQueryFailure = 'onQueryFailure',
}

export enum LoginMethodsEnum {
  ledger = 'ledger',
  mobile = 'mobile',
  webWallet = 'web-wallet',
  browserExtension = 'browser-extension',
  xAlias = 'x-alias',
  webview = 'webview',
}

export enum DappCoreWCV2CustomMethodsEnum {
  mvx_cancelAction = 'mvx_cancelAction',
  mvx_signNativeAuthToken = 'mvx_signNativeAuthToken',
}

export enum WalletConnectV2ProviderErrorMessagesEnum {
  unableToInit = 'WalletConnect is unable to init',
  notInitialized = 'WalletConnect is not initialized',
  unableToConnect = 'WalletConnect is unable to connect',
  unableToConnectExisting = 'WalletConnect is unable to connect to existing pairing',
  unableToSignLoginToken = 'WalletConnect could not sign login token',
  unableToSign = 'WalletConnect could not sign the message',
  unableToLogin = 'WalletConnect is unable to login',
  unableToHandleTopic = 'WalletConnect: Unable to handle topic update',
  unableToHandleEvent = 'WalletConnect: Unable to handle events',
  unableToHandleCleanup = 'WalletConnect: Unable to handle cleanup',
  sessionNotConnected = 'WalletConnect Session is not connected',
  sessionDeleted = 'WalletConnect Session Deleted',
  sessionExpired = 'WalletConnect Session Expired',
  alreadyLoggedOut = 'WalletConnect: Already logged out',
  pingFailed = 'WalletConnect Ping Failed',
  invalidAddress = 'WalletConnect: Invalid address',
  requestDifferentChain = 'WalletConnect: Request Chain Id different than Connection Chain Id',
  invalidMessageResponse = 'WalletConnect could not sign the message: invalid message response',
  invalidMessageSignature = 'WalletConnect: Invalid message signature',
  invalidTransactionResponse = 'WalletConnect could not sign the transactions. Invalid signatures',
  invalidCustomRequestResponse = 'WalletConnect could not send the custom request',
  transactionError = 'Transaction canceled',
  connectionError = 'WalletConnect could not establish a connection',
  invalidGuardian = 'WalletConnect: Invalid Guardian',
}
