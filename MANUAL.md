# ISS-Enterprise Operational Manual

> **Intelligent Stack Scaffolding for Enterprise (`iss-enterprise` v2.1.0)** — Adaptive multi-stack governance CLI with zero external runtime dependencies (`Node.js >= 18.0.0`).

---

## 1. Architecture Boundary with `STNG-framework`
- **`STNG-framework`**: Owns the canonical deterministic hooks in `.agents/hooks/`, rules, and monorepo core templates.
- **`ISS-Enterprise`**: Interviews developers to understand any project's context, domain, invariants, and stack; allocates multi-model fleets; compacts skills; generates adaptive contracts and multi-language `.semgrep.yml`; scaffolds greenfield projects; and audits drift via `iss doctor`.

---

## 2. Full CLI Reference (`bin/iss.js`)
- `iss inspect [dir] [--json]` — Scans repository manifests to infer archetype, tech stack flags (`hasNext`, `hasAstro`, `hasExpo`, `hasFlutter`, `hasPython`, `hasFastApi`, `hasDjango`, `hasFlask`, `hasGo`, `hasRust`, `hasVite`, `hasBiome`, `hasTurbo`), styling mode, fleet providers, and recommended skills.
- `iss init [dir] [--yes] [--dry-run] [--force|--reconfigure] [--init-spec] [--theme=standard|naval|local]` — Launches the interactive context/domain/stack interview or applies defaults with `--yes`.
- `iss apply [dir] [--dry-run] [--force] [--init-spec] [--theme=standard|naval|local]` (aliases: `engage`, `arm`) — One-shot shorthand equivalent to `iss init --yes`.
- `iss new <name> [dir]` — Interactive greenfield scaffolder supporting `monorepo`, `astro-portal`, `python-rag`, `backend-api` (FastAPI, NestJS, Go, Rust), `minimal`, or custom architecture inputs (`investigateCustomChoice`), followed by automatic governance initialization.
- `iss doctor [dir] [--no-exit]` (alias: `audit`) — Verifies `.agents/hooks.json`, physical hook files (`theme-loader.js`, `pre-tool-shell-guard.js`, `edit-circuit-breaker.js`, `post-edit-policy-check.js`, `audit-log-writer.js`, `skill-security-scanner.js`), `.agents/roles/`, `.agents/project-context.json`, `.mcp/mcp-servers.config.json` (command injection & plaintext token checks), `.gitignore` hygiene (`.env` & `.agents/theme.local.json`), Node.js CVE baseline, `.semgrep.yml`, and `APPROVED` SDD specs.
- `iss spec new <slug> [dir] [--title=...] [--dry-run] [--force]` — Creates an SDD spec under `docs/designs/<slug>.md` with sanitized path slug protection.
- `iss spec check [dir] [--json] [--no-exit]` (alias: `spec drift`) — Audits SDD specs against disk files and staleness thresholds.
- `iss theme [dir]` — Displays active theme mode (`standard` / `naval` / `local`), resolved config source, Deck zones (`Bridge`, `Lower Deck`, `Sim`), and role mappings (`src/themes.js`).
- `iss skills list|compact|create [dir] [--dry-run]` — Lists recommended domains, fuses overlapping skills into canonical `.agents/skills/<domain>/SKILL.md` pillars (quarantining prompt injections), or scaffolds a new skill.
- `iss mcps [dir|warmup]` — Generates `.mcp/mcp-servers.config.json` (using `gh-cli-fallback` on <=32k local models) or indexes the repository with `codebase-memory-mcp`.
- `iss advise [dir] [--yes]` (alias: `advisor`) — Runs lifecycle gap analysis and writes `.agents/project-profile.json`.
- `iss update [dir] [--check] [--yes]` — Clones upstream into a quarantine temp dir, runs the Quadruple Security Gate, backs up `.agents/`, applies updates, and rolls back automatically on post-test failure.

---

## 3. Context Interview, `.agents/project-context.json` & AI Discovery Gate
During `iss init`, `getTailoredQuestions` asks:
1. Lifecycle stage (`Greenfield`, `In Construction`, `Maintenance`).
2. `project_summary` (1–2 sentence goal & target user).
3. `project_domain` (SaaS, Fintech, Healthcare/PII, E-Commerce, Content Portal, CLI/DevTool, Data/RAG, or Custom).
4. `domain_invariants` (KISS + explicit errors, financial decimal/idempotency, PII privacy, offline-first, low latency, or Custom).
5. `project_non_goals` (explicit scope exclusions).
6. Architecture pattern, stack-ordered folder distribution, adaptive styling policy, stack-ordered linter, `shield_rigidity` (`standard` | `strict` | `fast-track`), and theme (`standard` | `naval` | `local`).

