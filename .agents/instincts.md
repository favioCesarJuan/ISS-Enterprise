# 🧠 Tactical Instincts & Learned Heuristics for ISS-Enterprise

> **Source**: ISS-Enterprise Continuous Learning System (ECC Doctrine)  
> **Purpose**: Dynamic repository memory capturing non-obvious architecture patterns, debugging discoveries, and avoided pitfalls.

## 📌 Architecture & Design Instincts
### [Instinct #1]: Minimalist Ponytail Diffs
- Always prefer local refactoring and stdlib over new third-party dependencies.
- Keep file diffs atomic and verified before proposing further modifications.

### [Instinct #2]: Zero Runtime Dependencies Invariant
- The engine core in `bin/` and `src/` must exclusively consume native Node.js (`node:*`) modules.
- Under no circumstances install external npm packages for core runtime features.

### [Instinct #3]: Context Budget Conservation & BPE Optimization
- Always deliberate, inspect code, and parse ASTs in English to maximize BPE token efficiency (30% to 50% savings).
- Deliver user-facing summaries in the Captain's native language.

### [Instinct #4]: Sandboxed File System Permissions
- Local terminal commands running inside Antigravity sandboxes may encounter `EROFS` when modifying files outside the workspace.
- Prefer code editing tools or explicit user approval for git push operations.

## 📝 Session Discoveries & Avoided Traps
- **GitHub Rulesets vs Branch Protection Rules**: On modern GitHub repositories, `Rulesets` take precedence. Never attempt to force legacy branch protection over active Rulesets.
- **Node.js CI Caching**: For zero-dependency projects without `pnpm-lock.yaml`, do not pass `cache: 'pnpm'` to `actions/setup-node` in GitHub Actions.
