/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild');
const plugin = require('node-stdlib-browser/helpers/esbuild/plugin');
const stdLibBrowser = require('node-stdlib-browser');

esbuild
  .build({
    inject: [require.resolve('node-stdlib-browser/helpers/esbuild/shim')],
    define: {
      global: 'global',
      process: 'process',
      Buffer: 'Buffer',
    },
    plugins: [plugin(stdLibBrowser)],
    entryPoints: ['./src/elven.ts'],
    bundle: true,
    minify: true,
    outdir: 'build',
    platform: 'browser',
  })
  .catch(() => process.exit(1));
