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

/**
 * Emits full governance architecture into target project.
 * @param {string} targetDir
 * @param {object} profile Detected profile & user choices
 * @param {object} fleetPlan Fleet allocation
 * @param {object} mcpPlan MCP triad plan
 * @returns {string[]} List of generated files
 */
export function generateGovernanceArchitecture(targetDir, profile = {}, fleetPlan = {}, mcpPlan = {}) {
  const root = path.resolve(targetDir);
  const created = [];

  const writeFile = (relPath, content) => {
    const full = path.join(root, relPath);
    const parent = path.dirname(full);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.writeFileSync(full, content.trim() + '\n', 'utf-8');
    created.push(relPath);
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

  // 7. Agents.md (Tailored Crew Roster & Folder Hierarchy)
  const isHeadless = profile.archetype === 'DATA_PIPELINE_RAG' || profile.archetype === 'BACKEND_API_ONLY';

  writeFile('Agents.md', `# 📜 Agents.md - Project: ${projectName}

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
${isHeadless ? '' : `| **Deanna Troi** | Design & UX | ${fleetPlan.officerRoster?.['Counselor Deanna Troi (Design & UX)']?.model || 'High-Reasoning'} | UI tokens, accessibility, ${styling} |\\n`}
| **Beverly Crusher** | Health & Quality | ${fleetPlan.officerRoster?.['Dr. Beverly Crusher (Health & Quality)']?.model || 'High-Reasoning'} | Ponytail minimalism, compiler hygiene |
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
`);

  // 8. Models and MCP configs
  writeFile('config/models.config.json', JSON.stringify(fleetPlan, null, 2));
  writeFile('.mcp/mcp-servers.config.json', JSON.stringify(mcpPlan.recommendedConfig || {}, null, 2));

  return created;
}
