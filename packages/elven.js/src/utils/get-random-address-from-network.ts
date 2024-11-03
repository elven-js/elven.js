export function getRandomAddressFromNetwork(addresses: string[]) {
  return addresses[Math.floor(Math.random() * addresses.length)];
}
