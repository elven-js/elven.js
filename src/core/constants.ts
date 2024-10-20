// Based on Multiversx sdk-core with modifications

export const TRANSACTION_MIN_GAS_PRICE = 1000000000;
export const TRANSACTION_OPTIONS_DEFAULT = 0;
export const TRANSACTION_VERSION_DEFAULT = 2;
export const TRANSACTION_OPTIONS_TX_GUARDED = 0b0010;
export const HEX_TRANSACTION_HASH_LENGTH = 64;
export const DEFAULT_MESSAGE_VERSION = 1;
export const MESSAGE_PREFIX = '\x17Elrond Signed Message:\n';
export const SDK_JS_SIGNER = 'sdk-js';
export const UNKNOWN_SIGNER = 'unknown';
export const WALLET_PROVIDER_CONNECT_URL = 'hook/login';
export const WALLET_PROVIDER_DISCONNECT_URL = 'hook/logout';
export const WALLET_PROVIDER_SEND_TRANSACTION_URL = 'hook/transaction';
export const WALLET_PROVIDER_SIGN_TRANSACTION_URL = 'hook/sign';
export const WALLET_PROVIDER_GUARD_TRANSACTION_URL = 'hook/2fa';
export const WALLET_PROVIDER_SIGN_MESSAGE_URL = 'hook/sign-message';
export const WALLET_PROVIDER_CALLBACK_PARAM = 'walletProviderStatus';
export const WALLET_PROVIDER_CALLBACK_PARAM_TX_SIGNED = 'transactionsSigned';
