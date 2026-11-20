/**
 * ==============================================================================
 * ZERO-DEPENDENCY THEME LOADER (Standard, Public-Domain Naval & Private Local)
 * ==============================================================================
 * Resolves runtime role aliases, deck zones, hook labels, and mission clock
 * formatting without embedding private themes in committed files.
 * ==============================================================================
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const VALID_MODES = new Set(['standard', 'naval', 'local']);

export const ROLES_CATALOG = [
  {
    key: 'productOwner',
    standardRole: 'Human / Product Owner',
    navalAlias: 'Captain',
    deck: 'BRIDGE',
    responsibility: 'Project authority, final sign-off, requirements & constraints'
  },
  {
    key: 'orchestrator',
    standardRole: 'Lead AI Orchestrator',
    navalAlias: 'First Officer',
    deck: 'BRIDGE',
    responsibility: 'Task decomposition, checklist planning, subagent coordination'
  },
  {
    key: 'systemsAnalyst',
    standardRole: 'Systems & Logic Analyst',
    navalAlias: 'Science & Logic Officer',
    deck: 'BRIDGE',
    responsibility: 'Algorithms, DDD domain logic, finite state machines, workspace DAG'
  },
  {
    key: 'architect',
    standardRole: 'Architecture Lead',
    navalAlias: 'Chief Engineer',
    deck: 'BRIDGE',
    responsibility: 'Monorepo boundaries, modular architecture, build & CI pipelines'
  },
  {
    key: 'security',
    standardRole: 'Security Guardrail',
    navalAlias: 'Security Officer',
    deck: 'BRIDGE',
    responsibility: 'Pre-tool shell/path guard, Semgrep SAST, skill security scanning'
  },
  {
    key: 'quality',
    standardRole: 'Quality & Health Auditor',
    navalAlias: 'Chief Medical Officer',
    deck: 'BRIDGE',
    responsibility: 'Post-edit policy checks, KISS/YAGNI/DRY/SOLID minimalism, anti-polling rules'
  },
  {
    key: 'ux',
    standardRole: 'Design System & UX Enforcer',
    navalAlias: 'UX & Comms Officer',
    deck: 'BRIDGE',
    responsibility: 'CLI ergonomics, WCAG accessibility, styling policy, bilingual docs'
  },
  {
    key: 'testRunner',
    standardRole: 'Test Automation Runner',
    navalAlias: 'Lower-Deck Runner',
    deck: 'LOWER_DECK',
    responsibility: 'Fast unit tests, linters, isolated simulation execution'
  },
  {
    key: 'metaCritic',
    standardRole: 'Meta-Critic Evaluator',
    navalAlias: 'Lower-Deck Evaluator',
    deck: 'LOWER_DECK',
    responsibility: 'Stateless zero-context cold review (3-gate Pass/Abort) & doc-to-code parity'
  }
];

/**
 * @typedef {'standard'|'naval'|'local'} ThemeMode
 * @typedef {{ theme?: ThemeMode|string, themeFile?: string, rootDir?: string, args?: string[] }} ThemeOptions
 * @typedef {{
 *   name: string,
 *   zones: Record<string, string>,
 *   labels: Record<string, string>,
 *   defaults: { from: string, to: string },
 *   clockPrefix: string|null
 * }} BaseThemeConfig
 * @typedef {BaseThemeConfig & {
 *   roles: Record<string, string>,
 *   mode: ThemeMode,
 *   source: string
 * }} ThemeConfig
 */

/** @param {string|null} [val] @returns {ThemeMode|null} */
function normalizeThemeMode(val) {
  const lower = String(val || '').trim().toLowerCase();
  if (lower === 'standard' || lower === 'naval' || lower === 'local') return lower;
  return null;
}

/** @param {ThemeMode|string} [mode] @returns {Record<string, string>} */
function buildRolesMap(mode = 'standard') {
  /** @type {Record<string, string>} */
  const map = {};
  for (const role of ROLES_CATALOG) {
    map[role.key] = mode === 'standard' ? role.standardRole : role.navalAlias;
  }
  return map;
}

