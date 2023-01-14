import QRCode from 'qrcode';
import {
  WalletConnectV2Provider,
  PairingTypes,
} from '@multiversx/sdk-wallet-connect-provider/out/walletConnectV2Provider';
import { walletConnectDeepLink } from '../utils/constants';
import { DappProvider } from '../types';

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
  aElem.textContent = 'Maiar login';
  aElem.classList.add('elven-qr-code-deep-link');

  return aElem;
};

const buildPairingsContainer = () => {
  const container = document.createElement('div');
  container.classList.add('elven-wc-pairings');
  container.setAttribute('id', 'elven-wc-pairings');

  return container;
};

const buildPairingsHeader = () => {
  const headerElem = document.createElement('div');
  headerElem.textContent = 'Existing WalletConnect pairings:';
  headerElem.classList.add('elven-wc-pairings-header');
  headerElem.setAttribute('id', 'elven-wc-pairings-header');

  return headerElem;
};

const buildPairingsRemoveButton = (pairing: PairingTypes.Struct) => {
  const btn = document.createElement('button');
  btn.classList.add('elven-wc-pairings-remove-btn');
  btn.setAttribute('id', 'elven-wc-pairings-remove-btn');
  btn.textContent = '✖';

  // TODO: connect and login logic
  btn.addEventListener('click', () => console.log('Click, ', pairing));

  return btn;
};

const buildPairingItem = (pairing: PairingTypes.Struct) => {
  const itemElem = document.createElement('div');
  itemElem.classList.add('elven-wc-pairing-item');
  itemElem.setAttribute('id', 'elven-wc-pairing-item');
  itemElem.textContent = `${pairing.peerMetadata.description}\n(${pairing.peerMetadata.url})`;

  const button = buildPairingsRemoveButton(pairing);
  itemElem.appendChild(button);

  return itemElem;
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
  dappProvider: DappProvider
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

    if (wcPairings) {
      const container = buildPairingsContainer();
      containerElem.appendChild(container);

      const headerElem = buildPairingsHeader();
      container.appendChild(headerElem);

      for (const pairing of wcPairings) {
        const itemElem = buildPairingItem(pairing);
        container.appendChild(itemElem);
      }
    }
  }

  return containerElem;
};
