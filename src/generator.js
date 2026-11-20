/**
 * ==============================================================================
 * ⚙️ ISS-ENTERPRISE: TAILORED GOVERNANCE GENERATOR
 * ==============================================================================
 * Generates custom, stack-tailored agentic governance assets from project
 * inspection and user context/domain interviews:
 * - Structured Context Memory (.agents/project-context.json)
 * - Selective Deterministic Model Hooks (.agents/hooks/)
 * - Canonical Rules & Skills (.agents/rules/, .agents/skills/)
 * - Multi-language Semgrep SAST (.semgrep.yml) & Staged Git Pre-Commit
 * - Multi-AI Contracts (Agents.md, CLAUDE.md, .cursorrules, .windsurfrules)
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { recommendSkillsForArchetype } from './skill-engine.js';
import { generateFleetEnvConfig, generateOllamaPullScript } from './fleet-manager.js';
import { resolveRigidityLevel, inferVerificationCommands } from './advisor.js';
import { createSpecTemplate } from './spec-checker.js';

/**
 * @param {string} root
 * @returns {Partial<import('../types/index.d.ts').ProjectContext> | null}
 */
function readExistingContext(root) {
  const ctxPath = path.join(root, '.agents', 'project-context.json');
  if (!fs.existsSync(ctxPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(ctxPath, 'utf-8'));
  } catch {
    return null; /* fallback: corrupted context file treated as absent */
  }
}

/**
 * @param {Partial<import('../types/index.d.ts').AdvisorAnswers> | import('../types/index.d.ts').ProjectProfile} [profile]
 * @returns {Record<string, import('../types/index.d.ts').CustomInvestigation>}
 */
function collectCustomInvestigations(profile = {}) {
  /** @type {Record<string, import('../types/index.d.ts').CustomInvestigation>} */
  const investigations = {};
  for (const [key, val] of Object.entries(profile)) {
    if (key.endsWith('_investigation') && val && typeof val === 'object') {
      investigations[key.replace(/_investigation$/, '')] = /** @type {import('../types/index.d.ts').CustomInvestigation} */ (val);
    }
  }
  return investigations;
}

/**
 * @param {string} root
 * @param {Partial<import('../types/index.d.ts').AdvisorAnswers> | import('../types/index.d.ts').ProjectProfile} [profile]
 * @param {import('../types/index.d.ts').GenerateOptions} [options]
 * @returns {import('../types/index.d.ts').ProjectContext}
 */
function resolveProjectContext(root, profile = {}, options = {}) {
  const projectName = path.basename(root);
  const existing = readExistingContext(root);
  const p = /** @type {Partial<import('../types/index.d.ts').AdvisorAnswers>} */ (profile);
  const styling = p.styling_strategy || p.stylingStrategy || 'MIXED_CSS_TAILWIND';
  const distribution = p.file_distribution || p.fileDistribution || 'Modular Clean Layout';
  const allowTailwind = /tailwind|mixed|nativewind/i.test(styling);
  const optTheme = String(options.theme || '').toLowerCase();
  const flavor = String(p.crew_flavor || '').toLowerCase();
  /** @type {import('../types/index.d.ts').ThemeMode} */
  let theme = 'standard';
  if (optTheme === 'local' || /local|privado/i.test(flavor)) theme = 'local';
  else if (optTheme === 'naval' || /naval|marit/i.test(flavor)) theme = 'naval';
  const rigidity = resolveRigidityLevel(p.shield_rigidity || options.rigidity);
  const commands = inferVerificationCommands(p, p);
  const isMonorepo = p.archetype === 'FULLSTACK_MONOREPO' || Boolean(p.techStack?.hasTurbo || p.techStack?.hasPnpmWorkspace) || /monorepo/i.test(distribution);
  const isHeadless = p.archetype === 'DATA_PIPELINE_RAG' || p.archetype === 'BACKEND_API_ONLY' || p.archetype === 'SYSTEM_CLI_RUST_GO' || /headless|sin estilos/i.test(styling);

  let interviewCompleted = Boolean(options.interviewCompleted ?? p.interviewCompleted ?? false);
  let domain = p.project_domain || p.domain || 'General Software';
  let summary = p.project_summary || p.summary || 'Modular application focused on maintainability and KISS simplicity.';
  let invariants = p.domain_invariants || p.invariants || 'KISS simplicity, explicit recoverable failure handling, minimal dependencies.';
  let nonGoals = p.project_non_goals || p.nonGoals || 'Avoid speculative abstractions outside core scope.';
  let architecturePattern = p.architecture_pattern || p.architecturePattern || 'Hexagonal / Modular Clean';

  if (existing?.interviewCompleted && !interviewCompleted && !options.force) {
    interviewCompleted = true;
    domain = existing.domain || domain;
    summary = existing.summary || summary;
    invariants = existing.invariants || invariants;
    nonGoals = existing.nonGoals || nonGoals;
    architecturePattern = existing.architecturePattern || architecturePattern;
  }

  return {
    projectName,
    archetype: p.archetype || 'ADAPTIVE',
    lifecycle: p.project_lifecycle || existing?.lifecycle || 'Active',
    styling,
    distribution,
    allowTailwind,
    theme,
    rigidity,
    commands,
    isMonorepo,
    isHeadless,
    interviewCompleted,
    domain,
    summary,
    invariants,
    nonGoals,
    architecturePattern,
    codingStyles: p.coding_styles || commands.lintCommand,
    customInvestigations: collectCustomInvestigations(p)
  };
}

