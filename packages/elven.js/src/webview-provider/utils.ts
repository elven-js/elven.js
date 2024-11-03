/**
 * Required for xPortal Hub integration
 * Based on sdk-dapp webview provider implementation
 * It will probably be replaced with separate library in the future
 */

export const isString = (x: any) => {
  return Object.prototype.toString.call(x) === '[object String]';
};
