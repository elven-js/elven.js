import { Address } from '@elrondnetwork/erdjs/out/address';
import { Account } from '@elrondnetwork/erdjs/out/account';

import { errorParse } from '../utils/errorParse';
import { ls } from '../utils/ls-helpers';
import { isLoginExpired } from './expires-at';

declare global {
  interface Window {
    ElvenJS: any;
  }
}

export const accountSync = async () => {
  const address = ls.get('address');
  const loginExpires = ls.get('expires');
  const loginExpired = loginExpires && isLoginExpired(loginExpires);

  if (!loginExpired && address && window.ElvenJS.networkProvider) {
    const userAddressInstance = new Address(address);
    const userAccountInstance = new Account(userAddressInstance);
    try {
      const userAccountOnNetwork =
        await window.ElvenJS.networkProvider.getAccount(userAddressInstance);
      userAccountInstance.update(userAccountOnNetwork);
      ls.set('address', address);
      ls.set('nonce', userAccountInstance.nonce.valueOf());
      ls.set('balance', userAccountInstance.balance.toString());
    } catch (e) {
      const err = errorParse(e);
      console.warn(
        `Something went wrong trying to synchronize the user account: ${err}`
      );
    }
  }
};