When executed non-interactively (`--yes` / `apply`) without prior confirmed context, `CLAUDE.md` includes an **AI Discovery Gate** instructing coding agents to confirm purpose, invariants, non-goals, and verification commands before modifying domain code. Re-running `iss apply` preserves `.agents/instincts.md` and `interviewCompleted: true` context unless `--force` / `--reconfigure` is supplied.

---

## 4. Multi-Model Fleet & Cross-Model Lower-Deck Cold Review (`src/fleet-manager.js`)
- Splits roles across **Bridge** (`HIGH_REASONING` long-context roles) and **Lower Deck** (stateless `ZERO_CONTEXT_READ_ONLY` / `FAST_ECONOMY` subagents).
- Context Budgeting automatically enables `quarantineInSubagent: true`, `systemPromptBudget: 800`, and `chunkLimitLines: 50` for models with `<= 32768` tokens (e.g., Qwen 7B–72B).
- When multiple providers are detected, `selectCrossModelReviewer` assigns a distinct provider's `HIGH_REASONING` model to `Meta-Critic Evaluator` (`Lower-Deck Evaluator`) while assigning `FAST_ECONOMY` to Gate 1 paraphrasing (`paraphraseModel`).
- Emits `.env.fleet.example`, `scripts/pull-fleet-models.sh`, and `scripts/warmup-mcp.sh`.

---

## 5. Multi-Stack Adaptation & Rigidity (`src/generator.js`)
- Copies `theme-loader.js` plus core hooks into every target project; copies `monorepo-cascade-scope.js` only when monorepo signals exist; omits `ux-design-enforcer.md` on headless projects.
- Generates language-specific `.semgrep.yml` rulesets for `python`, `go`, `rust`, or `javascript/typescript`.
- Writes `.git/hooks/pre-commit` to scan staged files (`git diff --cached --name-only --diff-filter=ACMR`) via `post-edit-policy-check.js`.
- Writes `SHIELD_RIGIDITY=standard|strict|fast-track` into `.agents/.env`.

---

## 6. Private Local Theme Guide (`standard` / `naval` / `local`)
- `standard`: Functional corporate labels (`Simulation Sandbox`, `[SECURITY GUARD]`).
- `naval`: Public-domain maritime labels (`Bridge`, `Lower Deck`, `Sim Deck`, `[SECURITY OFFICER]`, `Mission YYYY.DDD`).
- `local`: Reads private overrides at runtime without persisting private strings into tracked repo files (`Agents.md`, `CLAUDE.md`, `config/models.config.json`). Lookup order:
  1. `AGENT_THEME_FILE`
  2. `<projectRoot>/.agents/theme.local.json`
  3. `<projectRoot>/.agent-theme.local.json` (and up to 3 parent workspace directories)
  4. `~/.config/agent-governance/theme.local.json`

Schema example:
```json
{
  "name": "Alpha Private Theme",
  "clockPrefix": "Cycle",
  "zones": { "bridge": "DeckAlpha", "lowerDeck": "SubDeck", "simBay": "SimArena" },
  "labels": { "guard": "[ALPHA GUARD]", "sim": "[SIM-ARENA]" },
  "roles": { "orchestrator": "AlphaLead", "testRunner": "SubDeck Runner", "metaCritic": "SubDeck Evaluator" }
}
```
Activate via `--theme=local` or `AGENT_THEME=local`. Keep `.agents/theme.local.json` and `.agent-theme.local.json` in `.gitignore` (`iss doctor` verifies this automatically).

---

## 7. Zero-Build ESM Runtime & Static Type Safety (`tsc --noEmit`)
All source modules (`src/`, `bin/`, `.agents/hooks/`) run natively on `Node.js >= 18.0.0` ESM JavaScript with **0 external runtime dependencies** and zero compilation steps, while remaining strictly type-checked via `tsconfig.json` (`strict: true`, `allowJs: true`, `checkJs: true`, `noEmit: true`), JSDoc, and [types/index.d.ts](types/index.d.ts) so CLI scaffolding and self-contained hooks work identically across polyglot targets (Python, Go, Rust, Flutter, JS/TS). `typescript` and `@types/node` are confined strictly to `devDependencies`.

```bash
node ./test/suite.js
node ./bin/iss.js doctor
node examples/quickstart-demo.js
pnpm run typecheck   # Strict tsc --noEmit verification (devDependencies)
```
