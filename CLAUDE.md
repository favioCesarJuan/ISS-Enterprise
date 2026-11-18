# Claude Guidelines for ISS-Enterprise

> **Role**: Multi-Stack Governance & Scaffolding CLI (`src/`)  
> **Theme**: `standard` default (`--theme=starfleet` optional; Zero Theatrical Filler)

## Critical Guardrails
1. **Zero Runtime Dependencies**: Only use Node.js `>=18.0.0` stdlib (`node:*`).
2. **Canonical Hooks**: Deploy physical hooks from `.agents/hooks/` (never inline degraded hook strings).
3. **MCP Schema**: Always emit `.mcp/mcp-servers.config.json` with the `{ "mcpServers": { ... } }` root key.
4. **Verification**: Run `node ./test/suite.js`, `node ./bin/iss.js doctor`, and `node examples/quickstart-demo.js` after any edit.
