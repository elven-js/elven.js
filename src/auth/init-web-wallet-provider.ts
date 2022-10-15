import { WalletProvider } from '@elrondnetwork/erdjs-web-wallet-provider';
import { ls } from '../utils/ls-helpers';
import { getParamFromUrl } from '../utils/getParamFromUrl';
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
      window.location.href = window.location.href.split('?')[0];
    }
    const dappProvider = new WalletProvider(
      `${webWalletAddress}${DAPP_INIT_ROUTE}`
    );

    return dappProvider;
  }
};
