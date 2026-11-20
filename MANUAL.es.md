# Manual Operativo de ISS-Enterprise

> **Intelligent Stack Scaffolding for Enterprise (`iss-enterprise` v2.1.0)** — CLI adaptativo multi-stack sin dependencias externas en runtime (`Node.js >= 18.0.0`).

---

## 1. Frontera de Arquitectura con `STNG-framework`
- **`STNG-framework`**: Mantiene los hooks deterministas canónicos en `.agents/hooks/`, reglas base y plantillas core para monorepos.
- **`ISS-Enterprise`**: Entrevista al desarrollador sobre contexto, dominio, invariantes y tecnologías de cualquier proyecto; asigna flotas multi-modelo; compacta skills; genera contratos y `.semgrep.yml` por lenguaje; crea proyectos greenfield; y audita deriva mediante `iss doctor`.

---

## 2. Referencia Completa de CLI (`bin/iss.js`)
- `iss inspect [dir] [--json]` — Analiza manifiestos del repositorio e infiere arquetipo, flags de stack (`hasNext`, `hasAstro`, `hasExpo`, `hasFlutter`, `hasPython`, `hasFastApi`, `hasDjango`, `hasFlask`, `hasGo`, `hasRust`, `hasVite`, `hasBiome`, `hasTurbo`), estrategia de estilos, flota y skills recomendadas.
- `iss init [dir] [--yes] [--dry-run] [--force|--reconfigure] [--init-spec] [--theme=standard|naval|local]` — Ejecuta la entrevista de contexto/dominio/stack o aplica valores por defecto con `--yes`.
- `iss apply [dir] [--dry-run] [--force] [--init-spec] [--theme=standard|naval|local]` (alias: `engage`, `arm`) — Atajo no interactivo equivalente a `iss init --yes`.
- `iss new <nombre> [dir]` — Generador greenfield interactivo (`monorepo`, `astro-portal`, `python-rag`, `backend-api` FastAPI/NestJS/Go/Rust, `minimal` o arquitectura personalizada via `investigateCustomChoice`) seguido de inicialización de gobernanza.
- `iss doctor [dir] [--no-exit]` (alias: `audit`) — Verifica `.agents/hooks.json`, archivos ejecutables de hooks (`theme-loader.js`, `pre-tool-shell-guard.js`, `edit-circuit-breaker.js`, `post-edit-policy-check.js`, `audit-log-writer.js`, `skill-security-scanner.js`), `.agents/roles/`, `.agents/project-context.json`, `.mcp/mcp-servers.config.json` (inyección de comandos y secretos en texto plano), higiene en `.gitignore` (`.env` y `.agents/theme.local.json`), baseline CVE de Node.js, `.semgrep.yml` y specs SDD `APPROVED`.
- `iss spec new <slug> [dir] [--title=...] [--dry-run] [--force]` — Crea una especificación SDD bajo `docs/designs/<slug>.md` sanitizando traversal en el slug.
- `iss spec check [dir] [--json] [--no-exit]` (alias: `spec drift`) — Verifica existencia de `target_files` en disco y obsolescencia de specs.
- `iss theme [dir]` — Muestra el tema activo (`standard` / `naval` / `local`), ruta resuelta, zonas (`Bridge`, `Lower Deck`, `Sim`) y tabla de roles (`src/themes.js`).
- `iss skills list|compact|create [dir] [--dry-run]` — Lista skills recomendadas, compacta en dominios canónicos (poniendo en cuarentena patrones de prompt injection) o crea nuevas plantillas `SKILL.md`.
- `iss mcps [dir|warmup]` — Escribe `.mcp/mcp-servers.config.json` (con fallback `gh-cli-fallback` en modelos locales <=32k) o indexa el repositorio con `codebase-memory-mcp`.
- `iss advise [dir] [--yes]` (alias: `advisor`) — Evalúa brechas según etapa del ciclo de vida y guarda `.agents/project-profile.json`.
- `iss update [dir] [--check] [--yes]` — Evalúa actualizaciones upstream en cuarentena tras 4 compuertas de seguridad, crea respaldo de `.agents/` y realiza rollback automático si fallan las autopruebas.

---

## 3. Entrevista de Contexto, `.agents/project-context.json` y AI Discovery Gate
Durante `iss init`, `getTailoredQuestions` consulta:
1. Etapa del ciclo de vida (`Greenfield`, `En Construcción`, `Mantenimiento`).
2. `project_summary` (propósito y usuario objetivo en 1–2 frases).
3. `project_domain` (SaaS, Fintech, Salud/PII, E-commerce, Portal, CLI/DevTool, Datos/RAG o Personalizado).
4. `domain_invariants` (KISS + fallas explícitas, precisión decimal/idempotencia, privacidad PII, offline-first, baja latencia o Personalizado).
5. `project_non_goals` (qué queda explícitamente fuera de alcance).
6. Patrón de arquitectura, distribución de carpetas ordenada por stack, estilos, linter ordenado por stack, `shield_rigidity` (`standard` | `strict` | `fast-track`) y tema (`standard` | `naval` | `local`).

