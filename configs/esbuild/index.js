const banner = `/*!
 * Portions of this code are derived from MultiversX libraries.
 * These portions are licensed under the MIT License.
 *
 * See the MultiversX repository for details: https://github.com/multiversx
 * See the attached MIT licence for elven.js: https://github.com/elven-js/elven.js/blob/main/LICENSE
 */
`;

export default {
  format: 'esm',
  bundle: true,
  metafile: true,
  minify: true,
  outdir: 'build',
  platform: 'browser',
  banner: { js: banner },
  treeShaking: true,
  // drop: ['console', 'debugger'],
};
