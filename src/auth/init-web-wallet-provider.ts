import { WalletProvider } from '@multiversx/sdk-web-wallet-provider/out/walletProvider';
import { ls } from '../utils/ls-helpers';
import { getParamFromUrl } from '../utils/get-param-from-url';
import { DAPP_INIT_ROUTE } from '../utils/constants';

export const initWebWalletProvider = async (webWalletAddress: string) => {
  const signature = getParamFromUrl('signature');
  const urlAddress = getParamFromUrl('address');
  const lsAddress = ls.get('address');
  if (signature) {
    ls.set('signature', signature);
  }

  if (urlAddress || lsAddress) {
    if (urlAddress) {
      ls.set('address', urlAddress);
      window.history.replaceState(null, '', window.location.pathname);
    }
    const dappProvider = new WalletProvider(
      `${webWalletAddress}${DAPP_INIT_ROUTE}`
    );

    return dappProvider;
  }
};
