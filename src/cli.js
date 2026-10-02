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
import { detectProject, ARCHETYPES } from './detector.js';
import { getTailoredQuestions, investigateCustomChoice } from './advisor.js';
import { detectAvailableFleet, allocateCrewToFleet, PROVIDER_REGISTRY } from './fleet-manager.js';
import { recommendSkillsForArchetype, compactAndFuseSkills, createNewSkill } from './skill-engine.js';
import { configureIndispensableTriad, evaluateTriadSubstitutions } from './mcp-engine.js';
import { scaffoldGreenfield } from './scaffolder.js';
import { generateGovernanceArchitecture } from './generator.js';

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
  ${c.bold}${c.silver}ISS-ENTERPRISE: UNIVERSAL MULTI-AGENT TACTICAL ENGINE & WIZARD${c.reset}
  ${c.dim}Mirror Universe Flagship // Generalist Cross-Stack Autonomous Governance${c.reset}
`);
}

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
    case 'engage':
    case 'arm':
      await handleEngage(args.slice(1));
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
    case 'help':
    case '--help':
    case '-h':
    default:
      handleHelp();
      break;
  }
}

/**
 * Handler for `iss inspect [dir] [--json]`
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
 * Handler for `iss init [dir] [--yes]`
 */
async function handleInit(args) {
  const autoYes = args.includes('--yes') || args.includes('-y');
  const targetDir = args.find(a => !a.startsWith('-')) || process.cwd();
  const dir = path.resolve(targetDir);

  printBanner();
  console.log(`${c.bold}⚙️  INITIALIZING MULTI-AGENT GOVERNANCE AT:${c.reset} ${c.cyan}${dir}${c.reset}\n`);

  const profile = detectProject(dir);
  const questions = getTailoredQuestions(profile);
  const answers = {
    archetype: profile.archetype,
    techStack: profile.techStack,
    stylingStrategy: profile.stylingStrategy
  };

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    if (autoYes) {
      console.log(`${c.yellow}[AUTOMATED MODE]: Adopting tactical defaults for ${profile.archetype}...${c.reset}`);
      answers.architecture_pattern = 'Hexagonal / Modular Clean';
      answers.file_distribution = profile.techStack?.hasTurbo ? 'Monorepo Packages' : 'Modular Standard';
      answers.styling_strategy = profile.stylingStrategy;
      answers.coding_styles = profile.techStack?.hasBiome ? 'Biome' : 'ESLint + Prettier + Strict TS';
      answers.shield_rigidity = 'Standard Starfleet';
      answers.crew_flavor = 'Híbrido: Star Trek TNG con subtítulo corporativo';
    } else {
      for (const q of questions) {
        console.log(`\n${c.bold}${q.title}${c.reset}`);
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
          // User typed direct custom text instead of number
          const investigation = investigateCustomChoice(q.id, choice.trim());
          console.log(`${c.green}⚡ [INVESTIGACIÓN AUTÓNOMA]:${c.reset} ${investigation.recommendation}`);
          answers[q.id] = `CUSTOM: ${choice.trim()}`;
          answers[`${q.id}_investigation`] = investigation;
        } else {
          answers[q.id] = q.options[0];
        }
      }
    }

    // Step 2: Fleet Allocation
    console.log(`\n${c.bold}🛸 DETERMINING MODEL FLEET & CONTEXT BUDGETS...${c.reset}`);
    const fleetProfile = detectAvailableFleet();
    let fleetAlloc = allocateCrewToFleet(fleetProfile.detectedProviders);
    console.log(`  Allocated ${c.green}${Object.keys(fleetAlloc.officerRoster).length} officers${c.reset} across available fleet models.`);

    // Step 3: MCP Triad Confirmation
    const mcpTriad = configureIndispensableTriad({ preferredModel: fleetProfile.detectedProviders[0] || 'gemini' });

    // Step 4: Generate Artifacts
    console.log(`\n${c.bold}⚡ EMITTING DETERMINISTIC AGENT DIRECTIVES...${c.reset}`);
    const createdFiles = generateGovernanceArchitecture(dir, answers, fleetAlloc, mcpTriad);

    console.log(`\n${c.green}${c.bold}✅ MISSION COMPLETE: GOVERNANCE INSTALLED${c.reset}`);
    console.log(`${c.silver}Generated ${createdFiles.length} tactical assets in ${dir}:${c.reset}`);
    createdFiles.slice(0, 8).forEach(f => console.log(`  ${c.dim}+${c.reset} ${f}`));
    if (createdFiles.length > 8) console.log(`  ${c.dim}... and ${createdFiles.length - 8} more.${c.reset}`);

    console.log(`\n${c.gold}Enterprise flagship is battle-ready. Execute! 🚀${c.reset}\n`);
  } finally {
    rl.close();
  }
}

/**
 * Handler for `iss engage [dir]`
 * One-shot tactical deployment: automatically detects project archetype,
 * adopts optimal presets, provisions crew, MCPs, and auto-arms Git pre-commit hooks.
 */
async function handleEngage(args) {
  const targetDir = args.find(a => !a.startsWith('-')) || process.cwd();
  await handleInit(['--yes', targetDir]);
}

/**
 * Handler for `iss new <name> [dir]`
 */
async function handleNew(args) {
  const projectName = args[0];
  if (!projectName) {
    console.error(`${c.red}Error: Project name required. Example: iss new my-space-app${c.reset}`);
    process.exit(1);
  }

  const baseDir = args[1] || process.cwd();
  const targetDir = path.resolve(baseDir, projectName);

  printBanner();
  console.log(`${c.bold}🏗️  FORGING NEW GREENFIELD VESSEL:${c.reset} ${c.gold}${projectName}${c.reset}`);
  console.log(`${c.dim}Target Directory: ${targetDir}${c.reset}\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    console.log(`${c.bold}Elige la plantilla estelar para el nuevo proyecto:${c.reset}`);
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

    if (selectedTemplate === 'custom') {
      const customName = await promptUser(rl, `${c.magenta}Describe la arquitectura/stack deseado: ${c.reset}`);
      const inv = investigateCustomChoice('stack', customName);
      console.log(`${c.green}⚡ [INVESTIGACIÓN AUTÓNOMA]:${c.reset} ${inv.recommendation}`);
      selectedTemplate = 'minimal';
    }

    console.log(`\n${c.bold}🚀 Scaffolding physical project tree...${c.reset}`);
    const scaffoldedFiles = scaffoldGreenfield(targetDir, { archetype: selectedTemplate, projectName });
    console.log(`Scaffolded ${c.green}${scaffoldedFiles.length} files.${c.reset}`);

    // Now run governance generator on the new directory
    const profile = detectProject(targetDir);
    const fleetProfile = detectAvailableFleet();
    const fleetAlloc = allocateCrewToFleet(fleetProfile.detectedProviders);
    const mcpTriad = configureIndispensableTriad({ preferredModel: fleetProfile.detectedProviders[0] || 'gemini' });

    generateGovernanceArchitecture(targetDir, {
      archetype: profile.archetype,
      techStack: profile.techStack,
      stylingStrategy: profile.stylingStrategy || 'MIXED_CSS_TAILWIND'
    }, fleetAlloc, mcpTriad);

    console.log(`\n${c.green}${c.bold}✅ New project '${projectName}' ready at:${c.reset} ${targetDir}`);
    console.log(`\nTo embark:\n  ${c.cyan}cd ${path.relative(process.cwd(), targetDir) || projectName}${c.reset}\n`);
  } finally {
    rl.close();
  }
}

