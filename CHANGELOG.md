### [0.20.0](https://github.com/elven-js/elven.js/releases/tag/v0.20.0) (2024-10-13)
- remove `@multiversx/sdk-network-providers` package (now included in the sdk core)
- remove/replace `SignableMessage` and adjust the code
- update dependencies 

### [0.19.0](https://github.com/elven-js/elven.js/releases/tag/v0.19.0) (2024-08-03)
- replace custom webview provider implementation with the dedicated library (xPortal)
- update dependencies

### [0.18.0](https://github.com/elven-js/elven.js/releases/tag/v0.18.0) (2024-04-28)
- switch to SDK v13
- breaking: `SmartContract` is no longer exported, use `SmartContractTransactionsFactory`
- breaking: `GasEstimator` removed
- breaking: `ContractFunction` removed, pass normal strings
- breaking: `TransactionPayload` removed, you can now pass `Uint8Array` instead
- update examples
- update reexported functions and helpers
- return transaction on network in `onTxFinalized`
- added two amount related helper functions: `parseAmount` and `formatAmount`

### [0.17.0](https://github.com/elven-js/elven.js/releases/tag/v0.17.0) (2024-01-29)
- remove onLoginEnd and onLogoutEnd callbacks. With success and failure callbacks, they are not needed
- fix duplicate callbacks calls

