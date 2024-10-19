/* eslint-disable @typescript-eslint/no-require-imports */
const esbuild = require('esbuild');
const plugin = require('node-stdlib-browser/helpers/esbuild/plugin');
const stdLibBrowser = require('node-stdlib-browser');

const fs = require('fs');

esbuild
  .build({
    inject: [require.resolve('node-stdlib-browser/helpers/esbuild/shim')],
    format: 'esm',
    entryPoints: ['./src/elven.ts'],
    bundle: true,
    metafile: true,
    minify: true,
    outdir: 'build',
    platform: 'browser',
    drop: ['console', 'debugger'],
    external: ['./node_modules/bip39/src/wordlists/*.json'],
    plugins: [
      plugin(stdLibBrowser),
      {
        name: 'alias',
        setup(build) {
          build.onResolve({ filter: /^bn\.js$/ }, () => ({
            path: require.resolve('bn.js'),
          }));
          build.onResolve({ filter: /^safe-buffer$/ }, () => ({
            path: require.resolve('safe-buffer'),
          }));
          build.onResolve({ filter: /^bignumber.js$/ }, () => ({
            path: require.resolve('bignumber.js'),
          }));
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
