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
