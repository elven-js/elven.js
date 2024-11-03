/* eslint-disable @typescript-eslint/no-require-imports */
const esbuild = require('esbuild');

const fs = require('fs');

const banner = `/*!
 * Portions of this code are derived from MultiversX libraries.
 * These portions are licensed under the MIT License.
 *
 * See the MultiversX repository for details: https://github.com/multiversx
 * See the attached MIT licence for elven.js: https://github.com/elven-js/elven.js/blob/main/LICENSE
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
    banner: { js: banner },
    treeShaking: true,
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
