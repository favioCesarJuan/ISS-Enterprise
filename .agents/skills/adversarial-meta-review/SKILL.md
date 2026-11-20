---
name: adversarial-meta-review
description: Zero-context adversarial cold review, bias destruction, and doc-to-code parity verification orchestrated by MetaCriticEvaluator (Naval Alias: Lower-Deck Evaluator). Enforces stateless 3-gate Pass/Abort checks on Vital Logic specs before implementation.
---

# Adversarial Meta-Review & Zero-Context Cold Review

## Role & Directive
- **Corporate Role**: `MetaCriticEvaluator` (Naval Alias: `Lower-Deck Evaluator`, `Deck: LOWER_DECK`)
- **Context Isolation Invariant**: Must execute as a **stateless, read-only Lower-Deck subagent** with an empty conversation history. Receives ONLY the target spec path (e.g., `docs/designs/<slug>.md` or `spec.md`) and explicitly cited source files — never prior Bridge brainstorming or drafting chat.
- **No-Glazing Output Rule**: Zero praise or theatrical filler. Every finding must state severity (`BLOCKER` | `MAJOR` | `MINOR`), exact section or file reference, and concrete failure mode.

---

## 1. Dual-Track Trigger Policy
- **Mandatory (Vital Logic)**: New features, architecture changes, auth/security flows, database/schema changes, offline sync queues, and multi-package refactors.
- **Exempt (Fast Path)**: Visual CSS layout, copy updates, translation files, and trivial single-file fixes — protects token budgets.

---

## 2. Three-Gate Staged Pass/Abort Pipeline (Lower-Deck Squadron)
Consult `references/cold-review-rubric.md` for detailed grading criteria and report format.

1. **Gate 1 — Lower-Deck Paraphraser (`FAST_ECONOMY` tier)**
   - Summarize the spec's goal, scope, and explicit non-goals in 3–5 concise bullets strictly from the written document without guessing missing intent.
   - If the paraphrase diverges from stated objectives or relies on unstated assumptions -> **`ABORT (AMBIGUOUS_SPEC)`**.

2. **Gate 2 — Lower-Deck Critic: Adversarial & Heilmeier Gate (Cross-Model `HIGH_REASONING` when available)**
   - Challenge confirmation bias, YAGNI violations, security/failure boundaries (offline mode, malformed inputs, missing binaries, concurrency), and contradictions with `memory.md` ADRs or `.agents/instincts.md`.
   - Any `BLOCKER` finding -> **`ABORT (DESIGN_GAP)`**.

3. **Gate 3 — Lower-Deck Verifier: Implementation Readiness & Code-Reality Gate (Read-Only + `codebase-memory-mcp`)**
   - Verify every cited file path and symbol exists in the repository (or is explicitly tagged `NEW`), interface contracts are unambiguous, and verification commands are falsifiable.
   - Unresolved paths or ambiguous contracts -> **`ABORT (NOT_READY)`**; otherwise **`PASS (READY_FOR_SIGN_OFF)`**.

---

## 3. Arbitration, Sign-Off & Audit Ledger
- **Author Triage**: `LeadAIOrchestrator` (`First Officer`) classifies each finding as `ACCEPT_FIX` (update spec) or `CONTEST_WITH_RATIONALE`.
- **Human Sign-Off**: `Human / Product Owner` (`Captain`) promotes spec `status` from `DRAFT` / `IN_REVIEW` to `APPROVED` before implementation begins.
- **Audit Logging**: Record lifecycle milestones (`spec_drafted`, `cold_review_abort`, `cold_review_pass`, `spec_approved`) via `.agents/hooks/audit-log-writer.js`.