function buildSemgrepYaml(language = 'javascript') {
  if (language === 'python') {
    return `rules:
  - id: gov-python-shell-injection
    languages: [python]
    message: "[SECURITY GUARD]: Avoid shell=True or os.system with dynamic commands."
    severity: ERROR
    patterns:
      - pattern-either:
          - pattern: os.system(...)
          - pattern: subprocess.run(..., shell=True, ...)
          - pattern: subprocess.Popen(..., shell=True, ...)

  - id: gov-python-eval
    languages: [python]
    message: "[SECURITY GUARD]: Dynamic eval/exec execution is prohibited."
    severity: ERROR
    patterns:
      - pattern-either:
          - pattern: eval(...)
          - pattern: exec(...)
`;
  }

  if (language === 'go') {
    return `rules:
  - id: gov-go-shell-exec
    languages: [go]
    message: "[SECURITY GUARD]: Avoid invoking shell wrappers (sh -c) via exec.Command."
    severity: ERROR
    pattern: exec.Command("sh", "-c", ...)
`;
  }

  if (language === 'rust') {
    return `rules:
  - id: gov-rust-shell-exec
    languages: [rust]
    message: "[SECURITY GUARD]: Audit Command::new(sh) invocations to prevent shell injection."
    severity: WARNING
    pattern: Command::new("sh")
`;
  }

  return `rules:
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
`;
}

function buildPreCommitHookContent() {
  return `#!/bin/sh
# ISS-Enterprise Git Pre-Commit Guardrail
node .agents/hooks/pre-tool-shell-guard.js --test || exit 1
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null)
if [ -n "$STAGED_FILES" ]; then
  node .agents/hooks/post-edit-policy-check.js $STAGED_FILES || exit 1
else
  node .agents/hooks/post-edit-policy-check.js --test || exit 1
fi
if command -v semgrep >/dev/null 2>&1 && [ -f .semgrep.yml ]; then
  semgrep scan --config .semgrep.yml --error --disable-version-check --metrics=off . || exit 1
fi
if command -v skillspector >/dev/null 2>&1 && [ -d .agents/skills ]; then
  skillspector scan .agents/skills/ --min-score 85 || exit 1
fi
`;
}

/**
 * @param {import('../types/index.d.ts').ProjectContext} ctx
 * @param {Partial<import('../types/index.d.ts').FleetConfig>} fleetPlan
 */
