// import {
//   SessionEventTypes,
//   WalletConnectV2Provider,
// } from '@multiversx/sdk-wallet-connect-provider/out/walletConnectV2Provider';
// import { networkConfig } from '../utils/constants';
// import { logout } from './logout';
// import { getRandomAddressFromNetwork } from '../utils/get-random-address-from-network';

// export const initMobileProvider = async (elven: any) => {
//   if (
//     !elven.initOptions.walletConnectV2ProjectId ||
//     !elven.initOptions.chainType
//   ) {
//     return undefined;
//   }

//   const providerHandlers = {
//     onClientLogin: () => {},
//     onClientLogout: () => logout(elven),
//     onClientEvent: (event: SessionEventTypes['event']) => {
//       console.log('wc2 session event: ', event);
//     },
//   };

//   const relayAddress = getRandomAddressFromNetwork(
//     elven.initOptions.walletConnectV2RelayAddresses
//   );

//   const dappProviderInstance = new WalletConnectV2Provider(
//     providerHandlers,
//     networkConfig[elven.initOptions.chainType].shortId,
//     relayAddress,
//     elven.initOptions.walletConnectV2ProjectId
//   );

//   try {
//     await dappProviderInstance.init();
//     return dappProviderInstance;
//   } catch {
//     console.warn("Can't initialize the Dapp Provider!");
//   }
// };
