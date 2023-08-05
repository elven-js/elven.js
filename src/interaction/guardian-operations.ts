import { Transaction } from '@multiversx/sdk-core/out/transaction';
import { ls } from '../utils/ls-helpers';
import {
  TransactionVersion,
  TransactionOptions,
} from '@multiversx/sdk-core/out/networkParams';
import { Address } from '@multiversx/sdk-core/out/address';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider/out';
import { DAPP_INIT_ROUTE } from '../utils/constants';
import { WebWalletUrlParamsEnum } from '../types';

export const guardianPreSignTxOperations = (tx: Transaction) => {
  const guardian = ls.get('activeGuardian');
  if (guardian) {
    const options = {
      guarded: true,
    };
    tx.setVersion(TransactionVersion.withTxOptions());
    tx.setOptions(TransactionOptions.withOptions(options));
    tx.setGuardian(Address.fromBech32(guardian));
  }

  return tx;
};

export const sendTxToGuardian = async (
  signedTx: Transaction,
  walletAddress?: string
) => {
  const webWalletProvider = new WalletProvider(
    `${walletAddress}${DAPP_INIT_ROUTE}`
  );
  const currentUrl = window?.location.href;

  const alteredCallbackUrl = new URL(currentUrl);
  alteredCallbackUrl.searchParams.set(
    WebWalletUrlParamsEnum.hasWebWalletGuardianSign,
    'true'
  );

  await webWalletProvider.guardTransactions([signedTx], {
    callbackUrl: encodeURIComponent(alteredCallbackUrl.toString()),
  });
};

export const checkNeedsGuardianSigning = (signedTx: Transaction) => {
  const guardian = ls.get('activeGuardian');
  const address = ls.get('address');
  if (!address || !guardian) {
    return false;
  }

  if (signedTx.isGuardedTransaction()) {
    return false;
  }

  return true;
};
