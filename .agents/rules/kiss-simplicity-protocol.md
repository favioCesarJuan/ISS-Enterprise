# KISS Simplicity Protocol (Keep It Simple)

> **Core Principle**: Keep every solution as simple as possible without sacrificing quality, architecture, or error handling. Simplicity removes complexity that adds no value.

---

## 1. Six Criteria of Simple Software
A solution satisfies KISS when:
1. The primary execution flow is immediately clear to a reader.
2. Responsibilities are separated into small, focused modules.
3. Expected error paths have explicit, recoverable handling.
4. Business and security rules are never duplicated with minor variations.
5. Tests describe observable, important behavior without brittle coupling.
6. The team can modify the module confidently without excessive historical context.

---

## 2. Why KISS Improves Security
- Duplicated permission checks, hidden validations, unmaintained dependencies, and sprawling exception branches obscure visibility and create security gaps.
- Simple rules are auditable; simple permissions are testable; simple deployments are easy to roll back.

---

## 3. Seven Operational KISS Practices
1. **Clarify the Problem Before Designing**: Identify who has the problem, the required outcome, explicit non-goals, inviolable rules, and acceptance criteria. If a requirement cannot be explained in a few sentences, it is not ready for code.
2. **Split Responsibilities into Small Modules**: Avoid mixing input validation, authorization, queries, formatting, and domain rules in a single class or function.
3. **Avoid Premature Abstractions**: Before adding generic layers, verify: (a) has this repetition occurred multiple times, (b) is the underlying rule truly identical, (c) does the abstraction simplify testing, (d) will a newcomer grasp it fast, and (e) what is the cost to change later?
4. **Minimize External Dependencies**: Prefer Node.js stdlib or a small well-tested local helper over importing third-party libraries for simple tasks.
5. **Write Intent-Revealing Names**: Choose clear names for variables, functions, endpoints, and components so intent is self-documenting.
6. **Design Happy Paths and Expected Failures**: Explicitly handle unauthorized users, rejected payments, unresponsive external APIs, malformed files, expired sessions, and duplicate records—fail clearly and recoverably.
7. **Refactor with Intention**: Make small, behavior-preserving structural improvements when signals appear; never mix broad refactors with large feature changes.

---

## 4. Warning Signs a Module Needs KISS
- Engineers avoid touching a specific module.
- A small change forces edits across many files.
- Similar business rules are duplicated with subtle tweaks.
- Tests fail for unrelated reasons; onboarding relies on long verbal explanations.
- External dependencies are added for trivial utilities; docs describe more exceptions than main flow.

---

## 5. Automated Hook Enforcement
Enforced on every edit via `.agents/hooks/post-edit-policy-check.js`:
- `KISS_EXCESSIVE_FILE_LENGTH` (`>400` non-empty lines)
- `KISS_DEEP_NESTING` (`>4` nested control blocks)
- `KISS_EXCESSIVE_PARAMS` (`>5` positional parameters)
- `KISS_LONG_FUNCTION` (`>80` lines per function)
- `KISS_SWALLOWED_ERROR` (undocumented empty `catch {}` blocks)
