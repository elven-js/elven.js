/**
 * Required for xPortal Hub integration
 * Based on sdk-dapp webview provider implementation
 * It will probably be replaced with separate library in the future
 */

export function isStringBase64(str: string) {
  try {
    // Try to decode the string and encode it back using base64 functions
    const atobDecoded = atob(str);
    const btoaEncoded = btoa(atobDecoded);
    const bufferFromDecoded = Buffer.from(str, 'base64').toString();
    const bufferFromEncoded = Buffer.from(bufferFromDecoded).toString('base64');

    // If the result is equal to the initial string
    const isEqualToInitialString =
      str === btoaEncoded && str === bufferFromEncoded;

    // or the atob() conversion is equal to the Buffer.from('base64')
    const isAtobEqualToBufferFrom = atobDecoded === bufferFromDecoded;

    if (isEqualToInitialString || isAtobEqualToBufferFrom) {
      // it is a regular base64 string
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function decodeBase64(string: string) {
  if (!isStringBase64(string)) {
    return string;
  }

  return atob(string);
}