function buildAgentsMarkdown(ctx, fleetPlan) {
  const useNavalAlias = ctx.theme === 'naval';
  const metaCritic = fleetPlan.officerRoster?.['Meta-Critic Evaluator'];
  const metaCriticModelLabel = metaCritic
    ? `${metaCritic.model || 'High-Reasoning'}${metaCritic.crossModel ? ' [cross-model]' : ''}`
    : 'High-Reasoning';

  const customTips = Object.entries(ctx.customInvestigations)
    .map(([cat, inv]) => `- **${cat}**: ${inv.recommendation} (${JSON.stringify(inv.config || {})})`)
    .join('\n');

  const localNote = ctx.theme === 'local'
    ? `\n> **Local Override**: Runtime hook labels and zones are resolved dynamically from an untracked local theme file (\`AGENT_THEME=local\`; private strings are never written into committed repo files).`
    : '';

  return `# Agents.md - Project: ${ctx.projectName}

> **Engine**: ISS-Enterprise Multi-Stack Governance & Scaffolding CLI  
> **Archetype**: ${ctx.archetype}  
> **Theme**: \`${ctx.theme}\` (\`AGENT_THEME=${ctx.theme}\`)  
> **Authority**: ${useNavalAlias ? 'Captain (Human User)' : 'Human / Product Owner'}  
> **Primary AI Orchestrator**: ${useNavalAlias ? 'First Officer' : 'Lead AI Orchestrator'}${localNote}

---

## 0. Project Context & Domain Invariants
- **Summary**: ${ctx.summary}
- **Domain**: ${ctx.domain}
- **Lifecycle**: ${ctx.lifecycle}
- **Architecture Pattern**: ${ctx.architecturePattern}
- **Critical Invariants**: ${ctx.invariants}
- **Explicit Non-Goals**: ${ctx.nonGoals}
- **Shield Rigidity**: \`${ctx.rigidity}\`
- **Verification Commands**: test=\`${ctx.commands.testCommand}\` | lint=\`${ctx.commands.lintCommand}\` | build=\`${ctx.commands.buildCommand}\`
${customTips ? `\n### Custom Technology Guidance\n${customTips}\n` : ''}
---

## 1. Governance Roles (Bridge & Lower Deck)

| Corporate Role | Naval Alias | Deck | Assigned Model | Focus Domain |
| :--- | :--- | :--- | :--- | :--- |
| **Human / Product Owner** | Captain | Bridge | Human Executive | Requirements, vision, sign-off |
| **Lead AI Orchestrator** | First Officer | Bridge | ${fleetPlan.officerRoster?.['Lead AI Orchestrator']?.model || 'High-Reasoning'} | Task coordination, subagent dispatch |
| **Systems & Logic Analyst** | Science & Logic Officer | Bridge | ${fleetPlan.officerRoster?.['Systems & Logic Analyst']?.model || 'High-Reasoning'} | Formal algorithms, state machines, DAG |
| **Architecture Lead** | Chief Engineer | Bridge | ${fleetPlan.officerRoster?.['Architecture Lead']?.model || 'High-Reasoning'} | Module boundaries, clean interfaces |
| **Security Guardrail** | Security Officer | Bridge | ${fleetPlan.officerRoster?.['Security Guardrail']?.model || 'High-Reasoning'} | Pre-tool shell/path guard, SAST, skill scan |
${ctx.isHeadless ? '' : `| **Design System & UX** | UX & Comms Officer | Bridge | ${fleetPlan.officerRoster?.['Design System & UX Enforcer']?.model || 'High-Reasoning'} | UI tokens, accessibility, ${ctx.styling} |\n`}| **Quality & Health Auditor** | Chief Medical Officer | Bridge | ${fleetPlan.officerRoster?.['Quality & Health Auditor']?.model || 'High-Reasoning'} | KISS, YAGNI, DRY, SOLID, policy hygiene, anti-polling |
| **Test Automation Runner** | Lower-Deck Runner | Lower Deck | ${fleetPlan.officerRoster?.['Test Automation Runner']?.model || 'Fast-Economy'} | Stateless tests & simulations in Sim Deck |
| **Meta-Critic Evaluator** | Lower-Deck Evaluator | Lower Deck | ${metaCriticModelLabel} | Zero-context 3-gate Cold Review (Paraphraser, Critic, Verifier) |

---

## 2. Cognitive Language, Simulation & Token Economy Protocol
- Inbound: Understand in the user's native language.
- Core Deliberation: Concise technical English for planning and code inspection.
- Outbound: Reply in the user's language.
- Simulations & Dry-Runs: Run isolated simulations, dry-runs, and automated tests inside \`Simulation Sandbox / Sim Deck\` contexts (\`.agents/hooks/theme-loader.js\`).
- **Zero Theatrical Filler**: Never emit roleplay dialogue (0 extra output tokens even when \`AGENT_THEME=naval\` or \`AGENT_THEME=local\`).

---

## 3. Styling & Quality Governance
- Styling: \`${ctx.styling}\`
- Enforcement: \`.agents/hooks/post-edit-policy-check.js\`

---

## 4. Folder Hierarchy
- **Selected Layout:** \`${ctx.distribution}\`
- **Placement Directive:** New components, services, and modules must follow this layout. Avoid ad-hoc top-level directories.
`;
}

