# ISS-Enterprise (*Intelligent Stack Scaffolding for Enterprise*)

> **Flexible Multi-Stack Governance & Scaffolding CLI (Companion to `STNG-framework`)** — Interviews users to understand project context, domain, and invariants; auto-detects heterogeneous stacks; allocates multi-model fleets (with cross-model Lower-Deck Cold Review); compacts agent skills; generates adaptive governance contracts & `.semgrep.yml`; and audits spec/governance drift (`iss doctor`). Zero external runtime dependencies (`Node.js >= 18.0.0`).

---

## Positioning: `ISS-Enterprise` vs. `STNG-framework`
- **`STNG-framework`**: Opinionated deterministic core runtime (hooks, rules, canonical skills, monorepo cascade scoping).
- **`ISS-Enterprise`**: Flexible, interactive scaffolding & governance orchestrator built for **any project layout** — JS/TS monorepos, Astro SSG, Next.js App Router, NestJS, Expo/React Native, Flutter, Python (FastAPI/Django/Flask/RAG), Go, Rust, Chrome Extensions (MV3), and standalone CLIs.

---

## 30-Second Quickstart Demo (Simulation Sandbox)

```bash
node examples/quickstart-demo.js
# Public-domain Naval Command theme (Bridge / Lower Deck / Sim Deck):
node examples/quickstart-demo.js --theme=naval
# Private local theme resolved dynamically from untracked JSON outside Git:
node examples/quickstart-demo.js --theme=local
```

Run the automated test suite, governance audit, and optional static TypeScript check:

```bash
node ./test/suite.js
node ./bin/iss.js doctor
pnpm run typecheck   # Strict tsc --noEmit verification via JSDoc + types/index.d.ts
```

---

## Key Capabilities Implemented

1. **Interactive Context & Domain Discovery (`src/advisor.js`, `src/generator.js`)**:
   - Captures lifecycle stage, `project_summary`, `project_domain`, `domain_invariants`, `project_non_goals`, architecture pattern, folder distribution, styling policy, linters, `shield_rigidity`, and theme into **`.agents/project-context.json`**.
   - Infers language-specific `test`, `lint`, and `build` commands automatically (`pytest`/`ruff`, `go test`, `cargo test`, `flutter test`, `bun test`, `pnpm test`/`biome`).
   - Preserves `.agents/instincts.md` notes and previously confirmed context on re-runs unless `--force` / `--reconfigure` is passed; emits an **AI Discovery Gate** in `CLAUDE.md` when initialized non-interactively (`interviewCompleted: false`).
   - Every tailored question offers a `[Otra / Personalizada]` write-in backed by heuristic investigation (`investigateCustomChoice`).
2. **Adaptive Multi-Stack Generator & Scaffolder (`src/generator.js`, `src/scaffolder.js`, `src/detector.js`)**:
   - Scaffolds greenfield repositories including Monorepos, Astro Atomic Design portals, Python RAG/FastAPI, Go, Rust, and minimal layouts.
   - Deploys `.agents/hooks/` selectively (`monorepo-cascade-scope.js` only on monorepos; omits `ux-design-enforcer.md` on headless APIs/CLIs), generates language-matched `.semgrep.yml` (JS/TS, Python, Go, Rust), arms staged-file `.git/hooks/pre-commit`, and optionally generates `docs/designs/001-initial-architecture.md`.
3. **Lower-Deck Cross-Model Cold Review & SDD Drift (`src/fleet-manager.js`, `src/spec-checker.js`)**:
   - Assigns a distinct cross-model `HIGH_REASONING` reviewer for `Meta-Critic Evaluator` (`Lower-Deck Evaluator`) when multiple providers exist, paired with a `FAST_ECONOMY` paraphraser in `ZERO_CONTEXT_READ_ONLY` isolation.
   - Scaffolds SDD specs (`iss spec new <slug>`) and checks `APPROVED` specs against disk paths and staleness (`iss spec check` + `iss doctor`).
4. **KISS Heuristics & Rigidity Modes (`post-edit-policy-check.js`, `pre-tool-shell-guard.js`)**:
   - Enforces `KISS_EXCESSIVE_FILE_LENGTH` (>400), `KISS_DEEP_NESTING` (>4), `KISS_EXCESSIVE_PARAMS` (>5), `KISS_LONG_FUNCTION` (>80), and `KISS_SWALLOWED_ERROR`, across `standard`, `strict`, and `fast-track` rigidity levels.

---

## CLI Commands (`bin/iss.js`)

