# Contributing to ISS-Enterprise

Welcome aboard, Officer! We are thrilled you want to help make **ISS-Enterprise** an even more formidable multi-agent scaffolding and governance dreadnought.

This document outlines the guidelines, invariants, and best practices for contributing to the project.

---

## 🌟 Core Architectural Invariant: Zero Runtime Dependencies

**ISS-Enterprise strictly requires ZERO runtime dependencies.**

- Every line in `bin/` and `src/` must exclusively utilize Node.js built-in modules (`node:fs`, `node:path`, `node:readline`, `node:child_process`, `node:assert/strict`, `node:os`, etc.).
- Do **NOT** install or add external npm runtime dependencies (e.g. `chalk`, `commander`, `yargs`, `axios`, `glob`).
- External frameworks mentioned in the advisor (like Vitest, Playwright, Semgrep, Astro) are tools that ISS-Enterprise **scaffolds and configures for user projects**, never dependencies of ISS-Enterprise itself.

This zero-dependency guarantee ensures:
1. Instant installation and execution via `pnpm dlx iss-enterprise` or `npx iss-enterprise`.
2. Total immunity to runtime supply-chain attacks.
3. Minimalist, audit-friendly codebase.

---

## 🛠️ Local Development Setup

We strongly recommend using **pnpm** for local development:

```bash
# 1. Clone the repository
git clone https://github.com/favioCesarJuan/ISS-Enterprise.git
cd ISS-Enterprise

# 2. Verify Node.js version (>=18.0.0 required)
node -v

# 3. Run the automated verification suite
pnpm test
# Or: node test/suite.js
```

---

## 🧪 Testing Guidelines

Before submitting any Pull Request:

1. All 15 tests in `test/suite.js` must pass.
2. If adding support for new frameworks or heuristic detection:
   - Add corresponding test cases in `test/suite.js`.
   - Never use absolute file paths in tests (e.g. `/home/user/...`). Use dynamic mock structures created in `os.tmpdir()` to keep tests portable across all operating systems and CI runners.

Run tests locally:
```bash
pnpm test
```

---

## 🚀 Proposing Features

### 1. New Archetypes & Heuristic Detections
- Propose additions to `src/detector.js` if you identify an emerging ecosystem or common pattern (e.g., SvelteKit, Deno, Swift/Vapor).
- Add heuristic rules to `TECH_KNOWLEDGE_BASE` in `src/advisor.js` to enrich the autonomous investigation engine for unlisted choices (`[Otra / Personalizada]`).

### 2. New Crew Officers or Tactical Roles
- Roles must adhere to the Star Trek TNG thematic immersion while fulfilling a concrete software engineering or security domain.
- Define their focus area in `src/fleet-manager.js` and update documentation tables accordingly.

---

## 📝 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new capability, officer, or detection signature.
- `fix:` Bug fixes, test repairs, or edge-case handling.
- `docs:` Documentation improvements or translations.
- `refactor:` Code restructuring without changing behavior.
- `test:` Adding or updating tests.

---

## 📄 License

By contributing to ISS-Enterprise, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
