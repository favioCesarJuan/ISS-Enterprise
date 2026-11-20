# ISS-Enterprise (*Intelligent Stack Scaffolding for Enterprise*)

> **CLI Flexible de Gobernanza y Scaffolding Multi-Stack (Compañero de `STNG-framework`)** — Entrevista al usuario sobre contexto, dominio e invariantes; detecta stacks heterogéneos; asigna flotas multi-modelo (con Cold Review cross-model en `Lower Deck`); compacta skills; genera contratos y `.semgrep.yml` adaptativos; y audita deriva (`iss doctor`). Cero dependencias de runtime externas (`Node.js >= 18.0.0`).

---

## Posicionamiento: `ISS-Enterprise` vs. `STNG-framework`
- **`STNG-framework`**: Núcleo determinista opinado para runtime y monorepos (hooks, reglas, skills canónicas, cascade scoping).
- **`ISS-Enterprise`**: Orquestador y CLI interactivo diseñado para **cualquier estructura de proyecto** — monorepos JS/TS, Astro SSG, Next.js App Router, NestJS, Expo/React Native, Flutter, Python (FastAPI/Django/Flask/RAG), Go, Rust, Extensiones Chrome (MV3) y CLIs independientes.

---

## Demo Reproducible en 30 Segundos (Simulation Sandbox)

```bash
node examples/quickstart-demo.js
# Tema naval de dominio público (Bridge / Lower Deck / Sim Deck):
node examples/quickstart-demo.js --theme=naval
# Tema local privado resuelto dinámicamente desde JSON no trackeado fuera de Git:
node examples/quickstart-demo.js --theme=local
```

Ejecutá la suite automatizada, la auditoría `doctor` y la verificación estática TypeScript opcional:

```bash
node ./test/suite.js
node ./bin/iss.js doctor
pnpm run typecheck   # Verificación estricta tsc --noEmit vía JSDoc + types/index.d.ts
```

---

## Capacidades Principales Implementadas

1. **Entrevista de Contexto y Dominio (`src/advisor.js`, `src/generator.js`)**:
   - Registra etapa del ciclo de vida, `project_summary`, `project_domain`, `domain_invariants`, `project_non_goals`, patrón de arquitectura, estructura de carpetas, política de estilos, linters, `shield_rigidity` y tema en **`.agents/project-context.json`**.
   - Infiere automáticamente comandos reales de `test`, `lint` y `build` según el stack (`pytest`/`ruff`, `go test`, `cargo test`, `flutter test`, `bun test`, `pnpm test`/`biome`).
   - Preserva aprendizajes en `.agents/instincts.md` y el contexto confirmado en re-ejecuciones salvo que pases `--force` / `--reconfigure`; si se ejecuta sin entrevista previa (`interviewCompleted: false`), inserta un **AI Discovery Gate** en `CLAUDE.md`.
   - Toda pregunta incluye `[Otra / Personalizada]` con investigación heurística (`investigateCustomChoice`).
2. **Generador y Scaffolder Multi-Stack Adaptativo (`src/generator.js`, `src/scaffolder.js`, `src/detector.js`)**:
   - Crea estructuras greenfield para Monorepos, Astro Atomic Design, Python RAG/FastAPI, Go, Rust y proyectos minimalistas.
   - Copia hooks selectivamente (`monorepo-cascade-scope.js` solo en monorepos; omite `ux-design-enforcer.md` en proyectos headless), genera `.semgrep.yml` por lenguaje (JS/TS, Python, Go, Rust), arma `.git/hooks/pre-commit` sobre archivos staged y puede emitir `docs/designs/001-initial-architecture.md`.
