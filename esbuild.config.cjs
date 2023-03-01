/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild');
// Bring back if needed
// const plugin = require('node-stdlib-browser/helpers/esbuild/plugin');
// const stdLibBrowser = require('node-stdlib-browser');
const fs = require('fs');

esbuild
  .build({
    inject: [require.resolve('node-stdlib-browser/helpers/esbuild/shim')],
    define: {
      global: 'global',
      process: 'process',
      Buffer: 'Buffer',
      'process.env.NODE_ENV': 'production',
    },
    format: 'esm',
    // Bring back if needed
    // plugins: [plugin(stdLibBrowser)],
    entryPoints: ['./src/elven.ts'],
    bundle: true,
    metafile: true,
    minify: true,
    outdir: 'build',
    platform: 'browser',
  })
  .then((result) => {
    return esbuild.analyzeMetafile(result.metafile);
  })
  .then((result) => {
    fs.writeFileSync('./build/meta.txt', result);
  })
  .catch(() => process.exit(1));
