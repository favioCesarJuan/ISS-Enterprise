# Zero-Context Cold Review Rubric & Report Standard

> **Owner**: `MetaCriticEvaluator` (Naval Alias: `Lower-Deck Evaluator`, `Deck: LOWER_DECK`)  
> **Mode**: Stateless, Read-Only, Zero Prior Conversation Context

---

## 1. Gate 1 — Lower-Deck Paraphraser (`FAST_ECONOMY`)
A fresh reviewer reading *only* the specification must answer in 3–5 bullets:
1. What problem does this change solve and who/what triggers it?
2. Which modules/files are modified vs. created (`NEW`)?
3. What is explicitly out of scope (non-goals)?
4. How is success verified deterministically?

- **PASS**: Paraphrase aligns with the spec without needing external chat history.
- **ABORT (`AMBIGUOUS_SPEC`)**: Reviewer must guess missing definitions, ownership, or boundaries — if a requirement cannot be summarized clearly in 3–5 bullets without verbal/historical context, it violates KISS clarity.

---

## 2. Gate 2 — Lower-Deck Critic: Heilmeier 6-Point & Adversarial Checklist
Evaluate every Vital Logic spec against these six constraints:
1. **Objective**: What are you trying to do, articulated without jargon?
2. **Current Baseline & Failure**: How is it done today, and what fails or is missing?
3. **What Is New**: What specific mechanism or contract changes, and why will it succeed?
4. **Risks & Failure Modes**: What breaks under offline state, malformed input, missing binaries, or concurrency?
5. **Cost, Complexity, KISS & YAGNI**: Reject premature abstractions, unnecessary external dependencies, duplicated business/permission rules, and missing expected failure paths; prefer stdlib/existing helpers and fewer moving parts.
6. **Verification Criteria**: What exact commands, tests, and exit checks falsify completion?

Also verify parity against `memory.md` ADRs and `.agents/instincts.md` (no continuous polling, strict styling policy, zero unapproved runtime deps).

---

## 3. Gate 3 — Lower-Deck Verifier: Implementation Readiness Checklist
- [ ] Frontmatter contains valid `id`, `title`, `status`, `track`, and `target_files`.
- [ ] Every existing path in `target_files` exists on disk (verify via read-only tools / `codebase-memory-mcp`).
- [ ] New files to be created are explicitly labeled `NEW`.
- [ ] Public function names, CLI flags, and schemas are exact (no `TBD` placeholders).
- [ ] Verification commands are concrete and runnable offline inside the Simulation Sandbox / Sim Deck.

---

## 4. Structured Cold Review Report Template

```markdown
## Cold Review Verdict: PASS | ABORT (<REASON_CODE>)
- **Spec**: <path>
- **Isolation**: Zero-Context Read-Only (Lower Deck)
- **Reviewer Model**: <model-id> (Cross-Model: true|false)

### Gate 1 — Paraphrase Summary
- <3-5 bullets summarizing understanding strictly from the spec>

### Findings
| ID | Severity | Gate | Section / File | Failure Mode & Required Fix | Resolution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F-01 | BLOCKER | Gate 2 | ... | ... | PENDING / ACCEPT_FIX / CONTEST_WITH_RATIONALE |
```
