/**
 * ==============================================================================
 * 🧪 ISS-ENTERPRISE: COMPREHENSIVE AUTOMATED VERIFICATION SUITE
 * ==============================================================================
 * Validates:
 * 1. Stack detection across heterogeneous archetypes (Astro, Python RAG, Monorepo)
 * 2. Autonomous investigation of "Otra" / custom technologies (Bun, FastAPI, Rust)
 * 3. Multi-model fleet allocation & context window budgeting
 * 4. Adaptive styling governance (Tailwind permitted vs strict forbidden vs headless)
 * 5. Dynamic skill compaction & canonical domain fusion
 * 6. Indispensable MCP Triad configuration
 * 7. Intelligent Folder Structure suggestions (Atomic Design for Astro, App Router, Hexagonal)
 * 8. Greenfield project scaffolding and deterministic hook execution
 * ==============================================================================
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { detectProject, ARCHETYPES } from '../src/detector.js';
import { investigateCustomChoice, getTailoredQuestions } from '../src/advisor.js';
import { allocateFleet, allocateCrewToFleet, MODEL_REGISTRY } from '../src/fleet-manager.js';
import { recommendSkillsForArchetype, compactAndFuseSkills, createNewSkill } from '../src/skill-engine.js';
import { buildMcpPlan, configureIndispensableTriad } from '../src/mcp-engine.js';
import { scaffoldGreenfield } from '../src/scaffolder.js';
import { generateGovernanceArchitecture } from '../src/generator.js';

const PASS = '  \x1b[32m✔\x1b[0m';
const FAIL = '  \x1b[31m✖\x1b[0m';

console.log('\n\x1b[1m\x1b[38;5;220m🛸 ISS-ENTERPRISE TACTICAL TEST RUNNER\x1b[0m');
console.log('----------------------------------------------------');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`${PASS} ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`${FAIL} ${name}`);
    console.error(`     \x1b[31m${err.message}\x1b[0m`);
    if (process.env.DEBUG) console.error(err.stack);
  }
}

// -----------------------------------------------------------------------------
// Fixture Setup for 100% Portable Tests (Runs on any machine or CI)
// -----------------------------------------------------------------------------
const fixturesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'iss-fixtures-'));

function setupFixtures() {

  // 1. Astro SSG Portal with Mixed Styling
  const astroDir = path.join(fixturesDir, 'astro-ssg-mock');
  fs.mkdirSync(astroDir, { recursive: true });
  fs.writeFileSync(path.join(astroDir, 'package.json'), JSON.stringify({
    dependencies: { astro: '^4.0.0', tailwindcss: '^3.4.0', '@biomejs/biome': '^1.5.0' }
  }));
  fs.writeFileSync(path.join(astroDir, 'astro.config.mjs'), 'export default {};\n');
  fs.writeFileSync(path.join(astroDir, 'style.css'), '/* Mixed styling */\n');

  // 2. Python Data / RAG Pipeline Headless
  const ragDir = path.join(fixturesDir, 'python-rag-mock');
  fs.mkdirSync(ragDir, { recursive: true });
  fs.writeFileSync(path.join(ragDir, 'requirements.txt'), 'openai\nchromadb\n');
  fs.writeFileSync(path.join(ragDir, 'pipeline.py'), '# RAG pipeline\n');
  fs.writeFileSync(path.join(ragDir, 'astronauts_dump.txt'), 'Payload dump\n');
  fs.writeFileSync(path.join(ragDir, 'Dockerfile'), 'FROM python:3.11\n');

  // 3. Fullstack Monorepo with Strict CSS
  const monorepoDir = path.join(fixturesDir, 'strict-monorepo-mock');
  fs.mkdirSync(path.join(monorepoDir, 'apps'), { recursive: true });
  fs.mkdirSync(path.join(monorepoDir, 'packages'), { recursive: true });
  fs.writeFileSync(path.join(monorepoDir, 'package.json'), JSON.stringify({
    dependencies: { '@nestjs/core': '^10.0.0' }
  }));
  fs.writeFileSync(path.join(monorepoDir, 'turbo.json'), '{"$schema": "https://turbo.build/schema.json"}\n');
  fs.writeFileSync(path.join(monorepoDir, 'pnpm-workspace.yaml'), "packages:\n  - 'apps/*'\n  - 'packages/*'\n");
  fs.writeFileSync(path.join(monorepoDir, 'rules.md'), '# Architecture Directives\nStrict policy: No TailwindCSS permitted. Use pure CSS3 & CSS Modules only.\n');
}

