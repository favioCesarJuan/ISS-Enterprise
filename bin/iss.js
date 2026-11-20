#!/usr/bin/env node

/**
 * ==============================================================================
 * ⚔️ ISS-ENTERPRISE CLI BINARY
 * ==============================================================================
 */

import { runCLI } from '../src/cli.js';

runCLI(process.argv.slice(2)).catch((/** @type {unknown} */ err) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error('\n\x1b[31m[CRITICAL CLI ERROR]\x1b[0m', msg);
  if (process.env.DEBUG && err instanceof Error) {
    console.error(err.stack);
  }
  process.exit(1);
});
