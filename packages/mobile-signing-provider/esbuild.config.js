import { baseConfig } from '@configs/esbuild';
import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

esbuild
  .build({
    ...baseConfig,
    entryPoints: ['./src/mobile-signing-provider.ts'],
    // These are workarounds to avoid not needed code being bundled
    // Always review when updating the walletconnect packages
    plugins: [
      {
        name: 'bn-resolver',
        setup(build) {
          build.onResolve({ filter: /^bn\.js$/ }, () => {
            return { path: 'virtual:bn.js', namespace: 'bn-shim' };
          });
          build.onLoad(
            { filter: /^virtual:bn\.js$/, namespace: 'bn-shim' },
            () => ({
              contents: `
                export class BN {
                  constructor(value) {
                    this.value = BigInt(value);
                  }
                  
                  toString(base = 10) {
                    return this.value.toString(base);
                  }
                  
                  toNumber() {
                    return Number(this.value);
                  }
                }
                export default BN;
              `,
            })
          );
        },
      },
      {
        name: 'customize-walletconnect',
        setup(build) {
          // Replace elliptic with our adapter
          build.onResolve({ filter: /^elliptic$/ }, () => ({
            path: 'virtual:secp256k1-adapter',
            namespace: 'virtual',
          }));

          build.onLoad(
            { filter: /^virtual:secp256k1-adapter$/, namespace: 'virtual' },
            () => ({
              contents: `
              import * as secp from '@noble/secp256k1';
              
              class EC {
                constructor(curve) {
                  if (curve !== 'secp256k1') throw new Error('Only secp256k1 is supported');
                }
                
                keyFromPrivate(priv) {
                  const privBytes = typeof priv === 'string' ? 
                    secp.utils.hexToBytes(priv.replace('0x', '')) : 
                    priv;
                  
                  return {
                    getPublic: (compact = false) => {
                      const pubKey = secp.getPublicKey(privBytes);
                      return {
                        encode: (enc) => pubKey
                      };
                    }
                  };
                }
                
                keyFromPublic(pub) {
                  const pubBytes = typeof pub === 'string' ? 
                    secp.utils.hexToBytes(pub.replace('0x', '')) : 
                    pub;
                  
                  return {
                    verify: async (msg, sig) => {
                      return secp.verify(sig, msg, pubBytes);
                    }
                  };
                }
              }
              
              export const ec = EC;
              export { EC };
              export default { EC };
            `,
              loader: 'js',
              resolveDir: path.dirname(fileURLToPath(import.meta.url)),
            })
          );
        },
      },
      {
        name: 'replace-lodash-isequal',
        setup(build) {
          build.onResolve({ filter: /^lodash\.isequal$/ }, () => ({
            path: 'virtual:isequal',
            namespace: 'virtual',
          }));

          build.onLoad(
            { filter: /^virtual:isequal$/, namespace: 'virtual' },
            () => ({
              contents: `
                export default function isEqual(a, b) {
                  if (a === b) return true;
                  
                  if (a && b && typeof a === 'object' && typeof b === 'object') {
                    if (Array.isArray(a)) {
                      if (!Array.isArray(b) || a.length !== b.length) return false;
                      for (let i = 0; i < a.length; i++) {
                        if (!isEqual(a[i], b[i])) return false;
                      }
                      return true;
                    }
                    
                    const keys = Object.keys(a);
                    if (keys.length !== Object.keys(b).length) return false;
                    
                    for (const key of keys) {
                      if (!b.hasOwnProperty(key) || !isEqual(a[key], b[key])) return false;
                    }
                    return true;
                  }
                  
                  return false;
                }
              `,
              loader: 'js',
            })
          );
        },
      },
      {
        name: 'replace-query-string',
        setup(build) {
          build.onResolve({ filter: /^query-string$/ }, () => ({
            path: 'virtual:query-string',
            namespace: 'virtual',
          }));

          build.onLoad(
            { filter: /^virtual:query-string$/, namespace: 'virtual' },
            () => ({
              contents: `
                export function parse(str) {
                  const searchParams = new URLSearchParams(str);
                  const result = {};
                  for (const [key, value] of searchParams.entries()) {
                    result[key] = value;
                  }
                  return result;
                }

                export function stringify(obj) {
                  const searchParams = new URLSearchParams();
                  for (const key in obj) {
                    if (obj[key] != null) {
                      searchParams.append(key, obj[key]);
                    }
                  }
                  return searchParams.toString();
                }

                export function parseUrl(url) {
                  const [base, query] = url.split('?');
                  return {
                    url: base,
                    query: parse(query || '')
                  };
                }

                export default {
                  parse,
                  stringify,
                  parseUrl,
                  extract: url => url.split('?')[1] || ''
                };
              `,
              loader: 'js',
            })
          );
        },
      },
      {
        name: 'inline-tslib',
        setup(build) {
          build.onResolve({ filter: /^tslib$/ }, () => ({
            path: 'virtual:tslib',
            namespace: 'virtual',
          }));

          build.onLoad(
            { filter: /^virtual:tslib$/, namespace: 'virtual' },
            () => ({
              contents: `
                export function __awaiter(thisArg, _arguments, P, generator) {
                  return new (P || (P = Promise))(function(resolve, reject) {
                    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
                    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
                    function step(result) { result.done ? resolve(result.value) : new P(function(resolve) { resolve(result.value); }).then(fulfilled, rejected); }
                    step((generator = generator.apply(thisArg, _arguments || [])).next());
                  });
                }
      
                export function __exportStar(m, o) {
                  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
                }
      
                export function __createBinding(o, m, k, k2) {
                  if (k2 === undefined) k2 = k;
                  var desc = Object.getOwnPropertyDescriptor(m, k);
                  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                    desc = { enumerable: true, get: function() { return m[k]; } };
                  }
                  Object.defineProperty(o, k2, desc);
                }
      
                export function __values(o) {
                  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
                  if (m) return m.call(o);
                  if (o && typeof o.length === "number") return {
                    next: function () {
                      if (o && i >= o.length) o = void 0;
                      return { value: o && o[i++], done: !o };
                    }
                  };
                  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
                }
      
                export function __read(o, n) {
                  var m = typeof Symbol === "function" && o[Symbol.iterator];
                  if (!m) return o;
                  var i = m.call(o), r, ar = [], e;
                  try {
                    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
                  }
                  catch (error) { e = { error: error }; }
                  finally {
                    try {
                      if (r && !r.done && (m = i["return"])) m.call(i);
                    }
                    finally { if (e) throw e.error; }
                  }
                  return ar;
                }
              `,
              loader: 'js',
            })
          );
        },
      },
      {
        name: 'replace-unstorage',
        setup(build) {
          build.onResolve({ filter: /^unstorage$/ }, () => ({
            path: 'virtual:unstorage',
            namespace: 'virtual',
          }));

          build.onLoad(
            { filter: /^virtual:unstorage$/, namespace: 'virtual' },
            () => ({
              contents: `
                export function createStorage(options = {}) {
                  return {
                    async getItem(key) {
                      try {
                        return localStorage.getItem(key);
                      } catch (e) {
                        console.warn('Storage getItem error:', e);
                        return null;
                      }
                    },
                    async setItem(key, value) {
                      try {
                        localStorage.setItem(key, value);
                      } catch (e) {
                        console.warn('Storage setItem error:', e);
                      }
                    },
                    async removeItem(key) {
                      try {
                        localStorage.removeItem(key);
                      } catch (e) {
                        console.warn('Storage removeItem error:', e);
                      }
                    },
                    async clear() {
                      try {
                        localStorage.clear();
                      } catch (e) {
                        console.warn('Storage clear error:', e);
                      }
                    },
                    async mount() {},
                    async unmount() {}
                  };
                }

                export default {
                  createStorage
                };
              `,
              loader: 'js',
            })
          );
        },
      },
      {
        name: 'replace-signing-key',
        setup(build) {
          build.onResolve({ filter: /^@ethersproject\/signing-key/ }, () => ({
            path: 'virtual:signing-key',
            namespace: 'virtual',
          }));

          build.onLoad(
            { filter: /^virtual:signing-key$/, namespace: 'virtual' },
            () => ({
              contents: `
                import { getPublicKey, sign, utils } from '@noble/secp256k1';
                import { hexlify, arrayify } from '@ethersproject/bytes';
                
                export class SigningKey {
                  #privateKey;
                  #publicKey;
                  
                  constructor(privateKey) {
                    this.#privateKey = arrayify(privateKey);
                    this.#publicKey = getPublicKey(this.#privateKey, false);
                  }
                  
                  get publicKey() {
                    return hexlify(this.#publicKey);
                  }
                  
                  get privateKey() {
                    return hexlify(this.#privateKey);
                  }
                  
                  get compressedPublicKey() {
                    return hexlify(getPublicKey(this.#privateKey, true));
                  }
                  
                  signDigest(digest) {
                    const [signature, recovery] = sign(arrayify(digest), this.#privateKey, {
                      recovered: true,
                      der: false,
                    });
                    
                    const r = hexlify(signature.slice(0, 32));
                    const s = hexlify(signature.slice(32, 64));
                    
                    return {
                      r,
                      s,
                      v: recovery + 27,
                      _vs: null,
                      recoveryParam: recovery
                    };
                  }
                }
                
                export function computePublicKey(key, compressed = false) {
                  const publicKey = getPublicKey(arrayify(key), compressed);
                  return hexlify(publicKey);
                }
      
                export function recoverPublicKey(digest, signature, recoveryParam) {
                  const sig = new Uint8Array(64);
                  sig.set(arrayify(signature.r), 0);
                  sig.set(arrayify(signature.s), 32);
                  
                  const publicKey = utils.recoverPublicKey(
                    arrayify(digest),
                    sig,
                    recoveryParam,
                    false
                  );
                  
                  return hexlify(publicKey);
                }
              `,
              loader: 'js',
              resolveDir: process.cwd(),
            })
          );
        },
      },
      {
        name: 'replace-pino',
        setup(build) {
          // Match any pino import pattern
          build.onResolve(
            {
              filter: /^pino($|\/.*$)|^\.\.\/\.\.\/node_modules\/pino(\/.*)?$/,
            },
            () => ({
              path: 'virtual:pino-browser',
              namespace: 'virtual',
            })
          );

          build.onLoad(
            { filter: /^virtual:pino-browser$/, namespace: 'virtual' },
            () => ({
              contents: `
                // Simplified logger implementation
                const noop = () => {};
                
                const levels = {
                  values: {
                    trace: 10,
                    debug: 20,
                    info: 30,
                    warn: 40,
                    error: 50,
                    fatal: 60,
                  }
                };
      
                function createLogger() {
                  return {
                    trace: noop,
                    debug: noop,
                    info: console.log.bind(console),
                    warn: console.warn.bind(console),
                    error: console.error.bind(console),
                    fatal: console.error.bind(console),
                    child: function() { return this; }
                  };
                }
      
                function pino() {
                  return createLogger();
                }
      
                // Static properties
                pino.destination = () => ({ write: noop });
                pino.transport = () => createLogger();
                pino.levels = levels;
      
                // Named exports
                export { levels };
                export { pino };
                
                // Default export
                export default pino;
              `,
              loader: 'js',
            })
          );
        },
      },
    ],
  })
  .then((result) => {
    fs.writeFileSync('./build/meta.json', JSON.stringify(result.metafile));
    return result;
  })
  .then((result) => {
    return esbuild.analyzeMetafile(result.metafile);
  })
  .then((result) => {
    fs.writeFileSync('./build/meta.txt', result);
  })
  .catch(() => process.exit(1));
