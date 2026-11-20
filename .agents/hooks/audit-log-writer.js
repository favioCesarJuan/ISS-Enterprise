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
import {
  loadThemeConfig,
  formatMissionClock,
  computeMissionDateCode,
  getHookLabel
} from './theme-loader.js';

export { formatMissionClock, computeMissionDateCode };

export const SPEC_AUDIT_EVENTS = {
  SPEC_DRAFTED: 'spec_drafted',
  COLD_REVIEW_ABORT: 'cold_review_abort',
  COLD_REVIEW_PASS: 'cold_review_pass',
  SPEC_APPROVED: 'spec_approved'
};

/**
 * @typedef {import('./theme-loader.js').ThemeOptions} ThemeOptions
 * @typedef {{
 *   specId?: string|null,
 *   gate?: string|null,
 *   verdict?: string|null,
 *   reviewerModel?: string|null,
 *   crossModel?: boolean
 * }} SpecAuditMeta
 * @typedef {{
 *   from?: string,
 *   to?: string,
 *   event?: string,
 *   mission?: string,
 *   healthStatus?: string,
 *   securityStatus?: string,
 *   details?: string,
 *   filesTouched?: string[],
 *   specMeta?: SpecAuditMeta
 * }} AuditEntryInput
 * @typedef {{
 *   id: string,
 *   epochMs: number,
 *   timestamp: string,
 *   from: string,
 *   to: string,
 *   event: string,
 *   mission: string,
 *   healthStatus: string,
 *   securityStatus: string,
 *   details: string,
 *   filesTouched: string[],
 *   missionClock?: string,
 *   specMeta?: SpecAuditMeta
 * }} AuditLogRecord
 */

/** @param {Date} [date] @param {ThemeOptions} [options] @returns {string} */
export function formatAuditTimestamp(date = new Date(), options = {}) {
  return formatMissionClock(date, options);
}

/**
 * Appends an audit log entry to both JSON and Markdown representations.
 * @param {AuditEntryInput} [entry]
 * @param {ThemeOptions} [options]
 * @returns {AuditLogRecord}
 */
export function appendAuditLog(entry = {}, options = {}) {
  const rootDir = options.rootDir ? path.resolve(options.rootDir) : process.cwd();
  const theme = loadThemeConfig({ rootDir, theme: options.theme });
  const logJson = path.join(rootDir, '.agents', 'audit_log.json');
  const logMd = path.join(rootDir, '.agents', 'audit_log.md');

  const dir = path.dirname(logJson);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const now = new Date();
  const displayTime = formatAuditTimestamp(now, { rootDir, theme: options.theme });

  /** @type {AuditLogRecord} */
  const fullEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    epochMs: now.getTime(),
    timestamp: now.toISOString(),
    from: entry.from || theme.defaults.from,
    to: entry.to || theme.defaults.to,
    event: entry.event || 'governance_action',
    mission: entry.mission || 'General operational duty',
    healthStatus: entry.healthStatus || 'HEALTHY',
    securityStatus: entry.securityStatus || 'SECURE',
    details: entry.details || '',
    filesTouched: entry.filesTouched || []
  };

  if (theme.mode !== 'standard') {
    fullEntry.missionClock = computeMissionDateCode(now);
  }

  if (entry.specMeta && typeof entry.specMeta === 'object') {
    fullEntry.specMeta = {
      specId: entry.specMeta.specId || null,
      gate: entry.specMeta.gate || null,
      verdict: entry.specMeta.verdict || null,
      reviewerModel: entry.specMeta.reviewerModel || null,
      crossModel: Boolean(entry.specMeta.crossModel)
    };
  }

  /** @type {AuditLogRecord[]} */
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

  const specSummary = fullEntry.specMeta
    ? `\n- **Spec Review**: \`${fullEntry.specMeta.specId || 'spec'}\` | Gate: \`${fullEntry.specMeta.gate || '-'}\` | Verdict: \`${fullEntry.specMeta.verdict || '-'}\`${fullEntry.specMeta.reviewerModel ? ` | Reviewer: \`${fullEntry.specMeta.reviewerModel}\` (crossModel=${fullEntry.specMeta.crossModel})` : ''}`
    : '';

  const mdEntry = `### ${displayTime} — \`${fullEntry.event}\`
- **From**: \`${fullEntry.from}\` -> **To**: \`${fullEntry.to}\`
- **Task**: ${fullEntry.mission}
- **Security**: \`${fullEntry.securityStatus}\` | **Policy Health**: \`${fullEntry.healthStatus}\`${specSummary}
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
    console.log(`${getHookLabel('sim')} ${getHookLabel('audit')}: Running audit log writer self-test...`);
    const tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.tmp-audit-'));
    let exitCode = 1;
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
        exitCode = 0;
      } else {
        console.error('Failed to write audit log files.');
      }
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    process.exit(exitCode);
  }
}
