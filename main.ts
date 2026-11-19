// Leonida Nights — the entry program for gta6-trophy-guide-01.
//
// What it does, in three moves: copy this repository's app/ (the offline
// trophy guide) and screenshots/ (four renders of it running) into the
// output folder, then write output/dossier.json with the make.fun library's
// buildDossier, the summary the judge reads.
//
// It runs on Node 22 with the standard library only, and it runs twice in
// grading: both runs must write the same bytes. There is nothing random or
// time-dependent in here, so they do.
//
// The output folder is /output inside the grader. Anywhere else,
// MAKEFUN_OUTPUT_DIR stands in for it:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Serve the guide locally with `node serve.ts` and open http://localhost:8080.
// vendor/makefun-frontend.ts is the kit's copy and must stay exactly as shipped:
// the scorer rebuilds the dossier with its own copy and compares byte for byte.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The folder this file lives in, and the folder the entry goes to.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The dossier library caps what it will accept, mirroring the sealed gate:
// at most 4 screenshots of at most 256 KiB, app/ at most 993 files and
// directories and 48 MiB in all, and the dossier text at most 160 KiB.
const dossierOptions = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, dossierOptions));
