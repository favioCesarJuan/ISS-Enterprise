#!/usr/bin/env node

/**
 * ==============================================================================
 * ⚔️ ISS-ENTERPRISE CLI BINARY
 * ==============================================================================
 */

import { runCLI } from '../src/cli.js';

runCLI(process.argv.slice(2)).catch((err) => {
  console.error('\n\x1b[31m[CRITICAL WARP CORE FAILURE]\x1b[0m', err.message || err);
  if (process.env.DEBUG) {
    console.error(err.stack);
  }
  process.exit(1);
});
