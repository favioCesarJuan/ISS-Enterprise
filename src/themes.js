/**
 * ==============================================================================
 * THEME & ROLE ALIAS REGISTRY (Option A: Standard Default + Optional Starfleet)
 * ==============================================================================
 * Provides functional corporate role definitions by default ("standard") and
 * optional Star Trek: TNG crew aliases ("starfleet") with zero extra output tokens.
 * ==============================================================================
 */

export const ROLES_MAP = [
  {
    key: 'productOwner',
    standardRole: 'Human / Product Owner',
    starfleetAlias: 'Captain Jean-Luc Picard',
    responsibility: 'Project authority, final sign-off, requirements & constraints'
  },
  {
    key: 'orchestrator',
    standardRole: 'Lead AI Orchestrator',
    starfleetAlias: 'Cmdr. William T. Riker',
    responsibility: 'Task decomposition, checklist planning, subagent coordination'
  },
  {
    key: 'systemsAnalyst',
    standardRole: 'Systems & Logic Analyst',
    starfleetAlias: 'Lt. Cmdr. Data',
    responsibility: 'Algorithms, DDD domain logic, finite state machines, workspace DAG'
  },
  {
    key: 'architect',
    standardRole: 'Architecture Lead',
    starfleetAlias: 'Lt. Cmdr. Geordi La Forge',
    responsibility: 'Monorepo boundaries, modular architecture, build & CI pipelines'
  },
  {
    key: 'security',
    standardRole: 'Security Guardrail',
    starfleetAlias: 'Lt. Cmdr. Worf / Lt. Tasha Yar',
    responsibility: 'Pre-tool shell/path guard, Semgrep SAST, skill security scanning'
  },
  {
    key: 'quality',
    standardRole: 'Quality & Health Auditor',
    starfleetAlias: 'Dr. Beverly Crusher',
    responsibility: 'Post-edit policy checks, YAGNI minimalism, anti-polling rules'
  },
  {
    key: 'ux',
    standardRole: 'Design System & UX Enforcer',
    starfleetAlias: 'Counselor Deanna Troi',
    responsibility: 'CLI ergonomics, WCAG accessibility, styling policy, bilingual docs'
  },
  {
    key: 'testRunner',
    standardRole: 'Test Automation Runner',
    starfleetAlias: 'Ensign Wesley Crusher',
    responsibility: 'Fast unit tests, linters, subagent execution'
  },
  {
    key: 'metaCritic',
    standardRole: 'Meta-Critic Evaluator',
    starfleetAlias: 'Q',
    responsibility: 'Adversarial edge-case review, bias detection, doc-to-code parity'
  }
];

/**
 * Resolves the active theme from CLI flags, explicit options, or environment.
 * @param {string[]} args
 * @param {object} options
 * @returns {'standard' | 'starfleet'}
 */
export function resolveTheme(args = [], options = {}) {
  if (options.theme === 'starfleet' || options.theme === 'standard') {
    return options.theme;
  }
  const flag = args.find(a => a.startsWith('--theme='));
  if (flag) {
    const value = flag.split('=')[1]?.trim().toLowerCase();
    if (value === 'starfleet' || value === 'standard') {
      return value;
    }
  }
  if (process.env.AGENT_THEME === 'starfleet') {
    return 'starfleet';
  }
  return 'standard';
}

/**
 * Prints the installation/activation notice explaining the optional Starfleet crew theme,
 * each character's role in the project, and the zero-extra-token guarantee.
 * @param {'standard' | 'starfleet'} theme
 */
export function printCrewThemeNotice(theme = 'standard') {
  console.log('\n================================================================');
  console.log(`GOVERNANCE THEME: ${theme.toUpperCase()} (${theme === 'starfleet' ? 'Optional Starfleet Aliases Active' : 'Default Functional Naming'})`);
  console.log('================================================================');
  console.log('You can switch between standard technical roles and optional Starfleet crew');
  console.log('aliases at any time via `--theme=starfleet` or `AGENT_THEME=starfleet` in .agents/.env.');
  console.log('Token Impact: 0 extra output tokens when using compact labels (`Zero Theatrical Filler`).\n');
  console.log('Role <-> Crew Mapping:');
  for (const r of ROLES_MAP) {
    console.log(`  - ${r.standardRole.padEnd(28)} <-> ${r.starfleetAlias.padEnd(28)} : ${r.responsibility}`);
  }
  console.log('================================================================\n');
}
