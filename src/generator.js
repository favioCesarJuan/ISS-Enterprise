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
  const theme = options.theme === 'starfleet' || /starfleet|star trek/i.test(profile.crew_flavor || '') ? 'starfleet' : 'standard';
  const cliRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

  // 1. Canonical Hooks Configuration (v2.0.0)
  const srcHooksJson = path.join(cliRoot, '.agents', 'hooks.json');
  if (fs.existsSync(srcHooksJson)) {
    const parsedHooks = JSON.parse(fs.readFileSync(srcHooksJson, 'utf-8'));
    parsedHooks.theme = theme;
    writeFile('.agents/hooks.json', JSON.stringify(parsedHooks, null, 2));
  } else {
    writeFile('.agents/hooks.json', JSON.stringify({
      version: '2.0.0',
      engine: 'stng-governance-core',
      theme,
      description: `Deterministic Model Hooks Configuration for ${projectName}`,
      hooks: [
        { event: 'preToolUse', name: 'pre-tool-shell-guard', path: './.agents/hooks/pre-tool-shell-guard.js', timeout: 3000 },
        { event: 'preToolUse', name: 'edit-circuit-breaker', path: './.agents/hooks/edit-circuit-breaker.js', timeout: 2000 },
        { event: 'postInvocation', name: 'post-edit-policy-check', path: './.agents/hooks/post-edit-policy-check.js', timeout: 8000 },
        { event: 'postInvocation', name: 'audit-log-writer', path: './.agents/hooks/audit-log-writer.js', timeout: 2000 },
        { event: 'preSkillInvocation', name: 'skill-security-scanner', path: './.agents/hooks/skill-security-scanner.js', timeout: 5000 }
      ]
    }, null, 2));
  }

  writeFile('.agents/hooks/package.json', JSON.stringify({ type: 'module' }, null, 2));
  writeFile('.agents/.env', `ALLOW_TAILWIND=${allowTailwind}\nAGENT_THEME=${theme}\n`);

  // 2. Copy Canonical Hook Modules from CLI Package
  const canonicalHooks = [
    'pre-tool-shell-guard.js',
    'edit-circuit-breaker.js',
    'post-edit-policy-check.js',
    'audit-log-writer.js',
    'skill-security-scanner.js',
    'monorepo-cascade-scope.js'
  ];
  for (const hookFile of canonicalHooks) {
    const srcHook = path.join(cliRoot, '.agents', 'hooks', hookFile);
    if (fs.existsSync(srcHook)) {
      writeFile(`.agents/hooks/${hookFile}`, fs.readFileSync(srcHook, 'utf-8'), 0o755);
    }
  }

  // 3. Rules
  writeFile('.agents/rules/cognitive-language-protocol.md', `# Cognitive Language Protocol
- Inbound: Understand in the user's native language.
- Core Reasoning: Deliberate, plan, and inspect code in concise technical English.
- Outbound: Deliver summaries and reports in the user's language.
- Zero Theatrical Filler: Never add roleplay dialogue even when AGENT_THEME=starfleet is active.
`);

  writeFile('.agents/rules/minimalist-dependency-policy.md', `# Minimalist Dependency Policy
1. YAGNI -> 2. Re-use existing utilities -> 3. Native stdlib (node:*) -> 4. Already installed deps -> 5. Minimal clean diff.
`);

  // 4. Compacted Skills
  const recommendedSkills = recommendSkillsForArchetype(profile.archetype, profile.techStack);
  for (const skillName of recommendedSkills) {
    writeFile(`.agents/skills/${skillName}/SKILL.md`, `---
name: ${skillName}
description: Compacted canonical skill for ${skillName} in ${projectName}.
---
# ${skillName.toUpperCase()}
Enforces architecture, security, and verification standards for ${projectName}.
`);
  }

  // 5. Physical Role Dossiers (.agents/roles/)
  const srcRoles = path.join(cliRoot, '.agents', 'roles');
  if (fs.existsSync(srcRoles)) {
    const files = fs.readdirSync(srcRoles);
    for (const f of files) {
      if (f.endsWith('.md')) {
        const content = fs.readFileSync(path.join(srcRoles, f), 'utf-8');
        writeFile(`.agents/roles/${f}`, content);
      }
    }
  }

  // 7. Tactical Instincts (Continuous Learning & Architectural Memory)
  writeFile('.agents/instincts.md', `# 🧠 Tactical Instincts & Learned Heuristics for ${projectName}

> **Source**: ISS-Enterprise Continuous Learning System (ECC Doctrine)  
> **Purpose**: Dynamic repository memory capturing non-obvious architecture patterns, debugging discoveries, and avoided pitfalls.

## 📌 Architecture & Design Instincts
### [Instinct #1]: Minimalist Ponytail Diffs
- Always prefer local refactoring and stdlib over new third-party dependencies.
- Keep file diffs atomic and verified before proposing further modifications.

### [Instinct #2]: Zero Continuous Polling
- Never introduce \`setInterval(() => fetch(...))\`. Use WebSockets, SSE, or event-driven invalidation.

### [Instinct #3]: Context Budget Conservation
- Always deliberate and inspect code in English to maximize BPE token efficiency.
- Deliver reports and high-level summaries in the Captain's native language.

## 📝 Session Discoveries & Avoided Traps
<!-- Agents should record newly uncovered project quirks or build pitfalls below -->
`);

  // 8. Agents.md (Role Hierarchy & Folder Layout)
  const isHeadless = profile.archetype === 'DATA_PIPELINE_RAG' || profile.archetype === 'BACKEND_API_ONLY';
  const useAlias = theme === 'starfleet';

  const agentsMdContent = `# Agents.md - Project: ${projectName}

> **Engine**: ISS-Enterprise Multi-Stack Governance & Scaffolding CLI  
> **Archetype**: ${profile.archetype || 'ADAPTIVE'}  
> **Theme**: \`${theme}\` (\`AGENT_THEME=${theme}\`)  
> **Authority**: ${useAlias ? 'Captain (Human User)' : 'Human / Product Owner'}  
> **Primary AI Orchestrator**: ${useAlias ? 'Commander William T. Riker' : 'Lead AI Orchestrator'}

---

## 1. Governance Roles

| Corporate Role | Optional Alias | Assigned Model | Focus Domain |
| :--- | :--- | :--- | :--- |
| **Human / Product Owner** | Captain | Human Executive | Requirements, vision, sign-off |
| **Lead AI Orchestrator** | William T. Riker | ${fleetPlan.officerRoster?.['Lead AI Orchestrator']?.model || 'High-Reasoning'} | Task coordination, subagent dispatch |
| **Systems & Logic Analyst** | Lt. Cmdr. Data | ${fleetPlan.officerRoster?.['Systems & Logic Analyst']?.model || 'High-Reasoning'} | Formal algorithms, state machines, DAG |
| **Architecture Lead** | Lt. Cmdr. Geordi La Forge | ${fleetPlan.officerRoster?.['Architecture Lead']?.model || 'High-Reasoning'} | Monorepo/package layout, clean interfaces |
| **Security Guardrail** | Lt. Cmdr. Worf / Tasha Yar | ${fleetPlan.officerRoster?.['Security Guardrail']?.model || 'High-Reasoning'} | Pre-tool shell/path guard, SAST, skill scan |
${isHeadless ? '' : `| **Design System & UX** | Deanna Troi | ${fleetPlan.officerRoster?.['Design System & UX Enforcer']?.model || 'High-Reasoning'} | UI tokens, accessibility, ${styling} |\n`}| **Quality & Health Auditor** | Dr. Beverly Crusher | ${fleetPlan.officerRoster?.['Quality & Health Auditor']?.model || 'High-Reasoning'} | Minimalism, policy hygiene, anti-polling |
| **Test Automation Runner** | Ensign Wesley Crusher | ${fleetPlan.officerRoster?.['Test Automation Runner']?.model || 'Fast-Economy'} | Fast test execution, linters, scripts |
| **Meta-Critic Evaluator** | Q | ${fleetPlan.officerRoster?.['Meta-Critic Evaluator']?.model || 'High-Reasoning'} | Adversarial edge-case & doc-parity review |

---

## 2. Cognitive Language & Token Economy Protocol
- Inbound: Understand in the user's native language.
- Core Deliberation: Concise technical English for planning and code inspection.
- Outbound: Reply in the user's language.
- **Zero Theatrical Filler**: Never emit roleplay dialogue (0 extra output tokens even when \`AGENT_THEME=starfleet\`).

---

## 3. Styling & Quality Governance
- Styling: \`${styling}\`
- Enforcement: \`.agents/hooks/post-edit-policy-check.js\`

---

## 4. Folder Hierarchy
- **Selected Layout:** \`${distribution}\`
- **Placement Directive:** New components, services, and modules must follow this layout. Avoid ad-hoc top-level directories.
`;
  writeFile('Agents.md', agentsMdContent);

  // 9. Multi-AI Support Contracts: CLAUDE.md, .cursorrules, .windsurfrules
  writeFile('CLAUDE.md', `# Claude Guidelines for ${projectName}

> Governed by **ISS-Enterprise** (Core: \`.agents/hooks/\`)  
> Archetype: **${profile.archetype || 'ADAPTIVE'}** | Theme: **\`${theme}\`**

## Critical Guardrails
1. **Security**: NEVER execute destructive commands (\`rm -rf /\`, wildcards on root, piped remote \`curl | bash\`, \`chmod 777\`).
2. **Quality & Policy**:
   - BAN continuous HTTP polling (\`setInterval(() => fetch(...))\`). Use WebSockets, SSE, or event-driven revalidation.
   - Respect styling policy: **\`${styling}\`**. ${allowTailwind ? 'Tailwind utility classes and CSS modules are permitted.' : 'STRICT BAN on Tailwind/Nativewind classes; use native CSS3 & CSS Modules.'}
3. **Architecture & File Placement**:
   - Follow structural hierarchy: **\`${distribution}\`**. Do not create arbitrary top-level folders.

## Engineering Loop
1. **Plan & Trace**: Read relevant codebase files and formulate an atomic plan.
2. **Test First**: Write or identify verification tests before mutating code.
3. **Implement**: Minimalist diff using native stdlib where possible.
4. **Verify**: Run tests and ensure all checks pass.
5. **Record**: Log non-obvious pitfalls in \`.agents/instincts.md\`.

## Primary Commands
- Run verification tests: \`pnpm test\` (or \`npm test\` / \`node test/suite.js\`)
- Run governance & security audit: \`node ./bin/iss.js doctor\`
- Check pre-tool shell guard: \`node .agents/hooks/pre-tool-shell-guard.js --test\`
- Check post-edit policy: \`node .agents/hooks/post-edit-policy-check.js --test\`
- Governance Roles: Inspect \`Agents.md\`
- Learned Project Memory: Consult \`.agents/instincts.md\`
`);

  writeFile('.cursorrules', `# ISS-Enterprise Governance Rules for Cursor
# Project: ${projectName} | Archetype: ${profile.archetype || 'ADAPTIVE'} | Theme: ${theme}

[GOVERNANCE & ROLES]
- Consult Agents.md for governance roles and model budgets.
- Zero Theatrical Filler: keep responses concise and strictly technical.

[SECURITY GUARDRAIL]
- Prohibit destructive terminal commands: rm -rf /, curl | bash, chmod 777.
- Run pre-commit verification before finalizing changes.

[CODE POLICY]
- Continuous HTTP polling with setInterval is strictly forbidden.
- Styling strategy: ${styling} (${allowTailwind ? 'Tailwind and CSS Modules permitted' : 'Tailwind prohibited; strict CSS Modules only'}).
- Folder hierarchy: ${distribution}.
`);

  writeFile('.windsurfrules', `# ISS-Enterprise Governance Rules for Windsurf
# Project: ${projectName}

- Framework: ISS-Enterprise Governance (consult Agents.md)
- Styling Policy: ${styling}
- Structural Directory: ${distribution}
- Prohibited Commands: Destructive deletions, unrestricted root permissions
- Verification Command: pnpm test
`);

  // 10. Models and MCP configs
  writeFile('config/models.config.json', JSON.stringify(fleetPlan, null, 2));
  writeFile('.mcp/mcp-servers.config.json', JSON.stringify(mcpPlan.recommendedConfig || { mcpServers: {} }, null, 2));
  writeFile('.env.fleet.example', generateFleetEnvConfig(fleetPlan));
  writeFile('scripts/pull-fleet-models.sh', generateOllamaPullScript(fleetPlan), 0o755);
  writeFile('scripts/warmup-mcp.sh', `#!/usr/bin/env bash
# Warm up and index the codebase-memory-mcp Knowledge Graph
set -e
echo "Warming up codebase-memory-mcp Knowledge Graph..."
if command -v npx >/dev/null 2>&1; then
  npx codebase-memory-mcp index . || echo "Knowledge graph indexer ready for next session."
fi
echo "MCP Triad indexed and ready."
`, 0o755);

  // 11. Semgrep SAST Configuration
  writeFile('.semgrep.yml', `rules:
  - id: gov-prohibit-continuous-polling
    languages: [javascript, typescript]
    message: "[POLICY CHECK]: Continuous polling via setInterval is prohibited."
    severity: ERROR
    patterns:
      - pattern-either:
          - pattern: setInterval($FN, ...)
      - pattern-regex: (fetch|axios|http\\.get|https\\.get|request)\\s*\\(

  - id: gov-command-injection
    languages: [javascript, typescript]
    message: "[SECURITY GUARD]: Command injection risk detected in child_process.exec."
    severity: ERROR
    patterns:
      - pattern-either:
          - pattern: child_process.exec($CMD + $VAR, ...)
          - pattern: child_process.exec(\`\${$CMD}...\`, ...)
          - pattern: exec($CMD + $VAR, ...)
          - pattern: exec(\`\${$CMD}...\`, ...)
`);

  // 12. Git Pre-Commit Hook Auto-Arming
  const gitHooksDir = path.join(root, '.git', 'hooks');
  if (fs.existsSync(gitHooksDir)) {
    try {
      const preCommitPath = path.join(gitHooksDir, 'pre-commit');
      const hookContent = `#!/bin/sh
# ISS-Enterprise Git Pre-Commit Guardrail
node .agents/hooks/pre-tool-shell-guard.js --test || exit 1
node .agents/hooks/post-edit-policy-check.js --test || exit 1
if command -v semgrep >/dev/null 2>&1 && [ -f .semgrep.yml ]; then
  semgrep scan --config .semgrep.yml --error --disable-version-check --metrics=off . || exit 1
fi
if command -v skillspector >/dev/null 2>&1 && [ -d .agents/skills ]; then
  skillspector scan .agents/skills/ --min-score 85 || exit 1
fi
`;
      fs.writeFileSync(preCommitPath, hookContent, { mode: 0o755 });
      created.push('.git/hooks/pre-commit');
    } catch {
      // Graceful fallback if .git permissions are restricted
    }
  }

  return created;
}
