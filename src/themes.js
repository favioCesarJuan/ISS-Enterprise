/**
 * ==============================================================================
 * THEME & ROLE ALIAS REGISTRY (Standard, Public-Domain Naval & Private Local)
 * ==============================================================================
 * Delegates theme resolution to `.agents/hooks/theme-loader.js` so runtime
 * hook labels, zones (Bridge, Lower Deck, Sim Deck/Sandbox), and optional
 * private local themes work consistently with zero external dependencies.
 * ==============================================================================
 */

import {
  ROLES_CATALOG,
  resolveThemeMode,
  loadThemeConfig,
  getHookLabel,
  getZoneName,
  getRoleAlias
} from '../.agents/hooks/theme-loader.js';

export const ROLES_MAP = ROLES_CATALOG;

export { loadThemeConfig, getHookLabel, getZoneName, getRoleAlias };

/**
 * Resolves the active theme from CLI flags, explicit options, or environment.
 * @param {string[]} [args]
 * @param {import('../types/index.d.ts').ThemeOptions} [options]
 * @returns {import('../types/index.d.ts').ThemeMode}
 */
export function resolveTheme(args = [], options = {}) {
  return resolveThemeMode(args, options);
}

/**
 * Prints the active governance theme notice, deck zones, and role mappings.
 * @param {import('../types/index.d.ts').ThemeMode | string} [theme]
 * @param {import('../types/index.d.ts').ThemeOptions} [options]
 */
export function printThemeNotice(theme = 'standard', options = {}) {
  const cfg = loadThemeConfig({ ...options, theme });
  const modeLabel = cfg.mode === 'naval'
    ? 'Public-Domain Naval Aliases Active'
    : cfg.mode === 'local'
      ? `Private Local Theme Active (${cfg.source})`
      : 'Default Functional Naming';

  console.log('\n================================================================');
  console.log(`GOVERNANCE THEME: ${cfg.mode.toUpperCase()} (${modeLabel})`);
  console.log(`ZONES: Bridge="${cfg.zones.bridge}" | Lower Deck="${cfg.zones.lowerDeck}" | Sim="${cfg.zones.simBay}"`);
  console.log('================================================================');
  console.log('Switch themes anytime via `--theme=standard|naval|local` or `AGENT_THEME` in .agents/.env.');
  console.log('Token Impact: 0 extra output tokens when using compact labels (`Zero Theatrical Filler`).\n');
  console.log('Role <-> Active Alias Mapping:');
  for (const role of ROLES_MAP) {
    const alias = getRoleAlias(role.key, { ...options, theme: cfg.mode });
    console.log(`  - ${role.standardRole.padEnd(28)} <-> ${alias.padEnd(24)} [${role.deck}] : ${role.responsibility}`);
  }
  console.log('================================================================\n');
}

export const printCrewThemeNotice = printThemeNotice;
