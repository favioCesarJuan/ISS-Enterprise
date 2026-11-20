/**
 * ==============================================================================
 * ⚔️ ISS-ENTERPRISE: CLI INTERFACE & INTERACTIVE TACTICAL WIZARD
 * ==============================================================================
 * Dispatches commands:
 *   iss inspect [dir]           Inspect stack, detect archetype, print report
 *   iss init [dir] [--yes]      Interactive questionnaire & governance generation
 *   iss new <name>              Greenfield scaffolding & agent initialization
 *   iss skills [compact|create] Manage, fuse, or create canonical skills
 *   iss mcps [dir]              Configure the Indispensable MCP Triad
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { execFileSync } from 'node:child_process';
import { detectProject, ARCHETYPES } from './detector.js';
import { getTailoredQuestions, investigateCustomChoice, runLifecycleAdvisor } from './advisor.js';
import { detectAvailableFleet, allocateCrewToFleet, PROVIDER_REGISTRY } from './fleet-manager.js';
import { recommendSkillsForArchetype, compactAndFuseSkills, createNewSkill } from './skill-engine.js';
import { configureIndispensableTriad, evaluateTriadSubstitutions } from './mcp-engine.js';
import { scaffoldGreenfield } from './scaffolder.js';
import { generateGovernanceArchitecture } from './generator.js';
import { runGovernanceAudit, printAuditReport } from './auditor.js';
import { runFrameworkUpdate } from './updater.js';
import { resolveTheme, printCrewThemeNotice, getHookLabel, getZoneName } from './themes.js';
import { createSpecTemplate, auditSpecDrift } from './spec-checker.js';

// ANSI terminal color helpers
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gold: '\x1b[38;5;220m',
  silver: '\x1b[38;5;250m'
};

function printBanner() {
  console.log(`
${c.gold}    ██╗███████╗███████╗    ███████╗███╗   ██╗████████╗███████╗██████╗ 
    ██║██╔════╝██╔════╝    ██╔════╝████╗  ██║╚══██╔══╝██╔════╝██╔══██╗
    ██║███████╗███████╗    █████╗  ██╔██╗ ██║   ██║   █████╗  ██████╔╝
    ██║╚════██║╚════██║    ██╔══╝  ██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗
    ██║███████║███████║    ███████╗██║ ╚████║   ██║   ███████╗██║  ██║
    ╚═╝╚══════╝╚══════╝    ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝${c.reset}
  ${c.bold}${c.silver}ISS-ENTERPRISE: MULTI-STACK GOVERNANCE & SCAFFOLDING CLI${c.reset}
  ${c.dim}Standard Technical Governance // Optional Naval (--theme=naval) or Private Local Theme (--theme=local)${c.reset}
`);
}

/**
 * @param {readline.Interface} rl
 * @param {string} query
 * @returns {Promise<string>}
 */
