# 🛸 ISS-Enterprise: Manual de Operaciones Tácticas

> *"Disciplina, claridad táctica y gobernanza multi-agente determinista sobre cualquier base de código."*

Bienvenido al **Manual de Operaciones Tácticas de ISS-Enterprise**. Esta guía proporciona una referencia técnica exhaustiva para crear y compactar skills, integrar servidores Model Context Protocol (MCP) personalizados, ajustar los escudos de seguridad en tiempo real y gobernar flotas heterogéneas de modelos de IA.

---

## 📑 Tabla de Contenidos

1. [Ciclo de Vida y Gestión de Skills](#1-ciclo-de-vida-y-gestión-de-skills)
   - [Creación de Skills Personalizadas (`skills create`)](#creación-de-skills-personalizadas)
   - [Anatomía de un Archivo `SKILL.md`](#anatomía-de-un-archivo-skillmd)
   - [Compactación Anticolisiones (`skills compact`)](#compactación-anticolisiones)
   - [Los 6 Pilares Canónicos](#los-6-pilares-canónicos)
2. [Tríada de Sensores MCP y Extensibilidad](#2-tríada-de-sensores-mcp-y-extensibilidad)
   - [La Tríada Indispensable](#la-tríada-indispensable)
   - [Generación de Configuración (`iss mcps`)](#generación-de-configuración)
   - [Integración de Servidores MCP de Terceros](#integración-de-servidores-mcp-de-terceros)
   - [Optimización para Modelos Pequeños (Fallback a `gh` CLI)](#optimización-para-modelos-pequeños)
3. [Escudos de Seguridad y Calidad en Tiempo Real](#3-escudos-de-seguridad-y-calidad-en-tiempo-real)
   - [Escudo de Seguridad de la Tte. Tasha Yar (`tasha-security-shield.js`)](#escudo-de-seguridad-de-la-tte-tasha-yar)
   - [Control de Salud y Estilos de la Dra. Crusher (`crusher-health-check.js`)](#control-de-salud-y-estilos-de-la-dra-crusher)
   - [Escritor de Bitácora del Capitán (`captains-log-writer.js`)](#escritor-de-bitácora-del-capitán)
4. [Orquestación de Flota Heterogénea y Presupuesto de Contexto](#4-orquestación-de-flota-heterogénea-y-presupuesto-de-contexto)
   - [Asignación de Roles por Ventana de Contexto](#asignación-de-roles-por-ventana-de-contexto)
   - [Protocolo de Lenguaje Cognitivo (Ahorro de Tokens BPE)](#protocolo-de-lenguaje-cognitivo)

---

## 1. Ciclo de Vida y Gestión de Skills

Los agentes de IA autónomos operan con máxima precisión cuando reciben directivas modulares y delimitadas por dominio. La acumulación desordenada de directivas provoca saturación de contexto (*prompt bloat*), instrucciones contradictorias y pérdida de atención. ISS-Enterprise gestiona los skills de manera dinámica y determinista.

### Creación de Skills Personalizadas

Puedes forjar un nuevo skill operativo especializado en cualquier momento mediante la CLI táctica:

```bash
# Recomendado con pnpm:
pnpm dlx iss-enterprise skills create <slug-del-skill>

# O mediante npx:
npx iss-enterprise skills create <slug-del-skill>

# Ejemplo:
pnpm dlx iss-enterprise skills create database-migrations-guard
```

Este comando genera automáticamente el directorio y el manifiesto de instrucciones:
```text
.agents/skills/database-migrations-guard/
└── SKILL.md
```

### Anatomía de un Archivo `SKILL.md`

Cada skill generado por ISS-Enterprise incluye un encabezado YAML frontmatter estricto acompañado de directivas tácticas:

```markdown
---
name: database-migrations-guard
description: Reglas de migración e invariantes de base de datos sin tiempo de inactividad gestionadas por el Tte. Cmdte. Geordi La Forge.
---

# ⚔️ DATABASE-MIGRATIONS-GUARD (Oficial: Geordi La Forge)

## 🎯 Propósito y Alcance
Instrucciones operativas especializadas para database-migrations-guard. Garantiza que todas las migraciones de esquema sean retrocompatibles y se ejecuten dentro de transacciones aisladas.

## 📋 Directivas y Mejores Prácticas
1. **YAGNI y Minimalismo**: Sube por la escalera del protocolo Ponytail. No introduzcas sobre-ingeniería en las tablas.
2. **Retrocompatibilidad**: La eliminación de columnas debe seguir una estrategia de dos fases (deprecation previa).
3. **Verificación Automatizada**: Cada migración debe incluir pruebas automatizadas de reversión (rollback).
4. **Escudo de Seguridad**: Respeta el perímetro y las directivas de seguridad de la Teniente Tasha Yar.
```

### Compactación Anticolisiones

Cuando un proyecto acumula decenas de skills sueltos (por ejemplo, archivos separados para Tailwind, CSS Modules, reglas de accesibilidad WCAG, linters de Semgrep, inyecciones SQL y patrones de test), cargar todos esos textos en el prompt del sistema desperdicia miles de tokens por turno y genera comportamientos contradictorios.

Para compactar y fusionar los skills dispersos:

```bash
pnpm dlx iss-enterprise skills compact
```

El motor de compactación (`src/skill-engine.js`):
1. Inspecciona los directorios en `.agents/skills/`.
2. Analiza semánticamente las reglas y delimita las fronteras de dominio.
3. Fusiona las directivas en los **6 pilares canónicos**, eliminando duplicidades y entregando un conjunto de reglas limpio y coherente.

### Los 6 Pilares Canónicos

| Pilar Canónico | Oficial Asignado | Enfoque Operativo |
| :--- | :--- | :--- |
| `security-guardrails` | Tte. Tasha Yar & Worf | Escudos de comandos, análisis estático Semgrep, OWASP Top 10, defensa ante intrusiones |
| `design-system-and-ui` | Consejera Deanna Troi | Tokens de diseño, accesibilidad WCAG AAA, higiene de estilos (CSS Modules / Tailwind) |
| `code-health-and-ponytail` | Dra. Beverly Crusher | Protocolo Ponytail (YAGNI, diffs mínimos), prohibición de polling continuo, arquitectura limpia |
| `fullstack-architecture` | Tte. Cmdte. Geordi La Forge | Monorepos, límites entre paquetes, Dockerfiles, caché de compilación |
| `data-engineering-and-rag` | Tte. Cmdte. Data | Recuperación vectorial, pipelines ETL, Chroma/Qdrant, streaming de datos |
| `workflow-and-coordination` | Comandante William T. Riker | TDD estricto, desglose de tareas, verificación con Vitest/Pytest/Playwright |

---

## 2. Tríada de Sensores MCP y Extensibilidad

El protocolo **Model Context Protocol (MCP)** proporciona a los agentes de IA acceso estandarizado a herramientas, bases de datos y APIs del sistema. ISS-Enterprise preconfigura la tríada esencial y ofrece una base sólida para conectar servidores adicionales.

### La Tríada Indispensable

ISS-Enterprise define tres capacidades sensoriales imprescindibles para cualquier nave:

1. **Sensores de Largo Alcance (`context7`)**:
   Recupera documentación oficial y en vivo de 2026 para librerías y APIs. Elimina alucinaciones en frameworks modernos (Next.js App Router, Astro 4/5, Tailwind v4).
2. **Archivos de la Enterprise (`codebase-memory-mcp`)**:
   Mantiene un grafo de conocimiento AST persistente y ejecuta consultas Cypher para trazar árboles de llamadas, dependencias y consumidores antes de refactorizar.
3. **Comunicaciones Subespaciales (`github`)**:
   Automatiza la creación y revisión de pull requests, gestión de issues, commits y auditorías de código.

### Generación de Configuración

Genera el archivo de configuración estandarizado para tu proyecto:

```bash
pnpm dlx iss-enterprise mcps
```

Esto crea el archivo `.mcp/mcp-servers.config.json` en la raíz del proyecto:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "codebase-memory-mcp": {
      "command": "npx",
      "args": ["-y", "codebase-memory-mcp"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### Integración de Servidores MCP de Terceros

Para añadir capacidades especializadas (como consultas SQL directas, orquestación de Docker o inspectores de navegador), edita directamente `.mcp/mcp-servers.config.json`:

#### Ejemplo: Incorporación de PostgreSQL y Docker MCP
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "codebase-memory-mcp": {
      "command": "npx",
      "args": ["-y", "codebase-memory-mcp"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "postgres-db": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:pass@localhost:5432/midb"]
    },
    "docker": {
      "command": "npx",
      "args": ["-y", "mcp-server-docker"]
    }
  }
}
```

### Optimización para Modelos Pequeños

Los servidores MCP con docenas de herramientas consumen una gran cantidad de tokens de contexto antes de que el modelo comience a razonar. Para modelos locales o económicos (ej. Qwen 7B, DeepSeek local u Ollama con <=32k de contexto):

- ISS-Enterprise sustituye automáticamente el pesado servidor MCP de GitHub por el **skill de CLI nativo `gh`**.
- El agente invoca comandos ligeros como `gh pr list`, `gh issue view` y herramientas nativas de `git`, ahorrando miles de tokens en cada turno.

---

## 3. Escudos de Seguridad y Calidad en Tiempo Real

Durante la inicialización (`iss init`), ISS-Enterprise despliega ganchos físicos de JavaScript en `.agents/hooks/`. Estos hooks se ejecutan de manera determinista para validar las acciones de los agentes.

### Escudo de Seguridad de la Tte. Tasha Yar

Archivo: `.agents/hooks/tasha-security-shield.js`

Intercepta los comandos de terminal propuestos por los agentes y los evalúa contra patrones destructivos o no autorizados:

```javascript
const PROHIBITED = [
  /\brm\s+-[rR]f\s+[\/\*]/,       // Borrado destructivo de raíz o con comodines
  /\bcurl\b.*\|\s*(ba)?sh\b/,     // Ejecución directa de scripts remotos en shell
  /\bchmod\s+(-R\s+)?777\b/       // Apertura insegura de permisos globales
];
```

Si un agente propone una acción prohibida, el escudo interrumpe la ejecución de inmediato y emite una alerta táctica de seguridad.

### Control de Salud y Estilos de la Dra. Crusher

Archivo: `.agents/hooks/crusher-health-check.js`

Preserva la higiene del código y previene vicios comunes de los agentes:

1. **Prohibición de Polling Continuo**: Detecta y rechaza bucles del tipo `setInterval(() => fetch(...))`. Exige el uso de WebSockets, Server-Sent Events o arquitectura reactiva por eventos.
2. **Gobernanza de Estilos Adaptativa**: Aplica la decisión tomada por el usuario en el asesor:
   - En **Modo de Prohibición Estricta**, bloquea cualquier inserción de `tailwindcss` o `nativewind`.
   - En **Modo Mixto Permisivo**, valida armónicamente tanto CSS Modules como clases utilitarias.

### Escritor de Bitácora del Capitán

Archivo: `.agents/hooks/captains-log-writer.js`

Mantiene un registro cronológico e inmutable de decisiones arquitectónicas, acciones de agentes y validaciones de pruebas en `.agents/captains-log.jsonl`.

---

## 4. Orquestación de Flota Heterogénea y Presupuesto de Contexto

ISS-Enterprise coordina flotas mixtas entre diversos proveedores de inteligencia artificial:

- **Google Gemini**: Gemini 3.1 Pro, Gemini 3.8 Flash, Gemini 1.5 Pro
- **Anthropic Claude**: Claude 3.5 Sonnet, Claude 3.5 Haiku
- **DeepSeek**: DeepSeek-R1, DeepSeek-V3
- **Alibaba Qwen**: Qwen 2.5 Coder (72B, 32B, 7B)
- **OpenAI**: o1, o3-mini, GPT-4o, GPT-4o-mini
- **Ollama Local**: Cualquier entorno de ejecución local

### Asignación de Roles por Ventana de Contexto

Para evitar el agotamiento presupuestario y la pérdida de atención:

- **Oficiales de Alto Razonamiento (>=128k - 1M tokens)**: Comandante Riker, Tte. Cmdte. Data, Q. Se les asignan transformaciones AST complejas, diseño de arquitectura y refactorizaciones multiactivo.
- **Oficiales de Economía Rápida (8k - 32k tokens)**: Alférez Wesley Crusher. Se le asignan prompts de sistema aislados de menos de 800 tokens para tareas atómicas: ejecución de tests unitarios, verificación de sintaxis y scripts rápidos.

### Protocolo de Lenguaje Cognitivo

Cuando se interactúa con desarrolladores hispanohablantes:

1. **Comunicación Externa**: Los agentes interactúan con el Capitán humano en español para máxima fluidez y claridad estratégica.
2. **Deliberación Interna y AST**: El razonamiento entre modelos, las trazas de pensamiento y las inspecciones de código se ejecutan en inglés.
3. **Ahorro de Tokens BPE**: La tokenización en inglés consume **entre un 30% y un 50% menos de tokens Byte Pair Encoding (BPE)** que los idiomas romances para expresar la misma lógica algorítmica, reduciendo costes y acelerando las respuestas.
