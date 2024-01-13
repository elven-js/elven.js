/**
 * Required for xPortal Hub integration
 * Based on sdk-dapp webview provider implementation
 * It will probably be replaced with separate library in the future
 */
import { PlatformsEnum } from './types';
export declare const detectCurrentPlatform: () => PlatformsEnum.ios | PlatformsEnum.reactNative | PlatformsEnum.web;
export declare const getTargetOrigin: () => string;
export declare const isString: (x: any) => boolean;