3. **Cold Review Cross-Model en Lower Deck y Detección de Deriva SDD (`src/fleet-manager.js`, `src/spec-checker.js`)**:
   - Asigna un modelo revisor distinto (`HIGH_REASONING`) para `Meta-Critic Evaluator` (`Lower-Deck Evaluator`) cuando existen múltiples proveedores, junto a un paraphrasing tier `FAST_ECONOMY` en aislamiento `ZERO_CONTEXT_READ_ONLY`.
   - Crea especificaciones SDD (`iss spec new <slug>`) y verifica rutas en disco y obsolescencia de specs `APPROVED` (`iss spec check` y `iss doctor`).
4. **Heurísticas KISS y Modos de Rigidez (`post-edit-policy-check.js`, `pre-tool-shell-guard.js`)**:
   - Evalúa `KISS_EXCESSIVE_FILE_LENGTH` (>400), `KISS_DEEP_NESTING` (>4), `KISS_EXCESSIVE_PARAMS` (>5), `KISS_LONG_FUNCTION` (>80) y `KISS_SWALLOWED_ERROR` bajo modos `standard`, `strict` y `fast-track`.

---

## Comandos CLI (`bin/iss.js`)

| Comando | Alias | Propósito |
| :--- | :--- | :--- |
| `iss apply [dir] [--dry-run] [--theme=standard\|naval\|local]` | `engage`, `arm` | Despliegue directo no interactivo de hooks, roles, MCP, `.agents/project-context.json` y pre-commit Git (`--dry-run` simula sin escribir en disco). |
| `iss init [dir] [--yes] [--dry-run] [--force] [--init-spec] [--theme=...]` | — | Asistente interactivo de contexto/dominio/stack (o modo `--yes`) que genera gobernanza adaptativa. |
| `iss inspect [dir] [--json]` | — | Detecta arquetipo, tecnologías, estrategia de estilos, flota disponible y skills recomendadas. |
| `iss new <nombre> [dir]` | — | Genera un proyecto nuevo desde cero (Monorepo, Astro, Python RAG, API Backend Go/Rust/FastAPI, Minimal o Personalizado) con gobernanza lista. |
| `iss doctor [dir]` | `audit` | Audita `.agents/hooks.json`, ejecutables, `.agents/roles/`, `.agents/project-context.json`, `.mcp/mcp-servers.config.json`, privacidad de `.env` y `theme.local.json` en `.gitignore`, baseline CVE de Node, `.semgrep.yml` y deriva SDD. |
| `iss spec new <slug> [dir] \| check [dir] [--json]` | `spec drift` | Crea plantillas SDD (`docs/designs/<slug>.md`) y verifica deriva entre specs `APPROVED` y archivos reales. |
| `iss theme [dir]` | — | Muestra tema activo (`standard`, `naval`, `local`), zonas (`Bridge`, `Lower Deck`, `Sim`) y tabla de roles. |
| `iss skills list\|compact\|create [dir]` | — | Lista, compacta en dominios canónicos o crea `SKILL.md` validando prompt-injection (`validateSkillSafety`). |
| `iss mcps [dir\|warmup]` | — | Genera `.mcp/mcp-servers.config.json` (`{ mcpServers: ... }`) o indexa el grafo con `codebase-memory-mcp`. |
| `iss advise [dir] [--yes]` | `advisor` | Evalúa etapa del proyecto (Greenfield / Active / Maintenance) y guarda `.agents/project-profile.json`. |
| `iss update [dir] [--check] [--yes]` | — | Evalúa actualizaciones upstream mediante Aduana Cuádruple de Seguridad con backup y rollback automático. |

---

## Temas de Gobernanza: `standard`, `naval` y Privado `local`

- **`standard` (por defecto)**: Nomenclatura funcional corporativa (`Core Governance`, `Stateless Subagents`, `Simulation Sandbox`).
- **`naval` (`--theme=naval` / `AGENT_THEME=naval`)**: Roles marítimos de dominio público: **Bridge** (contexto largo), **Lower Deck** (subagentes efímeros sin contexto previo) y **Sim Deck** (simulaciones/tests), con reloj `Mission YYYY.DDD` y **0 tokens extra** (`Zero Theatrical Filler`).
- **`local` (`--theme=local` / `AGENT_THEME=local` / `AGENT_THEME_FILE=<ruta>`)**: Carga alias y zonas privadas en tiempo de ejecución desde archivos JSON ignorados fuera de Git (`.agents/theme.local.json`, `.agent-theme.local.json` hasta 3 directorios padre o `~/.config/agent-governance/theme.local.json`). Los nombres privados nunca se serializan en archivos trackeados y `iss doctor` advierte si `.agents/theme.local.json` falta en `.gitignore`.

