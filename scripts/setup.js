#!/usr/bin/env node
// scripts/setup.js
// One-command local setup: `npm run setup` from the repo root.
// Copies env files (never overwriting one you've already configured),
// installs dependencies in both packages, and runs backend migrations.
//
// A plain Node script rather than a bash one-liner so this works
// identically on Windows, matching the existing convention in this repo
// (frontend/scripts/check-env.js, backend/generate-pwa-icons.js).

import { existsSync, copyFileSync } from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function copyEnvIfMissing(pkgDir) {
  const example = path.join(rootDir, pkgDir, '.env.example');
  const target = path.join(rootDir, pkgDir, '.env');
  if (!existsSync(example)) return;
  if (existsSync(target)) {
    console.log(`✓ ${pkgDir}/.env already exists — leaving it alone`);
    return;
  }
  copyFileSync(example, target);
  console.log(`✓ Created ${pkgDir}/.env from .env.example`);
}

function run(command, args, cwd) {
  console.log(`\n$ ${command} ${args.join(' ')}  (in ${cwd})`);
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    console.error(`\n✗ Command failed: ${command} ${args.join(' ')} (in ${cwd})`);
    process.exit(result.status ?? 1);
  }
}

console.log('── Setting up env files ──────────────────────────────');
copyEnvIfMissing('backend');
copyEnvIfMissing('frontend');

console.log('\n── Installing dependencies ───────────────────────────');
run('npm', ['install'], path.join(rootDir, 'backend'));
run('npm', ['install'], path.join(rootDir, 'frontend'));

console.log('\n── Running database migrations ───────────────────────');
run('npm', ['run', 'migrate'], path.join(rootDir, 'backend'));

console.log(`
── Setup complete ────────────────────────────────────

Next steps:
  1. Edit backend/.env — at minimum set DATABASE_URL and JWT_SECRET
     (random, ≥32 chars, no dictionary words — config.js checks this
     at boot).
  2. Run \`npm run create-admin\` inside backend/ (or set
     ADMIN_BOOTSTRAP_EMAIL + ADMIN_BOOTSTRAP_PASSWORD and skip this).
  3. From the repo root: \`npm run dev\` to start both servers.
`);
