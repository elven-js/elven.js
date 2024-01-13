/**
 * Required for xPortal Hub integration
 * Based on sdk-dapp webview provider implementation
 * It will probably be replaced with separate library in the future
 */

import { decodeBase64 } from './base64-utils';
import { isString } from './utils';
import { DecodedLoginTokenType, decodeLoginToken } from './decode-login-token';

interface DecodedNativeAuthTokenType extends DecodedLoginTokenType {
  address: string;
  body: string;
  signature: string;
}

export const decodeNativeAuthToken = (
  accessToken?: string
): DecodedNativeAuthTokenType | null => {
  if (!accessToken || !isString(accessToken)) {
    return null;
  }

  const parts = accessToken.split('.');

  if (parts.length !== 3) {
    console.error(
      'Invalid nativeAuthToken. You may be trying to decode a loginToken. Try using decodeLoginToken method instead'
    );
    return null;
  }

  try {
    const [address, body, signature] = parts;
    const parsedAddress = decodeBase64(address);
    const parsedBody = decodeBase64(body);
    const parsedInitToken = decodeLoginToken(parsedBody);

    if (!parsedInitToken) {
      return {
        address: parsedAddress,
        body: parsedBody,
        signature,
        blockHash: '',
        origin: '',
        ttl: 0,
      };
    }

    const result = {
      ...parsedInitToken,
      address: parsedAddress,
      body: parsedBody,
      signature,
    };

    // if empty object, delete extraInfo
    if (!parsedInitToken.extraInfo?.timestamp) {
      delete result.extraInfo;
    }

    return result;
  } catch (err) {
    return null;
  }
};
