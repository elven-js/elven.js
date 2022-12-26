/* eslint-disable @typescript-eslint/no-unused-vars */
// ==============================================================
// UI manipulation for demo purposes
// ==============================================================
export const uiPending = (isPending) => {
  const overlay = document.querySelector('.overlay');
  if (isPending) {
    overlay.classList.add('visible');
  } else {
    overlay.classList.remove('visible');
  }
};

export const uiLoggedInState = (loggedIn) => {
  const loginExtensionButton = document.getElementById(
    'button-login-extension'
  );
  const loginMaiarButton = document.getElementById('button-login-mobile');
  const loginWebButton = document.getElementById('button-login-web');
  const logoutButton = document.getElementById('button-logout');
  const txButton = document.getElementById('button-tx');
  const txEsdtButton = document.getElementById('button-tx-esdt');
  const mintButton = document.getElementById('button-mint');
  const queryButton = document.getElementById('button-query');
  if (loggedIn) {
    loginExtensionButton.style.display = 'none';
    loginMaiarButton.style.display = 'none';
    loginWebButton.style.display = 'none';
    logoutButton.style.display = 'block';
    txButton.style.display = 'block';
    txEsdtButton.style.display = 'block';
    mintButton.style.display = 'block';
    queryButton.style.display = 'block';
  } else {
    loginExtensionButton.style.display = 'block';
    loginMaiarButton.style.display = 'block';
    loginWebButton.style.display = 'block';
    logoutButton.style.display = 'none';
    txButton.style.display = 'none';
    txEsdtButton.style.display = 'none';
    mintButton.style.display = 'none';
    queryButton.style.display = 'none';
  }
  uiPending(false);
};

export const updateTxHashContainer = (txHash) => {
  const txHashContainer = document.getElementById('tx-hash-or-query-result');
  if (txHash) {
    txHashContainer?.replaceChildren();
    const url = `https://devnet-explorer.elrond.com/transactions/${txHash}`;
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.classList.add('transaction-link');
    link.innerText = `➡️ ${url}`;
    txHashContainer?.appendChild(link);
  } else {
    txHashContainer?.replaceChildren();
  }
};

export const updateQueryResultContainer = (result) => {
  const queryContainer = document.getElementById('tx-hash-or-query-result');
  if (result) {
    queryContainer?.replaceChildren();
    const divElem = document.createElement('div');
    divElem.innerText = result;
    queryContainer?.appendChild(divElem);
  } else {
    queryContainer?.replaceChildren();
  }
};

// For simplicity, you should probably use Buffer in browser for that
export const base64ToDecimalHex = (str) => {
  const raw = window.atob(str);
  const result = [...raw].map((c) =>
    c.charCodeAt(0).toString(16).padStart(2, 0)
  ).join``;
  return result.toUpperCase();
};

export const clearQrCodeContainer = () => {
  const qrContainer = document.querySelector('#qr-code-container');
  if (qrContainer?.childNodes?.length > 0) {
    qrContainer?.replaceChildren();
  }
};
