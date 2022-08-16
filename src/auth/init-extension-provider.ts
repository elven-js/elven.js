import { ExtensionProvider } from '@elrondnetwork/erdjs-extension-provider';
import { ls } from '../utils/ls-helpers';

export const initExtensionProvider = async () => {
  const dappProvider = ExtensionProvider.getInstance();

  try {
    const isSuccessfullyInitialized: boolean = await dappProvider.init();

    const currentState = ls.get();

    if (currentState?.address) {
      dappProvider.setAddress(currentState.address);
    }

    if (!isSuccessfullyInitialized) {
      console.warn(
        'Something went wrong when trying to initialize the ExtensionProvider..'
      );
      return;
    }

    return dappProvider;
  } catch (e) {
    console.warn("Can't initialize the Dapp Provider!");
  }
};