Al inicializar sin entrevista interactiva (`--yes` / `apply`) sin contexto previo confirmado, `CLAUDE.md` emite un **AI Discovery Gate** indicando a los agentes confirmar propósito, invariantes, non-goals y comandos de verificación antes de tocar lógica de dominio. Al re-ejecutar `iss apply` sin `--force`, se preservan `.agents/instincts.md` y el contexto ya confirmado.

---

## 4. Flota Multi-Modelo y Cold Review Cross-Model en Lower Deck (`src/fleet-manager.js`)
- Separa roles en **Bridge** (`HIGH_REASONING` de contexto largo) y **Lower Deck** (subagentes sin historial `ZERO_CONTEXT_READ_ONLY` / `FAST_ECONOMY`).
- El presupuesto de contexto activa `quarantineInSubagent: true`, `systemPromptBudget: 800` y `chunkLimitLines: 50` en modelos de `<= 32768` tokens (p. ej. Qwen 7B–72B).
- Cuando existen múltiples proveedores, `selectCrossModelReviewer` asigna un modelo `HIGH_REASONING` de otro proveedor a `Meta-Critic Evaluator` (`Lower-Deck Evaluator`) y un modelo `FAST_ECONOMY` al Gate 1 (`paraphraseModel`).
- Genera `.env.fleet.example`, `scripts/pull-fleet-models.sh` y `scripts/warmup-mcp.sh`.

---

## 5. Adaptación Multi-Stack y Rigidez (`src/generator.js`)
- Despliega `theme-loader.js` junto con los hooks canónicos; incluye `monorepo-cascade-scope.js` solo en monorepos; omite `ux-design-enforcer.md` en proyectos headless.
- Genera `.semgrep.yml` adaptado a `python`, `go`, `rust` o `javascript/typescript`.
- Configura `.git/hooks/pre-commit` inspeccionando solo archivos staged (`git diff --cached --name-only --diff-filter=ACMR`) mediante `post-edit-policy-check.js`.
- Escribe `SHIELD_RIGIDITY=standard|strict|fast-track` en `.agents/.env`.

---

## 6. Guía de Tema Local Privado (`standard` / `naval` / `local`)
- `standard`: Nomenclatura técnica corporativa (`Simulation Sandbox`, `[SECURITY GUARD]`).
- `naval`: Alias marítimos de dominio público (`Bridge`, `Lower Deck`, `Sim Deck`, `[SECURITY OFFICER]`, `Mission YYYY.DDD`).
- `local`: Lee overrides privados en tiempo de ejecución sin escribir cadenas privadas en archivos versionados (`Agents.md`, `CLAUDE.md`, `config/models.config.json`). Orden de búsqueda:
  1. `AGENT_THEME_FILE`
  2. `<raízProyecto>/.agents/theme.local.json`
  3. `<raízProyecto>/.agent-theme.local.json` (y hasta 3 directorios padre de workspace)
  4. `~/.config/agent-governance/theme.local.json`

Ejemplo de esquema:
```json
{
  "name": "Alpha Private Theme",
  "clockPrefix": "Cycle",
  "zones": { "bridge": "DeckAlpha", "lowerDeck": "SubDeck", "simBay": "SimArena" },
  "labels": { "guard": "[ALPHA GUARD]", "sim": "[SIM-ARENA]" },
  "roles": { "orchestrator": "AlphaLead", "testRunner": "SubDeck Runner", "metaCritic": "SubDeck Evaluator" }
}
```
Activalo con `--theme=local` o `AGENT_THEME=local`. Mantené `.agents/theme.local.json` y `.agent-theme.local.json` en `.gitignore` (`iss doctor` verifica esta regla automáticamente).

---

## 7. Runtime ESM Zero-Build y Tipado Estático (`tsc --noEmit`)
Todo el código fuente (`src/`, `bin/`, `.agents/hooks/`) corre en JavaScript ESM nativo (`Node.js >= 18.0.0`) con **0 dependencias externas en runtime** y sin compilación previa, manteniendo verificación estática estricta vía `tsconfig.json` (`strict: true`, `allowJs: true`, `checkJs: true`, `noEmit: true`), JSDoc y [types/index.d.ts](types/index.d.ts) para ejecutar en repositorios Python, Go, Rust, Flutter o JS/TS. `typescript` y `@types/node` viven estrictamente en `devDependencies`.

```bash
node ./test/suite.js
node ./bin/iss.js doctor
node examples/quickstart-demo.js
pnpm run typecheck   # Verificación estricta tsc --noEmit (devDependencies)
```
