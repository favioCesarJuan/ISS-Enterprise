/**
 * ==============================================================================
 * 🔌 ISS-ENTERPRISE: INDISPENSABLE MCP ENGINE & AUDITOR
 * ==============================================================================
 * Governs the Indispensable MCP Triad:
 * 1. Long-range Sensors: context7 / brave-search (Up-to-date 2026 Docs)
 * 2. Enterprise Archives: codebase-memory-mcp (Knowledge Graph & Call Chains)
 * 3. Subspace Comms: github MCP / gh CLI (VCS & PR Automation)
 *
 * Provides interactive pre-approval, alternative substitutions, and model-specific tuning.
 * ==============================================================================
 */

export const INDISPENSABLE_TRIAD = {
  docs_freshness: {
    id: 'context7',
    name: 'Long-range Sensors (Fresh 2026 Docs)',
    defaultServer: 'context7',
    alternatives: ['brave-search', 'perplexity-mcp', 'fetch-url-agent'],
    description: 'Retrieves official, live documentation for libraries and APIs without hallucination.',
    envVarsNeeded: []
  },
  knowledge_graph: {
    id: 'codebase-memory-mcp',
    name: 'Enterprise Archives (Knowledge Graph)',
    defaultServer: 'codebase-memory-mcp',
    alternatives: ['ast-grep-mcp', 'sqlite-ast-indexer'],
    description: 'Maintains persistent knowledge graph of functions, routes, and call chains for cascade evaluation.',
    envVarsNeeded: []
  },
  vcs_github: {
    id: 'github',
    name: 'Subspace Communications (GitHub / VCS)',
    defaultServer: 'github',
    alternatives: ['gh-cli-skill', 'git-terminal-agent'],
    description: 'Automates pull requests, issues, commits, and code review comments.',
    envVarsNeeded: ['GITHUB_PERSONAL_ACCESS_TOKEN']
  }
};

/**
 * Evaluates current project and model profile, returning recommended MCP config.
 * @param {object} techStack
 * @param {string} dominantProvider 'anthropic' | 'google' | 'deepseek' | 'qwen'
 * @returns {object} Structured MCP configuration and checklist
 */
export function buildMcpPlan(techStack = {}, dominantProvider = 'anthropic') {
  const plan = {
    triad: INDISPENSABLE_TRIAD,
    recommendedConfig: {},
    envVarsToCheck: []
  };

  // 1. Docs
  plan.recommendedConfig['context7'] = {
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp'],
    priority: 'MANDATORY',
    description: 'Up-to-date documentation lookup.'
  };

  // 2. Knowledge Graph
  plan.recommendedConfig['codebase-memory-mcp'] = {
    command: 'npx',
    args: ['-y', 'codebase-memory-mcp'],
    priority: 'MANDATORY',
    description: 'Knowledge graph for cascade evaluation.'
  };

  // 3. GitHub / VCS
  // If local model with small context, suggest CLI skill alternative!
  const isLocalSmallModel = dominantProvider === 'qwen' || dominantProvider === 'ollama';

  if (isLocalSmallModel) {
    plan.recommendedConfig['github-cli-fallback'] = {
      type: 'NATIVE_CLI_SKILL',
      tool: 'gh',
      description: 'Uses lightweight local gh CLI commands to minimize token overhead on local models.'
    };
  } else {
    plan.recommendedConfig['github'] = {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      priority: 'HIGH',
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: '${GITHUB_TOKEN}' },
      description: 'Full GitHub MCP integration.'
    };
    plan.envVarsToCheck.push('GITHUB_PERSONAL_ACCESS_TOKEN');
  }

  // 4. Optional UI/DevTools if frontend detected
  if (techStack.hasNext || techStack.hasAstro || techStack.hasExpo) {
    plan.recommendedConfig['chrome-devtools'] = {
      command: 'npx',
      args: ['-y', 'chrome-devtools-mcp'],
      priority: 'RECOMMENDED',
      description: 'Live UI inspection, console logs, and WCAG accessibility auditing.'
    };
  }

  return plan;
}

/**
 * High-level helper to configure the indispensable triad.
 * @param {object} options
 */
export function configureIndispensableTriad(options = {}) {
  const preferredModel = options.preferredModel || 'anthropic';
  const techStack = options.techStack || {};
  return buildMcpPlan(techStack, preferredModel);
}

/**
 * Evaluates custom user substitutions for the MCP triad.
 * @param {object} substitutions
 * @param {object} techStack
 */
export function evaluateTriadSubstitutions(substitutions = {}, techStack = {}) {
  return buildMcpPlan(techStack, 'anthropic');
}

/**
 * Formats a user-facing interactive summary of the proposed MCPs.
 * @param {object} mcpPlan
 * @returns {string} Formatted text
 */
export function renderInteractiveMcpMenu(mcpPlan) {
  let output = `📡 [FIRST OFFICER RIKER]: Tactical Sensor Array (Indispensable MCP Triad):\n\n`;

  for (const [key, item] of Object.entries(mcpPlan.triad)) {
    output += `  🔹 [${item.name}]: ${item.defaultServer}\n`;
    output += `     ↳ Purpose: ${item.description}\n`;
    output += `     ↳ Available Alternatives: ${item.alternatives.join(', ')}\n\n`;
  }

  if (mcpPlan.envVarsToCheck.length > 0) {
    output += `⚠️  Environment Keys required for full uplink: ${mcpPlan.envVarsToCheck.join(', ')}\n`;
  }

  return output;
}
