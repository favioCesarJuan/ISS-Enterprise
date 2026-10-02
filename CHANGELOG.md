# Changelog

All notable changes to the **ISS-Enterprise** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-10-02

### Added
- **Visual Architecture & Flowcharts**: Embedded native GitHub-flavored Mermaid diagrams explaining the full lifecycle, runtime security interceptor shields, and crew command hierarchy in both English (`README.md`) and Spanish (`README.es.md`).
- **First-class pnpm Support**: Documented and optimized `pnpm dlx iss-enterprise` as the primary invocation method. Clarified technical rationale: Zero Phantom Dependencies for agent execution security, and Content-Addressable Hard-Link Store for massive disk savings across workspaces.
- **Automated `pnpm-workspace.yaml` Generation**: Greenfield monorepo scaffolding now generates a native `pnpm-workspace.yaml` by default.
- **Dual Binary Aliases**: Added `iss-enterprise` alongside `iss` in `package.json` bin mapping.
- **Community Governance & Contribution Guide**: Added [CONTRIBUTING.md](CONTRIBUTING.md) detailing development setup, Zero-Dependencies architectural invariants, and PR guidelines.
- **Continuous Integration Workflow**: Added GitHub Actions pipeline (`.github/workflows/ci.yml`) testing across Node.js 18.x, 20.x, and 22.x.

### Fixed
- **Test Portability**: Fully decoupled the automated test suite (`test/suite.js`) from local absolute paths. Tests now generate dynamic, isolated mock archetypes in `os.tmpdir()`, achieving 100% test reproducibility across all platforms, CI runners, and sandboxes (15/15 tests passing).
- **npm Package Distribution Whitelist**: Explicitly scoped the `files` field in `package.json` to prevent packaging test fixtures or temporary run directories into npm tarballs.

---

## [1.0.0] - 2026-09-29

### Added
- **Tactical Archetype Scanner** (`src/detector.js`): Zero-config detection for Monorepos, Astro SSG Portals, Python Data/RAG Pipelines, Backend APIs, and Greenfield bases.
- **Interactive Advisor with Heuristic Investigation** (`src/advisor.js`): Dynamic tailoring with guaranteed `[Otra / Personalizada]` write-ins and autonomous inference for unlisted tech stacks (Bun, Elysia, FastAPI, Rust, Go, Flutter, SolidJS).
- **Heterogeneous Fleet Allocator & Context Budgeting** (`src/fleet-manager.js`): Support for Gemini, Claude, DeepSeek, Qwen, OpenAI, and Ollama with context quarantining for <=32k models.
- **Anti-Collision Skill Engine** (`src/skill-engine.js`): Dynamic skill recommendations and compaction into 6 canonical domains.
- **Indispensable MCP Triad** (`src/mcp-engine.js`): Automated provisioning of context7, codebase-memory-mcp, and github (with native `gh` CLI fallback).
- **Physical Scaffolder & Governance Generator** (`src/scaffolder.js`, `src/generator.js`): Greenfield layouts, Atomic Design directory trees, and physical hooks (Lt. Tasha Yar Security Shield, Dr. Crusher Health Check, Captains Log Writer).
- **Tactical Test Suite** (`test/suite.js`): Verification runner for archetypes, fleet quotas, and hook executions.