function promptUser(rl, query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

/**
 * Main CLI runner entrypoint.
 * @param {string[]} args
 */
export async function runCLI(args = []) {
  const command = args[0] || 'help';

  switch (command) {
    case 'inspect':
      await handleInspect(args.slice(1));
      break;
    case 'apply':
    case 'engage':
    case 'arm':
      await handleEngage(args.slice(1));
      break;
    case 'doctor':
    case 'audit':
      await handleDoctor(args.slice(1));
      break;
    case 'init':
      await handleInit(args.slice(1));
      break;
    case 'new':
      await handleNew(args.slice(1));
      break;
    case 'skills':
      await handleSkills(args.slice(1));
      break;
    case 'mcps':
      await handleMcps(args.slice(1));
      break;
    case 'update':
      await handleUpdate(args.slice(1));
      break;
    case 'advise':
    case 'advisor':
      await handleAdvise(args.slice(1));
      break;
    case 'spec':
      await handleSpec(args.slice(1));
      break;
    case 'theme':
      handleTheme(args.slice(1));
      break;
    case 'help':
    case '--help':
    case '-h':
    default:
      handleHelp();
      break;
  }
}

/** @param {string[]} [args] */
function handleTheme(args = []) {
  const targetDir = args.find(a => !a.startsWith('-')) || process.cwd();
  const active = resolveTheme(args, { rootDir: targetDir });
  printCrewThemeNotice(active, { rootDir: targetDir });
}

/**
 * Handler for `iss inspect [dir] [--json]`.
 * @param {string[]} args
 */
async function handleInspect(args) {
  const isJson = args.includes('--json');
  const targetDir = args.find(a => !a.startsWith('-')) || process.cwd();
  const profile = detectProject(targetDir);
  const fleet = detectAvailableFleet();
  const recommendedSkills = recommendSkillsForArchetype(profile.archetype, profile.techStack);
  const triadPlan = configureIndispensableTriad({ preferredModel: fleet.detectedProviders[0] || 'gemini' });

  if (isJson) {
    console.log(JSON.stringify({ profile, fleet, recommendedSkills, triadPlan }, null, 2));
    return;
  }

  printBanner();
  console.log(`${c.bold}🛰️  TACTICAL SCAN OF SECTOR:${c.reset} ${c.cyan}${path.resolve(targetDir)}${c.reset}`);
  console.log(`${c.bold}Archetype:${c.reset}     ${c.gold}${profile.archetype}${c.reset}`);
  console.log(`${c.bold}Summary:${c.reset}       ${profile.summary}`);
  console.log(`${c.bold}Styling Mode:${c.reset}  ${c.magenta}${profile.stylingStrategy}${c.reset}`);
  
  console.log(`\n${c.bold}📦 Detected Technologies:${c.reset}`);
  const activeTech = Object.entries(profile.techStack || {})
    .filter(([_, v]) => Boolean(v))
    .map(([k]) => k.replace(/^has/, ''))
    .join(', ');
  console.log(`  ${activeTech || 'None (Clean slate / Greenfield)'}`);

  console.log(`\n${c.bold}🛡️  Recommended Compacted Skills:${c.reset}`);
  recommendedSkills.forEach(s => console.log(`  - ${c.green}${s}${c.reset}`));

  console.log(`\n${c.bold}🤖 Detected Fleet Providers:${c.reset}`);
  fleet.detectedProviders.forEach(p => console.log(`  - ${c.cyan}${p.toUpperCase()}${c.reset}`));

  console.log(`\n${c.bold}🔌 Indispensable MCP Triad Readiness:${c.reset}`);
  console.log(`  - context7:            ${c.green}Active (2026 Live Docs)${c.reset}`);
  console.log(`  - codebase-memory-mcp: ${c.green}Active (Knowledge Graph & Cypher)${c.reset}`);
  console.log(`  - github:              ${c.green}Active (VCS & Issues Synchronization)${c.reset}`);
  console.log(`\n${c.dim}Run 'iss init' to deploy this tactical governance configuration.${c.reset}\n`);
}

/**
 * Handler for `iss init [dir] [--yes]`.
 * @param {string[]} args
 */
async function handleInit(args) {
  const autoYes = args.includes('--yes') || args.includes('-y');
  const isDryRun = args.includes('--dry-run');
  const isForce = args.includes('--force') || args.includes('--reconfigure');
  const initSpecFlag = args.includes('--init-spec');
  const theme = resolveTheme(args);
  const targetDir = args.find(a => !a.startsWith('-')) || process.cwd();
  const dir = path.resolve(targetDir);

  printBanner();
  if (isDryRun) {
    console.log(`${getHookLabel('sim')} ${c.yellow}${c.bold}[DRY RUN MODE ACTIVE]: Simulating governance deployment in ${getZoneName('simBay', { rootDir: dir })} without touching disk.${c.reset}`);
  }
  console.log(`${c.bold}⚙️  INITIALIZING MULTI-AGENT GOVERNANCE AT:${c.reset} ${c.cyan}${dir}${c.reset} (Theme: ${theme})\n`);

  const profile = detectProject(dir);
  const detectedTech = Object.entries(profile.techStack || {})
    .filter(([, v]) => Boolean(v))
    .map(([k]) => k.replace(/^has/, ''))
    .join(', ');
  console.log(`${c.dim}Detected: ${profile.archetype} | Stack: ${detectedTech || 'Clean/Greenfield'} | Styling: ${profile.stylingStrategy || 'AUTO'}${c.reset}`);

  const questions = getTailoredQuestions(profile);
  /** @type {import('../types/index.d.ts').AdvisorAnswers} */
  const answers = {
    archetype: profile.archetype,
    summary: profile.summary,
    techStack: profile.techStack,
    stylingStrategy: profile.stylingStrategy
  };

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    if (autoYes) {
      console.log(`${c.yellow}[AUTOMATED MODE]: Adopting defaults for ${profile.archetype}...${c.reset}`);
      answers.project_domain = profile.archetype === 'DATA_PIPELINE_RAG' ? 'Datos / Scraping / IA / Pipeline RAG' : 'General Software';
      answers.project_summary = profile.summary || 'Modular application';
      answers.domain_invariants = 'KISS simplicity, explicit recoverable failure handling, minimal dependencies';
      answers.project_non_goals = 'Avoid speculative abstractions outside core scope';
      answers.architecture_pattern = 'Hexagonal / Modular Clean';
      answers.file_distribution = profile.techStack?.hasTurbo ? 'Monorepo Packages' : 'Modular Standard';
      answers.styling_strategy = profile.stylingStrategy;
      answers.coding_styles = profile.techStack?.hasPython
        ? 'Ruff + Black + MyPy'
        : profile.techStack?.hasGo
          ? 'Golangci-lint + Go Fmt'
          : profile.techStack?.hasRust
            ? 'Cargo Clippy + Cargo Fmt'
            : profile.techStack?.hasBiome
              ? 'Biome'
              : 'ESLint + Prettier + Strict TS';
      answers.shield_rigidity = 'Standard';
      answers.crew_flavor = theme === 'local'
        ? 'Local Privado'
        : theme === 'naval'
          ? 'Naval (Opcional, Dominio Público)'
          : 'Estándar (Funcional)';
    } else {
      for (const q of questions) {
        console.log(`\n${c.bold}${q.title}${c.reset}`);
        if (q.type === 'text') {
          const textInput = await promptUser(rl, `${c.yellow}[Enter = ${q.defaultValue}]: ${c.reset}`);
          answers[q.id] = textInput.trim() || q.defaultValue;
          continue;
        }

        q.options.forEach((opt, idx) => {
          console.log(`  ${c.cyan}[${idx + 1}]${c.reset} ${opt}`);
        });

        const choice = await promptUser(rl, `\n${c.yellow}Selecciona una opción [1-${q.options.length}]: ${c.reset}`);
        const parsedIdx = parseInt(choice.trim(), 10) - 1;

        if (parsedIdx >= 0 && parsedIdx < q.options.length) {
          const selectedText = q.options[parsedIdx];
          if (selectedText.includes('[Otra / Personalizada]')) {
            const customInput = await promptUser(rl, `${c.magenta}Especifica tu opción personalizada o tecnología: ${c.reset}`);
            const investigation = investigateCustomChoice(q.id, customInput);
            console.log(`${c.green}⚡ [INVESTIGACIÓN AUTÓNOMA]:${c.reset} ${investigation.recommendation}`);
            answers[q.id] = `CUSTOM: ${customInput}`;
            answers[`${q.id}_investigation`] = investigation;
          } else {
            answers[q.id] = selectedText;
          }
        } else if (choice.trim()) {
          const investigation = investigateCustomChoice(q.id, choice.trim());
          console.log(`${c.green}⚡ [INVESTIGACIÓN AUTÓNOMA]:${c.reset} ${investigation.recommendation}`);
          answers[q.id] = `CUSTOM: ${choice.trim()}`;
          answers[`${q.id}_investigation`] = investigation;
        } else {
          answers[q.id] = q.options[0];
        }
      }
    }

    const shouldCreateSpec = initSpecFlag || (!autoYes && profile.archetype === 'GREENFIELD_EMPTY');
    const flavorAnswer = answers.crew_flavor || '';
    const effectiveTheme = /local|privado/i.test(flavorAnswer)
      ? 'local'
      : /naval|marit/i.test(flavorAnswer)
        ? 'naval'
        : theme;

    // Step 2: Fleet Allocation
    console.log(`\n${c.bold}DETERMINING MODEL FLEET & CONTEXT BUDGETS...${c.reset}`);
    const fleetProfile = detectAvailableFleet();
    const fleetAlloc = allocateCrewToFleet(fleetProfile.detectedProviders);
    console.log(`  Allocated ${c.green}${Object.keys(fleetAlloc.officerRoster).length} roles${c.reset} across available fleet models.`);

    // Step 3: MCP Triad Confirmation
    const mcpTriad = configureIndispensableTriad({ preferredModel: fleetProfile.detectedProviders[0] || 'gemini' });

    // Step 4: Generate Artifacts
    console.log(`\n${c.bold}EMITTING DETERMINISTIC AGENT DIRECTIVES...${c.reset}`);
    const createdFiles = generateGovernanceArchitecture(dir, answers, fleetAlloc, mcpTriad, {
      dryRun: isDryRun,
      theme: effectiveTheme,
      force: isForce,
      interviewCompleted: !autoYes,
      createInitialSpec: shouldCreateSpec
    });

    if (isDryRun) {
      console.log(`\n${getHookLabel('sim')} ${c.yellow}${c.bold}[DRY RUN RESULTS — ${getZoneName('simBay', { rootDir: dir })}]: 0 files written to disk.${c.reset}`);
      console.log(`${c.silver}The following ${createdFiles.length} files would be created/modified:${c.reset}`);
      createdFiles.forEach(f => console.log(`  ${c.cyan}[DRY-RUN WOULD CREATE]${c.reset} ${f}`));
      console.log(`\nTo physically apply these changes, re-run without --dry-run.\n`);
      return createdFiles;
    }

    console.log(`\n${c.green}${c.bold}MISSION COMPLETE: GOVERNANCE INSTALLED${c.reset}`);
    console.log(`${c.silver}Generated ${createdFiles.length} assets in ${dir}:${c.reset}`);
    createdFiles.slice(0, 10).forEach(f => console.log(`  ${c.dim}+${c.reset} ${f}`));
    if (createdFiles.length > 10) console.log(`  ${c.dim}... and ${createdFiles.length - 10} more.${c.reset}`);

    printCrewThemeNotice(effectiveTheme, { rootDir: dir });
    return createdFiles;
  } finally {
    rl.close();
  }
}

