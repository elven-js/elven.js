import QRCode from 'qrcode';
import {
  WalletConnectV2Provider,
  PairingTypes,
} from '@multiversx/sdk-wallet-connect-provider/out/walletConnectV2Provider';
import { walletConnectDeepLink } from '../utils/constants';
import { errorParse } from '../utils/error-parse';
import { DappProvider, DappCoreWCV2CustomMethodsEnum } from '../types';

const htmlStringToElement = (htmlString: string) => {
  const template = document.createElement('template');
  template.innerHTML = htmlString.trim();
  return template.content.firstChild?.cloneNode(true);
};

const buildDeepLink = (walletConnectUri: string) => {
  const hrefVal = `${walletConnectDeepLink}?wallet-connect=${encodeURIComponent(
    walletConnectUri
  )}`;

  const aElem = document.createElement('a');
  aElem.setAttribute('href', hrefVal);
  aElem.setAttribute('rel', 'noopener noreferrer nofollow');
  aElem.setAttribute('target', '_blank');
  aElem.textContent = 'xPortal login';
  aElem.classList.add('elven-qr-code-deep-link');

  return aElem;
};

const buildPairingsContainer = () => {
  const container = document.createElement('div');
  container.classList.add('elven-wc-pairings');

  return container;
};

const buildPairingsHeader = () => {
  const headerElem = document.createElement('div');
  headerElem.textContent = 'Existing WalletConnect pairings:';
  headerElem.classList.add('elven-wc-pairings-header');

  return headerElem;
};

const pairingRemoveControllers: Record<string, AbortController> = {};

const buildPairingsRemoveButton = (
  pairing: PairingTypes.Struct,
  removeExistingPairing: (topic: string) => Promise<void>
) => {
  const btn = document.createElement('button');
  btn.classList.add('elven-wc-pairings-remove-btn');
  btn.textContent = '✖';

  pairingRemoveControllers[pairing.topic] = new AbortController();

  btn.addEventListener(
    'click',
    (e) => {
      e.stopImmediatePropagation();
      removeExistingPairing(pairing.topic);
    },
    {
      signal: pairingRemoveControllers[pairing.topic].signal,
    }
  );

  return btn;
};

const pairingLoginControllers: Record<string, AbortController> = {};

const buildPairingItem = (
  pairing: PairingTypes.Struct,
  removeExistingPairing: (topic: string) => Promise<void>,
  loginThroughExistingPairing: (topic: string) => Promise<void>
) => {
  const itemElem = document.createElement('div');
  const itemTextWrapper = document.createElement('div');
  itemElem.classList.add('elven-wc-pairing-item');
  itemElem.setAttribute('id', pairing.topic);
  itemTextWrapper.classList.add('elven-wc-pairing-item-description');
  itemTextWrapper.textContent = `${pairing.peerMetadata?.description} (${pairing.peerMetadata?.url})`;

  itemElem.appendChild(itemTextWrapper);

  const button = buildPairingsRemoveButton(pairing, removeExistingPairing);
  itemElem.appendChild(button);

  pairingLoginControllers[pairing.topic] = new AbortController();

  itemElem.addEventListener(
    'click',
    () => loginThroughExistingPairing(pairing.topic),
    { signal: pairingLoginControllers[pairing.topic].signal }
  );

  return itemElem;
};

const buildPairingItemConfirmMessage = () => {
  const itemElem = document.createElement('div');
  itemElem.classList.add('elven-wc-pairing-item-confirm-msessage');
  itemElem.innerText = 'Confirm on xPortal app!';

  return itemElem;
};

const removePairingItem = (topic: string) => {
  if (!topic) return;
  const pairingElement = document.getElementById(topic);
  pairingElement?.remove();
};

const isMobile = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

const generateQRCode = async (walletConnectUri: string) => {
  if (!walletConnectUri) {
    return;
  }

  const svg = await QRCode.toString(walletConnectUri, {
    type: 'svg',
  });

  return svg;
};

export const qrCodeAndPairingsBuilder = async (
  qrCodeContainer: string | HTMLElement,
  walletConnectUri: string,
  dappProvider: DappProvider,
  token?: string
) => {
  if (!qrCodeContainer)
    throw new Error(
      'Please provide the QR Code and WalletConnect Pairings container id!'
    );

  let containerElem: HTMLElement | null = null;

  if (typeof qrCodeContainer === 'string') {
    containerElem = document.getElementById(qrCodeContainer);
  } else if (qrCodeContainer instanceof HTMLElement) {
    containerElem = qrCodeContainer;
  }

  const qrCodeElementString = await generateQRCode(walletConnectUri);

  // QRCode

  let qrCodeSvg: Node | undefined;

  if (qrCodeElementString) {
    qrCodeSvg = htmlStringToElement(qrCodeElementString);
  }

  if (containerElem && qrCodeSvg) {
    containerElem.replaceChildren();
    containerElem.appendChild(qrCodeSvg);
    if (isMobile()) {
      containerElem.appendChild(buildDeepLink(walletConnectUri));
    }
  }

  // WC Pairings

  if (containerElem && dappProvider instanceof WalletConnectV2Provider) {
    const wcPairings = dappProvider.pairings;

    const removeExistingPairing = async (topic: string) => {
      try {
        if (topic) {
          await dappProvider.logout({
            topic,
          });
          removePairingItem(topic);
        }
      } catch (e) {
        const err = errorParse(e);
        console.warn(
          `Something went wrong trying to remove the existing pairing: ${err}`
        );
      } finally {
        pairingLoginControllers[topic].abort();
      }
    };

    const loginThroughExistingPairing = async (topic: string) => {
      try {
        const { approval } = await dappProvider.connect({
          topic,
          methods: [DappCoreWCV2CustomMethodsEnum.erd_cancelAction],
        });

        const pairingItemElement = document.getElementById(topic);
        pairingItemElement?.after(buildPairingItemConfirmMessage());

        await dappProvider.login({
          approval,
          token,
        });
      } catch (e) {
        const err = errorParse(e);
        console.warn(`Something went wrong trying to login the user: ${err}`);
      } finally {
        for (const abortController of Object.values(pairingLoginControllers)) {
          abortController?.abort();
        }
        for (const abortController of Object.values(pairingRemoveControllers)) {
          abortController?.abort();
        }
      }
    };

    if (wcPairings && wcPairings.length > 0) {
      const container = buildPairingsContainer();
      containerElem.appendChild(container);

      const headerElem = buildPairingsHeader();
      container.appendChild(headerElem);

      for (const pairing of wcPairings) {
        const itemElem = buildPairingItem(
          pairing,
          removeExistingPairing,
          loginThroughExistingPairing
        );
        container.appendChild(itemElem);
      }
    }
  }

  return containerElem;
};