setupFixtures();

// -----------------------------------------------------------------------------
// Test 1: Archetype Detection on Portable Archetypes
// -----------------------------------------------------------------------------
runTest('Detector: Correctly identifies Astro SSG with Mixed Styling (Astro Portal archetype)', () => {
  const p = detectProject(path.join(fixturesDir, 'astro-ssg-mock'));
  assert.equal(p.archetype, ARCHETYPES.CONTENT_SSG_PORTAL);
  assert.equal(p.stylingStrategy, 'MIXED_CSS_TAILWIND');
  assert.equal(p.techStack.hasAstro, true);
  assert.equal(p.techStack.hasBiome, true);
});

runTest('Detector: Correctly identifies Python Data/RAG Pipeline Headless (Python RAG Pipeline archetype)', () => {
  const p = detectProject(path.join(fixturesDir, 'python-rag-mock'));
  assert.equal(p.archetype, ARCHETYPES.DATA_PIPELINE_RAG);
  assert.equal(p.stylingStrategy, 'HEADLESS_NO_UI');
  assert.equal(p.techStack.hasPython, true);
});

runTest('Detector: Correctly identifies Fullstack Monorepo with Strict CSS (Enterprise Monorepo archetype)', () => {
  const p = detectProject(path.join(fixturesDir, 'strict-monorepo-mock'));
  assert.equal(p.archetype, ARCHETYPES.FULLSTACK_MONOREPO);
  assert.equal(p.stylingStrategy, 'STRICT_NO_TAILWIND');
  assert.equal(p.techStack.hasTurbo, true);
  assert.equal(p.techStack.hasNest, true);
});

// -----------------------------------------------------------------------------
// Test 2: Autonomous Investigation of "Otra" / Custom Tech
// -----------------------------------------------------------------------------
runTest('Advisor: Heuristic investigation of Bun and ElysiaJS', () => {
  const inv = investigateCustomChoice('stack', 'bun with elysia server');
  assert.equal(inv.recognized, true);
  assert.equal(inv.matchedTech, 'bun');
  assert.ok(inv.config.runtime.includes('Bun'));
});

runTest('Advisor: Heuristic investigation of FastAPI', () => {
  const inv = investigateCustomChoice('stack', 'fastapi backend');
  assert.equal(inv.recognized, true);
  assert.equal(inv.matchedTech, 'fastapi');
  assert.equal(inv.config.language, 'Python');
});

runTest('Advisor: Unrecognized custom tech adopts fallback zero-dep governance', () => {
  const inv = investigateCustomChoice('styling', 'custom-glamor-engine-v9');
  assert.equal(inv.recognized, false);
  assert.ok(inv.recommendation.includes('custom-glamor-engine-v9'));
  assert.ok(inv.config.rules.length >= 2);
});

// -----------------------------------------------------------------------------
// Test 3: Multi-Model Fleet Allocation & Context Budgeting
// -----------------------------------------------------------------------------
runTest('FleetManager: Allocates reasoning models to Data/Riker and economy to Wesley', () => {
  const fleet = allocateFleet(['claude-3-5-sonnet', 'claude-3-5-haiku'], 'anthropic');
  const roster = fleet.officerRoster;
  assert.equal(roster['William T. Riker (First Officer)'].model, 'claude-3-5-sonnet');
  assert.equal(roster['Lt. Cmdr. Data (Systems & Logic)'].model, 'claude-3-5-sonnet');
  assert.equal(roster['Ensign Wesley Crusher (Automation Runner)'].model, 'claude-3-5-haiku');
  assert.equal(roster['Ensign Wesley Crusher (Automation Runner)'].contextBudget.isConstrained, false);
});

runTest('FleetManager: Context Budgeting quarantines models with <= 32k context (Qwen 7b)', () => {
  const fleet = allocateFleet(['qwen2.5-coder-72b', 'qwen2.5-coder-7b'], 'qwen');
  const wesley = fleet.officerRoster['Ensign Wesley Crusher (Automation Runner)'];
  assert.equal(wesley.contextBudget.isConstrained, true);
  assert.equal(wesley.contextBudget.systemPromptBudget, 800);
  assert.equal(wesley.contextBudget.quarantineInSubagent, true);
});

