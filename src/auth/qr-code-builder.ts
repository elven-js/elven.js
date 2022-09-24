import QRCode from 'qrcode';
import { networkConfig, chainTypeConfig } from '../utils/constants';

const htmlStringToElement = (htmlString: string) => {
  const template = document.createElement('template');
  template.innerHTML = htmlString.trim();
  return template.content.firstChild?.cloneNode(true);
};

const buildDeepLink = (walletConnectUri: string) => {
  const hrefVal = `${
    networkConfig[chainTypeConfig]?.walletConnectDeepLink
  }?wallet-connect=${encodeURIComponent(walletConnectUri)}`;

  const aElem = document.createElement('a');
  aElem.setAttribute('href', hrefVal);
  aElem.setAttribute('rel', 'noopener noreferrer nofollow');
  aElem.setAttribute('target', '_blank');
  aElem.textContent = 'Maiar login';
  aElem.classList.add('elven-qr-code-deep-link');

  return aElem;
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

export const qrCodeBuilder = async (
  qrCodeContainer: string | HTMLElement,
  walletConnectUri: string
) => {
  if (!qrCodeContainer)
    throw new Error('Please provide the QR Code container id!');

  const qrCodeElementString = await generateQRCode(walletConnectUri);

  let qrCodeElem: HTMLElement | null = null;

  if (typeof qrCodeContainer === 'string') {
    qrCodeElem = document.getElementById(qrCodeContainer);
  } else if (qrCodeContainer instanceof HTMLElement) {
    qrCodeElem = qrCodeContainer;
  }

  let qrCodeSvg: Node | undefined;

  if (qrCodeElementString) {
    qrCodeSvg = htmlStringToElement(qrCodeElementString);
  }

  if (qrCodeElem && qrCodeSvg) {
    qrCodeElem.appendChild(qrCodeSvg);
    if (isMobile()) {
      qrCodeElem.appendChild(buildDeepLink(walletConnectUri));
    }
  }

  return qrCodeElem;
};
