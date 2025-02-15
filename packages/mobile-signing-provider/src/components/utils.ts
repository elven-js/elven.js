export const errorParse = (err: unknown) => {
  if (typeof err === 'string') {
    return err.toUpperCase();
  } else if (err instanceof Error) {
    return err.message;
  }
  return JSON.stringify(err);
};

export function getRandomAddressFromNetwork(addresses: string[]) {
  return addresses[Math.floor(Math.random() * addresses.length)];
}

export const walletConnectDeepLink =
  'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://xportal.com/';

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
