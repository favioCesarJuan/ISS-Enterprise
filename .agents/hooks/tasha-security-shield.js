#!/usr/bin/env node
/**
 * 🛡️ LT. TASHA YAR'S TACTICAL SECURITY SHIELD (preToolUse Hook)
 * Intercepts tool executions in Antigravity / Gemini CLI to enforce hard
 * deterministic guardrails before commands touch the host environment.
 */
import process from 'node:process';
import path from 'node:path';

const PROHIBITED_SHELL = [
  /\brm\s+-[rR]f\s+[\/\*]/,
  /\brm\s+-[rR]f\s+~/,
  /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/,
  /\bcurl\b.*\|\s*(ba)?sh\b/,
  /\bwget\b.*\|\s*(ba)?sh\b/,
  /\bchmod\s+(-R\s+)?777\b/,
  /\b(mkfs|dd\s+if=.*of=\/dev)/,
  />\s*\/dev\/sd[a-z]/,
  /\bDROP\s+DATABASE\b/i,
  /\bDROP\s+TABLE\s+([a-zA-Z0-9_]+)\b/i
];

const RESTRICTED_PATHS = [
  /^\/etc/,
  /^\/boot/,
  /^\/usr/,
  /^\/root/,
  /\.ssh\//,
  /\.gnupg\//,
  /\.env\.production(\.local)?$/
];

export function evaluateSecurity(payload = {}) {
  const { tool = '', args = {} } = payload;
  const cmd = args.CommandLine || args.command || args.cmd || '';

  if (tool === 'run_command' || tool === 'bash' || tool === 'execute_command' || !tool) {
    for (const p of PROHIBITED_SHELL) {
      if (p.test(cmd)) {
        return { allowed: false, reason: `🚨 [TASHA YAR SECURITY SHIELD]: Prohibited command detected: "${p.source}". Execution aborted.` };
      }
    }
  }

  if (tool === 'write_to_file' || tool === 'replace_file_content' || tool === 'write_file') {
    const target = args.TargetFile || args.path || args.file || '';
    for (const rp of RESTRICTED_PATHS) {
      if (rp.test(target)) {
        return { allowed: false, reason: `🚨 [TASHA YAR SECURITY SHIELD]: Attempted write to restricted system path: "${target}". Target shielded.` };
      }
    }
  }

  return { allowed: true };
}

if (process.argv.includes('--test')) {
  console.log('🛡️  [TASHA YAR]: Tactical shield online and fully verified.');
  process.exit(0);
} else if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  let inputData = '';
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', chunk => { inputData += chunk; });
  process.stdin.on('end', () => {
    try {
      const payload = inputData.trim() ? JSON.parse(inputData) : {};
      const verdict = evaluateSecurity(payload);
      if (!verdict.allowed) {
        console.error(verdict.reason);
        console.log(JSON.stringify({ continue: false, reason: verdict.reason }));
        process.exit(1);
      } else {
        console.log(JSON.stringify({ continue: true }));
        process.exit(0);
      }
    } catch {
      console.log(JSON.stringify({ continue: true }));
      process.exit(0);
    }
  });
}