// -----------------------------------------------------------------------------
// Test 4: Dynamic Skill Recommendations & Compaction
// -----------------------------------------------------------------------------
runTest('SkillEngine: Tailors skills by archetype (No UI skills in Data RAG)', () => {
  const ragSkills = recommendSkillsForArchetype('DATA_PIPELINE_RAG');
  assert.ok(ragSkills.includes('data-engineering-and-rag'));
  assert.ok(!ragSkills.includes('design-system-and-ui'), 'Data RAG must NOT include design-system-and-ui');

  const ssgSkills = recommendSkillsForArchetype('CONTENT_SSG_PORTAL');
  assert.ok(ssgSkills.includes('design-system-and-ui'));
  assert.ok(!ssgSkills.includes('data-engineering-and-rag'));
});

runTest('SkillEngine: Compaction fuses multiple raw skills into canonical domains', () => {
  const raw = [
    { name: 'owasp-top-10', content: 'Audit web vulnerabilities and SQL injections' },
    { name: 'semgrep-rules', content: 'Static analysis security scanner rules' },
    { name: 'color-tokens', content: 'Design system typography and contrast' },
    { name: 'button-styles', content: 'CSS UI components for buttons' }
  ];
  const fused = compactAndFuseSkills(raw);
  assert.equal(fused.length, 2);
  const security = fused.find(f => f.canonicalName === 'security-guardrails');
  const ui = fused.find(f => f.canonicalName === 'design-system-and-ui');
  assert.ok(security);
  assert.equal(security.originalCount, 2);
  assert.ok(ui);
  assert.equal(ui.originalCount, 2);
});

// -----------------------------------------------------------------------------
// Test 5: MCP Triad Configuration
// -----------------------------------------------------------------------------
runTest('McpEngine: Builds indispensable triad (context7, codebase-memory-mcp, github)', () => {
  const plan = buildMcpPlan({ hasAstro: true }, 'anthropic');
  assert.ok(plan.recommendedConfig['context7']);
  assert.ok(plan.recommendedConfig['codebase-memory-mcp']);
  assert.ok(plan.recommendedConfig['github']);
  assert.ok(plan.recommendedConfig['chrome-devtools'], 'Astro UI project must recommend devtools');
});

runTest('McpEngine: Replaces heavy GitHub MCP with lightweight gh CLI skill on small local models', () => {
  const plan = buildMcpPlan({}, 'qwen');
  assert.ok(plan.recommendedConfig['github-cli-fallback']);
  assert.equal(plan.recommendedConfig['github-cli-fallback'].type, 'NATIVE_CLI_SKILL');
  assert.ok(!plan.recommendedConfig['github']);
});

// -----------------------------------------------------------------------------
// Test 6: Intelligent Folder Distribution Suggestions (Atomic Design, etc.)
// -----------------------------------------------------------------------------
runTest('Advisor: Prioritizes Atomic Design UI recommendation for Astro stacks', () => {
  const questions = getTailoredQuestions({
    archetype: ARCHETYPES.CONTENT_SSG_PORTAL,
    techStack: { hasAstro: true }
  });
  const distQ = questions.find(q => q.id === 'file_distribution');
  assert.ok(distQ, 'file_distribution question must exist');
  assert.ok(distQ.options[0].includes('Atomic Design UI'), 'Atomic Design must be option #1 for Astro');
  assert.ok(distQ.options.includes('[Otra / Personalizada]'), 'Guaranteed [Otra] option must exist');
});

runTest('Advisor: Prioritizes Hexagonal Layers recommendation for Backend APIs', () => {
  const questions = getTailoredQuestions({
    archetype: ARCHETYPES.BACKEND_API_ONLY,
    techStack: { hasGo: true }
  });
  const distQ = questions.find(q => q.id === 'file_distribution');
  assert.ok(distQ.options[0].includes('Capas Hexagonales'), 'Hexagonal must be option #1 for Go backend');
});

// -----------------------------------------------------------------------------
// Test 7: Greenfield Scaffolding & End-to-End Governance Generation with Atomic Design
// -----------------------------------------------------------------------------
const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'iss-scaffold-'));