/** @param {import('../types/index.d.ts').ProjectContext} ctx */
function buildClaudeMarkdown(ctx) {
  const discoveryGate = ctx.interviewCompleted
    ? ''
    : `\n## AI Discovery Gate\nProject context has not yet been confirmed interactively (\`interviewCompleted: false\`). Before writing Vital Logic specs or domain code, ask the user 4-5 concise questions to confirm: (1) product goal & target user, (2) critical domain invariants, (3) explicit non-goals, and (4) real test/lint commands, then update \`.agents/project-context.json\`.\n`;

  return `# Claude Guidelines for ${ctx.projectName}

> Governed by **ISS-Enterprise** (Core: \`.agents/hooks/\`)  
> Archetype: **${ctx.archetype}** | Domain: **${ctx.domain}** | Theme: **\`${ctx.theme}\`**

## Project Context & Domain
- **Summary**: ${ctx.summary}
- **Architecture Pattern**: ${ctx.architecturePattern}
- **Critical Invariants**: ${ctx.invariants}
- **Explicit Non-Goals**: ${ctx.nonGoals}
- **Shield Rigidity**: \`${ctx.rigidity}\`
${discoveryGate}
## Critical Guardrails
1. **Security**: NEVER execute destructive commands (recursive root deletion, wildcards on root, piped remote shell scripts, or world-writable permissions).
2. **Quality & Policy**:
   - Enforce **KISS** (small cohesive modules, intent-revealing names, no premature abstractions, explicit recoverable failure handling).
   - BAN continuous HTTP polling (\`setInterval(() => fetch(...))\`). Use WebSockets, SSE, or event-driven revalidation.
   - Respect styling policy: **\`${ctx.styling}\`**. ${ctx.allowTailwind ? 'Tailwind utility classes and CSS modules are permitted.' : 'STRICT BAN on Tailwind/Nativewind classes; use native CSS3 & CSS Modules.'}
3. **Architecture & File Placement**:
   - Follow structural hierarchy: **\`${ctx.distribution}\`**. Do not create arbitrary top-level folders.

## Engineering Loop
1. **Plan & Trace**: Read relevant codebase files and formulate an atomic plan.
2. **Cold Review (Vital Logic)**: Draft spec (\`iss spec new <slug>\`) and run stateless Zero-Context Cold Review (\`Meta-Critic Evaluator\`) before coding.
3. **Test First**: Write or identify verification tests before mutating code.
4. **Implement**: Minimalist diff using native stdlib where possible.
5. **Verify**: Run tests and ensure all checks pass.
6. **Record**: Log non-obvious pitfalls in \`.agents/instincts.md\`.

## Primary Commands
- Run verification tests: \`${ctx.commands.testCommand}\`
- Run linter / static check: \`${ctx.commands.lintCommand}\`
- Run governance & security audit: \`node ./bin/iss.js doctor\`
- Check SDD spec drift: \`node ./bin/iss.js spec check\`
- Check pre-tool shell guard: \`node .agents/hooks/pre-tool-shell-guard.js --test\`
- Check post-edit policy: \`node .agents/hooks/post-edit-policy-check.js --test\`
- Governance Roles: Inspect \`Agents.md\`
- Learned Project Memory: Consult \`.agents/instincts.md\`
`;
}

/** @typedef {(relPath: string, content: string, mode?: number) => void} WriteFileFn */

