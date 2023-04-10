## ElvenJS

### One static file to rule it all on the MultiversX blockchain!

## Docs
- [www.elvenjs.com](https://www.elvenjs.com)

## Videos
- [JavaScript browser SDK for MultiversX Blockchain](https://youtu.be/tcTukpkjcQw)

## Demos
- [elvenjs.netlify.app](https://elvenjs.netlify.app/) - EGLD, ESDT transactions, smart contract queries and transactions
- [elrond-donate-widget-demo.netlify.app](https://multiversx-donate-widget-demo.netlify.app/) - donation-like widget demo on Astro based blog example
- [StackBlitz vanilla html demo](https://stackblitz.com/edit/web-platform-d4rx5v?file=index.html)
- [StackBlitz Astro demo](https://stackblitz.com/edit/withastro-astro-pwareu?file=src%2Fpages%2Findex.astro)
- [StackBlitz Solid.js demo](https://stackblitz.com/edit/vitejs-vite-rbo6du?file=src/App.tsx)
- [StackBlitz React demo](https://stackblitz.com/edit/vitejs-vite-qr2u7l?file=src/App.tsx)
- [StackBlitz Vue demo](https://stackblitz.com/edit/vue-zrb8y5?file=src/App.vue)

Authenticate, sign and send transactions on the MultiversX blockchain in the browser. No need for bundlers, frameworks, etc. Just attach the script source, and you are ready to go. You can incorporate it into your preferred CMS framework like WordPress or an e-commerce system. Plus, it will also work on a standard static HTML website.

The primary purpose of this tool is to have a lite script for browser usage where you can authenticate and sign/send transactions on the MultiversX blockchain and do this without any additional build steps.

The purpose is to simplify the usage for primary use cases and open the doors for many frontend tools and approaches.

It is a script for browsers incorporates ES6 modules. If you need fully functional JavaScript/Typescript SDK (also in Nodejs), please use [sdk-js](https://docs.multiversx.com/sdk-and-tools/sdk-js/), an official Typescript MultiversX SDK. And if you are React developer, please check the [Nextjs dapp](https://github.com/xdevguild/nextjs-dapp-template).

**You can use it already, but it is under active development, and the API might change, and there could be breaking changes without changing major versions.**

### How to use it

Just copy and include the `elven.js` script from the `build` directory (in this repository) or CDN (https://unpkg.com/elven.js/build/elven.js). Use module type, like:

```html
<script type="module">
  import {
    ElvenJS,
    Transaction,
    Address,
    TransactionPayload,
    TokenTransfer,
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
    TokenTransfer,
    ContractFunction,
    U32Value,
  } from 'https://unpkg.com/elven.js@0.9.0/build/elven.js';

  // Your code here
</script>
```

### SDK reference

Please check the docs here: [www.elvenjs.com/docs/sdk-reference.html](https://www.elvenjs.com/docs/sdk-reference.html)

### Recipes

Please check how to use it with a couple of recipes here: [www.elvenjs.com/docs/recipes.html](https://www.elvenjs.com/docs/recipes.html)

Check for more complete examples in the [example/index.html](/example/index.html)

### Usage example with static website (base demo): 

Check out the example file: [example/index.html](/example/index.html)

You will find the whole demo there. The same is deployed here: [elvenjs.netlify.app](https://elvenjs.netlify.app)

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

### What can it do?

The API is limited for now, this will change, but even now, it can do most of the core operations:

- authenticate using the xPortal mobile, MultiversX browser extension or MultiversX Web Wallet
- handle expiration of the auth state
- handle login with tokens to be able to get the signature
- sign transactions
- send transactions (also custom smart contracts)
- basic global states handling (local storage)
- basic structures for transaction payload
- sync the network on page load
- querying the smart contracts (without tools for result parsing yet)

### What will it do soon? (TODO):

- authenticate with Ledger Nano
- result parsing (separate library)
- sign messages
- more advanced global state handling and (real-time updates (if needed)?)
- more structures and simplification for payload builders
- rethink the structure and split it into more files (???)
- make it as small as possible

### What it won't probably do:

- crypto tasks
- results parsing (but it will land in a separate package)

Why? Because it is supposed to be a browser script, it should be as small as possible. All that functionality can be replaced if needed by a custom implementation or other libraries. There will be docs with examples for that. And in the future, there may be more similar libraries, but optional and separated.

### Development

1. clone the repo
2. `npm install` dependencies
3. `npm run build`
4. test on example -> `npm run dev:server`
5. rebuild with every change in the script

### Articles

- [How to Interact With the MultiversX Blockchain in a Simple Static Website](https://hackernoon.com/how-to-interact-with-the-elrond-blockchain-in-a-simple-static-website)
- [How to enable donations on any website using the MultiversX blockchain and EGLD tokens](https://dev.to/juliancwirko/how-to-enable-donations-on-any-website-using-the-elrond-blockchain-and-egld-tokens-3fkf)

### TODO
- [Kanban board](https://github.com/juliancwirko/elven.js/projects/1)

### Other tools

If you need to use MultiversX SDK with React-based projects, you can try these tools:

- [sdk-dapp](https://github.com/multiversx/mx-sdk-dapp) - for standard React-based SPA
- [nextjs-dapp-template](https://github.com/xdevguild/nextjs-dapp-template) - or Nextjs apps
- [useElven](https://www.useelven.com) - React Hooks for interacting with MultiversX blockchain

If you are interested in creating and managing your own PFP NFT collection, you might be interested in:

- [Elven Tools](https://www.elven.tools) - What is included: NFT minter smart contract (decentralized way of minting), minter Nextjs dapp (interaction on the frontend side), CLI tool (deploy, configuration, interaction)
- [nft-art-maker](https://github.com/juliancwirko/nft-art-maker) - tool for creating png assets from provided layers. It can also pack files and upload them to IPFS using nft.storage. All CIDs will be auto-updated

Other tools:

- [Buildo Begins](https://github.com/xdevguild/buildo-begins) - all MultiversX blockchain CLI interactions with sdk-js, still in progress, but usable
