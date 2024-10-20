export const isValidHex = (value: string) =>
  value.match(/.{1,2}/g)?.length === 32;

export const stringToBytes = (string: string) => {
  return new TextEncoder().encode(string);
};

export const hexToBytes = (hex: string) => {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }
  return Uint8Array.from(bytes);
};

export const bytesToString = (uint8Array: Uint8Array) => {
  const decoder = new TextDecoder();
  const string = decoder.decode(uint8Array);
  return string;
};

export const bytesToHex = (uint8Array: Uint8Array) => {
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const stringToHex = (string: string) => {
  const uint8Array = stringToBytes(string);
  return bytesToHex(uint8Array);
};

export const bytesFromBase64 = (base64: string) => {
  let byteArray;

  function isBase64(str: string) {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  }

  if (isBase64(base64)) {
    const binaryString = atob(base64);
    const binaryLength = binaryString.length;
    byteArray = new Uint8Array(binaryLength);
    for (let i = 0; i < binaryLength; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
  } else {
    byteArray = new TextEncoder().encode(base64);
  }

  return byteArray;
};

export const toBase64fromStringOrBytes = (value: string | Uint8Array) => {
  if (!value || !value.length) return undefined;

  let utf8Bytes;

  if (typeof value === 'string') {
    utf8Bytes = new TextEncoder().encode(value);
  } else if (value instanceof Uint8Array) {
    utf8Bytes = value;
  } else {
    return undefined; // Invalid input type
  }

  const binary = String.fromCharCode(...utf8Bytes);

  return btoa(binary);
};

export const combineBytes = (bytesArray: Uint8Array[]) => {
  const totalLength = bytesArray.reduce((sum, bytes) => sum + bytes.length, 0);
  const combinedBytes = new Uint8Array(totalLength);
  let offset = 0;

  bytesArray.forEach((bytes) => {
    combinedBytes.set(bytes, offset);
    offset += bytes.length;
  });

  return combinedBytes;
};

// TODO: fix these, should work similar to qs
export function parseQueryString(queryString: string): Record<string, any> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, any> = {};

  for (const [key, value] of params.entries()) {
    const match = key.match(/^(\w+)(?:\[(\d*)\])?$/); // Match keys like nonce[0] or nonce (standard keys)

    if (match) {
      const paramName = match[1];
      const index = match[2] !== undefined ? Number(match[2]) : null;

      if (index !== null) {
        // If it's an array-like param (e.g., nonce[0])
        if (!result[paramName]) {
          result[paramName] = [];
        }
        result[paramName][index] = value;
      } else {
        // Standard param (e.g., nonce)
        if (!result[paramName]) {
          result[paramName] = value;
        } else if (Array.isArray(result[paramName])) {
          (result[paramName] as any[]).push(value);
        } else {
          result[paramName] = [result[paramName], value];
        }
      }
    }
  }

  return result;
}

export function stringifyQueryParams(params: Record<string, any>): string {
  const queryParams: string[] = [];

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      if (Array.isArray(params[key])) {
        // Handle array-like parameters
        params[key].forEach((value: any, index: number) => {
          queryParams.push(`${key}[${index}]=${encodeURIComponent(value)}`);
        });
      } else if (typeof params[key] === 'object') {
        // Handle nested objects (qs supports this)
        for (const subKey in params[key]) {
          queryParams.push(
            `${key}[${subKey}]=${encodeURIComponent(params[key][subKey])}`
          );
        }
      } else {
        // Handle standard parameters
        queryParams.push(`${key}=${encodeURIComponent(params[key])}`);
      }
    }
  }

  return queryParams.join('&');
}
