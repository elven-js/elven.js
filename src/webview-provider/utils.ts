/**
 * Required for xPortal Hub integration
 * Based on sdk-dapp webview provider implementation
 * It will probably be replaced with separate library in the future
 */

import { PlatformsEnum } from './types';

const safeWindow = typeof window !== 'undefined' ? (window as any) : {};

export const detectCurrentPlatform = () => {
  if (safeWindow.ReactNativeWebView) {
    return PlatformsEnum.reactNative;
  }
  if (safeWindow.webkit) {
    return PlatformsEnum.ios;
  }
  return PlatformsEnum.web;
};

export const getTargetOrigin = () => {
  return typeof window != 'undefined' && typeof window?.location != 'undefined'
    ? window?.parent?.origin ?? '*'
    : '*';
};

export const isString = (x: any) => {
  return Object.prototype.toString.call(x) === '[object String]';
};
