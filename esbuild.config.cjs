/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild');

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
