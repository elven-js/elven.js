### [0.7.0](https://github.com/juliancwirko/elven.js/releases/tag/v0.7.0) (2023-01-...)
- WalletConnect 2 integration through a new version of `@elrondnetwork/erdjs-wallet-connect-provider` - lets you use 'Maiar Login 2.0'. No fallback for the old method. The Maiar app for Android sometimes shows a message that the connection is taking too much time, but it will connect finally, and hopefully, there will be some improvements for that on the walletconnect side soon.
- two new callbacks: `onQrPending` and `onQrLoaded` - usedull when waiting for the QR and WalletConnect Pairings list

### [0.6.2](https://github.com/juliancwirko/elven.js/releases/tag/v0.6.2) (2022-11-19)
- added new callbacks for transactions `onTxSent` and `onTxError`. With `onTxSent`, you can get the transaction data before it is finalized on the chain and after signing it. Then you can use `onTxFinalized`. Check the source code of the demo example.
- dependencies updates

### [0.6.1](https://github.com/juliancwirko/elven.js/releases/tag/v0.6.1) (2022-10-31)
- make the WalletConnect bridge addresses configurable. You can use `ElvenJS.init({ walletConnectBridgeAddresses: ['https://...'], })` to overwrite the default ones.

### [0.6.0](https://github.com/juliancwirko/elven.js/releases/tag/v0.6.0) (2022-10-16)
- Elrond Web Wallet support
- new way of getting the last transaction status, you can now use a callback function defined when initializing the ElvenJS: `onTxFinalized: (tx) => { ... }`. Check for more info in the docs. You can still use the return value from `await ElvenJS.signAndSendTransaction(tx)`, but it won't work for the Web Wallet (because of its redirections and different flow).
- there is also another callback to handle transactions states: `onTxStarted: (tx) => { ... }`
- the `ElvenJS.init` now always returns undefined. You should rely on its callbacks from now on instead of returned booleans
- some refactoring around walletconnect provider configuration

### [0.5.0](https://github.com/juliancwirko/elven.js/releases/tag/v0.5.0) (2022-09-24)
- a couple of login fixes
- **Breaking change:** Now you can pass not only the id for the QR container but also the DOM element, so there are changes in how you should define it. New way: `await ElvenJS.login('maiar-mobile', { qrCodeContainer: <elem_id_as_string_or_DOM_element>});` 

### [0.4.0](https://github.com/juliancwirko/elven.js/releases/tag/v0.4.0) (2022-09-11)
- `onLoggedIn`, `onLoginPending` and `onLogout` callbacks are now passed in the `ElvenJS.init()` function. This unifies it and helps in synchronizing the WalletConnect actions. In the future probably also Ledger integration will be simpler because of that
- added a smart contract query (for now, without result parsing tools, it will probably be a separate library, you can still parse the result manually for simple data types like string or number, check the example/index.html)
- exported `AddressValue`
- example demo updates ([example demo](https://github.com/juliancwirko/elven.js/tree/main/example))

### [0.3.3](https://github.com/juliancwirko/elven.js/releases/tag/v0.3.3) (2022-09-01)
- additional exports from erdjs required for esdt/sft/nft/meta sending (`ESDTNFTTransferPayloadBuilder`, `ESDTTransferPayloadBuilder`)
- Updated demo. By default you can send a predefined ESDT token

### [0.3.2](https://github.com/juliancwirko/elven.js/releases/tag/v0.3.2) (2022-08-21)
- fix type export
- add Solid.js demo

### [0.3.1](https://github.com/juliancwirko/elven.js/releases/tag/v0.3.1) (2022-08-20)
- fix types export

### [0.3.0](https://github.com/juliancwirko/elven.js/releases/tag/v0.3.0) (2022-08-20)
- **breaking change**: from v0.3.0, the elven.js is served as an ES6 module. Why? Because ES6 modules are well supported in all browsers, it will be much simpler to make it compatible with many different frontend frameworks if needed. It would be simpler to import it from node_modules. You can still use it directly from the CDN. You just need to import it using `<script type="module" />` Check the docs for more info about it.
- supporting it as a standard script seems to be obsolete nowadays, but please let me know if you have a good use case for it, then I will try to support both

### [0.2.0](https://github.com/juliancwirko/elven.js/releases/tag/v0.2.0) (2022-07-16)
- Maiar mobile app auth functionality with QR code generation
- changes for the init function, you don't set the auth provider there anymore, it is moved to the login function
- a lot of refactoring

### [0.1.0](https://github.com/juliancwirko/elven.js/releases/tag/v0.1.0) (2022-07-03)
- initial release
- ability to authenticate using the Maiar browser extension
- ability to sign and send transactions, also to custom smart contract
- basic erdjs structures exposed as globals for browser