/** @type {Record<'standard'|'naval', BaseThemeConfig>} */
export const PUBLIC_THEMES = {
  standard: {
    name: 'Standard Technical',
    zones: {
      bridge: 'Core Governance',
      lowerDeck: 'Stateless Subagents',
      simBay: 'Simulation Sandbox'
    },
    labels: {
      guard: '[SECURITY GUARD]',
      policy: '[POLICY CHECK]',
      scanner: '[SKILL SECURITY SCANNER]',
      circuit: '[CIRCUIT BREAKER]',
      cascade: '[CASCADE SCOPE]',
      audit: '[AUDIT LOG]',
      cve: '[NODE CVE CHECK]',
      sim: '[SIMULATION SANDBOX]'
    },
    defaults: {
      from: 'Product Owner',
      to: 'Lead Orchestrator'
    },
    clockPrefix: null
  },
  naval: {
    name: 'Naval Command',
    zones: {
      bridge: 'Bridge',
      lowerDeck: 'Lower Deck',
      simBay: 'Sim Deck'
    },
    labels: {
      guard: '[SECURITY OFFICER]',
      policy: '[CHIEF MEDICAL / POLICY]',
      scanner: '[SECURITY OFFICER / SKILL SCANNER]',
      circuit: '[SECURITY OFFICER / CIRCUIT BREAKER]',
      cascade: '[SCIENCE OFFICER / CASCADE SCOPE]',
      audit: '[DECK LOG]',
      cve: '[RUNTIME SHIELD]',
      sim: '[SIM DECK]'
    },
    defaults: {
      from: 'Captain',
      to: 'First Officer'
    },
    clockPrefix: 'Mission'
  }
};