runTest('Scaffolder & Generator: End-to-end greenfield creation with live hooks and Atomic Design', () => {

  const testProjectDir = path.join(tmpBase, 'uss-defiant');
  scaffoldGreenfield(testProjectDir, {
    archetype: 'astro-portal',
    distribution: 'Atomic Design UI',
    projectName: 'uss-defiant'
  });

  // Verify physical Atomic Design directories
  assert.ok(fs.existsSync(path.join(testProjectDir, 'src/components/atoms')));
  assert.ok(fs.existsSync(path.join(testProjectDir, 'src/components/molecules')));
  assert.ok(fs.existsSync(path.join(testProjectDir, 'src/components/organisms')));
  assert.ok(fs.existsSync(path.join(testProjectDir, 'src/layouts')));
  assert.ok(fs.existsSync(path.join(testProjectDir, 'src/pages')));

  const profile = detectProject(testProjectDir);
  const fleet = allocateCrewToFleet(['gemini']);
  const mcpPlan = configureIndispensableTriad({ preferredModel: 'gemini' });

  const created = generateGovernanceArchitecture(testProjectDir, {
    archetype: profile.archetype,
    techStack: profile.techStack,
    file_distribution: 'Atomic Design UI (src/components/atoms, molecules, organisms, layouts, pages)',
    styling_strategy: 'MIXED_CSS_TAILWIND'
  }, fleet, mcpPlan);

  assert.ok(fs.existsSync(path.join(testProjectDir, '.agents/hooks.json')));
  assert.ok(fs.existsSync(path.join(testProjectDir, '.agents/hooks/tasha-security-shield.js')));
  assert.ok(fs.existsSync(path.join(testProjectDir, '.agents/hooks/crusher-health-check.js')));
  assert.ok(fs.existsSync(path.join(testProjectDir, '.agents/hooks/captains-log-writer.js')));

  // Verify Multi-AI Governance Contracts
  assert.ok(fs.existsSync(path.join(testProjectDir, 'CLAUDE.md')), 'CLAUDE.md must be generated');
  const claudeContent = fs.readFileSync(path.join(testProjectDir, 'CLAUDE.md'), 'utf-8');
  assert.ok(claudeContent.includes('Critical Guardrails'));
  assert.ok(claudeContent.includes('Ponytail Protocol'));
  assert.ok(claudeContent.includes('tasha-security-shield.js'));

  assert.ok(fs.existsSync(path.join(testProjectDir, '.cursorrules')), '.cursorrules must be generated');
  const cursorContent = fs.readFileSync(path.join(testProjectDir, '.cursorrules'), 'utf-8');
  assert.ok(cursorContent.includes('SECURITY PERIMETER - LT. TASHA YAR'));

  assert.ok(fs.existsSync(path.join(testProjectDir, '.windsurfrules')), '.windsurfrules must be generated');
  
  const agentsMd = fs.readFileSync(path.join(testProjectDir, 'Agents.md'), 'utf-8');
  assert.ok(agentsMd.includes('Mapeo Estructural y Jerarquía de Carpetas'));
  assert.ok(agentsMd.includes('Atomic Design UI'));
  assert.ok(agentsMd.includes('Lt. Tasha Yar'));
  assert.ok(agentsMd.includes('Lt. Worf'));

  // Test hook execution via node
  const tashaOutput = execSync(`node ${path.join(testProjectDir, '.agents/hooks/tasha-security-shield.js')} --test`, { encoding: 'utf-8' });
  assert.ok(tashaOutput.includes('Tactical shield online'));
  assert.ok(tashaOutput.includes('TASHA YAR'));

  const crusherOutput = execSync(`node ${path.join(testProjectDir, '.agents/hooks/crusher-health-check.js')} --test`, { encoding: 'utf-8' });
  assert.ok(crusherOutput.includes('Health check online'));
  assert.ok(crusherOutput.includes('Tailwind allowed: true'), 'Tailwind must be allowed when MIXED_CSS_TAILWIND is selected');

  // Clean up
  fs.rmSync(tmpBase, { recursive: true, force: true });
  if (fs.existsSync(fixturesDir)) {
    fs.rmSync(fixturesDir, { recursive: true, force: true });
  }
});

console.log('----------------------------------------------------');
console.log(`\x1b[1mRESULTS: ${passedTests}/${totalTests} Tests Passed.\x1b[0m\n`);

if (passedTests < totalTests) {
  process.exit(1);
}