/** @param {WriteFileFn} writeFile @param {string} cliRoot @param {import('../types/index.d.ts').ProjectContext} ctx */
function emitHooksAndRules(writeFile, cliRoot, ctx) {
  const srcHooksJson = path.join(cliRoot, '.agents', 'hooks.json');
  if (fs.existsSync(srcHooksJson)) {
    const parsedHooks = JSON.parse(fs.readFileSync(srcHooksJson, 'utf-8'));
    parsedHooks.theme = ctx.theme;
    writeFile('.agents/hooks.json', JSON.stringify(parsedHooks, null, 2));
  } else {
    writeFile('.agents/hooks.json', JSON.stringify({
      version: '2.0.0',
      engine: 'stng-governance-core',
      theme: ctx.theme,
      description: `Deterministic Model Hooks Configuration for ${ctx.projectName}`,
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
  writeFile('.agents/.env', `ALLOW_TAILWIND=${ctx.allowTailwind}\nAGENT_THEME=${ctx.theme}\nSHIELD_RIGIDITY=${ctx.rigidity}\n`);

  const canonicalHooks = [
    'theme-loader.js',
    'pre-tool-shell-guard.js',
    'edit-circuit-breaker.js',
    'post-edit-policy-check.js',
    'audit-log-writer.js',
    'skill-security-scanner.js'
  ];
  if (ctx.isMonorepo) {
    canonicalHooks.push('monorepo-cascade-scope.js');
  }
  for (const hookFile of canonicalHooks) {
    const srcHook = path.join(cliRoot, '.agents', 'hooks', hookFile);
    if (fs.existsSync(srcHook)) {
      writeFile(`.agents/hooks/${hookFile}`, fs.readFileSync(srcHook, 'utf-8'), 0o755);
    }
  }

  writeFile('.agents/rules/cognitive-language-protocol.md', `# Cognitive Language Protocol
- Inbound: Understand in the user's native language.
- Core Reasoning: Deliberate, plan, and inspect code in concise technical English.
- Outbound: Deliver summaries and reports in the user's language.
- Zero Theatrical Filler: Never add roleplay dialogue even when AGENT_THEME=naval or AGENT_THEME=local is active.
`);

  writeFile('.agents/rules/minimalist-dependency-policy.md', `# Minimalist Dependency & KISS Policy
1. Clarify & KISS (remove non-value complexity, explicit failure paths) -> 2. YAGNI -> 3. DRY / Re-use existing utilities -> 4. Native stdlib (node:*) -> 5. Already installed deps -> 6. SOLID small modules & minimal clean diff.
`);

  const srcKissRule = path.join(cliRoot, '.agents', 'rules', 'kiss-simplicity-protocol.md');
  const kissRuleContent = fs.existsSync(srcKissRule)
    ? fs.readFileSync(srcKissRule, 'utf-8')
    : `# KISS Simplicity Protocol\n- Clarify problem, non-goals, invariants, and verification before coding.\n- Separate responsibilities into small modules; avoid premature abstractions.\n- Handle expected failure paths clearly and recoverably.`;
  writeFile('.agents/rules/kiss-simplicity-protocol.md', kissRuleContent);
}

/** @param {WriteFileFn} writeFile @param {string} srcSkillDir @param {string} skillName @param {string} projectName */
function copySkillWithReferences(writeFile, srcSkillDir, skillName, projectName) {
  const srcSkillMd = path.join(srcSkillDir, 'SKILL.md');
  if (!fs.existsSync(srcSkillMd)) {
    writeFile(`.agents/skills/${skillName}/SKILL.md`, `---
name: ${skillName}
description: Compacted canonical skill for ${skillName} in ${projectName}.
---
# ${skillName.toUpperCase()}
Enforces architecture, security, and verification standards for ${projectName}.
`);
    return;
  }

  writeFile(`.agents/skills/${skillName}/SKILL.md`, fs.readFileSync(srcSkillMd, 'utf-8'));
  const srcRefsDir = path.join(srcSkillDir, 'references');
  if (!fs.existsSync(srcRefsDir) || !fs.statSync(srcRefsDir).isDirectory()) return;

  for (const refFile of fs.readdirSync(srcRefsDir)) {
    if (!refFile.endsWith('.md')) continue;
    writeFile(
      `.agents/skills/${skillName}/references/${refFile}`,
      fs.readFileSync(path.join(srcRefsDir, refFile), 'utf-8')
    );
  }
}

/** @param {{ writeFile: WriteFileFn, cliRoot: string, root: string, ctx: import('../types/index.d.ts').ProjectContext, profile: Partial<import('../types/index.d.ts').AdvisorAnswers> | import('../types/index.d.ts').ProjectProfile, options: import('../types/index.d.ts').GenerateOptions }} params */
function emitSkillsAndRoles({ writeFile, cliRoot, root, ctx, profile, options }) {
  const recommendedSkills = recommendSkillsForArchetype(profile.archetype || 'ADAPTIVE', profile.techStack);
  for (const skillName of recommendedSkills) {
    copySkillWithReferences(writeFile, path.join(cliRoot, '.agents', 'skills', skillName), skillName, ctx.projectName);
  }

  const srcRoles = path.join(cliRoot, '.agents', 'roles');
  if (fs.existsSync(srcRoles)) {
    for (const file of fs.readdirSync(srcRoles)) {
      if (!file.endsWith('.md')) continue;
      if (ctx.isHeadless && file === 'ux-design-enforcer.md') continue;
      writeFile(`.agents/roles/${file}`, fs.readFileSync(path.join(srcRoles, file), 'utf-8'));
    }
  }

  const instinctsDest = path.join(root, '.agents', 'instincts.md');
  if (options.dryRun || options.force || !fs.existsSync(instinctsDest)) {
    writeFile('.agents/instincts.md', `# 🧠 Tactical Instincts & Learned Heuristics for ${ctx.projectName}

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
- Deliver reports and high-level summaries in the user's native language.

## 📝 Session Discoveries & Avoided Traps
<!-- Agents should record newly uncovered project quirks or build pitfalls below -->
`);
  }
}

/**
 * Emits full governance architecture into target project.
 * @param {string} targetDir
 * @param {Partial<import('../types/index.d.ts').AdvisorAnswers> | import('../types/index.d.ts').ProjectProfile} [profile] Detected profile & user choices
 * @param {Partial<import('../types/index.d.ts').FleetConfig>} [fleetPlan] Fleet allocation
 * @param {Partial<import('../types/index.d.ts').McpPlan>} [mcpPlan] MCP triad plan
 * @param {import('../types/index.d.ts').GenerateOptions} [options] Execution options
 * @returns {string[]} List of generated files
 */
export function generateGovernanceArchitecture(targetDir, profile = {}, fleetPlan = {}, mcpPlan = {}, options = {}) {
  const root = path.resolve(targetDir);
  /** @type {string[]} */
  const created = [];
  const isDryRun = Boolean(options.dryRun);

  /** @type {WriteFileFn} */
  const writeFile = (relPath, content, mode) => {
    created.push(relPath);
    if (isDryRun) return;

    const full = path.join(root, relPath);
    const parent = path.dirname(full);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.writeFileSync(full, content.trim() + '\n', mode ? { mode, encoding: 'utf-8' } : 'utf-8');
  };

  const cliRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
  const ctx = resolveProjectContext(root, profile, options);

  // 1. Project Context Memory (.agents/project-context.json)
  writeFile('.agents/project-context.json', JSON.stringify({
    version: '2.0.0',
    projectName: ctx.projectName,
    generatedAt: new Date().toISOString(),
    interviewCompleted: ctx.interviewCompleted,
    lifecycle: ctx.lifecycle,
    archetype: ctx.archetype,
    domain: ctx.domain,
    summary: ctx.summary,
    invariants: ctx.invariants,
    nonGoals: ctx.nonGoals,
    architecturePattern: ctx.architecturePattern,
    fileDistribution: ctx.distribution,
    stylingStrategy: ctx.styling,
    codingStyles: ctx.codingStyles,
    verificationCommands: ctx.commands,
    shieldRigidity: ctx.rigidity,
    theme: ctx.theme,
    customInvestigations: ctx.customInvestigations
  }, null, 2));

  // 2. Hooks, .env, Rules, Skills, Roles & Instincts
  emitHooksAndRules(writeFile, cliRoot, ctx);
  emitSkillsAndRoles({ writeFile, cliRoot, root, ctx, profile, options });

  // 3. Multi-AI Contracts (Agents.md, CLAUDE.md, .cursorrules, .windsurfrules)
  writeFile('Agents.md', buildAgentsMarkdown(ctx, fleetPlan));
  writeFile('CLAUDE.md', buildClaudeMarkdown(ctx));

  writeFile('.cursorrules', `# ISS-Enterprise Governance Rules for Cursor
# Project: ${ctx.projectName} | Archetype: ${ctx.archetype} | Domain: ${ctx.domain} | Theme: ${ctx.theme}

[GOVERNANCE & ROLES]
- Consult Agents.md and .agents/project-context.json for roles, invariants, and model budgets.
- Architecture: ${ctx.architecturePattern} | Rigidity: ${ctx.rigidity}.
- Zero Theatrical Filler: keep responses concise and strictly technical.

[SECURITY GUARDRAIL]
- Prohibit destructive terminal commands (recursive root deletion, piped remote shell scripts, world-writable permissions).
- Run pre-commit verification before finalizing changes.

[CODE POLICY]
- Continuous HTTP polling with setInterval is strictly forbidden.
- Styling strategy: ${ctx.styling} (${ctx.allowTailwind ? 'Tailwind and CSS Modules permitted' : 'Tailwind prohibited; strict CSS Modules only'}).
- Folder hierarchy: ${ctx.distribution}.
- Verification command: ${ctx.commands.testCommand}.
`);

  writeFile('.windsurfrules', `# ISS-Enterprise Governance Rules for Windsurf
# Project: ${ctx.projectName}

- Framework: ISS-Enterprise Governance (consult Agents.md & .agents/project-context.json)
- Domain & Architecture: ${ctx.domain} (${ctx.architecturePattern})
- Styling Policy: ${ctx.styling}
- Structural Directory: ${ctx.distribution}
- Prohibited Commands: Destructive deletions, unrestricted root permissions
- Verification Command: ${ctx.commands.testCommand}
`);

  // 4. Models, MCP configs & Warmup Scripts
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

  // 5. Multi-Language Semgrep SAST Configuration
  writeFile('.semgrep.yml', buildSemgrepYaml(ctx.commands.language));

  // 6. Optional Initial SDD Spec from Interview Context
  const initialSpecRel = path.join('docs', 'designs', '001-initial-architecture.md');
  if (options.createInitialSpec && (isDryRun || !fs.existsSync(path.join(root, initialSpecRel)))) {
    const templateRes = createSpecTemplate(root, '001-initial-architecture', {
      dryRun: true,
      force: true,
      title: `${ctx.projectName} Initial Architecture`,
      track: 'VITAL_LOGIC',
      targetFiles: ['Agents.md']
    });
    const enrichedSpec = templateRes.content
      .replace('- **Objective**: State what this change achieves without jargon.', `- **Objective**: ${ctx.summary}`)
      .replace('- **Current Baseline & Failure**: Current state and exact gap/failure being solved.', `- **Current Baseline & Failure**: Initial architecture for ${ctx.domain} (${ctx.architecturePattern}).`)
      .replace('- Explicit exclusions to prevent scope creep.', `- ${ctx.nonGoals}`)
      .replace('`node --test`, `node ./bin/iss.js doctor`', `\`${ctx.commands.testCommand}\`, \`${ctx.commands.lintCommand}\`, \`node ./bin/iss.js doctor\``);
    writeFile(templateRes.relPath, enrichedSpec);
  }

  // 7. Git Pre-Commit Hook Auto-Arming (Staged-File Inspection)
  const gitHooksDir = path.join(root, '.git', 'hooks');
  if (fs.existsSync(gitHooksDir)) {
    try {
      const preCommitPath = path.join(gitHooksDir, 'pre-commit');
      created.push('.git/hooks/pre-commit');
      if (!isDryRun) {
        fs.writeFileSync(preCommitPath, buildPreCommitHookContent(), { mode: 0o755 });
      }
    } catch {
      /* fallback: skip git hook write if .git permissions are restricted */
    }
  }

  return created;
}
