## ElvenJS

### One static file to rule it all on the Elrond blockchain!

## Demos
- [elvenjs.netlify.app](https://elvenjs.netlify.app/)
- [StackBlitz vanilla html demo](https://stackblitz.com/edit/web-platform-d4rx5v?file=index.html)
- [StackBlitz Astro demo](https://stackblitz.com/edit/withastro-astro-pwareu?file=src%2Fpages%2Findex.astro)

Authenticate, sign and send transactions and messages on the Elrond blockchain in the browser. No need for bundlers, frameworks, etc. Just attach the script source, and you are ready to go. You can incorporate it into your preferred CMS framework like WordPress or an e-commerce system. Plus, it will also work on a standard static HTML website.

The primary purpose of this tool is to have a lite script for browser usage where you can authenticate and sign/send transactions on the Elrond blockchain and do this without any additional build steps.

The purpose is to simplify the usage for primary use cases and open the doors for many frontend tools and approaches.

It is a script for browsers incorporates ES6 modules. If you need fully functional JavaScript/Typescript SDK (also in Nodejs), please use [erdjs](https://github.com/ElrondNetwork/elrond-sdk-erdjs), an official Typescriot Elrond SDK. And if you are React developer, please check the [Nextjs dapp](https://github.com/ElrondDevGuild/nextjs-dapp-template).

**You can use it already, but it is under active development, and the API might change, and there could be breaking changes.**

### How to use it

Just copy and include the `elven.js` script from the `build` directory or CDN (https://unpkg.com/elven.js/build/elven.js). Use module type, like:

```html
<script type="module">
  import {
    ElvenJS,
    Transaction,
    Address,
    TransactionPayload,
    TokenPayment,
    ContractCallPayloadBuilder,
    ContractFunction,
    U32Value,
  } from './elven.js';

  // Your code here
</script>
```
or from CDN:

```html
<script type="module">
  import {
    ElvenJS,
    Transaction,
    Address,
    TransactionPayload,
    TokenPayment,
    ContractCallPayloadBuilder,
    ContractFunction,
    U32Value,
  } from 'https://unpkg.com/elven.js@0.3.0/build/elven.js';

  // Your code here
</script>
```

Check what exactly is included below:

### All exported erdjs classes/types:
(not all is exported)

- `TokenPayment`,
- `Address`,
- `Account`
- `Transaction`
- `TransactionPayload`
- `TransactionWatcher`
- `BytesValue`
- `BigUIntValue`
- `U32Value`
- `BooleanValue`
- `ContractCallPayloadBuilder`
- `ESDTTransferPayloadBuilder`
- `ESDTNFTTransferPayloadBuilder`
- `ContractFunction`

There will be more, for now only most used ones.

### What else is exposed:

- `ElvenJS.storage` - `ElvenJS.storage.get(key?)`, `ElvenJS.storage.set(key, value)`, `ElvenJS.storage.clear()` - storage helper for localStorage `elvenjs_state` where couple of information is stored: `{ address: '', nonce: '', expires: '', loginMethod: '', balance: '' }` you can get and set them (be careful, they are used also internally)
- `ElvenJS.networkProvider` - access to the simplified network provider which gives some API related helpers, it is also used internally
- `ElvenJS.dappProvider` - access to the auth provider instance, it is also used internally
- `ElvenJS.destroy` - remove the instances of networkProvider and dappProvider, cleanup

### Usage in frontend frameworks

Elven.js from v0.3.0 can also be used in many different frameworks by importing it from node_modules (of course, it is a client-side library). When it comes to React/Nextjs, it is advised to use one of the ready templates, for example, the one mentioned above. But Elven.js can be helpful in other frameworks where there are no templates yet. Example:

```bash
npm install elven.js
```
and then in your client side framework:
```typescript
import { ElvenJS } from 'elven.js';
```

The types should also be exported.

### Usage example with static website: 

Check out the example file: [example/index.html](/example/index.html)

You will find the whole demo there. The same that is deployed here: [elvenjs.netlify.app](https://elvenjs.netlify.app)

You will find the demo directory in the repository so you can play with its final version, here only as an example.

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

- query smart contracts with network provider
- sign messages
- more advanced global state handling and (real-time updates (if needed)?)
- more structures and simplification for payload builders
- authenticate with Ledger Nano
- authenticate with Elrond Web Wallet
- rethink the structure and split it into more files (???)
- make it as small as possible, for now, it is pretty big

### What it won't probably do:

- crypto tasks
- results parsing (but maybe it will land in a separate package)

Why? Because it is supposed to be a browser script, it should be as small as possible. All that functionality can be replaced if needed by a custom implementation or other libraries. There will be docs with examples for that. And in the future, there may be more similar libraries, but optional and separated.

### API

The main initialization function (init providers, sync the network):

```javascript
import { ElvenJS } from 'elven.js';
(...)
await ElvenJS.init({
  apiUrl: 'https://devnet-api.elrond.com',
  chainType: 'devnet',
  apiTimeout: 10000,
});
```

You can define the API endpoint and chain type also the API timeout if needed. These values are set by default. So it will work like that even without them.

Login using Maiar mobile app (optionally you can also pass login token, it will be used to generate the signature):

```javascript
import { ElvenJS } from 'elven.js';
(...)
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
import { ElvenJS } from 'elven.js';
(...)
await ElvenJS.login('maiar-browser-extension', { token: '<your_login_token_here>' });
```

Logout using previously initialized provider, here Maiar browser extension.

```javascript
import { ElvenJS } from 'elven.js';
(...)
const isLoggedIn = await ElvenJS.logout();
```

Transaction builder:

```javascript
import { ElvenJS, Transaction, Address, TransactionPayload, TokenPayment } from 'elven.js';
(...)

const tx = new Transaction({
  nonce: ElvenJS.storage.get('nonce'),
  receiver: new Address(egldTransferAddress),
  gasLimit: 50000 + 1500 * demoMessage.length,
  chainID: 'D',
  data: new TransactionPayload(demoMessage),
  value: TokenPayment.egldFromAmount(0.001),
  sender: new Address(ElvenJS.storage.get('address')),
});
```

The API is similar to erdjs, but not all is exported. This could change in the future.

Sign and send transaction using previously initialized provider:

```javascript
import { ElvenJS } from 'elven.js';
(...)
const transaction = await ElvenJS.signAndSendTransaction(tx);
```

Here the `tx` is the transaction from the previous example.

### Development

1. clone the repo
2. `npm install` dependencies
3. `npm run build`
4. test on example -> `npm run dev:server`
5. rebuild with every change in the script

### TODO
- [Kanban board](https://github.com/juliancwirko/elven.js/projects/1)

### Other tools

If you need to use Elrond SDK with React-based projects, you can try these tools:

- [dapp-core](https://github.com/ElrondNetwork/dapp-core) - for standard React based SPA
- [nextjs-dapp-template](https://github.com/ElrondDevGuild/nextjs-dapp-template) - or Nextjs apps

If you are interested in creating and managing your own PFP NFT collection, you might be interested in:

- [Elven Tools](https://www.elven.tools) - What is included: NFT minter smart contract (decentralized way of minting), minter Nextjs dapp (interaction on the frontend side), CLI tool (deploy, configuration, interaction)
- [nft-art-maker](https://github.com/juliancwirko/nft-art-maker) - tool for creating png assets from provided layers. It can also pack files and upload them to IPFS using nft.storage. All CIDs will be auto-updated

Other tools:

- [Buildo Begins](https://github.com/ElrondDevGuild/buildo-begins) - all Elrond blockchain CLI interactions with erdjs SDK still in progress
