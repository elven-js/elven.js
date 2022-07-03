## ElvenJS

**(!not ready for usage yet! stay tuned, under active development)**

Authenticate, sign and send transactions and messages on the Elrond blockchain in the browser. No need for bundlers, frameworks, etc. Just attach the script source, and you are ready to go.

The primary purpose of this tool is to have a lite script for browser usage where you can authenticate and sign/send transactions on the Elrond blockchain and do this without any additional build steps.

It is a script to be used in browsers with a global Window namespace: `ElvenJS`

If you need fully functional JavaScript/Typescript SDK (also in Nodejs), please use [erdjs](https://github.com/ElrondNetwork/elrond-sdk-erdjs), a powerful tool. For now, it includes basic functionality. Internally it uses [erdjs libraries](https://docs.elrond.com/sdk-and-tools/erdjs/erdjs/).

### How to use it

Just copy and include the `elven.js` script from the `build` directory or CDN (https://unpkg.com/elven.js/build/elven.js).

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Elven.js demo</title>
</head>

<body>
  <button onclick="login()">Login</button>

  <!-- Include the script from local file system or CDN -->
  <!-- https://unpkg.com/elven.js/build/elven.js -->
  <script src="elven.js"></script>
  
  <script>
    const init = async () => {
      const isLoggedIn = await ElvenJS.init(
        'extension',
        {
          apiUrl: 'https://devnet-api.elrond.com',
          chainType: 'devnet',
          apiTimeout: 10000
        }
      );
    }

    init();

    const login = async () => {
      const isLoggedIn = await ElvenJS.login();
    }

    const logout = async () => {
      const isLoggedOut = await ElvenJS.logout();
    }
  </script>
</body>

</html>
```

You will find the demo directory in the repository so that you can play with its final version, here only an example.

### What can it do? 

The API is limited for now, this will change, but even now, it can do much:

- authenticate using the Maiar browser extension
- sign transactions
- send transactions (also custom smart contracts)
- basic global states handling (local storage)
- basic structures for transaction payload
- sync the network on page load

### What will it do soon? (TODO):

- authenticate using Maiar mobile app
- handle expiration of the auth state
- query smart contracts
- handle login with tokens to be able to get the signature
- sign messages
- more advanced global state handling and (real-time updates?)
- more structures and simplification for payload builders
- authenticate with Ledger Nano
- authenticate with Elrond Web Wallet
- rethink the structure and split it into more files
- make it as small as possible, for now, it is pretty big
- make it load as an ES6 module in browser probably two separate builds will be required

### What it won't probably do:

- crypto tasks
- results parsing (but maybe it will land in a separate package)

Why? Because it is supposed to be a browser script, it should be as small as possible. All that functionality can be replaced if needed by a custom implementation or other libraries. There will be docs with examples for that. And in the future, there may be more similar libraries, but optional and separated.

### API

The main initialization function: 
```javascript
const isLoggedIn = await ElvenJS.init(
  'extension',
  {
    apiUrl: 'https://devnet-api.elrond.com',
    chainType: 'devnet',
    apiTimeout: 10000
  }
);
```
You can define the API endpoint and chain type also the API timeout if needed. These values are set by default. So it will work like that even without them.

Login using previously initialized provider, here Maiar browser extension.
```javascript
const isLoggedIn = await ElvenJS.login();
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

### All exposed erdjs types:

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