### [0.16.0](https://github.com/elven-js/elven.js/releases/tag/v0.16.0) (2024-01-28)
- rename and add more login callbacks (breaking)
- rename some of the transaction and message signing callbacks (breaking)
- add callbacks for logout
- add callbacks for `queryContract`
- check [docs](https://www.elvenjs.com/docs/sdk-reference.html#initialization) and [example demo](/example/index.html) for more information

### [0.15.0](https://github.com/elven-js/elven.js/releases/tag/v0.15.0) (2024-01-13)
- add webview provider (based on sdk-dapp), required for xPortal Hub integration (experimental, need more tests and rewrites, it will probably land in a separate package in the following updates)
- update dependencies

### [0.14.0](https://github.com/elven-js/elven.js/releases/tag/v0.14.0) (2023-11-25)
- add tools for signing messages with all supported providers (`ElvenJS.signMessage`). Find more details in the [demo example]((/example/index.html)) and [documentation]((https://www.elvenjs.com)).
- update dependencies

### [0.13.0](https://github.com/elven-js/elven.js/releases/tag/v0.13.0) (2023-10-27)
 - add xAlias login support `ElvenJS.login('x-alias')` (check the [docs](https://www.elvenjs.com) and [demo example](/example/index.html))
 - update dependencies

### [0.12.0](https://github.com/elven-js/elven.js/releases/tag/v0.12.0) (2023-08-05)
- improve guardian support (all providers)
- update dependencies

### [0.11.0](https://github.com/elven-js/elven.js/releases/tag/v0.11.0) (2023-07-16)
- allow triggering transactions before the previous ones are finished
- updated dependencies
- adjust the code for newest versions of Multiversx tools
- run login pending state when native auth is fetching

### [0.10.2](https://github.com/elven-js/elven.js/releases/tag/v0.10.2) (2023-05-29)
- fix native auth when signing using browser extension

### [0.10.1](https://github.com/elven-js/elven.js/releases/tag/v0.10.1) (2023-05-23)
- fix native auth when used with web wallet provider

### [0.10.0](https://github.com/elven-js/elven.js/releases/tag/v0.10.0) (2023-05-23)
- **Breaking** switch to using `sdk-native-auth-client` instead passing string-based login tokens, there is no fallback or other option, so it is a breaking change. Native Auth is recommended. The old way of doing that will be deprecated. Please freeze the previous version if you are not ready to switch yet

### [0.9.2](https://github.com/elven-js/elven.js/releases/tag/v0.9.2) (2023-05-13)
- changes in package.json configuration

### [0.9.1](https://github.com/elven-js/elven.js/releases/tag/v0.9.1) (2023-05-13)
- update dependencies: sdk-core, sdk-web-wallet-provider and others

### [0.9.0](https://github.com/elven-js/elven.js/releases/tag/v0.9.0) (2023-04-10)
- migrate to MultiversX JS SDK 12.1.0 **(breaking changes):**
  - `TokenPayment` is now `TokenTransfer`
  - `ESDTNFTTransferPayloadBuilder` and `ESDTTransferPayloadBuilder` are deprecated and removed, instead please use `TransferTransactionsFactory`
  - `ContractCallPayloadBuilder` is removed, please use `SmartContract.call` instead
  - See all changes in the [example](example/index.html), also please check [MultiversX SDK JS Cookbook](https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook) for how to  build payload structures
- update dependecies

### [0.8.2](https://github.com/elven-js/elven.js/releases/tag/v0.8.2) (2023-03-05)
- fix browser extension signing states

### [0.8.1](https://github.com/elven-js/elven.js/releases/tag/v0.8.1) (2023-03-02)
- minor improvements in the code and demo

### [0.8.0](https://github.com/elven-js/elven.js/releases/tag/v0.8.0) (2023-03-01)
- WalletConnect 2 integration through a new version of `@elrondnetwork/erdjs-wallet-connect-provider` - lets you use 'xPortal Login'.
- two new callbacks: `onQrPending` and `onQrLoaded` - usefull when waiting for the QR and WalletConnect Pairings list, but it shouldn't take much time to load
- minor improvements

### [0.7.0](https://github.com/elven-js/elven.js/releases/tag/v0.7.0) (2023-01-14)
- rebrand to multiversx (continuation)
    - npm packages are replaced
    - public api/explorer endpoints are replaced
- update dependencies
- **Breaking:** `ElvenJS.login('maiar-mobile')` is now `ElvenJS.login('mobile')` and `ElvenJS.login('maiar-browser-extension')` is now `ElvenJS.login('browser-extension')`

### [0.6.2](https://github.com/elven-js/elven.js/releases/tag/v0.6.2) (2022-11-19)
- added new callbacks for transactions `onTxSent` and `onTxError`. With `onTxSent`, you can get the transaction data before it is finalized on the chain and after signing it. Then you can use `onTxFinalized`. Check the source code of the demo example.
- dependencies updates

### [0.6.1](https://github.com/elven-js/elven.js/releases/tag/v0.6.1) (2022-10-31)
- make the WalletConnect bridge addresses configurable. You can use `ElvenJS.init({ walletConnectBridgeAddresses: ['https://...'], })` to overwrite the default ones.

### [0.6.0](https://github.com/elven-js/elven.js/releases/tag/v0.6.0) (2022-10-16)
- Elrond Web Wallet support
- new way of getting the last transaction status, you can now use a callback function defined when initializing the ElvenJS: `onTxFinalized: (tx) => { ... }`. Check for more info in the docs. You can still use the return value from `await ElvenJS.signAndSendTransaction(tx)`, but it won't work for the Web Wallet (because of its redirections and different flow).
- there is also another callback to handle transactions states: `onTxStarted: (tx) => { ... }`
- the `ElvenJS.init` now always returns undefined. You should rely on its callbacks from now on instead of returned booleans
- some refactoring around walletconnect provider configuration

### [0.5.0](https://github.com/elven-js/elven.js/releases/tag/v0.5.0) (2022-09-24)
- a couple of login fixes
- **Breaking change:** Now you can pass not only the id for the QR container but also the DOM element, so there are changes in how you should define it. New way: `await ElvenJS.login('maiar-mobile', { qrCodeContainer: <elem_id_as_string_or_DOM_element>});` 

### [0.4.0](https://github.com/elven-js/elven.js/releases/tag/v0.4.0) (2022-09-11)
- `onLoggedIn`, `onLoginPending` and `onLogout` callbacks are now passed in the `ElvenJS.init()` function. This unifies it and helps in synchronizing the WalletConnect actions. In the future probably also Ledger integration will be simpler because of that
- added a smart contract query (for now, without result parsing tools, it will probably be a separate library, you can still parse the result manually for simple data types like string or number, check the example/index.html)
- exported `AddressValue`
- example demo updates ([example demo](https://github.com/elven-js/elven.js/tree/main/example))

### [0.3.3](https://github.com/elven-js/elven.js/releases/tag/v0.3.3) (2022-09-01)
- additional exports from erdjs required for esdt/sft/nft/meta sending (`ESDTNFTTransferPayloadBuilder`, `ESDTTransferPayloadBuilder`)
- Updated demo. By default you can send a predefined ESDT token

### [0.3.2](https://github.com/elven-js/elven.js/releases/tag/v0.3.2) (2022-08-21)
- fix type export
- add Solid.js demo

### [0.3.1](https://github.com/elven-js/elven.js/releases/tag/v0.3.1) (2022-08-20)
- fix types export

### [0.3.0](https://github.com/elven-js/elven.js/releases/tag/v0.3.0) (2022-08-20)
- **breaking change**: from v0.3.0, the elven.js is served as an ES6 module. Why? Because ES6 modules are well supported in all browsers, it will be much simpler to make it compatible with many different frontend frameworks if needed. It would be simpler to import it from node_modules. You can still use it directly from the CDN. You just need to import it using `<script type="module" />` Check the docs for more info about it.
- supporting it as a standard script seems to be obsolete nowadays, but please let me know if you have a good use case for it, then I will try to support both

### [0.2.0](https://github.com/elven-js/elven.js/releases/tag/v0.2.0) (2022-07-16)
- Maiar mobile app auth functionality with QR code generation
- changes for the init function, you don't set the auth provider there anymore, it is moved to the login function
- a lot of refactoring

### [0.1.0](https://github.com/elven-js/elven.js/releases/tag/v0.1.0) (2022-07-03)
- initial release
- ability to authenticate using the Maiar browser extension
- ability to sign and send transactions, also to custom smart contract
- basic erdjs structures exposed as globals for browser
