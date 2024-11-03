import { Account } from '../core/account';
import { errorParse } from '../utils/error-parse';
import { ls } from '../utils/ls-helpers';
import { isLoginExpired } from './expires-at';

export const accountSync = async (elven: any) => {
  const address = ls.get('address');
  const loginExpires = ls.get('expires');
  const loginExpired = loginExpires && isLoginExpired(loginExpires);

  if (!loginExpired && address && elven.networkProvider) {
    const userAccountInstance = new Account(address);
    try {
      const userAccountOnNetwork =
        await elven.networkProvider.getAccount(address);

      const userGuardianOnNetwork =
        await elven.networkProvider.getGuardianData(address);

      ls.set('address', address);
      ls.set(
        'activeGuardian',
        userGuardianOnNetwork.guarded &&
          userGuardianOnNetwork.activeGuardian?.address
          ? userGuardianOnNetwork.activeGuardian.address
          : ''
      );
      ls.set('nonce', userAccountOnNetwork.nonce.valueOf());
      ls.set('balance', userAccountOnNetwork.balance.toString());
      userAccountInstance.update(userAccountOnNetwork);
    } catch (e) {
      const err = errorParse(e);
      console.warn(
        `Something went wrong trying to synchronize the user account: ${err}`
      );
    }
  }
};
