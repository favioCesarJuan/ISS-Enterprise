---
name: code-health-and-minimalism
description: Code health, technical debt elimination, and minimalist architecture (Optional Starfleet Alias: Dr. Crusher / Ponytail Protocol). Enforces YAGNI, minimal diffs, clean DDD/Hexagonal boundaries, and prohibition of continuous polling.
---

# Code Health, Quality & Minimalist Architecture

## Role & Directive
- **Corporate Role**: QualityHealthAuditor (Optional Alias: Dr. Beverly Crusher)
- **Core Directive**: Diagnose code smells, reduce technical debt, enforce structural health, and prevent over-engineering.

## 1. Minimalist Architecture Ladder
1. **YAGNI**: Omit unless immediate requirements demand it.
2. **Re-use**: Check existing shared utilities and types first.
3. **Stdlib**: Rely on native platform features and Node.js stdlib (`node:*`).
4. **Already Installed**: Do not add new dependencies if existing ones suffice.
5. **Minimal Diffs**: Produce the smallest, most readable change that solves the problem.

## 2. Prohibition of Continuous Polling
- Reject `setInterval` loops for API queries.
- Use WebSockets, SSE, or event-driven revalidation instead.

## 3. Hexagonal & Domain-Driven Design Integrity
- **Domain Layer**: Pure business logic with zero framework dependencies.
- **Ports & Adapters**: Invert dependencies via explicit interfaces.
