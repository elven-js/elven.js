import { Transaction } from '../core/transaction';
import { ls } from '../utils/ls-helpers';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider/out/walletProvider';
import { DAPP_INIT_ROUTE } from '../utils/constants';
import { WebWalletUrlParamsEnum } from '../types';
import {
  TRANSACTION_OPTIONS_TX_GUARDED,
  TRANSACTION_VERSION_DEFAULT,
} from '../core/constants';

export const guardianPreSignTxOperations = (tx: Transaction) => {
  const guardian = ls.get('activeGuardian');
  if (guardian) {
    tx.version = TRANSACTION_VERSION_DEFAULT;
    tx.options = TRANSACTION_OPTIONS_TX_GUARDED;
    tx.guardian = guardian;
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
