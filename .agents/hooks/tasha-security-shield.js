#!/usr/bin/env node
import process from 'node:process';
const PROHIBITED = [/\brm\s+-[rR]f\s+[\/\*]/, /\bcurl\b.*\|\s*(ba)?sh\b/, /\bchmod\s+(-R\s+)?777\b/];
export function evaluateSecurity(payload = {}) {
  const cmd = payload.args?.CommandLine || payload.args?.command || '';
  for (const p of PROHIBITED) {
    if (p.test(cmd)) return { allowed: false, reason: '🚨 [TASHA YAR]: Prohibited command detected.' };
  }
  return { allowed: true };
}
if (process.argv.includes('--test')) {
  console.log('🛡️  [TASHA YAR]: Tactical shield online.');
  process.exit(0);
}
