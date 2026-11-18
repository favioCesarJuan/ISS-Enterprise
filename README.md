# ISS-Enterprise (Multi-Stack Governance & Scaffolding CLI)

> **Companion CLI to `STNG-framework`** — Auto-detects project archetypes, configures multi-model fleets, compacts agent skills, deploys canonical deterministic hooks, and audits governance drift (`iss doctor`). Zero external runtime dependencies (Node.js `>=18.0.0`).

---

## 30-Second Quickstart Demo

Run the reproducible demo in under 1 second with zero external dependencies:

```bash
node examples/quickstart-demo.js
# Or with optional Starfleet crew aliases (0 extra output tokens):
node examples/quickstart-demo.js --theme=starfleet
```

Run the full test suite (28 tests) and governance audit:

```bash
node ./test/suite.js
node ./bin/iss.js doctor
```

---

## Implemented CLI Commands (`bin/iss.js`)

| Command | Alias | Purpose |
| :--- | :--- | :--- |
| `iss apply [dir] [--dry-run] [--theme=standard\|starfleet]` | `engage`, `arm` | One-shot non-interactive deployment of hooks, roles, MCP config, and Git pre-commit guard. |
| `iss doctor [dir]` | `audit` | Audits `.agents/hooks.json`, hook files, `.agents/roles/` (or legacy `.agents/crew/`), `.mcp/mcp-servers.config.json`, Node CVE baseline, and `.semgrep.yml`. |
| `iss inspect [dir] [--json]` | — | Detects project archetype (`FULLSTACK_MONOREPO`, `CONTENT_SSG_PORTAL`, `DATA_PIPELINE_RAG`, `BACKEND_API_ONLY`, `MOBILE_CROSS_PLATFORM`, `CHROME_EXTENSION_V3`, `SYSTEM_PERFORMANCE_CLI`, `STANDALONE_SCRIPT_PROTOTYPE`, `GREENFIELD_EMPTY`). |
| `iss init [dir] [--yes] [--dry-run] [--theme=...]` | — | Interactive wizard (or `--yes` preset mode) generating governance artifacts and printing the theme role notice. |
| `iss new <name> [dir]` | — | Scaffolds a new greenfield project and initializes governance. |
| `iss skills list\|compact\|create` | — | Lists, compacts into canonical domains, or creates new `SKILL.md` templates with prompt-injection screening. |
| `iss mcps [dir\|warmup]` | — | Writes `.mcp/mcp-servers.config.json` (`{ mcpServers: ... }`) or runs `codebase-memory-mcp index .`. |
| `iss advise [dir] [--yes]` | `advisor` | Evaluates lifecycle stage (Greenfield / Active / Maintenance) and reports missing governance pieces. |
| `iss update [dir] [--check] [--yes]` | — | Checks upstream repository and applies updates behind the Quadruple Security Gate with backup/rollback. |

---

## Optional Starfleet Theme (`--theme=starfleet`)

By default, `iss` deploys **standard functional naming** (`theme: "standard"`).
Passing `--theme=starfleet` (or setting `AGENT_THEME=starfleet` in `.agents/.env`) switches hook log prefixes and audit timestamps to Starfleet crew labels with **0 extra output tokens** (`Zero Theatrical Filler`).

| Corporate Role | Optional Starfleet Alias | Project Responsibility |
| :--- | :--- | :--- |
| Human / Product Owner | Captain Jean-Luc Picard | Project authority, requirements, sign-off |
| Lead AI Orchestrator | Cmdr. William T. Riker | Task decomposition, subagent coordination |
| Systems & Logic Analyst | Lt. Cmdr. Data | Algorithms, state machines, workspace DAG |
| Architecture Lead | Lt. Cmdr. Geordi La Forge | Monorepo boundaries, build & CI pipelines |
| Security Guardrail | Lt. Cmdr. Worf / Lt. Tasha Yar | Pre-tool shell/path guard, Semgrep SAST, skill scan |
| Quality & Health Auditor | Dr. Beverly Crusher | Post-edit policy check, YAGNI minimalism |
| Design System & UX | Counselor Deanna Troi | CLI ergonomics, WCAG accessibility, styling policy |
| Test Automation Runner | Ensign Wesley Crusher | Fast unit tests, linters, subagent execution |
| Meta-Critic Evaluator | Q | Adversarial edge-case review, doc-to-code parity |

---

## Status & Roadmap Honesty
- **Implemented & Tested:** Archetype detector, lifecycle advisor, fleet allocator (`gemini-2.5-pro`, `gemini-2.5-flash`, `claude-3-7-sonnet`, etc.), skill compactor/scanner, MCP planner (`mcpServers` schema), physical hook deployment, `doctor` audit, and `themes.js`.
- **Optional External Tools:** `semgrep`, `skillspector`, `ollama`, and `gh` enhance scans/workflows when present on `PATH`; built-in Node.js checks work offline without them.