function stripQuotes(val = '') {
  return String(val).trim().replace(/^['"]|['"]$/g, '').trim();
}

/**
 * Reads theme overrides from `.agents/.env`.
 * @param {string} [startDir]
 * @returns {{ theme: string|null, themeFile: string|null }}
 */
export function readDotEnvTheme(startDir = process.cwd()) {
  const envPath = path.join(path.resolve(startDir), '.agents', '.env');
  /** @type {{ theme: string|null, themeFile: string|null }} */
  const result = { theme: null, themeFile: null };
  if (!fs.existsSync(envPath)) return result;

  try {
    const raw = fs.readFileSync(envPath, 'utf-8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = stripQuotes(trimmed.slice(eqIdx + 1));
      if (key === 'AGENT_THEME' && val) result.theme = val.toLowerCase();
      if (key === 'AGENT_THEME_FILE' && val) result.themeFile = val;
    }
  } catch { /* fallback: unreadable .agents/.env treated as absent */ }
  return result;
}

/** @param {string|null|undefined} filePath @returns {boolean} */
function isReadableFile(filePath) {
  if (!filePath) return false;
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch { /* fallback: inaccessible path */
    return false;
  }
}

/**
 * Searches for a private local theme JSON override.
 * @param {string} [startDir]
 * @param {ThemeOptions} [options]
 * @returns {string|null}
 */
export function findLocalThemeFile(startDir = process.cwd(), options = {}) {
  const resolvedStart = path.resolve(startDir);
  const dotEnv = readDotEnvTheme(resolvedStart);
  const explicitFile = options.themeFile || process.env.AGENT_THEME_FILE || dotEnv.themeFile;

  /** @type {string[]} */
  const candidates = [];
  if (explicitFile) {
    candidates.push(path.isAbsolute(explicitFile) ? explicitFile : path.resolve(resolvedStart, explicitFile));
  }
  candidates.push(path.join(resolvedStart, '.agents', 'theme.local.json'));
  candidates.push(path.join(resolvedStart, '.agent-theme.local.json'));

  let cur = resolvedStart;
  for (let i = 0; i < 3; i++) {
    const parent = path.dirname(cur);
    if (!parent || parent === cur) break;
    candidates.push(path.join(parent, '.agent-theme.local.json'));
    cur = parent;
  }

  candidates.push(path.join(os.homedir(), '.config', 'agent-governance', 'theme.local.json'));

  for (const cand of candidates) {
    if (isReadableFile(cand)) return cand;
  }
  return null;
}

/**
 * Resolves the active theme mode from options, CLI args, env, or `.agents/.env`.
 * @param {string[]} [args]
 * @param {ThemeOptions} [options]
 * @returns {ThemeMode}
 */
export function resolveThemeMode(args = [], options = {}) {
  const optMode = normalizeThemeMode(options.theme);
  if (optMode) {
    return optMode;
  }

  const flag = Array.isArray(args) ? args.find(a => typeof a === 'string' && a.startsWith('--theme=')) : null;
  if (flag) {
    const flagMode = normalizeThemeMode(flag.slice('--theme='.length));
    if (flagMode) return flagMode;
  }

  const envMode = normalizeThemeMode(process.env.AGENT_THEME);
  if (envMode) return envMode;

  if (options.themeFile || process.env.AGENT_THEME_FILE) {
    return 'local';
  }

  const dotEnv = readDotEnvTheme(options.rootDir || process.cwd());
  const dotEnvMode = normalizeThemeMode(dotEnv.theme);
  if (dotEnvMode) return dotEnvMode;
  if (dotEnv.themeFile) return 'local';

  return 'standard';
}

/**
 * Loads the resolved theme configuration, falling back safely if local overrides are missing.
 * @param {ThemeOptions} [options]
 * @returns {ThemeConfig}
 */
export function loadThemeConfig(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const mode = resolveThemeMode(options.args || [], options);

  if (mode === 'standard' || mode === 'naval') {
    const base = PUBLIC_THEMES[mode];
    return {
      ...base,
      roles: buildRolesMap(mode),
      mode,
      source: 'built-in'
    };
  }

  const navalBase = PUBLIC_THEMES.naval;
  /** @type {ThemeConfig} */
  const fallback = {
    ...navalBase,
    roles: buildRolesMap('naval'),
    mode: 'local',
    source: 'fallback:naval'
  };

  const localFile = findLocalThemeFile(rootDir, options);
  if (!localFile) return fallback;

  try {
    const parsed = JSON.parse(fs.readFileSync(localFile, 'utf-8'));
    if (!parsed || typeof parsed !== 'object') return fallback;

    return {
      name: parsed.name || 'Local Theme',
      clockPrefix: parsed.clockPrefix !== undefined ? parsed.clockPrefix : navalBase.clockPrefix,
      zones: { ...navalBase.zones, ...(parsed.zones || {}) },
      labels: { ...navalBase.labels, ...(parsed.labels || {}) },
      defaults: { ...navalBase.defaults, ...(parsed.defaults || {}) },
      roles: { ...buildRolesMap('naval'), ...(parsed.roles || {}) },
      mode: 'local',
      source: localFile
    };
  } catch { /* fallback: invalid JSON in local theme file falls back cleanly to naval */
    return fallback;
  }
}

/** @param {string} labelKey @param {ThemeOptions} [options] @returns {string} */
export function getHookLabel(labelKey, options = {}) {
  const cfg = loadThemeConfig(options);
  return cfg.labels?.[labelKey] || '[GOVERNANCE]';
}

/** @param {string} zoneKey @param {ThemeOptions} [options] @returns {string} */
export function getZoneName(zoneKey, options = {}) {
  const cfg = loadThemeConfig(options);
  return cfg.zones?.[zoneKey] || zoneKey;
}

/** @param {string} roleKey @param {ThemeOptions} [options] @returns {string} */
export function getRoleAlias(roleKey, options = {}) {
  const cfg = loadThemeConfig(options);
  if (cfg.roles?.[roleKey]) return cfg.roles[roleKey];
  const entry = ROLES_CATALOG.find(r => r.key === roleKey);
  if (!entry) return roleKey;
  return cfg.mode === 'standard' ? entry.standardRole : entry.navalAlias;
}

/** @param {Date} [date] @returns {string} */
export function computeMissionDateCode(date = new Date()) {
  const year = date.getUTCFullYear();
  const start = Date.UTC(year, 0, 0);
  const diff = date.getTime() - start;
  const dayOfYear = Math.max(1, Math.floor(diff / 86400000));
  return `${year}.${String(dayOfYear).padStart(3, '0')}`;
}

/** @param {Date} [date] @param {ThemeOptions} [options] @returns {string} */
export function formatMissionClock(date = new Date(), options = {}) {
  const cfg = loadThemeConfig(options);
  if (cfg.clockPrefix) {
    return `${cfg.clockPrefix} ${computeMissionDateCode(date)}`;
  }
  return date.toISOString();
}
