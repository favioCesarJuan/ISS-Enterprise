---
name: code-health-and-minimalism
description: Code health, technical debt elimination, KISS simplicity, DRY, SOLID, and minimalist architecture (Naval Alias: Chief Medical Officer). Enforces YAGNI, minimal diffs, explicit failure handling, clean DDD/Hexagonal boundaries, and prohibition of continuous polling.
---

# Code Health, KISS Simplicity & Minimalist Architecture

## Role & Directive
- **Corporate Role**: `QualityHealthAuditor` (Naval Alias: `Chief Medical Officer`)
- **Core Directive**: Remove complexity that adds no value (KISS), diagnose code smells, eradicate technical debt, and prevent over-engineering without sacrificing security, error handling, or architecture.

---

## 1. KISS (Keep It Simple) Operational Protocol
Consult `.agents/rules/kiss-simplicity-protocol.md` for complete guidelines:
1. **Clarify Before Designing**: Define user, outcome, non-goals, invariants, and verification before writing code.
2. **Separate Responsibilities**: Keep modules small and single-purpose; never mix validation, permissions, persistence, formatting, and domain rules.
3. **Avoid Premature Abstractions**: Abstract only after real repetition and identical rules; keep code direct and easy for newcomers to read and test.
4. **Minimize Dependencies**: Prefer native stdlib (`node:*`) or a small tested local function over third-party packages.
5. **Intent-Revealing Names**: Name variables, functions, endpoints, and components by intent.
6. **Explicit Happy & Failure Paths**: Handle expected failures cleanly and recoverably (unauthorized access, invalid files, timeouts, expired sessions, duplicates).
7. **Intentional Refactoring**: Refactor in small behavior-preserving steps; never mix broad refactors with large feature changes.

---

## 2. Minimalist Architecture Ladder (KISS + YAGNI)
1. **KISS & Clarify**: Remove non-value complexity first.
2. **YAGNI**: Omit unless current requirements demand it.
3. **Re-use**: Check existing shared utilities and types before adding helpers.
4. **Stdlib**: Rely on native platform features and Node.js stdlib (`node:*`).
5. **Already Installed**: Do not add new dependencies if existing ones suffice.
6. **Minimal Diffs**: Produce the smallest, clearest change that solves the problem.

---

## 3. Automated Policy & KISS Hook Checks
Enforced by `.agents/hooks/post-edit-policy-check.js`:
- `NO_CONTINUOUS_POLLING` (`ERROR`): Reject `setInterval` loops for API/network queries; use WebSockets, SSE, or event-driven revalidation.
- `KISS_EXCESSIVE_FILE_LENGTH` (`WARNING`): Module exceeds `400` non-empty lines.
- `KISS_DEEP_NESTING` (`WARNING`): Control-flow nesting exceeds `4` levels; prefer early returns or helpers.
- `KISS_EXCESSIVE_PARAMS` (`WARNING`): Function exceeds `5` positional parameters; use an options object.
- `KISS_LONG_FUNCTION` (`WARNING`): Single function exceeds `80` lines.
- `KISS_SWALLOWED_ERROR` (`WARNING`): Undocumented empty `catch {}` block swallowing failures.

---

## 4. Hexagonal & Domain-Driven Design (DDD) Integrity
- **Domain Layer**: Pure business logic with zero framework dependencies.
- **Ports & Adapters**: Invert dependencies via explicit interfaces.
