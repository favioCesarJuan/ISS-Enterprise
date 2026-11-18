#!/usr/bin/env node
/**
 * ==============================================================================
 * AUDIT LOG WRITER (Immutable Multi-Agent Governance Ledger)
 * ==============================================================================
 * Appends structured execution records to .agents/audit_log.json and
 * renders a human-readable Markdown transcript at .agents/audit_log.md.
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const isStarfleet = () => process.env.AGENT_THEME === 'starfleet';

export function formatAuditTimestamp(date = new Date()) {
  if (isStarfleet()) {
    const year = date.getUTCFullYear();
    const start = new Date(Date.UTC(year, 0, 0));
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const stardate = 41000 + (year - 2024) * 1000 + (dayOfYear / 365) * 1000;
    return `Stardate ${stardate.toFixed(1)}`;
  }
  return date.toISOString();
}

export function calculateStardate(date = new Date()) {
  const year = date.getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 0));
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const stardate = 41000 + (year - 2024) * 1000 + (dayOfYear / 365) * 1000;
  return stardate.toFixed(1);
}

/**
 * Appends an audit log entry to both JSON and Markdown representations.
 * @param {object} entry
 * @param {object} options { rootDir?: string }
 */
export function appendAuditLog(entry = {}, options = {}) {
  const rootDir = options.rootDir ? path.resolve(options.rootDir) : process.cwd();
  const logJson = path.join(rootDir, '.agents', 'audit_log.json');
  const logMd = path.join(rootDir, '.agents', 'audit_log.md');

  const dir = path.dirname(logJson);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const now = new Date();
  const displayTime = formatAuditTimestamp(now);

  const fullEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    epochMs: now.getTime(),
    timestamp: now.toISOString(),
    from: entry.from || (isStarfleet() ? 'Captain Picard' : 'Product Owner'),
    to: entry.to || (isStarfleet() ? 'Cmdr. Riker' : 'Lead Orchestrator'),
    event: entry.event || 'governance_action',
    mission: entry.mission || 'General operational duty',
    healthStatus: entry.healthStatus || 'HEALTHY',
    securityStatus: entry.securityStatus || 'SECURE',
    details: entry.details || '',
    filesTouched: entry.filesTouched || []
  };

  if (isStarfleet()) {
    fullEntry.stardate = calculateStardate(now);
  }

  let logs = [];
  if (fs.existsSync(logJson)) {
    try {
      logs = JSON.parse(fs.readFileSync(logJson, 'utf-8'));
    } catch {
      logs = [];
    }
  }
  logs.push(fullEntry);
  fs.writeFileSync(logJson, JSON.stringify(logs, null, 2), 'utf-8');

  const mdHeader = !fs.existsSync(logMd)
    ? `# Agent Governance Audit Log\n\nImmutable ledger of guardrail checks, policy evaluations, and agent handoffs.\n\n---\n\n`
    : '';

  const mdEntry = `### ${displayTime} — \`${fullEntry.event}\`
- **From**: \`${fullEntry.from}\` -> **To**: \`${fullEntry.to}\`
- **Task**: ${fullEntry.mission}
- **Security**: \`${fullEntry.securityStatus}\` | **Policy Health**: \`${fullEntry.healthStatus}\`
${fullEntry.filesTouched.length > 0 ? `- **Files Touched**: ${fullEntry.filesTouched.map(f => `\`${f}\``).join(', ')}` : ''}
${fullEntry.details ? `\n> ${fullEntry.details.replace(/\n/g, '\n> ')}\n` : ''}
---
`;

  fs.appendFileSync(logMd, mdHeader + mdEntry, 'utf-8');
  return fullEntry;
}

export const appendLogEntry = appendAuditLog;

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  if (process.argv.includes('--test')) {
    console.log('[AUDIT LOG]: Running audit log writer self-test...');
    const tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.tmp-audit-'));
    try {
      const entry = appendAuditLog({
        from: 'Lead Orchestrator',
        to: 'Security Guardrail',
        event: 'self_test',
        mission: 'Verify audit log JSON and Markdown ledger',
        healthStatus: 'HEALTHY (100%)',
        securityStatus: 'SECURE',
        details: 'System bootstrapped with deterministic hooks.',
        filesTouched: ['.agents/hooks.json', '.agents/hooks/audit-log-writer.js']
      }, { rootDir: tmpDir });

      const jsonOk = fs.existsSync(path.join(tmpDir, '.agents', 'audit_log.json'));
      const mdOk = fs.existsSync(path.join(tmpDir, '.agents', 'audit_log.md'));
      if (jsonOk && mdOk) {
        console.log(`Audit Log recorded entry: ${entry.id} (${entry.timestamp})`);
        console.log('[AUDIT LOG]: Self-test PASSED.');
        process.exit(0);
      } else {
        console.error('Failed to write audit log files.');
        process.exit(1);
      }
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
}
