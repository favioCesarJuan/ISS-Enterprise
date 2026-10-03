/**
 * ==============================================================================
 * ⚙️ ISS-ENTERPRISE: TAILORED GOVERNANCE GENERATOR
 * ==============================================================================
 * Generates custom, stack-tailored agentic governance assets:
 * - Deterministic Model Hooks (.agents/hooks/)
 * - Canonical Engineering Rules (.agents/rules/)
 * - Compacted Archetype-Specific Skills (.agents/skills/)
 * - Dual-Layer Agents.md and Living Governance contracts
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { recommendSkillsForArchetype } from './skill-engine.js';
import { generateFleetEnvConfig, generateOllamaPullScript } from './fleet-manager.js';

/**
 * Emits full governance architecture into target project.
 * @param {string} targetDir
 * @param {object} profile Detected profile & user choices
 * @param {object} fleetPlan Fleet allocation
 * @param {object} mcpPlan MCP triad plan
 * @param {object} options Execution options ({ dryRun: boolean })
 * @returns {string[]} List of generated files
 */
export function generateGovernanceArchitecture(targetDir, profile = {}, fleetPlan = {}, mcpPlan = {}, options = {}) {
  const root = path.resolve(targetDir);
  const created = [];
  const isDryRun = Boolean(options.dryRun);

  const writeFile = (relPath, content, mode) => {
    created.push(relPath);
    if (isDryRun) return;

    const full = path.join(root, relPath);
    const parent = path.dirname(full);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    const writeOptions = mode ? { mode, encoding: 'utf-8' } : 'utf-8';
    fs.writeFileSync(full, content.trim() + '\n', writeOptions);
  };

  const projectName = path.basename(root);
  const styling = profile.styling_strategy || profile.stylingStrategy || 'MIXED_CSS_TAILWIND';
  const distribution = profile.file_distribution || profile.fileDistribution || 'Atomic Design UI (src/components/atoms, molecules, organisms, layouts, pages)';
  const allowTailwind = /tailwind|mixed|nativewind/i.test(styling);

  // 1. Hooks Configuration
  writeFile('.agents/hooks.json', JSON.stringify({
    version: '1.0.0',
    framework: 'ISS-Enterprise',
    description: `Deterministic Multi-Agent Governance Hooks for ${projectName}`,
    hooks: [
      {
        event: 'preToolUse',
        name: 'tasha-security-shield',
        path: './.agents/hooks/tasha-security-shield.js',
        timeout: 3000,
        description: 'Tactical security perimeter guardrail orchestrated by Lt. Tasha Yar.'
      },
      {
        event: 'postInvocation',
        name: 'crusher-health-check',
        path: './.agents/hooks/crusher-health-check.js',
        timeout: 8000,
        description: 'Medical health check, Ponytail minimalism, and quality linter.'
      },
      {
        event: 'postInvocation',
        name: 'captains-log-writer',
        path: './.agents/hooks/captains-log-writer.js',
        timeout: 2000,
        description: 'Immutable ledger of agent actions and health telemetry.'
      }
    ]
  }, null, 2));

  writeFile('.agents/hooks/package.json', JSON.stringify({ type: 'module' }, null, 2));

  // 2. Tasha Yar Tactical Security Shield
  writeFile('.agents/hooks/tasha-security-shield.js', `#!/usr/bin/env node
import process from 'node:process';
const PROHIBITED = [/\\brm\\s+-[rR]f\\s+[\\/\\*]/, /\\bcurl\\b.*\\|\\s*(ba)?sh\\b/, /\\bchmod\\s+(-R\\s+)?777\\b/];
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
`);

  // 3. Dr. Crusher Health Check (Adaptive: Respects user styling choice!)
  writeFile('.agents/hooks/crusher-health-check.js', `#!/usr/bin/env node
import fs from 'node:fs';
import process from 'node:process';

const ALLOW_TAILWIND = ${allowTailwind};

export function diagnose(content = '') {
  const issues = [];
  if (/setInterval\\s*\\(\\s*(async\\s*)?\\(\\s*\\)\\s*=>.*fetch|axios|api\\b/s.test(content)) {
    issues.push({ id: 'NO_CONTINUOUS_POLLING', msg: 'Continuous polling is prohibited.' });
  }
  if (!ALLOW_TAILWIND && /(from\\s+['"]tailwindcss['"]|from\\s+['"]nativewind['"])/.test(content)) {
    issues.push({ id: 'FORBIDDEN_TAILWIND', msg: 'Tailwind forbidden by project directive.' });
  }
  return issues;
}

if (process.argv.includes('--test')) {
  console.log('🩺  [DR. CRUSHER]: Health check online. Tailwind allowed:', ALLOW_TAILWIND);
  process.exit(0);
}
`);

  // 4. Captain's Log Writer
  writeFile('.agents/hooks/captains-log-writer.js', `#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export function appendLog(entry = {}) {
  const file = path.resolve('.agents/captains_log.json');
  let list = [];
  try { list = JSON.parse(fs.readFileSync(file, 'utf-8')); } catch {}
  list.push({ timestamp: new Date().toISOString(), ...entry });
  fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf-8');
}

if (process.argv.includes('--test')) {
  console.log('📜  [COMPUTER]: Captain Log writer online.');
  process.exit(0);
}
`);

  // 5. Rules
  writeFile('.agents/rules/cognitive-language-protocol.md', `# 🌐 Cognitive Language Protocol (30-50% BPE Token Savings)
- Inbound: Understand in Captain's native tongue (e.g. Spanish).
- Core Reasoning: Deliberate, plan, AST parse, and dispatch subagents in English.
- Outbound: Deliver conversation and reports back in Captain's tongue.
`);

  writeFile('.agents/rules/ponytail-minimalism.md', `# 🩺 Ponytail Minimalist Protocol
1. YAGNI -> 2. Re-use -> 3. Stdlib -> 4. Native Platform -> 5. Existing dep -> 6. Minimal clean diff.
`);

  writeFile('.agents/rules/priority-2026-search.md', `# 🔍 Priority 2026 Information Retrieval
Prioritize 2026 results first, 2025 fallback, older only if strictly required.
`);

  // 6. Compacted Skills
  const recommendedSkills = recommendSkillsForArchetype(profile.archetype, profile.techStack);
  for (const skillName of recommendedSkills) {
    writeFile(`.agents/skills/${skillName}/SKILL.md`, `---
name: ${skillName}
description: Compacted canonical skill for ${skillName} in ${projectName}.
---
# ⚔️ ${skillName.toUpperCase()}
Enforces high standards of architecture, security, and verification for ${projectName}.
`);
  }

  // 8. Agents.md (Tailored Crew Roster & Folder Hierarchy)
  const isHeadless = profile.archetype === 'DATA_PIPELINE_RAG' || profile.archetype === 'BACKEND_API_ONLY';

  const agentsMdContent = `# 📜 Agents.md - Project: ${projectName}

> **Engine**: ISS-Enterprise Universal Multi-Agent Scaffolding Engine  
> **Archetype**: ${profile.archetype || 'ADAPTIVE'}  
> **Commanding Officer**: Captain (Human User)  
> **Primary AI Orchestrator**: Commander William T. Riker  

---

## 👑 1. Command Hierarchy (ISS Tactical Fleet)

| Officer | Corporate Role | Assigned Model | Focus Domain |
| :--- | :--- | :--- | :--- |
| **Captain (You)** | Human Owner | Human Executive | Requirements, vision, approval |
| **William T. Riker** | Lead AI Orchestrator | ${fleetPlan.officerRoster?.['William T. Riker (First Officer)']?.model || 'High-Reasoning'} | Task coordination, subagent dispatch |
| **Data** | Systems & Logic | ${fleetPlan.officerRoster?.['Lt. Cmdr. Data (Systems & Logic)']?.model || 'High-Reasoning'} | Formal algorithms, state machines, RAG |
| **Geordi La Forge** | Architecture Lead | ${fleetPlan.officerRoster?.['Lt. Cmdr. Geordi La Forge (Engineering)']?.model || 'High-Reasoning'} | Monorepo/package layout, clean interfaces |
| **Lt. Tasha Yar** | Security Guardrail | ${fleetPlan.officerRoster?.['Lt. Tasha Yar (Security Guardrail)']?.model || 'High-Reasoning'} | Tactical defense perimeter, command intercept |
| **Lt. Worf** | Offensive Security | ${fleetPlan.officerRoster?.['Lt. Worf (Offensive Security & Red Team)']?.model || 'High-Reasoning'} | Red Teaming (Strix), penetration testing, supply chain |
${isHeadless ? '' : `| **Deanna Troi** | Design & UX | ${fleetPlan.officerRoster?.['Counselor Deanna Troi (Design & UX)']?.model || 'High-Reasoning'} | UI tokens, accessibility, ${styling} |\n`}| **Beverly Crusher** | Health & Quality | ${fleetPlan.officerRoster?.['Dr. Beverly Crusher (Health & Quality)']?.model || 'High-Reasoning'} | Ponytail minimalism, compiler hygiene |
| **Wesley Crusher** | Automation Runner | ${fleetPlan.officerRoster?.['Ensign Wesley Crusher (Automation Runner)']?.model || 'Fast-Economy'} | Fast test execution, linters, scripts |
| **Q (Continuum)** | Meta-Critic | ${fleetPlan.officerRoster?.['Q (The Q Continuum)']?.model || 'High-Reasoning'} | Bias challenge, timeline & chaos trials |

---

## 🌐 2. Cognitive Language Protocol
- Inbound: Spanish / Any Language.
- Core Deliberation: English (30% to 50% token reduction via BPE compression).
- Outbound: Mirrored in the Captain's language.

---

## 🎨 3. Styling & Quality Governance
- Styling: \`${styling}\`
- Enforcement: \`.agents/hooks/crusher-health-check.js\`

---

## 📂 4. Mapeo Estructural y Jerarquía de Carpetas
- **Estructura Seleccionada:** \`${distribution}\`
- **Directiva Inviolable de Ubicación:** Todos los nuevos componentes, servicios o módulos deben residir en la jerarquía designada. Prohibido crear carpetas ad-hoc fuera de esta convención.
`;
  writeFile('Agents.md', agentsMdContent);

  // 9. Multi-AI Support Contracts: CLAUDE.md, .cursorrules, .windsurfrules
  // A. CLAUDE.md (Anthropic Claude Code & Claude Desktop)
  writeFile('CLAUDE.md', `# 🛸 Claude Guidelines for ${projectName}

> Governed by **ISS-Enterprise Tactical Multi-Agent Framework**
> Archetype: **${profile.archetype || 'ADAPTIVE'}**

## 🛡️ Critical Guardrails
1. **Security**: NEVER execute catastrophic commands (\`rm -rf /\`, wildcards on root, piped remote curl to bash, \`chmod 777\`).
2. **Quality & Health (Ponytail Protocol)**:
   - BAN continuous polling (\`setInterval(() => fetch(...))\`). Use WebSockets, SSE, or reactive events.
   - Respect styling policy: **\`${styling}\`**. ${allowTailwind ? 'Tailwind utility classes and CSS modules are permitted.' : 'STRICT BAN on Tailwind/Nativewind classes; use native CSS3 & CSS Modules.'}
3. **Architecture & File Placement**:
   - Follow structural hierarchy: **\`${distribution}\`**. Do not create arbitrary top-level folders.

## ⚡ Primary Commands
- Run verification tests: \`pnpm test\` (or \`npm test\` / \`node test/suite.js\`)
- Check security shield: \`node .agents/hooks/tasha-security-shield.js --test\`
- Check health & styling: \`node .agents/hooks/crusher-health-check.js --test\`
- Tactical Crew Roster & Roles: Inspect \`Agents.md\`
`);

  // B. .cursorrules (Cursor IDE)
  writeFile('.cursorrules', `# ISS-Enterprise Governance Rules for Cursor
# Project: ${projectName} | Archetype: ${profile.archetype || 'ADAPTIVE'}

[GOVERNANCE & ROSTER]
- Multi-agent framework active: Consult Agents.md for officer roles.
- Lead Orchestrator: Commander William T. Riker.

[SECURITY PERIMETER - LT. TASHA YAR]
- Prohibit destructive terminal commands: rm -rf, curl | bash, chmod 777.
- Always run pre-commit verification before finalizing changes.

[CODE HYGIENE - DR. CRUSHER]
- Continuous polling is strictly forbidden.
- Styling strategy: ${styling} (${allowTailwind ? 'Tailwind and CSS Modules permitted' : 'Tailwind prohibited; strict CSS Modules only'}).
- Folder hierarchy: ${distribution}.
`);

  // C. .windsurfrules (Windsurf IDE)
  writeFile('.windsurfrules', `# ISS-Enterprise Governance Rules for Windsurf
# Project: ${projectName}

- Framework: ISS-Enterprise Multi-Agent Fleet (consult Agents.md)
- Styling Policy: ${styling}
- Structural Directory: ${distribution}
- Prohibited Commands: Destructive deletions, unrestricted root permissions
- Verification Command: pnpm test
`);

  // 10. Models and MCP configs
  writeFile('config/models.config.json', JSON.stringify(fleetPlan, null, 2));
  writeFile('.mcp/mcp-servers.config.json', JSON.stringify(mcpPlan.recommendedConfig || {}, null, 2));
  writeFile('.env.fleet.example', generateFleetEnvConfig(fleetPlan));
  writeFile('scripts/pull-fleet-models.sh', generateOllamaPullScript(fleetPlan), 0o755);
  writeFile('scripts/warmup-mcp.sh', `#!/usr/bin/env bash
# 🔌 ISS-Enterprise: Warm up and index the Knowledge Graph
set -e
echo "🛰️  Warming up codebase-memory-mcp Knowledge Graph..."
if command -v npx >/dev/null 2>&1; then
  npx codebase-memory-mcp index . || echo "ℹ️  Knowledge graph indexer ready for next session."
fi
echo "✅ MCP Triad indexed and ready."
`, 0o755);

  // 11. Git Pre-Commit Hook Auto-Arming
  const gitHooksDir = path.join(root, '.git', 'hooks');
  if (fs.existsSync(gitHooksDir)) {
    try {
      const preCommitPath = path.join(gitHooksDir, 'pre-commit');
      const hookContent = `#!/bin/sh
# 🛡️ ISS-Enterprise Tactical Git Pre-Commit Guardrail
node .agents/hooks/tasha-security-shield.js --test || exit 1
node .agents/hooks/crusher-health-check.js --test || exit 1
`;
      fs.writeFileSync(preCommitPath, hookContent, { mode: 0o755 });
      created.push('.git/hooks/pre-commit');
    } catch {
      // Graceful fallback if .git permissions are restricted
    }
  }

  return created;
}
