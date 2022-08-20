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
  const mintButton = document.getElementById('button-mint');
  if (loggedIn) {
    loginExtensionButton.style.display = 'none';
    loginMaiarButton.style.display = 'none';
    logoutButton.style.display = 'block';
    txButton.style.display = 'block';
    mintButton.style.display = 'block';
  } else {
    loginExtensionButton.style.display = 'block';
    loginMaiarButton.style.display = 'block';
    logoutButton.style.display = 'none';
    txButton.style.display = 'none';
    mintButton.style.display = 'none';
  }
};

export const uiSpinnerState = (isLoading, button) => {
  const buttonLoginExtension = document.getElementById(
    'button-login-extension'
  );
  const buttonLoginMobile = document.getElementById('button-login-mobile');
  const buttonEgld = document.getElementById('button-tx');
  const buttonMint = document.getElementById('button-mint');
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
      buttonEgld.innerText = 'Transaction pending...';
      buttonEgld.setAttribute('disabled', true);
    }
    if (button === 'mint') {
      buttonMint.innerText = 'Transaction pending...';
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
      buttonEgld.innerText = 'Send predefined transaction';
      buttonEgld.removeAttribute('disabled');
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
