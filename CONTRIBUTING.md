# Contributing to ISS-Enterprise

Welcome! We appreciate contributions helping make **ISS-Enterprise** (*Intelligent Stack Scaffolding for Enterprise*) a clean, deterministic multi-stack governance CLI.

---

## Core Architectural Invariant: Zero Runtime Dependencies

**ISS-Enterprise strictly requires ZERO external runtime dependencies.**

- Every line in `bin/` and `src/` must exclusively use Node.js built-in modules (`node:fs`, `node:path`, `node:readline`, `node:child_process`, `node:assert/strict`, `node:os`, etc.).
- Do **NOT** add external npm runtime dependencies (`dependencies` must stay absent/empty — never add `chalk`, `commander`, `yargs`, `axios`, `glob`).
- `typescript` and `@types/node` are permitted strictly under **`devDependencies`** for static verification (`pnpm run typecheck` via JSDoc + `checkJs: true` + `types/index.d.ts`). All CLI commands and tests must remain 100% runnable without `pnpm install`.
- External tools configured for target projects (Vitest, Playwright, Semgrep, Astro, Ruff) remain target project tools, never runtime dependencies of ISS-Enterprise itself.

---

## Local Development Setup

```bash
git clone https://github.com/favioCesarJuan/ISS-Enterprise.git
cd ISS-Enterprise
node -v             # >= 18.0.0 required
pnpm test           # or: node ./test/suite.js
pnpm run typecheck  # after pnpm install: strict tsc --noEmit check
```

---

## Testing Guidelines

Before submitting any Pull Request:

1. All tests in `test/suite.js`, `node ./bin/iss.js doctor`, and `pnpm run typecheck` (`tsc --noEmit`) must pass cleanly with `0` errors.
2. Never hardcode absolute local paths in tests or committed fixtures; use `os.tmpdir()` cleanly and clean up temporary folders in `finally` blocks.
3. Keep all committed files free of third-party trademarks. Keep personal or private theme overrides exclusively outside Git via `.agent-theme.local.json` / `.agents/theme.local.json`.
4. Keep `.agents/hooks/*` byte-for-byte synchronized with `STNG-framework/.agents/hooks/`.

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` A new capability, role mapping, or stack signature.
- `fix:` Bug fixes, edge-case handling, or test repairs.
- `docs:` Documentation improvements or bilingual parity updates.
- `refactor:` Clean structural improvements preserving behavior.
- `test:` Adding or updating verification suites.

---

## License
By contributing to ISS-Enterprise, you agree that your contributions are licensed under the project's [MIT License](LICENSE).
