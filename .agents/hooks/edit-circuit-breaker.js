#!/usr/bin/env node
/**
 * ==============================================================================
 * EDIT CIRCUIT BREAKER GUARDRAIL (preToolUse Hook)
 * ==============================================================================
 * Prevents runaway token consumption and infinite edit loops by monitoring
 * rapid, repetitive edit attempts on the same file within a sliding window.
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { getHookLabel } from './theme-loader.js';

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes window
const MAX_CHURN_THRESHOLD = 5;    // Maximum edits allowed per file within window

const guardLabel = () => getHookLabel('circuit');
const simLabel = () => getHookLabel('sim');

export function getStateFilePath(rootDir = process.cwd()) {
  return path.join(path.resolve(rootDir), '.agents', '.circuit_state.json');
}

/**
 * @typedef {{ targets: Record<string, number[]> }} CircuitState
 * @typedef {{ tool?: string, args?: { TargetFile?: string, target_file?: string, file?: string, path?: string } }} CircuitPayload
 * @typedef {{ rootDir?: string, maxThreshold?: number, windowMs?: number }} CircuitOptions
 */

/** @param {string} [rootDir] @returns {CircuitState} */
export function loadState(rootDir = process.cwd()) {
  const filePath = getStateFilePath(rootDir);
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch {}
  return { targets: {} };
}

/** @param {CircuitState} state @param {string} [rootDir] */
export function saveState(state, rootDir = process.cwd()) {
  const filePath = getStateFilePath(rootDir);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
}

export function resetCircuit(rootDir = process.cwd()) {
  const filePath = getStateFilePath(rootDir);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch {}
  }
}

/**
 * Evaluates whether an edit operation trips the circuit breaker.
 * @param {CircuitPayload} [payload]
 * @param {CircuitOptions} [options]
 * @returns {{ allowed: boolean, reason?: string, count: number }}
 */
export function evaluateCircuit(payload = {}, options = {}) {
  const { tool = '', args = {} } = payload;
  const rootDir = options.rootDir || process.cwd();
  const maxThreshold = options.maxThreshold || MAX_CHURN_THRESHOLD;
  const windowMs = options.windowMs || WINDOW_MS;

  const isEditTool =
    tool === 'write_to_file' ||
    tool === 'replace_file_content' ||
    tool === 'multi_replace_file_content' ||
    tool === 'edit_file';

  if (!isEditTool) {
    return { allowed: true, count: 0 };
  }

  const targetFile = args.TargetFile || args.target_file || args.file || args.path;
  if (!targetFile) {
    return { allowed: true, count: 0 };
  }

  const normalized = path.resolve(rootDir, targetFile);
  const now = Date.now();
  const state = loadState(rootDir);

  if (!state.targets) state.targets = {};
  if (!Array.isArray(state.targets[normalized])) {
    state.targets[normalized] = [];
  }

  const activeTimestamps = state.targets[normalized].filter(t => (now - t) < windowMs);
  activeTimestamps.push(now);
  state.targets[normalized] = activeTimestamps;

  saveState(state, rootDir);

  const count = activeTimestamps.length;

  if (count > maxThreshold) {
    const relTarget = path.relative(rootDir, normalized);
    return {
      allowed: false,
      count,
      reason: `${guardLabel()}: Excessive modification churn detected for '${relTarget}' (${count} edits in under ${Math.round(windowMs / 60000)}m). Execution halted to prevent token runaway.`
    };
  }

  return { allowed: true, count };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  if (process.argv.includes('--reset')) {
    resetCircuit();
    console.log(`${guardLabel()}: State reset successfully. Counters cleared.`);
    process.exit(0);
  }

  if (process.argv.includes('--test')) {
    console.log(`${simLabel()} ${guardLabel()}: Running Circuit Breaker self-test...`);
    const testDir = fs.mkdtempSync(path.join(process.cwd(), '.circuit-test-'));

    try {
      const payload = {
        tool: 'replace_file_content',
        args: { TargetFile: 'src/core/AuthService.ts' }
      };

      for (let i = 1; i <= 5; i++) {
        const res = evaluateCircuit(payload, { rootDir: testDir, maxThreshold: 5 });
        if (!res.allowed) throw new Error(`Should allow edit #${i}`);
      }

      const tripRes = evaluateCircuit(payload, { rootDir: testDir, maxThreshold: 5 });
      if (tripRes.allowed) throw new Error('6th edit must trip the circuit breaker');
      console.log('Tripped as expected:', tripRes.reason);

      resetCircuit(testDir);
      const postResetRes = evaluateCircuit(payload, { rootDir: testDir, maxThreshold: 5 });
      if (!postResetRes.allowed) throw new Error('Post-reset edit must be allowed');

      console.log(`${guardLabel()}: Circuit Breaker self-test PASSED.`);
    } finally {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  }
}
