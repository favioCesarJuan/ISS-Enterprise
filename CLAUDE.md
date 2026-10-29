# 🛸 Claude Guidelines for ISS-Enterprise

> Governed by **ISS-Enterprise Tactical Multi-Agent Framework**
> Archetype: **HIGH_PERF_SYSTEM_CLI**

## 🛡️ Critical Guardrails
1. **Security**: NEVER execute catastrophic commands (`rm -rf /`, wildcards on root, piped remote curl to bash, `chmod 777`).
2. **Quality & Health (Ponytail Protocol)**:
   - BAN continuous polling (`setInterval(() => fetch(...))`). Use WebSockets, SSE, or reactive events.
   - Maintain Zero Runtime Dependencies: Core engine in `src/` and `bin/` must ONLY use native Node.js (`node:*`) modules.
3. **Architecture & File Placement**:
   - Follow structural hierarchy: Modular single-purpose files in `src/`. Do not create arbitrary top-level folders.

## 🔄 Research-First Engineering Loop (ECC Doctrine)
Before writing or mutating code:
1. **Plan & Trace**: Read relevant AST relations or codebase files. Formulate atomic plan.
2. **Test First**: Write or identify the verification test reproducing the issue or defining acceptance.
3. **Implement**: Minimalist diff strictly adhering to project conventions.
4. **Verify**: Run `pnpm test` (or `node test/suite.js`) and ensure all 27/27 tests pass.
5. **Remember**: If an unexpected trap or quirk is discovered, record it in `.agents/instincts.md`.

## ⚡ Primary Commands
- Run verification tests: `pnpm test` (or `node test/suite.js`)
- Run governance & security audit: `node ./bin/iss.js doctor` (or `pnpm audit`)
- Check security shield: `node .agents/hooks/tasha-security-shield.js --test`
- Check health & styling: `node .agents/hooks/crusher-health-check.js --test`
- Run lifecycle advisor: `node ./bin/iss.js advise`
- Check upstream updates: `node ./bin/iss.js update --check`
- Tactical Crew Roster & Roles: Inspect `Agents.md` and `.agents/crew/*.md`
- Learned Project Memory: Consult `.agents/instincts.md`