Ejemplo de `.agent-theme.local.json` fuera de Git:

```json
{
  "name": "Alpha Private Theme",
  "clockPrefix": "Cycle",
  "zones": { "bridge": "DeckAlpha", "lowerDeck": "SubDeck", "simBay": "SimArena" },
  "labels": { "guard": "[ALPHA GUARD]", "sim": "[SIM-ARENA]" },
  "roles": { "orchestrator": "AlphaLead" }
}
```

| Rol Corporativo | Alias Naval | Zona | Tarea en el Proyecto |
| :--- | :--- | :--- | :--- |
| Human / Product Owner | Captain | Bridge | Autoridad del proyecto, requisitos y aprobación `APPROVED` |
| Lead AI Orchestrator | First Officer | Bridge | Descomposición de tareas, subagentes y arbitraje |
| Systems & Logic Analyst | Science & Logic Officer | Bridge | Algoritmos, máquinas de estado, DAG de workspace |
| Architecture Lead | Chief Engineer | Bridge | Límites multi-stack, pipelines de build y CI |
| Security Guardrail | Security Officer | Bridge | Escudo pre-tool, Semgrep SAST, escaneo de skills |
| Quality & Health Auditor | Chief Medical Officer | Bridge | Revisión post-edit, KISS + YAGNI, anti-polling |
| Design System & UX | UX & Comms Officer | Bridge | Ergonomía CLI, accesibilidad WCAG, estilos |
| Test Automation Runner | Lower-Deck Runner | Lower Deck | Pruebas y simulaciones aisladas en Simulation Sandbox (`Sim Deck`) |
| Meta-Critic Evaluator | Lower-Deck Evaluator | Lower Deck | Cold Review sin contexto en 3 compuertas (`Paraphraser`, `Critic`, `Verifier`) |

---

## Decisión de Arquitectura: Runtime ESM Zero-Build + Tipado Estricto JSDoc

`ISS-Enterprise` utiliza **ES Modules (`.js`)** sin dependencias externas en runtime (`Node.js >= 18.0.0`) con verificación estática mediante **TypeScript (`tsc --noEmit`)**:
- **Ejecución inmediata en stacks políglotas**: Permite ejecutar `iss` y desplegar `.agents/hooks/*.js` autocontenidos al instante en proyectos Python, Go, Rust, Flutter o JS/TS sin exigir compilación `tsc`, carpeta `dist/` ni exposición de `node_modules`.
- **Seguridad Estática Completa**: `tsconfig.json` (`strict: true`, `allowJs: true`, `checkJs: true`, `noEmit: true`) valida `bin/`, `src/`, `.agents/hooks/`, `examples/` y `test/` frente a los contratos compartidos en `types/index.d.ts` (`"types"` en `package.json`).
- **Tooling Exclusivo de Desarrollo**: `typescript` y `@types/node` residen únicamente en `devDependencies`; `dependencies` permanece vacío (`0`).

---

## Estado y Herramientas Externas
- **Implementado y verificado:** Detector de arquetipos, entrevistador de contexto/dominio, asignador de flotas multi-modelo (con Cold Review cross-model), compactador/escáner de skills, planificador MCP, generador y scaffolder adaptativos, `doctor` + `spec-checker.js` y `theme-loader.js`.
- **Herramientas externas opcionales:** `semgrep`, `skillspector`, `ollama` y `gh` complementan análisis cuando están en `PATH`; los checks en Node.js funcionan offline sin ellos.
