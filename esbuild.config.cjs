/* eslint-disable @typescript-eslint/no-require-imports */
const esbuild = require('esbuild');

const fs = require('fs');

const multiversXBanner = `/*!
 * Portions of this code are derived from MultiversX libraries.
 * These portions are licensed under the MIT License.
 *
 * See the MultiversX repository for details: https://github.com/multiversx
 */
`;

esbuild
  .build({
    format: 'esm',
    entryPoints: ['./src/elven.ts'],
    bundle: true,
    metafile: true,
    minify: true,
    outdir: 'build',
    platform: 'browser',
    banner: { js: multiversXBanner },
    // drop: ['console', 'debugger'],
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
