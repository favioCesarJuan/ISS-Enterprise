# ISS-Enterprise (CLI de Gobernanza y Scaffolding Multi-Stack)

> **CLI compañero de `STNG-framework`** — Detecta arquetipos de proyecto, configura flotas multi-modelo, compacta skills, despliega los hooks deterministas canónicos y audita deriva de gobernanza (`iss doctor`). Cero dependencias de runtime externas (Node.js `>=18.0.0`).

---

## Demo Reproducible en 30 Segundos

Ejecutá la demo en menos de 1 segundo sin dependencias externas:

```bash
node examples/quickstart-demo.js
# Con alias opcionales de Starfleet (0 tokens extra de salida):
node examples/quickstart-demo.js --theme=starfleet
```

Ejecutá la suite completa (28 tests) y la auditoría `doctor`:

```bash
node ./test/suite.js
node ./bin/iss.js doctor
```

---

## Tema Opcional Starfleet (`--theme=starfleet`)

Por defecto, `iss` despliega **nomenclatura funcional estándar** (`theme: "standard"`).
Con `--theme=starfleet` (o `AGENT_THEME=starfleet` en `.agents/.env`), los hooks y logs usan los alias de Star Trek: TNG con **0 tokens extra de salida** (`Zero Theatrical Filler`).

| Rol Corporativo | Alias Starfleet (Opcional) | Tarea en el Proyecto |
| :--- | :--- | :--- |
| Human / Product Owner | Captain Jean-Luc Picard | Autoridad del proyecto, requisitos y aprobación |
| Lead AI Orchestrator | Cmdr. William T. Riker | Descomposición de tareas y coordinación |
| Systems & Logic Analyst | Lt. Cmdr. Data | Algoritmos, máquinas de estado, DAG de workspace |
| Architecture Lead | Lt. Cmdr. Geordi La Forge | Límites de monorepo, pipelines de build y CI |
| Security Guardrail | Lt. Cmdr. Worf / Lt. Tasha Yar | Escudo pre-tool, Semgrep SAST, escaneo de skills |
| Quality & Health Auditor | Dr. Beverly Crusher | Revisión post-edit, minimalismo YAGNI, anti-polling |
| Design System & UX | Counselor Deanna Troi | Ergonomía CLI, accesibilidad WCAG, estilos |
| Test Automation Runner | Ensign Wesley Crusher | Ejecución rápida de tests y linters |
| Meta-Critic Evaluator | Q | Revisión adversarial de bordes y paridad doc-código |