/**
 * Handler for `iss skills [compact|create|list]`
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
    console.log(`${c.bold}Compacting and fusing skills in ${c.cyan}${targetDir}${c.reset}...`);
    const fused = compactAndFuseSkills(targetDir);
    console.log(`${c.green}Compacted into canonical pillars:${c.reset}`);
    fused.forEach(f => console.log(`  - ${c.gold}${f.canonicalName}${c.reset} (${f.sourceSkills.length} source skills fused)`));
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
 * Handler for `iss mcps [dir]`
 */
async function handleMcps(args) {
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
 * Handler for `iss help`
 */
function handleHelp() {
  printBanner();
  console.log(`
${c.bold}USAGE:${c.reset}
  $ iss <command> [options]

${c.bold}COMMANDS:${c.reset}
  ${c.green}engage${c.reset} [dir]            One-shot tactical deployment: arms hooks, crew, MCPs & Git shields
  ${c.green}inspect${c.reset} [dir]            Inspect existing project, detect archetype & recommendations
  ${c.green}init${c.reset} [dir] [--yes]       Launch interactive wizard to scaffold multi-agent governance
  ${c.green}new${c.reset} <name> [dir]         Scaffold a brand new project from scratch (Greenfield)
  ${c.green}skills${c.reset} list|compact|create Manage, compact & fuse agent skills
  ${c.green}mcps${c.reset} [dir]               Configure the Indispensable MCP Triad (Docs, Graph, VCS)
  ${c.green}help${c.reset}                     Display this tactical guidance manifest

${c.bold}OPTIONS:${c.reset}
  ${c.cyan}--yes, -y${c.reset}                Non-interactive mode, auto-accept optimal recommendations
  ${c.cyan}--json${c.reset}                   Output structured JSON (available in inspect)

${c.bold}EXAMPLES:${c.reset}
  $ iss engage
  $ iss inspect
  $ iss inspect /path/to/my-astro-project
  $ iss init --yes
  $ iss new alpha-station
  $ iss skills compact
  $ iss mcps
`);
}
