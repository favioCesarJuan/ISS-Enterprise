#!/usr/bin/env node
import fs from 'node:fs';
import process from 'node:process';

const ALLOW_TAILWIND = false;

export function diagnose(content = '') {
  const issues = [];
  if (/setInterval\s*\(\s*(async\s*)?\(\s*\)\s*=>.*fetch|axios|api\b/s.test(content)) {
    issues.push({ id: 'NO_CONTINUOUS_POLLING', msg: 'Continuous polling is prohibited.' });
  }
  if (!ALLOW_TAILWIND && /(from\s+['"]tailwindcss['"]|from\s+['"]nativewind['"])/.test(content)) {
    issues.push({ id: 'FORBIDDEN_TAILWIND', msg: 'Tailwind forbidden by project directive.' });
  }
  return issues;
}

if (process.argv.includes('--test')) {
  console.log('🩺  [DR. CRUSHER]: Health check online. Tailwind allowed:', ALLOW_TAILWIND);
  process.exit(0);
}
