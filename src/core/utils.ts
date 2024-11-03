// Common constants and instances
const base64Chars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const base64Map = new Uint8Array(256);
for (let i = 0; i < base64Chars.length; i++) {
  base64Map[base64Chars.charCodeAt(i)] = i;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// Utility Functions
export const isValidHex = (value: string): boolean =>
  /^[0-9a-fA-F]{64}$/.test(value);

export const stringToBytes = (string: string): Uint8Array => {
  return textEncoder.encode(string);
};

export const bytesToString = (bytes: Uint8Array): string => {
  return textDecoder.decode(bytes);
};

export const hexToBytes = (hex: string): Uint8Array => {
  if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
};

export const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const stringToHex = (string: string): string => {
  return bytesToHex(stringToBytes(string));
};

// Base64 Encoding/Decoding Functions
export const bytesFromBase64 = (base64String: string): Uint8Array => {
  base64String = base64String.replace(/[^A-Za-z0-9+/=]/g, '');

  let padding = 0;
  if (base64String.endsWith('==')) {
    padding = 2;
  } else if (base64String.endsWith('=')) {
    padding = 1;
  }

  const byteLength = Math.floor((base64String.length * 6) / 8 - padding);
  const bytes = new Uint8Array(byteLength);

  let buffer = 0;
  let bitsCollected = 0;
  let byteIndex = 0;

  for (let i = 0; i < base64String.length; i++) {
    const c = base64String.charAt(i);
    if (c === '=') break;

    buffer = (buffer << 6) | base64Map[c.charCodeAt(0)];
    bitsCollected += 6;

    if (bitsCollected >= 8) {
      bitsCollected -= 8;
      bytes[byteIndex++] = (buffer >> bitsCollected) & 0xff;
    }
  }

  return bytes;
};

export const bytesToBase64 = (bytes: Uint8Array): string => {
  let base64 = '';
  const len = bytes.length;

  for (let i = 0; i < len; i += 3) {
    const byte1 = bytes[i];
    const byte2 = i + 1 < len ? bytes[i + 1] : 0;
    const byte3 = i + 2 < len ? bytes[i + 2] : 0;

    const combined = (byte1 << 16) | (byte2 << 8) | byte3;

    const enc1 = (combined >> 18) & 0x3f;
    const enc2 = (combined >> 12) & 0x3f;
    const enc3 = (combined >> 6) & 0x3f;
    const enc4 = combined & 0x3f;

    base64 += base64Chars.charAt(enc1);
    base64 += base64Chars.charAt(enc2);
    base64 += i + 1 < len ? base64Chars.charAt(enc3) : '=';
    base64 += i + 2 < len ? base64Chars.charAt(enc4) : '=';
  }

  return base64;
};

export const stringFromBase64 = (base64String: string): string => {
  return bytesToString(bytesFromBase64(base64String));
};

export const toBase64FromStringOrBytes = (
  input: string | Uint8Array
): string => {
  const bytes = typeof input === 'string' ? stringToBytes(input) : input;
  return bytesToBase64(bytes);
};

// Combine Bytes
export const combineBytes = (bytesArray: Uint8Array[]): Uint8Array => {
  const totalLength = bytesArray.reduce((sum, bytes) => sum + bytes.length, 0);
  const combinedBytes = new Uint8Array(totalLength);
  let offset = 0;

  bytesArray.forEach((bytes) => {
    combinedBytes.set(bytes, offset);
    offset += bytes.length;
  });

  return combinedBytes;
};

// Query String Parsing and Stringifying
function parseKey(key: string): Array<string | number> {
  const keys: Array<string | number> = [];
  const regex = /([^[\]]+)|\[(.*?)\]/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(key)) !== null) {
    if (match[1] !== undefined) {
      keys.push(match[1]);
    } else if (match[2] !== undefined) {
      if (match[2] === '') {
        keys.push('');
      } else if (/^\d+$/.test(match[2])) {
        keys.push(Number(match[2]));
      } else {
        keys.push(match[2]);
      }
    }
  }

  return keys;
}

function setDeep(obj: any, keys: Array<string | number>, value: any) {
  let current = obj;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (i === keys.length - 1) {
      if (key === '') {
        if (!Array.isArray(current)) current = [];
        current.push(value);
      } else if (typeof key === 'number') {
        if (!Array.isArray(current)) current = [];
        current[key] = value;
      } else {
        current[key] = value;
      }
    } else {
      const nextKey = keys[i + 1];

      if (key === '') {
        if (!Array.isArray(current)) current = [];
        if (
          current.length === 0 ||
          typeof current[current.length - 1] !== 'object'
        ) {
          current.push(typeof nextKey === 'number' ? [] : {});
        }
        current = current[current.length - 1];
      } else if (typeof key === 'number') {
        if (!Array.isArray(current)) current = [];
        if (!current[key]) {
          current[key] = typeof nextKey === 'number' ? [] : {};
        }
        current = current[key];
      } else {
        if (!current[key]) {
          current[key] =
            typeof nextKey === 'number' || nextKey === '' ? [] : {};
        }
        current = current[key];
      }
    }
  }
}

function buildQueryParams(
  keys: Array<string | number>,
  value: any,
  queryParams: string[]
) {
  if (value === null || value === undefined) return;

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        buildQueryParams([...keys, ''], item, queryParams);
      });
    } else {
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          buildQueryParams([...keys, key], value[key], queryParams);
        }
      }
    }
  } else {
    const keyString = keys
      .map((key, index) => {
        if (index === 0) {
          return encodeURIComponent(String(key));
        } else if (key === '') {
          return '[]';
        } else {
          return `[${encodeURIComponent(String(key))}]`;
        }
      })
      .join('');
    queryParams.push(`${keyString}=${encodeURIComponent(value)}`);
  }
}

export function parseQueryString(queryString: string): Record<string, any> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, any> = {};

  for (const [key, value] of params.entries()) {
    const keys = parseKey(key);
    setDeep(result, keys, value);
  }

  return result;
}

export function stringifyQueryParams(params: Record<string, any>): string {
  const queryParams: string[] = [];
  buildQueryParams([], params, queryParams);
  return queryParams.join('&');
}

// Window and Document Utilities
export const isWindowAvailable = (): boolean =>
  typeof window !== 'undefined' && typeof window.location !== 'undefined';

export const getTargetOrigin = (): string => {
  if (isWindowAvailable()) {
    const ancestorOrigins = window.location.ancestorOrigins;
    return ancestorOrigins?.[ancestorOrigins.length - 1] ?? '*';
  }
  return '*';
};

export const isMobileWebview = (): boolean => {
  const windowObj = window as any;
  return Boolean(windowObj?.ReactNativeWebView || windowObj?.webkit);
};
