/**
 * Used for xPortal Hub integration
 */

import { LoginMethodsEnum } from '../types';
import { ls } from '../utils/ls-helpers';
import { decodeNativeAuthToken } from '../webview-provider/decode-native-auth-token';
import { WebviewProvider } from '../webview-provider/webview-provider';

export function loginWithNativeAuthToken(token: string, elven: any) {
  const nativeAuthInfo = decodeNativeAuthToken(token);

  if (nativeAuthInfo == null) {
    return;
  }

  const { signature, address, body } = nativeAuthInfo;

  if (signature && token && address) {
    ls.set('loginToken', body);
    ls.set('accessToken', token);
    ls.set('signature', signature);
    ls.set('address', address);
    ls.set('loginMethod', LoginMethodsEnum.xPortalHub);

    elven.dappProvider = new WebviewProvider();
  }
}
