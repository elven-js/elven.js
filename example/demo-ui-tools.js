/* eslint-disable @typescript-eslint/no-unused-vars */
// ==============================================================
// UI manipulation for demo purposes, for ElvenJS see below
// ==============================================================

export const uiLoggedInState = (loggedIn) => {
  const loginExtensionButton = document.getElementById(
    'button-login-extension'
  );
  const loginMaiarButton = document.getElementById('button-login-mobile');
  const logoutButton = document.getElementById('button-logout');
  const txButton = document.getElementById('button-tx');
  const txEsdtButton = document.getElementById('button-tx-esdt');
  const mintButton = document.getElementById('button-mint');
  if (loggedIn) {
    loginExtensionButton.style.display = 'none';
    loginMaiarButton.style.display = 'none';
    logoutButton.style.display = 'block';
    txButton.style.display = 'block';
    txEsdtButton.style.display = 'block';
    mintButton.style.display = 'block';
  } else {
    loginExtensionButton.style.display = 'block';
    loginMaiarButton.style.display = 'block';
    logoutButton.style.display = 'none';
    txButton.style.display = 'none';
    txEsdtButton.style.display = 'none';
    mintButton.style.display = 'none';
  }
};

export const uiSpinnerState = (isLoading, button) => {
  const buttonLoginExtension = document.getElementById(
    'button-login-extension'
  );
  const buttonLoginMobile = document.getElementById('button-login-mobile');
  const buttonEgld = document.getElementById('button-tx');
  const buttonEsdt = document.getElementById('button-tx-esdt');
  const buttonMint = document.getElementById('button-mint');
  const spinnerText = 'Transaction pending...';
  if (isLoading) {
    if (button === 'loginExtension') {
      buttonLoginExtension.innerText = 'Logging in...';
      buttonLoginExtension.setAttribute('disabled', true);
    }
    if (button === 'loginMobile') {
      buttonLoginMobile.innerText = 'Logging in...';
      buttonLoginMobile.setAttribute('disabled', true);
    }
    if (button === 'egld') {
      buttonEgld.innerText = spinnerText;
      buttonEgld.setAttribute('disabled', true);
    }
    if (button === 'esdt') {
      buttonEsdt.innerText = spinnerText;
      buttonEsdt.setAttribute('disabled', true);
    }
    if (button === 'mint') {
      buttonMint.innerText = spinnerText;
      buttonMint.setAttribute('disabled', true);
    }
  } else {
    if (button === 'loginExtension') {
      buttonLoginExtension.innerText = 'Login with Extension';
      buttonLoginExtension.removeAttribute('disabled');
    }
    if (button === 'loginMobile') {
      buttonLoginMobile.innerText = 'Login with Maiar mobile';
      buttonLoginMobile.removeAttribute('disabled');
    }
    if (button === 'egld') {
      buttonEgld.innerText = 'EGLD transaction';
      buttonEgld.removeAttribute('disabled');
    }
    if (button === 'esdt') {
      buttonEsdt.innerText = 'ESDT transaction*';
      buttonEsdt.removeAttribute('disabled');
    }
    if (button === 'mint') {
      buttonMint.innerText = 'Mint NFT';
      buttonMint.removeAttribute('disabled');
    }
  }
};

export const updateTxHashContainer = (txHash) => {
  const txHashContainer = document.getElementById('tx-hash');
  if (txHash) {
    const url = `https://devnet-explorer.elrond.com/transactions/${txHash}`;
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.classList.add('transaction-link');
    link.innerText = url;
    txHashContainer.appendChild(link);
  } else {
    txHashContainer?.querySelector('a')?.remove();
  }
};
