// Based on Multiversx sdk WalletConnect signing provider with modifications

import Client from '@walletconnect/sign-client';
import { getAppMetadata } from '@walletconnect/utils';
import {
  EngineTypes,
  SessionTypes,
  SignClientTypes,
} from '@walletconnect/types';

import {
  WALLETCONNECT_MULTIVERSX_METHODS,
  WALLETCONNECT_MULTIVERSX_NAMESPACE,
} from './constants';
import { WalletConnectV2ProviderErrorMessagesEnum } from './types';
import { hexToBytes } from './utils';

enum OptionalOperation {
  SIGN_LOGIN_TOKEN = 'mvx_signLoginToken',
  SIGN_NATIVE_AUTH_TOKEN = 'mvx_signNativeAuthToken',
  CANCEL_ACTION = 'mvx_cancelAction',
}

export interface ConnectParamsTypes {
  topic?: string;
  events?: SessionTypes.Namespace['events'];
  methods?: string[];
}

export interface TransactionResponse {
  signature: string;
  guardian?: string;
  guardianSignature?: string;
  options?: number;
  version?: number;
}

export function getConnectionParams(
  chainId: string,
  options?: ConnectParamsTypes
): EngineTypes.FindParams {
  const methods = [
    ...WALLETCONNECT_MULTIVERSX_METHODS,
    ...(options?.methods ?? []),
  ];
  if (!options?.methods?.includes(OptionalOperation.SIGN_LOGIN_TOKEN)) {
    methods.push(OptionalOperation.SIGN_LOGIN_TOKEN);
  }
  const chains = [`${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${chainId}`];
  const events = options?.events ?? [];

  return {
    requiredNamespaces: {
      [WALLETCONNECT_MULTIVERSX_NAMESPACE]: {
        methods,
        chains,
        events,
      },
    },
  };
}

export function getCurrentSession(
  chainId: string,
  client?: Client
): SessionTypes.Struct {
  if (!client) {
    throw new Error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
  }

  const acknowledgedSessions = client
    .find(getConnectionParams(chainId))
    .filter((s) => s.acknowledged);

  if (acknowledgedSessions.length > 0) {
    const lastKeyIndex = acknowledgedSessions.length - 1;
    const session = acknowledgedSessions[lastKeyIndex];

    return session;
  }

  if (client.session.length > 0) {
    const lastKeyIndex = client.session.keys.length - 1;
    const session = client.session.get(client.session.keys[lastKeyIndex]);

    return session;
  }

  console.log(WalletConnectV2ProviderErrorMessagesEnum.sessionNotConnected);
  throw new Error(WalletConnectV2ProviderErrorMessagesEnum.sessionNotConnected);
}

export function getCurrentTopic(
  chainId: string,
  client?: Client
): SessionTypes.Struct['topic'] {
  if (!client) {
    throw new Error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
  }

  const session = getCurrentSession(chainId, client);
  if (!session?.topic) {
    throw new Error(
      WalletConnectV2ProviderErrorMessagesEnum.sessionNotConnected
    );
  }

  return session.topic;
}

export function addressIsValid(destinationAddress: string): boolean {
  const address = destinationAddress;
  return Boolean(address);
}

export function getAddressFromSession(session: SessionTypes.Struct): string {
  const selectedNamespace =
    session.namespaces[WALLETCONNECT_MULTIVERSX_NAMESPACE];

  if (selectedNamespace && selectedNamespace.accounts) {
    // Use only the first address in case of multiple provided addresses
    const currentSession = selectedNamespace.accounts[0];
    const [, , address] = currentSession.split(':');

    return address;
  }

  return '';
}

export function applyTransactionSignature({
  transaction,
  response,
}: {
  transaction: any;
  response: TransactionResponse;
}): any {
  if (!response) {
    console.log(
      WalletConnectV2ProviderErrorMessagesEnum.invalidTransactionResponse
    );
    throw new Error(
      WalletConnectV2ProviderErrorMessagesEnum.invalidTransactionResponse
    );
  }

  const { signature, guardianSignature, version, options, guardian } = response;
  const transactionGuardian = transaction.guardian;

  if (transactionGuardian && transactionGuardian !== guardian) {
    console.log(WalletConnectV2ProviderErrorMessagesEnum.invalidGuardian);
    throw new Error(WalletConnectV2ProviderErrorMessagesEnum.invalidGuardian);
  }

  if (guardian) {
    transaction.guardian = guardian;
  }

  if (version) {
    transaction.version = version;
  }

  if (options != null) {
    transaction.options = options;
  }

  transaction.signature = hexToBytes(signature);

  if (guardianSignature) {
    transaction.guardianSignature = hexToBytes(guardianSignature);
  }

  return transaction;
}

export function getMetadata(metadata?: SignClientTypes.Options['metadata']) {
  if (metadata) {
    return { ...metadata, url: getAppMetadata().url };
  }

  return;
}

export async function sleep(timeout: number) {
  return await new Promise<void>((resolve) =>
    setTimeout(() => {
      resolve();
    }, timeout)
  );
}
