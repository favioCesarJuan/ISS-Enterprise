# ⚔️ ISS-Enterprise: Universal Multi-Agent Scaffolding Engine & Tactical CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](https://nodejs.org/)
[![Architecture](https://img.shields.io/badge/Architecture-Multi--Agent%20Tactical%20Fleet-red.svg)](#)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20Runtime-green.svg)](#)

> *"In the Mirror Universe, the ISS Enterprise is not an exploratory vessel—she is an armored dreadnought forged for tactical superiority, uncompromising discipline, and rapid planetary conquest."*

**ISS-Enterprise** is a generalist, cross-stack scaffolding CLI and multi-agent governance engine. It transforms any codebase—or creates new ones from scratch—into an autonomous, self-healing software engineering dreadnought powered by specialized AI agent personas and deterministic model hooks.

Available in English and Spanish ([README en Español](README.es.md)).

---

## ⚡ Key Capabilities

### 1. 🛰️ Cross-Stack Archetype Scanner
Zero-configuration scanner detects heterogeneous stacks and automatically configures appropriate officer rosters, hooks, and skills:
- **Fullstack Monorepos** (Turborepo, Next.js, NestJS, React Native / Expo, Drizzle ORM).
- **Content Portals & SSG** (Astro, Biome, Playwright, mixed CSS + Tailwind).
- **Data Engineering & RAG Pipelines** (Python, Vector DBs, Docker, headless data scraping).
- **Backend APIs & Microservices** (Go, Rust, FastAPI, NestJS).
- **Greenfield / Empty Starbases** (Scaffolds physical project trees and starter code from scratch).

### 2. 🧠 Interactive Advisor with Guaranteed Custom Write-In ("Otra")
Never trapped in rigid presets. Every multiple-choice question provides `[Otra / Personalizada]`:
- Selecting `[Otra]` triggers the **Autonomous Heuristic Investigation Engine** (`investigateCustomChoice`), inferring optimal linters, directory structures, and architecture conventions for unlisted frameworks (e.g. Bun, Elysia, FastAPI, SolidJS, custom internal engines).

### 3. 🤖 Mixed-Fleet Orchestration & Context Budgeting
Seamlessly coordinates heterogeneous model fleets (Google Gemini, Anthropic Claude, DeepSeek, Alibaba Qwen, OpenAI, local Ollama):
- **Large Context Allocation (>=128k - 1M tokens)**: Assigned to high-reasoning roles (Commander Riker, Lt. Cmdr. Data, Q) for complex architecture, AST refactors, and cascade impact analysis.
- **Constrained Context Quarantining (8k - 32k tokens)**: Assigned to fast economy roles (Ensign Wesley Crusher) with lean system prompts (under 800 tokens) and quarantined subagent execution.
- **Cognitive Language Protocol**: Inbound and outbound communications mirror the Captain's native language (e.g. Spanish), while internal deliberation and AST operations run in English for **30% to 50% BPE token savings**.

### 4. 🎨 Adaptive Styling Governance (Never Hardcoded)
Adapts styling rules to the project's actual architecture:
- **Permissive Mixed Mode** (e.g. `cosmo-hub`): TailwindCSS utilities paired with CSS Modules.
- **Strict Prohibition Mode** (e.g. `extra-time`): Pure CSS3 + CSS Modules; Dr. Crusher's hook blocks Tailwind injection.
- **Native StyleSheet Mode**: React Native / Expo zero-abstraction layout.
- **Headless Mode**: Completely disables UI/CSS linting for data pipelines, microservices, and CLIs.

### 5. 🗜️ Dynamic Skill Engine & Anti-Collision Compactor
Prevents instruction bloat and prompt collisions by compacting unlimited raw skills into 6 canonical pillars:
1. `security-guardrails` (Lt. Cmdr. Worf: Semgrep, OWASP Top 10, Strix Red Team)
2. `design-system-and-ui` (Counselor Troi: WCAG AAA, UI tokens, CSS/Tailwind governance)
3. `code-health-and-ponytail` (Dr. Crusher: Ponytail protocol, YAGNI, zero-polling)
4. `fullstack-architecture` (Lt. Cmdr. Geordi: Monorepos, DDD, Hexagonal boundaries)
5. `data-engineering-and-rag` (Lt. Cmdr. Data: Vector retrieval, ETL pipelines)
6. `workflow-and-coordination` (Commander Riker: Strict TDD, Vitest/Pytest/Playwright)

### 6. 🔌 Indispensable MCP Triad
Deploys and pre-approves the three essential Model Context Protocol servers:
1. **context7**: Live 2026 official documentation lookup without hallucinations.
2. **codebase-memory-mcp**: Persistent knowledge graph and Cypher queries for call-chain tracing.
3. **github**: Version control, pull request management, and automated issue reviews (with automatic lightweight `gh` CLI fallback for local small models).

---

## 🚀 Quickstart

### Inspect Any Project
Scan any repository to detect archetype, styling rules, tech stack, and recommended agent roster:
```bash
# In the project directory:
npx iss-enterprise inspect

# Or inspect a specific target path:
npx iss-enterprise inspect /path/to/my-project

# JSON output for automated pipelines:
npx iss-enterprise inspect /path/to/my-project --json
```

### Initialize Agent Governance
Launch the interactive tactical wizard to tailor hooks, skills, and model allocations:
```bash
npx iss-enterprise init

# Or accept optimal automated defaults:
npx iss-enterprise init --yes
```

### Forge a Greenfield Project
Scaffold a brand-new project from scratch:
```bash
npx iss-enterprise new alpha-station
```

### Compact & Fuse Overlapping Skills
Eliminate duplicate instructions and compress `.agents/skills` into canonical pillars:
```bash
npx iss-enterprise skills compact
```

### Configure MCP Triad
Generate `.mcp/mcp-servers.config.json` with the indispensable sensor array:
```bash
npx iss-enterprise mcps
```

---

## 👑 Command Hierarchy (The ISS Tactical Crew)

| Officer | Corporate Role | Focus Domain |
| :--- | :--- | :--- |
| **Captain (You)** | Human Executive | Requirements, architecture approval, strategic direction |
| **Commander William T. Riker** | Lead AI Orchestrator | Task planning, subagent delegation, TDD execution |
| **Lt. Cmdr. Data** | Systems & Logic | Algorithms, RAG pipelines, state machines, formal logic |
| **Lt. Cmdr. Geordi La Forge** | Chief Engineer | Monorepo packages, build performance, Docker |
| **Lt. Cmdr. Worf** | Tactical Security | Security shields, Semgrep static analysis, command intercept |
| **Counselor Deanna Troi** | Design & UX | Design systems, WCAG AAA accessibility, styling hygiene |
| **Dr. Beverly Crusher** | Health & Quality | Ponytail protocol (YAGNI, minimal diffs), no-polling hook |
| **Ensign Wesley Crusher** | Automation Runner | Fast scripts, test execution (Vitest, Pytest, Playwright) |
| **Q (The Q Continuum)** | Omniscient Meta-Critic | Timeline analysis, bias challenge, chaos trials |

---

## 🧪 Automated Test Suite

ISS-Enterprise includes a comprehensive test suite covering all archetypes, heuristic investigations, context budgeting rules, and physical hook executions:

```bash
npm test
```

```
🛸 ISS-ENTERPRISE TACTICAL TEST RUNNER
----------------------------------------------------
  ✔ Detector: Correctly identifies Astro SSG with Mixed Styling (cosmo-hub)
  ✔ Detector: Correctly identifies Python Data/RAG Pipeline Headless (inAstraCaeli)
  ✔ Detector: Correctly identifies Fullstack Monorepo with Strict CSS (extra-time)
  ✔ Advisor: Heuristic investigation of Bun and ElysiaJS
  ✔ Advisor: Heuristic investigation of FastAPI
  ✔ Advisor: Unrecognized custom tech adopts fallback zero-dep governance
  ✔ FleetManager: Allocates reasoning models to Data/Riker and economy to Wesley
  ✔ FleetManager: Context Budgeting quarantines models with <= 32k context (Qwen 7b)
  ✔ SkillEngine: Tailors skills by archetype (No UI skills in Data RAG)
  ✔ SkillEngine: Compaction fuses multiple raw skills into canonical domains
  ✔ McpEngine: Builds indispensable triad (context7, codebase-memory-mcp, github)
  ✔ McpEngine: Replaces heavy GitHub MCP with lightweight gh CLI skill on small local models
  ✔ Scaffolder & Generator: End-to-end greenfield creation with live hooks
----------------------------------------------------
RESULTS: 13/13 Tests Passed.
```

---

## 📄 License

MIT © [Favio Cesar Juan](https://github.com/favioCesarJuan)
