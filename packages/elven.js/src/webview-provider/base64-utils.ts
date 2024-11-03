/**
 * Required for xPortal Hub integration
 * Based on sdk-dapp webview provider implementation
 * It will probably be replaced with separate library in the future
 */

import { stringFromBase64, toBase64FromStringOrBytes } from '../core/utils';

export function isStringBase64(str: string) {
  try {
    // Try to decode the string and encode it back using base64 functions
    const atobDecoded = atob(str);
    const btoaEncoded = btoa(atobDecoded);
    const bufferFromDecoded = stringFromBase64(str);
    const bufferFromEncoded = toBase64FromStringOrBytes(bufferFromDecoded)!;

    // If the result is equal to the initial string
    const isBtoaEqual = str === btoaEncoded || btoaEncoded.startsWith(str);
    const isBufferFromBase64Equal =
      str === bufferFromEncoded || bufferFromEncoded.startsWith(str);
    const isEqualToInitialString = isBtoaEqual && isBufferFromBase64Equal;

    if (isEqualToInitialString) {
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