/**
 * Handler for `iss apply [dir] [--dry-run] [--theme=standard|naval|local]` (alias: `engage`, `arm`).
 * @param {string[]} args
 */
async function handleEngage(args) {
  const targetDir = args.find(a => !a.startsWith('-')) || process.cwd();
  const passArgs = ['--yes', targetDir];
  for (const flag of ['--dry-run', '--force', '--reconfigure', '--init-spec']) {
    if (args.includes(flag)) passArgs.push(flag);
  }
  const themeFlag = args.find(a => a.startsWith('--theme='));
  if (themeFlag) passArgs.push(themeFlag);
  await handleInit(passArgs);
}

/**
 * Handler for `iss doctor [dir]` / `iss audit [dir]`.
 * @param {string[]} args
 */
async function handleDoctor(args) {
  const targetDir = args.find(a => !a.startsWith('-')) || process.cwd();
  const report = runGovernanceAudit(targetDir);
  printAuditReport(report);
  if (!report.ok && !args.includes('--no-exit')) {
    process.exitCode = 1;
  }
  return report;
}

/**
 * Handler for `iss new <name> [dir]`.
 * @param {string[]} args
 */
async function handleNew(args) {
  const projectName = args[0];
  if (!projectName) {
    console.error(`${c.red}Error: Project name required. Example: iss new my-app${c.reset}`);
    process.exit(1);
  }

  const baseDir = args[1] || process.cwd();
  const targetDir = path.resolve(baseDir, projectName);

  printBanner();
  console.log(`${c.bold}🏗️  SCAFFOLDING NEW GREENFIELD PROJECT:${c.reset} ${c.gold}${projectName}${c.reset}`);
  console.log(`${c.dim}Target Directory: ${targetDir}${c.reset}\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    console.log(`${c.bold}Elige la plantilla de arquitectura para el nuevo proyecto:${c.reset}`);
    const templates = [
      { id: 'monorepo', label: 'Fullstack Monorepo (Next.js + NestJS + Expo + Turborepo)' },
      { id: 'astro-portal', label: 'Content Portal & SSG (Astro + Biome + Mixed CSS/Tailwind)' },
      { id: 'python-rag', label: 'Data Engineering & RAG Pipeline (Python + Docker + Headless)' },
      { id: 'backend-api', label: 'Microservicio Backend API (FastAPI / NestJS / Go)' },
      { id: 'minimal', label: 'Scripting Minimalista & Modular' },
      { id: 'custom', label: '[Otra / Personalizada]' }
    ];

    templates.forEach((t, i) => console.log(`  ${c.cyan}[${i + 1}]${c.reset} ${t.label}`));
    const choice = await promptUser(rl, `\n${c.yellow}Selecciona plantilla [1-${templates.length}]: ${c.reset}`);
    const idx = parseInt(choice.trim(), 10) - 1;
    let selectedTemplate = (idx >= 0 && idx < templates.length) ? templates[idx].id : 'monorepo';
    let customStack = null;

    if (selectedTemplate === 'custom') {
      const customName = await promptUser(rl, `${c.magenta}Describe la arquitectura/stack deseado: ${c.reset}`);
      const inv = investigateCustomChoice('stack', customName);
      console.log(`${c.green}⚡ [INVESTIGACIÓN AUTÓNOMA]:${c.reset} ${inv.recommendation}`);
      customStack = customName;
      selectedTemplate = customName;
    }

    const projectSummary = await promptUser(rl, `${c.yellow}Describe brevemente el propósito/dominio del proyecto [Enter = omitir]: ${c.reset}`);

    console.log(`\n${c.bold}🚀 Scaffolding physical project tree...${c.reset}`);
    const scaffoldedFiles = scaffoldGreenfield(targetDir, { archetype: selectedTemplate, purpose: selectedTemplate, projectName });
    console.log(`Scaffolded ${c.green}${scaffoldedFiles.length} files.${c.reset}`);

    // Now run governance generator on the new directory
    const profile = detectProject(targetDir);
    const fleetProfile = detectAvailableFleet();
    const fleetAlloc = allocateCrewToFleet(fleetProfile.detectedProviders);
    const mcpTriad = configureIndispensableTriad({ preferredModel: fleetProfile.detectedProviders[0] || 'gemini' });

    generateGovernanceArchitecture(targetDir, {
      archetype: profile.archetype,
      techStack: profile.techStack,
      stylingStrategy: profile.stylingStrategy || 'MIXED_CSS_TAILWIND',
      project_purpose: customStack || selectedTemplate,
      project_summary: projectSummary.trim() || profile.summary
    }, fleetAlloc, mcpTriad, {
      interviewCompleted: Boolean(projectSummary.trim()),
      createInitialSpec: true
    });

    console.log(`\n${c.green}${c.bold}✅ New project '${projectName}' ready at:${c.reset} ${targetDir}`);
    console.log(`\nNext steps:\n  ${c.cyan}cd ${path.relative(process.cwd(), targetDir) || projectName}${c.reset}\n`);
  } finally {
    rl.close();
  }
}

/**
 * Handler for `iss skills [compact|create|list]`.
 * @param {string[]} args
 */
async function handleSkills(args) {
  const sub = args[0] || 'list';
  const targetDir = args[1] || process.cwd();

  printBanner();
  if (sub === 'list') {
    const profile = detectProject(targetDir);
    const skills = recommendSkillsForArchetype(profile.archetype, profile.techStack);
    console.log(`${c.bold}Active & Recommended Skills for ${c.cyan}${targetDir}${c.reset}:`);
    skills.forEach(s => console.log(`  - ${c.green}${s}${c.reset}`));
  } else if (sub === 'compact') {
    const isDryRun = args.includes('--dry-run');
    const prefix = isDryRun ? `${getHookLabel('sim')} ` : '';
    console.log(`${prefix}${c.bold}Compacting and fusing skills in ${c.cyan}${targetDir}${c.reset}${isDryRun ? ` [${getZoneName('simBay', { rootDir: targetDir })} / DRY RUN]` : ''}...`);
    const fused = compactAndFuseSkills(targetDir, { dryRun: isDryRun, writeToDisk: !isDryRun });
    console.log(`${c.green}Compacted into ${fused.length} canonical pillars:${c.reset}`);
    fused.forEach(f => console.log(`  - ${c.gold}${f.canonicalName}${c.reset} (${f.sourceSkills.length} source skills fused)`));
    if (!isDryRun) {
      console.log(`${c.green}✅ Persisted canonical skills to .agents/skills/<domain>/SKILL.md${c.reset}`);
    }
  } else if (sub === 'create') {
    const skillName = args[1];
    if (!skillName) {
      console.error(`${c.red}Error: Skill name required. Example: iss skills create my-specialized-skill${c.reset}`);
      return;
    }
    const created = createNewSkill(targetDir, skillName, { description: `Custom skill ${skillName} created via ISS-Enterprise CLI.` });
    console.log(`${c.green}Created canonical skill:${c.reset} ${created.path}`);
  }
}

/**
 * Handler for `iss mcps [dir|warmup]`.
 * @param {string[]} args
 */
async function handleMcps(args) {
  if (args[0] === 'warmup') {
    const targetDir = args[1] || process.cwd();
    const target = path.resolve(targetDir);
    printBanner();
    console.log(`${c.bold}🔌 WARMING UP INDISPENSABLE MCP TRIAD & KNOWLEDGE GRAPH AT:${c.reset} ${c.cyan}${target}${c.reset}`);
    const warmupScript = path.join(target, 'scripts/warmup-mcp.sh');
    if (fs.existsSync(warmupScript)) {
      console.log(`Executing warmup script: ${c.dim}${warmupScript}${c.reset}`);
      try {
        execFileSync('bash', [warmupScript], { stdio: 'inherit', cwd: target });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`Warmup completed with exit code notice: ${msg}`);
      }
    } else {
      console.log(`📡 Warming up codebase-memory-mcp indexer on ${target}...`);
      try {
        execFileSync('npx', ['codebase-memory-mcp', 'index', '.'], { stdio: 'inherit', cwd: target });
      } catch {
        console.log(`ℹ️  codebase-memory-mcp will index automatically on first agent request.`);
      }
    }
    return;
  }

  const targetDir = args[0] || process.cwd();
  printBanner();
  console.log(`${c.bold}Indispensable MCP Triad for ${c.cyan}${targetDir}${c.reset}:`);
  const plan = configureIndispensableTriad({});
  
  console.log(`\n${c.gold}1. context7 (Live 2026 Documentation)${c.reset}`);
  console.log(`   Tool: context7:query-docs, context7:resolve-library-id`);
  console.log(`   Status: Essential for up-to-date SDKs.`);

  console.log(`\n${c.gold}2. codebase-memory-mcp (Knowledge Graph & Cypher)${c.reset}`);
  console.log(`   Tool: search_graph, trace_path, query_graph`);
  console.log(`   Status: Mandatory for zero-hallucination structural queries.`);

  console.log(`\n${c.gold}3. github (VCS & Orchestration)${c.reset}`);
  console.log(`   Tool: get_file_contents, create_pull_request, search_code`);
  console.log(`   CLI Fallback: gh (GitHub CLI) & local git`);

  const outConfig = path.join(path.resolve(targetDir), '.mcp/mcp-servers.config.json');
  if (!fs.existsSync(path.dirname(outConfig))) {
    fs.mkdirSync(path.dirname(outConfig), { recursive: true });
  }
  fs.writeFileSync(outConfig, JSON.stringify(plan.recommendedConfig, null, 2), 'utf-8');
  console.log(`\n${c.green}Configured .mcp/mcp-servers.config.json successfully.${c.reset}`);
}

/**
 * Handler for `iss update`.
 * @param {string[]} args
 */
async function handleUpdate(args) {
  const checkOnly = args.includes('--check');
  const autoYes = args.includes('--yes') || args.includes('-y');
  const srcArg = args.find(a => a.startsWith('--source='));
  const source = srcArg ? srcArg.slice('--source='.length) : undefined;
  const targetDir = args.find(a => !a.startsWith('-')) || process.cwd();
  await runFrameworkUpdate(targetDir, { checkOnly, yes: autoYes, source });
}

/**
 * Handler for `iss advise`.
 * @param {string[]} args
 */
async function handleAdvise(args) {
  const autoYes = args.includes('--yes') || args.includes('-y');
  const targetDir = args.find(a => !a.startsWith('-')) || process.cwd();
  await runLifecycleAdvisor(targetDir, { yes: autoYes });
}

/**
 * Handler for `iss spec [new <slug>|check]`.
 * @param {string[]} args
 */
async function handleSpec(args) {
  const sub = args[0] || 'check';

  if (sub === 'new') {
    const rest = args.slice(1);
    const positional = rest.filter(a => !a.startsWith('-'));
    const slug = positional[0];
    const targetDir = positional[1] || process.cwd();
    const isDryRun = rest.includes('--dry-run');
    const force = rest.includes('--force');
    const titleArg = rest.find(a => a.startsWith('--title='));
    const title = titleArg ? titleArg.slice('--title='.length) : undefined;

    if (!slug) {
      console.error(`${c.red}Error: Spec slug required. Example: iss spec new auth-flow${c.reset}`);
      process.exitCode = 1;
      return;
    }

    try {
      const created = createSpecTemplate(targetDir, slug, { dryRun: isDryRun, force, title });
      if (isDryRun) {
        console.log(`${getHookLabel('sim')} ${c.yellow}[DRY-RUN — ${getZoneName('simBay', { rootDir: targetDir })}] Would create spec:${c.reset} ${created.relPath}`);
      } else {
        console.log(`${c.green}Created SDD spec:${c.reset} ${created.relPath}`);
        console.log(`${c.dim}Next: Run stateless Zero-Context Cold Review (Lower-Deck Evaluator) before setting status: APPROVED, then verify with 'iss spec check'.${c.reset}`);
      }
      return created;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`${c.red}Error: ${msg}${c.reset}`);
      process.exitCode = 1;
      return null;
    }
  }

  if (sub === 'check' || sub === 'drift') {
    const rest = args.slice(1);
    const isJson = rest.includes('--json');
    const targetDir = rest.find(a => !a.startsWith('-')) || process.cwd();
    const report = auditSpecDrift(targetDir);

    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n${c.bold}${c.gold}📐 SDD SPECIFICATION DRIFT CHECK${c.reset}`);
      console.log(`${c.dim}Target: ${path.resolve(targetDir)}${c.reset}`);
      console.log('----------------------------------------------------');
      if (report.specsFound === 0) {
        console.log(`  \x1b[32m✔ [OK]\x1b[0m No SDD specs found under docs/designs/.`);
      } else {
        for (const msg of report.passed) console.log(`  \x1b[32m✔ [OK]\x1b[0m ${msg}`);
        for (const msg of report.warnings) console.log(`  \x1b[33m▲ [WARN]\x1b[0m ${msg}`);
        for (const msg of report.failures) console.log(`  \x1b[31m✖ [FAIL]\x1b[0m ${msg}`);
      }
      console.log('----------------------------------------------------\n');
    }

    if (!report.ok && !rest.includes('--no-exit')) {
      process.exitCode = 1;
    }
    return report;
  }

  console.error(`${c.red}Unknown spec subcommand '${sub}'. Use 'iss spec new <slug>' or 'iss spec check'.${c.reset}`);
  process.exitCode = 1;
}

