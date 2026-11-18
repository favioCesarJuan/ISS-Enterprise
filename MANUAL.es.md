# Manual Operativo de ISS-Enterprise

## 1. Frontera de Arquitectura (Opción A)
- **STNG-framework** contiene los hooks deterministas canónicos (`.agents/hooks/`).
- **ISS-Enterprise** detecta el stack del proyecto, asigna presupuestos de modelos, compacta skills, genera contratos multi-IA (`Agents.md`, `CLAUDE.md`, `.cursorrules`, `.windsurfrules`) y despliega los hooks canónicos.

## 2. Selector de Tema (`src/themes.js`)
- Por defecto: `standard` (`AGENT_THEME=standard`).
- Opcional: `starfleet` mediante `--theme=starfleet` en `iss apply` / `iss init`, o `AGENT_THEME=starfleet` en `.agents/.env`.
- `printCrewThemeNotice(theme)` muestra la tabla completa de personajes y su tarea en el proyecto confirmando `0` tokens extra de salida (`Zero Theatrical Filler`).

## 3. Comandos de Verificación
```bash
node ./test/suite.js
node ./bin/iss.js doctor
node examples/quickstart-demo.js
```
