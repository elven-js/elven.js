/* eslint-disable @typescript-eslint/no-unused-vars */
// ==============================================================
// UI manipulation for demo purposes
// ==============================================================
export const uiPending = (isPending) => {
  const wrapper = document.querySelector('.loader-wrapper');
  if (isPending) {
    wrapper.classList.add('visible');
  } else {
    wrapper.classList.remove('visible');
  }
};

export const uiLoggedInState = (loggedIn) => {
  const loginExtensionButton = document.getElementById(
    'button-login-extension'
  );
  const loginButton = document.getElementById('button-login-mobile');
  const loginWebButton = document.getElementById('button-login-web');
  const loginXaliasButton = document.getElementById('button-login-x-alias');
  const logoutButton = document.getElementById('button-logout');
  const txButton = document.getElementById('button-tx');
  const txEsdtButton = document.getElementById('button-tx-esdt');
  const mintButton = document.getElementById('button-mint');
  const queryButton = document.getElementById('button-query');
  const signMessageButton = document.getElementById('button-sign-message');

  if (loggedIn) {
    loginExtensionButton.style.display = 'none';
    loginButton.style.display = 'none';
    loginWebButton.style.display = 'none';
    loginXaliasButton.style.display = 'none';
    logoutButton.style.display = 'block';
    txButton.style.display = 'block';
    txEsdtButton.style.display = 'block';
    mintButton.style.display = 'block';
    queryButton.style.display = 'block';
    signMessageButton.style.display = 'block';
  } else {
    loginExtensionButton.style.display = 'block';
    loginButton.style.display = 'block';
    loginWebButton.style.display = 'block';
    loginXaliasButton.style.display = 'block';
    logoutButton.style.display = 'none';
    txButton.style.display = 'none';
    txEsdtButton.style.display = 'none';
    mintButton.style.display = 'none';
    queryButton.style.display = 'none';
    signMessageButton.style.display = 'none';
  }
  uiPending(false);
};

export const displayError = (error) => {
  if (error) {
    const txHashContainer = document.getElementById('operation-result');
    txHashContainer.replaceChildren();
    const container = document.createElement('div');
    container.classList.add('operation-result');
    container.innerText =
      'There was an error: "' + error + '" Please try again!';
    txHashContainer?.appendChild(container);
  }
};

export const updateTxHashContainer = (txHash, isPending) => {
  if (txHash) {
    const txHashContainer = document.getElementById('operation-result');
    txHashContainer.replaceChildren();
    const url = `https://devnet-explorer.multiversx.com/transactions/${txHash}`;
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('target', '_blank');
    link.classList.add('transaction-link');
    link.innerText = `Click to check your transaction on the Explorer.${isPending ? ' (Still pending...)' : ''}`;
    txHashContainer?.appendChild(link);
  }
};

export const updateOperationResultContainer = (result) => {
  const queryContainer = document.getElementById('operation-result');
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
