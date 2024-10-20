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

// ================== qs-like replacement start

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
        if (!Array.isArray(current)) {
          current = [];
        }
        current.push(value);
      } else if (typeof key === 'number') {
        if (!Array.isArray(current)) {
          current = [];
        }
        current[key] = value;
      } else {
        current[key] = value;
      }
    } else {
      const nextKey = keys[i + 1];

      if (key === '') {
        if (!Array.isArray(current)) {
          current = [];
        }
        if (
          current.length === 0 ||
          typeof current[current.length - 1] !== 'object'
        ) {
          current.push(typeof nextKey === 'number' ? [] : {});
        }
        current = current[current.length - 1];
      } else if (typeof key === 'number') {
        if (!Array.isArray(current)) {
          current = [];
        }
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

// ================== qs-like replacement stop