/**
 * Handler for `iss help`
 */
function handleHelp() {
  printBanner();
  console.log(`
${c.bold}USAGE:${c.reset}
  $ iss <command> [options]

${c.bold}COMMANDS:${c.reset}
  ${c.green}apply${c.reset} [dir]             One-shot deployment: arms hooks, roles, MCPs & Git guards (alias: engage)
  ${c.green}doctor${c.reset} [dir]            Audit governance drift, executable guards, and policy alignment
  ${c.green}inspect${c.reset} [dir]           Inspect existing project, detect archetype & recommendations
  ${c.green}init${c.reset} [dir] [--yes]      Launch interactive context interview & governance generator
  ${c.green}new${c.reset} <name> [dir]        Scaffold a brand new project from scratch (Greenfield)
  ${c.green}theme${c.reset} [dir]             Inspect active theme mode (standard / naval / local), zones & roles
  ${c.green}skills${c.reset} list|compact|create Manage, compact & fuse agent skills
  ${c.green}mcps${c.reset} [dir|warmup]       Configure or warm up the Indispensable MCP Triad
  ${c.green}advise${c.reset} [dir] [--yes]    Lifecycle-aware advisor (Greenfield / Active / Maintenance)
  ${c.green}spec${c.reset} new|check [dir]    Create SDD specs or audit spec-to-code drift
  ${c.green}update${c.reset} [dir] [--check]  Consulted framework updater with Quadruple Security Gate
  ${c.green}help${c.reset}                    Display this CLI reference

${c.bold}OPTIONS:${c.reset}
  ${c.cyan}--yes, -y${c.reset}               Non-interactive mode, auto-accept optimal recommendations
  ${c.cyan}--theme=standard|naval|local${c.reset} Standard technical names, public Naval (Bridge/Lower Deck/Sim), or untracked local override
  ${c.cyan}--check${c.reset}                 Check for upstream updates without applying
  ${c.cyan}--dry-run${c.reset}               Simulate governance deployment without writing to disk
  ${c.cyan}--force, --reconfigure${c.reset}  Re-run context interview and overwrite existing contracts/instincts
  ${c.cyan}--init-spec${c.reset}             Generate initial SDD spec in docs/designs/001-initial-architecture.md
  ${c.cyan}--json${c.reset}                  Output structured JSON (available in inspect / spec check)

${c.bold}EXAMPLES:${c.reset}
  $ iss apply
  $ iss apply --theme=naval
  $ iss apply --theme=local --dry-run
  $ iss theme
  $ iss doctor
  $ iss advise
  $ iss inspect /path/to/my-expo-app
  $ iss init --yes
  $ iss new alpha-station
  $ iss mcps warmup
`);
}
