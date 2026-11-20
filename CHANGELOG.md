# Changelog

All notable changes to the **ISS-Enterprise** (*Intelligent Stack Scaffolding for Enterprise*) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - 2026-11-20

### Added
- **Zero-Build TypeScript Verification (`tsconfig.json`, `types/index.d.ts`, JSDoc `strict: true`)**: Added strict `tsc --noEmit` static verification (`checkJs: true`, `allowJs: true`) across all 22 JS modules (`bin/`, `src/`, `.agents/hooks/`, `examples/`, `test/`) with `0` external runtime dependencies.
- **CI Integration**: Added a dedicated `typecheck` job in `.github/workflows/ci.yml` while keeping runtime/test matrix zero-install.

### Fixed
- **Updater & CLI Hardening (`src/updater.js`, `src/cli.js`, `src/generator.js`)**: Excluded `node_modules/`, `.git/`, and `.agents.backup.*` from quarantine copies, stripped `#` comments before `.sh` Gate 1 checks, added `--source=` forwarding in `iss update`, and sanitized `.cursorrules` template documentation wording against Gate 1 false positives.

---

## [2.0.0] - 2026-11-19

### Added
- **Context & Domain Discovery Interview (`src/advisor.js`, `src/generator.js`)**: Tailored questions capturing `project_summary`, `project_domain`, `domain_invariants`, `project_non_goals`, and verification commands into `.agents/project-context.json`, with AI Discovery Gate in `CLAUDE.md` when unconfirmed.
- **Public-Domain Naval & Private Local Theme Engine (`src/themes.js`, `.agents/hooks/theme-loader.js`)**: Standardized `standard`, public-domain `naval` (`Bridge`, `Lower Deck`, `Sim Deck`), and untracked `local` theme overrides outside Git (`iss theme`).
- **Stateless Lower-Deck Cold Review & SDD Checker (`src/fleet-manager.js`, `src/spec-checker.js`, `iss spec`)**: Cross-model `Lower-Deck Evaluator` allocation for 3-gate Cold Reviews and deterministic SDD spec-to-code drift audits in `iss doctor`.
- **Adaptive Multi-Stack Generator & Scaffolder**: Selective monorepo/frontend rules, multi-language `.semgrep.yml` (JS/Python/Go/Rust), Go/Rust/FastAPI scaffolding, and `KISS` post-edit heuristics.

---

## [1.3.1] - 2026-10-29

### Added
- **Semgrep SAST & AST Perimeter**: Integrated `.semgrep.yml` rules into generator and root repo to prevent continuous polling violations, command injection in `child_process`, and hardcoded credentials.
- **Node.js Runtime CVE Baseline (`iss doctor`)**: Enhanced `src/auditor.js` to inspect active runtime against Node.js CVE baselines.
- **Agent Skill Security & SkillSpector Integration**: Added `validateSkillSafety` in `src/skill-engine.js` to quarantine prompt injections and tool exfiltration, plus SkillSpector readiness check in `iss doctor`.

---

## [1.3.0] - 2026-10-16

### Added
- **Continuous Learning Instincts (`.agents/instincts.md`)**: Repository memory preserving learned architecture patterns and avoided pitfalls.
- **AgentShield MCP & Secret Leaks Auditor (`iss doctor` / `iss audit`)**: Audited MCP command injection patterns, plaintext secret leaks in `.mcp/mcp-servers.config.json`, and `.gitignore` coverage.
- **Research-First Engineering Loop**: Integrated `Plan -> Cold Review -> Test -> Implement -> Verify -> Record` into generated `CLAUDE.md` contracts.

---

## [1.2.0] - 2026-10-02

### Added
- **Multi-AI Engine Governance Contracts**: Dynamically generated `CLAUDE.md`, `.cursorrules`, `.windsurfrules`, and `Agents.md`.
- **One-Shot `apply` Command**: Non-interactive deployment of governance assets and Git pre-commit hooks.

---

## [1.1.0] - 2026-10-02

### Added
- **First-class pnpm Support**: Optimized for `pnpm` hardlinked security and `pnpm-workspace.yaml` monorepos.
- **Continuous Integration Workflow**: GitHub Actions pipeline (`.github/workflows/ci.yml`) testing Node.js 18.x, 20.x, and 22.x.
- **Test Portability**: Isolated mock archetypes in `os.tmpdir()` (`test/suite.js`).

---

## [1.0.0] - 2026-09-29

### Added
- **Archetype Detector** (`src/detector.js`): Zero-config detection for Monorepos, Astro SSG, Python RAG, Backend APIs, Mobile, and Extensions.
- **Interactive Advisor** (`src/advisor.js`): Tailored questions with `[Otra / Personalizada]` write-ins and heuristic investigation.
- **Multi-Model Fleet Allocator** (`src/fleet-manager.js`), **Skill Compactor** (`src/skill-engine.js`), **MCP Triad** (`src/mcp-engine.js`), and deterministic hooks in `.agents/hooks/`.
