# Agents.md — ISS-Enterprise

> **Engine**: `iss-enterprise` (*Intelligent Stack Scaffolding for Enterprise*, `v2.1.0`)  
> **Theme**: `standard` default (`--theme=naval` public-domain maritime, or `--theme=local` private runtime override)

| Corporate Role | Naval Alias | Deck | Responsibility |
| :--- | :--- | :--- | :--- |
| Human / Product Owner | Captain | Bridge | Authority, requirements, approval |
| Lead AI Orchestrator | First Officer | Bridge | Task decomposition, CLI orchestration |
| Systems & Logic Analyst | Science & Logic Officer | Bridge | Archetype detection, DAG, skill compaction |
| Architecture Lead | Chief Engineer | Bridge | Scaffolding, CI pipelines, workspace boundaries |
| Security Guardrail | Security Officer | Bridge | Pre-tool guard, Quadruple Security Gate |
| Quality & Health Auditor | Chief Medical Officer | Bridge | KISS/YAGNI minimalism, post-edit policy checks |
| Design System & UX | UX & Comms Officer | Bridge | CLI prompts, styling policy, bilingual docs |
| Test Automation Runner | Lower-Deck Runner | Lower Deck | Stateless tests & simulations in Sim Deck (`test/suite.js`, `iss doctor`) |
| Meta-Critic Evaluator | Lower-Deck Evaluator | Lower Deck | Zero-context 3-gate Cold Review (`Paraphraser`, `Critic`, `Verifier`) |

**Zero Theatrical Filler**: Never emit roleplay dialogue even when `AGENT_THEME=naval` or `AGENT_THEME=local` is active.
