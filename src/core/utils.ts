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