| Command | Alias | Purpose |
| :--- | :--- | :--- |
| `iss apply [dir] [--dry-run] [--theme=standard\|naval\|local]` | `engage`, `arm` | Non-interactive deployment of hooks, roles, MCP config, `.agents/project-context.json`, and Git pre-commit guard (`--dry-run` simulates without touching disk). |
| `iss init [dir] [--yes] [--dry-run] [--force] [--init-spec] [--theme=...]` | — | Interactive context/domain/stack interview wizard (or `--yes` preset mode) generating adaptive governance assets. |
| `iss inspect [dir] [--json]` | — | Detects project archetype, detected tech stack, styling policy, fleet providers, and recommended skills. |
| `iss new <name> [dir]` | — | Scaffolds a greenfield project (Monorepo, Astro, Python RAG, Backend API Go/Rust/FastAPI, Minimal, or Custom) and initializes governance. |
| `iss doctor [dir]` | `audit` | Audits `.agents/hooks.json`, hook executables, `.agents/roles/`, `.agents/project-context.json`, `.mcp/mcp-servers.config.json`, `.gitignore` secret & `theme.local.json` privacy, Node CVE baseline, `.semgrep.yml`, and SDD spec drift. |
| `iss spec new <slug> [dir] \| check [dir] [--json]` | `spec drift` | Creates SDD specification templates (`docs/designs/<slug>.md`) and checks spec-to-code path drift and staleness. |
| `iss theme [dir]` | — | Displays active theme mode (`standard`, `naval`, `local`), resolved zones (`Bridge`, `Lower Deck`, `Sim`), and role mappings. |
| `iss skills list\|compact\|create [dir]` | — | Lists, compacts into canonical domains, or creates `SKILL.md` files with prompt-injection screening (`validateSkillSafety`). |
| `iss mcps [dir\|warmup]` | — | Writes `.mcp/mcp-servers.config.json` (`{ mcpServers: ... }`) with local-model substitution or runs `codebase-memory-mcp index .`. |
| `iss advise [dir] [--yes]` | `advisor` | Evaluates lifecycle stage (Greenfield / Active / Maintenance) and saves `.agents/project-profile.json`. |
| `iss update [dir] [--check] [--yes]` | — | Evaluates upstream updates inside a Quarantined Quadruple Security Gate with automatic backup and rollback. |

---

## Governance Themes: `standard`, `naval` & Private `local`

- **`standard` (Default)**: Clean corporate engineering terminology (`Core Governance`, `Stateless Subagents`, `Simulation Sandbox`).
- **`naval` (`--theme=naval` / `AGENT_THEME=naval`)**: 100% public-domain maritime hierarchy separating long-context **Bridge** officers from stateless zero-context **Lower-Deck** subagents, plus **Sim Deck** simulations and `Mission YYYY.DDD` clock formatting (`0` extra output tokens with `Zero Theatrical Filler`).
- **`local` (`--theme=local` / `AGENT_THEME=local` / `AGENT_THEME_FILE=<path>`)**: Resolves private labels, roles, and simulation bay names dynamically at runtime from untracked JSON outside Git (`.agents/theme.local.json`, `.agent-theme.local.json` up to 3 parent workspace dirs, or `~/.config/agent-governance/theme.local.json`). Private names are never written into committed files, and `iss doctor` warns if `.agents/theme.local.json` is not ignored in `.gitignore`.

Example untracked `.agent-theme.local.json`:

```json
{
  "name": "Alpha Private Theme",
  "clockPrefix": "Cycle",
  "zones": { "bridge": "DeckAlpha", "lowerDeck": "SubDeck", "simBay": "SimArena" },
  "labels": { "guard": "[ALPHA GUARD]", "sim": "[SIM-ARENA]" },
  "roles": { "orchestrator": "AlphaLead" }
}
```

| Corporate Role | Naval Alias | Deck | Project Responsibility |
| :--- | :--- | :--- | :--- |
| Human / Product Owner | Captain | Bridge | Project authority, requirements, final `APPROVED` sign-off |
| Lead AI Orchestrator | First Officer | Bridge | Task decomposition, subagent coordination, Cold Review triage |
| Systems & Logic Analyst | Science & Logic Officer | Bridge | Algorithms, state machines, workspace DAG |
| Architecture Lead | Chief Engineer | Bridge | Monorepo & multi-stack boundaries, build & CI pipelines |
| Security Guardrail | Security Officer | Bridge | Pre-tool shell/path guard, Semgrep SAST, skill scan |
| Quality & Health Auditor | Chief Medical Officer | Bridge | Post-edit policy check, KISS/YAGNI/DRY/SOLID minimalism |
| Design System & UX | UX & Comms Officer | Bridge | CLI ergonomics, WCAG accessibility, styling policy |
| Test Automation Runner | Lower-Deck Runner | Lower Deck | Stateless unit tests & linters inside Simulation Sandbox (`Sim Deck`) |
| Meta-Critic Evaluator | Lower-Deck Evaluator | Lower Deck | Zero-context 3-gate Cold Review (`Paraphraser`, `Critic`, `Verifier`) |

---

## Architecture Decision: Zero-Build ESM Runtime + Strict JSDoc Type Safety

`ISS-Enterprise` uses pure zero-runtime-dependency **ES Modules (`.js`)** (`Node.js >= 18.0.0`) statically verified with **TypeScript (`tsc --noEmit`)**:
- **Instant Execution Across Polyglot Projects**: `npx` / `node ./bin/iss.js` and deployed self-contained `.agents/hooks/*.js` run immediately in JS/TS, Python, Go, Rust, or Flutter repos without compilation steps, `tsc`, or `node_modules` supply-chain exposure.
- **Full Static Type Safety**: `tsconfig.json` (`strict: true`, `allowJs: true`, `checkJs: true`, `noEmit: true`) validates `bin/`, `src/`, `.agents/hooks/`, `examples/`, and `test/` against shared domain contracts in `types/index.d.ts` (`"types"` in `package.json`).
- **Dev-Only Tooling**: `typescript` and `@types/node` reside strictly in `devDependencies`; runtime `dependencies` remain empty (`0`).

---

## Status & External Tooling
- **Implemented & Tested:** Archetype detector, interactive context/domain advisor, heterogeneous fleet allocator (cross-model Cold Review routing), skill compactor/scanner, MCP triad planner, adaptive multi-stack generator/scaffolder, `doctor` + `spec-checker.js`, and shared `theme-loader.js`.
- **Optional External Tools:** `semgrep`, `skillspector`, `ollama`, and `gh` enhance scans/workflows when installed on `PATH`; built-in Node.js checks run offline without them.
