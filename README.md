## ElvenJS

### One static file to rule it all on the Elrond blockchain!

## Demos
- [elvenjs.netlify.app](https://elvenjs.netlify.app/)
- [StackBlitz demo](https://stackblitz.com/edit/web-platform-d4rx5v?file=index.html)

Authenticate, sign and send transactions and messages on the Elrond blockchain in the browser. No need for bundlers, frameworks, etc. Just attach the script source, and you are ready to go. You can incorporate it into your preferred CMS framework like WordPress or an e-commerce system. Plus, it will also work on a standard static HTML website.

The primary purpose of this tool is to have a lite script for browser usage where you can authenticate and sign/send transactions on the Elrond blockchain and do this without any additional build steps.

The purpose is to simplify the usage for primary use cases and open the doors for many frontend tools and approaches.

It is a script for browsers with a global Window namespace: `ElvenJS`. If you need fully functional JavaScript/Typescript SDK (also in Nodejs), please use [erdjs](https://github.com/ElrondNetwork/elrond-sdk-erdjs), an official Typescriot Elrond SDK.

**You can use it already, but it is under active development, and the API might change, and there could be breaking changes.**

### How to use it

Just copy and include the `elven.js` script from the `build` directory or CDN (https://unpkg.com/elven.js/build/elven.js). Example: 

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Elven.js demo</title>
  </head>

  <body>
    <div class="header" id="header">
      <button
        class="button"
        id="button-tx"
        onclick="signAndSendEgld()"
        style="display: none;"
      >
        Send predefined transaction
      </button>
      <button
        class="button"
        id="button-mint"
        onclick="mintNFT()"
        style="display: none;"
      >
        Mint NFT
      </button>
      <button
        class="button"
        id="button-login-extension"
        onclick="loginWithBrowserExtension()"
        style="display: none;"
      >
        Login with Extension
      </button>
      <button
        class="button"
        id="button-login-mobile"
        onclick="loginWithMaiarMobileApp()"
        style="display: none;"
      >
        Login with Maiar mobile
      </button>
      <button
        class="button"
        id="button-logout"
        onclick="logout()"
        style="display: none;"
      >
        Logout
      </button>
    </div>

    <div id="tx-hash" class="tx-hash"></div>
    <div id="qr-code-container"></div>

    <!-- Include the script from local file system or CDN -->
    <!-- https://unpkg.com/elven.js/build/elven.js -->
    <script src="elven.js"></script>

    <script>
      const initElven = async () => {
        const isLoggedIn = await ElvenJS.init({
          apiUrl: 'https://devnet-api.elrond.com',
          chainType: 'devnet',
          apiTimeout: 10000,
        });

        uiLoggedInState(isLoggedIn);
      };

      initElven();

      const loginWithBrowserExtension = async () => {
        try {
          uiSpinnerState(true, 'loginExtension');
          await ElvenJS.login('maiar-browser-extension');
          uiLoggedInState(true);
        } catch (e) {
          console.log('Login: Something went wrong, try again!', e?.message);
        } finally {
          uiSpinnerState(false, 'loginExtension');
        }
      };

      const loginWithMaiarMobileApp = async () => {
        try {
          uiSpinnerState(true, 'loginMobile');
          await ElvenJS.login('maiar-mobile', {
            qrCodeContainerId: 'qr-code-container',
            onWalletConnectLogin: () => {
              uiLoggedInState(true);
            },
            onWalletConnectLogout: () => {
              uiLoggedInState(false);
            },
          });
        } catch (e) {
          console.log('Login: Something went wrong, try again!', e?.message);
        } finally {
          uiSpinnerState(false, 'loginMobile');
        }
      };

      const logout = async () => {
        try {
          const isLoggedOut = await ElvenJS.logout();
          uiLoggedInState(!isLoggedOut);
        } catch (e) {
          console.error(e.message);
        }
      };

      // Simple transaction, you can build different transaction types and payload structures
      const egldTransferAddress =
        'erd17a4wydhhd6t3hhssvcp9g23ppn7lgkk4g2tww3eqzx4mlq95dukss0g50f';
      const signAndSendEgld = async () => {
        updateTxHashContainer(false);
        const demoMessage = 'Transaction demo from Elven.js!';

        const tx = new ElvenJS.Transaction({
          nonce: ElvenJS.storage.get('nonce'),
          receiver: new ElvenJS.Address(egldTransferAddress),
          gasLimit: 50000 + 1500 * demoMessage.length,
          chainID: 'D',
          data: new ElvenJS.TransactionPayload(demoMessage),
          value: ElvenJS.TokenPayment.egldFromAmount(0.001),
          sender: new ElvenJS.Address(ElvenJS.storage.get('address')),
        });

        try {
          uiSpinnerState(true, 'egld');
          const transaction = await ElvenJS.signAndSendTransaction(tx);
          uiSpinnerState(false, 'egld');
          updateTxHashContainer(transaction.hash);
        } catch (e) {
          uiSpinnerState(false, 'egld');
          throw new Error(e?.message);
        }
      };

      // Mint nft function
      // It mints on the smart contract from: https://dapp-demo.elven.tools/
      const nftMinterSmartContract =
        'erd1qqqqqqqqqqqqqpgq5za2pty2tlfqhj20z9qmrrpjmyt6advcgtkscm7xep';
      const mintNFT = async () => {
        updateTxHashContainer(false);
        const data = new ElvenJS.ContractCallPayloadBuilder()
          .setFunction(new ElvenJS.ContractFunction('mint'))
          .setArgs([new ElvenJS.U32Value(1)])
          .build();

        const tx = new ElvenJS.Transaction({
          data,
          gasLimit: 14000000,
          value: ElvenJS.TokenPayment.egldFromAmount(0.01),
          chainID: 'D',
          receiver: new ElvenJS.Address(nftMinterSmartContract),
          sender: new ElvenJS.Address(ElvenJS.storage.get('address')),
        });

        try {
          uiSpinnerState(true, 'mint');
          const transaction = await ElvenJS.signAndSendTransaction(tx);
          uiSpinnerState(false, 'mint');
          updateTxHashContainer(transaction.hash);
        } catch (e) {
          uiSpinnerState(false, 'mint');
          throw new Error(e?.message);
        }
      };
    </script>
  </body>
</html>
```

You will find the demo directory in the repository so that you can play with its final version, here only as an example.

### What can it do?

The API is limited for now, this will change, but even now, it can do much:

- authenticate using the Maiar mobile and Maiar browser extension
- handle expiration of the auth state
- handle login with tokens to be able to get the signature
- sign transactions
- send transactions (also custom smart contracts)
- basic global states handling (local storage)
- basic structures for transaction payload
- sync the network on page load

### What will it do soon? (TODO):

- query smart contracts
- sign messages
- more advanced global state handling and (real-time updates (if needed)?)
- more structures and simplification for payload builders
- authenticate with Ledger Nano
- authenticate with Elrond Web Wallet
- rethink the structure and split it into more files
- make it as small as possible, for now, it is pretty big
- make it load as an ES6 module in browser probably two separate builds will be required, maybe only ES6 will be enough?

### What it won't probably do:

- crypto tasks
- results parsing (but maybe it will land in a separate package)

Why? Because it is supposed to be a browser script, it should be as small as possible. All that functionality can be replaced if needed by a custom implementation or other libraries. There will be docs with examples for that. And in the future, there may be more similar libraries, but optional and separated.

### API

The main initialization function (init providers, sync the network):

```javascript
await ElvenJS.init({
  apiUrl: 'https://devnet-api.elrond.com',
  chainType: 'devnet',
  apiTimeout: 10000,
});
```

You can define the API endpoint and chain type also the API timeout if needed. These values are set by default. So it will work like that even without them.

Login using Maiar mobile app (optionally you can also pass login token, it will be used to generate the signature):

```javascript
await ElvenJS.login('maiar-mobile', {
  qrCodeContainerId: 'qr-code-container', // Your qr code container id
  onWalletConnectLogin: () => {
    // Your logic here, the wallet connect is connected
  },
  onWalletConnectLogout: () => {
    // Your logic here, the wallet connect is disconnected
  },
  token: '<your_login_token_here>'
});
```

Login using Maiar browser extension (optionally you can also pass login token, it will be used to generate the signature):

```javascript
await ElvenJS.login('maiar-browser-extension', { token: '<your_login_token_here>' });
```

Logout using previously initialized provider, here Maiar browser extension.

```javascript
const isLoggedIn = await ElvenJS.logout();
```

Transaction builder:

```javascript
const tx = new ElvenJS.Transaction({
  nonce: ElvenJS.storage.get('nonce'),
  receiver: new ElvenJS.Address(egldTransferAddress),
  gasLimit: 50000 + 1500 * demoMessage.length,
  chainID: 'D',
  data: new ElvenJS.TransactionPayload(demoMessage),
  value: ElvenJS.TokenPayment.egldFromAmount(0.001),
  sender: new ElvenJS.Address(ElvenJS.storage.get('address')),
});
```

The API is similar to erdjs, but all are placed under the `ElvenJS` namespace. Not all APIs are exported from erdjs, only the basic ones. This will change in the future.

Sign and send transaction using previously initialized provider:

```javascript
const transaction = await ElvenJS.signAndSendTransaction(tx);
```

Here the `tx` is the transaction from the previous example.

### All exposed erdjs classes/types:

- `ElvenJS.TokenPayment`,
- `ElvenJS.Address`,
- `ElvenJS.Account`
- `ElvenJS.Transaction`
- `ElvenJS.TransactionPayload`
- `ElvenJS.TransactionWatcher`
- `ElvenJS.BytesValue`
- `ElvenJS.BigUIntValue`
- `ElvenJS.U32Value`
- `ElvenJS.BooleanValue`
- `ElvenJS.ContractCallPayloadBuilder`
- `ElvenJS.ESDTTransferPayloadBuilder`
- `ElvenJS.ESDTNFTTransferPayloadBuilder`
- `ElvenJS.ContractFunction`

There will be more, for now only basic ones.

### What else is exposed:

- `ElvenJS.storage` - `ElvenJS.storage.get(key?)`, `ElvenJS.storage.set(key, value)`, `ElvenJS.storage.clear()` - storage helper for localStorage `elvenjs_state` where couple of information is stored: `{ address: '', nonce: '', expires: '', loginMethod: '', balance: '' }` you can get and set them (be careful, they are used also internally)
- `ElvenJS.networkProvider` - access to the simplified network provider which gives some API related helpers, it is also used internally
- `ElvenJS.dappProvider` - access to the auth provider instance, it is also used internally

### Development

1. clone the repo
2. `npm install` dependencies
3. `npm run build`
4. test on example -> `npm run dev:server`
5. rebuild with every change in the script

### Other tools

If you need to use Elrond SDK with React-based projects, you can try these tools:

- [dapp-core](https://github.com/ElrondNetwork/dapp-core) - for standard React based SPA
- [nextjs-dapp-template](https://github.com/ElrondDevGuild/nextjs-dapp-template) - or Nextjs apps

If you are interested in creating and managing your own PFP NFT collection, you might be interested in:

- [Elven Tools](https://www.elven.tools) - What is included: NFT minter smart contract (decentralized way of minting), minter Nextjs dapp (interaction on the frontend side), CLI tool (deploy, configuration, interaction)
- [nft-art-maker](https://github.com/juliancwirko/nft-art-maker) - tool for creating png assets from provided layers. It can also pack files and upload them to IPFS using nft.storage. All CIDs will be auto-updated

Other tools:

- [Buildo Begins](https://github.com/ElrondDevGuild/buildo-begins) - all Elrond blockchain CLI interactions with erdjs SDK still in progress
