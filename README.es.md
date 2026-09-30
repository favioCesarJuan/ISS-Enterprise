# ⚔️ ISS-Enterprise: Motor Universal de Andamiaje Multi-Agente y CLI Táctico

[![Licencia: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)
[![Versión de Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](https://nodejs.org/)
[![Arquitectura](https://img.shields.io/badge/Arquitectura-Flota%20T%C3%A1ctica%20Multi--Agente-red.svg)](#)
[![Cero Dependencias](https://img.shields.io/badge/Dependencias-Cero%20Runtime-green.svg)](#)

> *"En el Universo Espejo, la ISS Enterprise no es una nave de exploración científica: es un acorazado de combate forjado para la superioridad táctica, la disciplina de hierro y la conquista ágil de sistemas estelares."*

**ISS-Enterprise** es un motor de andamiaje (*scaffolding*) agnóstico y CLI táctico multi-agente. Transforma cualquier proyecto existente —o crea nuevos desde cero— en un acorazado de ingeniería autónomo gobernado por tripulantes de IA especializados y directivas deterministas de modelo.

Disponible en Inglés y Español ([English README](README.md)).

---

## ⚡ Capacidades Principales

### 1. 🛰️ Escáner Universal de Arquetipos
Detecta automáticamente el stack tecnológico sin requerir configuración previa y asigna el perfil de tripulación, directivas y skills correspondientes:
- **Monorepos Fullstack** (Turborepo, Next.js, NestJS, React Native / Expo, Drizzle ORM).
- **Portales de Contenido y SSG** (Astro, Biome, Playwright, estilos mixtos CSS + Tailwind).
- **Pipelines de Datos y RAG** (Python, Vector DBs, Docker, scrapers headless).
- **APIs de Backend y Microservicios** (Go, Rust, FastAPI, NestJS).
- **Proyectos Greenfield (Desde Cero)** (Genera la estructura de carpetas, código base y manifiestos).

### 2. 🧠 Asistente Interactivo con Opción "Otra" Garantizada
Nunca te encasilla en opciones predefinidas. Cada pregunta incluye la opción `[Otra / Personalizada]`:
- Al elegir `[Otra]`, se activa el **Motor de Investigación Heurística Autónoma** (`investigateCustomChoice`), deduciendo automáticamente los linters, convenciones de directorios y patrones óptimos para tecnologías no listadas (como Bun, Elysia, FastAPI, SolidJS o motores propietarios).

### 3. 🤖 Orquestación de Flota Heterogénea y Presupuesto de Contexto
Coordina sin fricción flotas de múltiples proveedores (Google Gemini, Anthropic Claude, DeepSeek, Alibaba Qwen, OpenAI, Ollama local):
- **Ventana de Contexto Amplia (>=128k - 1M tokens)**: Asignada a roles de alto razonamiento (Comandante Riker, Teniente Comandante Data, Q) para arquitectura de alto nivel, refactorización de AST y análisis de impacto en cascada.
- **Ventana de Contexto Reducida (8k - 32k tokens)**: Asignada a roles de economía rápida (Alférez Wesley Crusher) con prompts de sistema ultracompactos (menos de 800 tokens) y ejecución en subagentes aislados.
- **Protocolo de Lenguaje Cognitivo**: Recepción y entrega de mensajes en el idioma nativo del Capitán (ej. Español), mientras que el razonamiento interno y operaciones de AST se procesan en Inglés para un **ahorro de 30% a 50% en tokens BPE**.

### 4. 🎨 Gobernanza Adaptativa de Estilos (Sin Prohibiciones Hardcodeadas)
Adapta las directivas de estilos a la arquitectura real del proyecto:
- **Modo Mixto Permisivo** (ej. `cosmo-hub`): TailwindCSS combinado con CSS Modules.
- **Modo Estricto de Prohibición** (ej. `extra-time`): CSS3 puro + CSS Modules; el hook de la Dra. Crusher intercepta e impide la inserción de Tailwind.
- **Modo StyleSheet Nativo**: React Native / Expo sin abstracciones intermedias.
- **Modo Headless**: Desactiva por completo el linteo de UI/CSS en proyectos de datos, microservicios o herramientas CLI.

### 5. 🗜️ Motor de Skills Dinámico y Compactador Anticolisiones
Evita la saturación de contexto y colisiones de instrucciones fusionando cualquier cantidad de skills en 6 pilares canónicos:
1. `security-guardrails` (Tasha Yar: Semgrep, OWASP Top 10, Strix Red Team, Escudos de Comandos)
2. `design-system-and-ui` (Troi: WCAG AAA, tokens de diseño, CSS/Tailwind)
3. `code-health-and-ponytail` (Dra. Crusher: Protocolo Ponytail, YAGNI, prohibición de polling)
4. `fullstack-architecture` (Geordi: Monorepos, DDD, límites hexagonales)
5. `data-engineering-and-rag` (Data: Ingesta vectorial, pipelines ETL)
6. `workflow-and-coordination` (Riker: TDD estricto, Vitest/Pytest/Playwright)

### 6. 🔌 Tríada Indispensable de MCPs
Configura y pre-aprueba los tres servidores esenciales de Model Context Protocol:
1. **context7**: Documentación oficial y actualizada de 2026 sin alucinaciones.
2. **codebase-memory-mcp**: Grafo de conocimiento persistente y consultas Cypher para trazabilidad de dependencias.
3. **github**: Control de versiones, gestión de PRs y revisión automatizada (con fallback al CLI ligero `gh` para modelos locales con contexto limitado).

---

## 🚀 Guía Rápida de Uso

### Inspeccionar un Proyecto Existente
Escanea cualquier repositorio para diagnosticar arquetipo, estilos, stack y tripulación recomendada:
```bash
# Dentro de la carpeta del proyecto:
npx iss-enterprise inspect

# O apuntando a una ruta específica:
npx iss-enterprise inspect /ruta/hacia/proyecto

# Salida estructurada JSON para pipelines:
npx iss-enterprise inspect /ruta/hacia/proyecto --json
```

### Inicializar la Gobernanza de Agentes
Inicia el asistente táctico interactivo:
```bash
npx iss-enterprise init

# O adoptando las recomendaciones automáticas de inmediato:
npx iss-enterprise init --yes
```

### Crear un Proyecto Desde Cero (Greenfield)
Crea una nueva base de operaciones con la estructura física y directivas ya listas:
```bash
npx iss-enterprise new alpha-station
```

### Compactar y Fusionar Skills
Elimina duplicados y comprime `.agents/skills` en los pilares canónicos:
```bash
npx iss-enterprise skills compact
```

### Configurar la Tríada de MCPs
Genera `.mcp/mcp-servers.config.json` con los sensores indispensables:
```bash
npx iss-enterprise mcps
```

---

## 👑 Cadena de Mando (La Tripulación Táctica del ISS)

| Oficial | Rol Corporativo | Área de Responsabilidad |
| :--- | :--- | :--- |
| **Capitán (Tú)** | Propietario / Human Executive | Requerimientos, aprobación de arquitectura, visión estratégica |
| **Comandante William T. Riker** | Orquestador Principal de IA | Planificación de tareas, despacho de subagentes, TDD |
| **Tte. Cmdte. Data** | Lógica y Sistemas | Algoritmos, pipelines RAG, máquinas de estado, lógica formal |
| **Tte. Cmdte. Geordi La Forge** | Jefe de Ingeniería | Paquetes de monorepo, rendimiento de compilación, Docker |
| **Teniente Tasha Yar** | Seguridad Táctica | Escudos perimétricos, análisis estático Semgrep, bloqueo de comandos |
| **Teniente Worf** | Seguridad Ofensiva / Red Team | Pruebas de estrés y penetración (Strix), auditoría de dependencias hostiles |
| **Consejera Deanna Troi** | Diseño y Ergonomía UX | Sistema de diseño, accesibilidad WCAG AAA, higiene de UI |
| **Dra. Beverly Crusher** | Salud Médica del Código | Protocolo Ponytail (YAGNI, diffs mínimos), bloqueo de polling continuo |
| **Alférez Wesley Crusher** | Automatización Rápida | Scripts veloces, ejecución de tests (Vitest, Pytest, Playwright) |
| **Q (El Continuo Q)** | Meta-Crítico Omnisciente | Auditoría temporal de decisiones, eliminación de sesgos, juicios de caos |

---

## 📄 Licencia

MIT © [Favio Cesar Juan](https://github.com/favioCesarJuan)
