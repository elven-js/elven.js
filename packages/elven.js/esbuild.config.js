import { baseConfig } from '@configs/esbuild';
import esbuild from 'esbuild';
import fs from 'fs';

esbuild
  .build({
    ...baseConfig,
    entryPoints: ['./src/elven.ts'],
    outfile: './build/elven.js',
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
