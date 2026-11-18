# ISS-Enterprise Operational Manual

## 1. Architecture Boundary (Option A)
- **STNG-framework** owns the deterministic runtime hooks (`.agents/hooks/`).
- **ISS-Enterprise** detects project stacks, allocates model budgets, compacts skills, generates multi-AI contracts (`Agents.md`, `CLAUDE.md`, `.cursorrules`, `.windsurfrules`), and deploys the canonical hooks.

## 2. Theme Toggle (`src/themes.js`)
- Default: `standard` (`AGENT_THEME=standard`).
- Optional: `starfleet` via `--theme=starfleet` on `iss apply` / `iss init`, or `AGENT_THEME=starfleet` in `.agents/.env`.
- `printCrewThemeNotice(theme)` prints the full role-to-crew mapping and confirms `0` extra output tokens (`Zero Theatrical Filler`).

## 3. Verification Commands
```bash
node ./test/suite.js
node ./bin/iss.js doctor
node examples/quickstart-demo.js
```
