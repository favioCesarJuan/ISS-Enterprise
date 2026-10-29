/**
 * ==============================================================================
 * 🧠 ISS-ENTERPRISE: ADVISOR & AUTONOMOUS INVESTIGATION ENGINE
 * ==============================================================================
 * Formulates tailored questions with guaranteed [Otra / Custom] write-ins.
 * When a custom choice is made, runs heuristic investigation to infer optimal
 * file distribution, linters, compiler flags, and architecture patterns.
 * Suggests the optimal folder structure according to the detected technology
 * and project lifecycle (Greenfield, In-Construction, Maintenance).
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import process from 'node:process';
import { execSync } from 'node:child_process';

export const PROJECT_LIFECYCLE = {
  GREENFIELD: 'greenfield',
  IN_CONSTRUCTION: 'construction',
  MAINTENANCE: 'maintenance'
};

function promptUser(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

// Heuristic knowledge database for autonomous investigation of custom technologies
const TECH_KNOWLEDGE_BASE = {
  bun: {
    runtime: 'Bun',
    packageManager: 'bun',
    linter: 'Biome or ESLint',
    typecheck: 'tsc --noEmit',
    recommendedArch: 'Modular Microservices or Clean Architecture',
    fileLayout: 'src/ (routes, services, domain)'
  },
  elysia: {
    framework: 'ElysiaJS',
    runtime: 'Bun',
    pattern: 'Type-safe fast REST/WebSocket server',
    linter: 'Biome',
    fileLayout: 'src/controllers, src/models, src/plugins'
  },
  fastapi: {
    language: 'Python',
    linter: 'Ruff + Black',
    typecheck: 'mypy --strict',
    recommendedArch: 'Hexagonal Architecture or Layered Domain',
    fileLayout: 'app/api, app/core, app/services, app/models, tests/'
  },
  rust: {
    language: 'Rust',
    packageManager: 'cargo',
    linter: 'cargo clippy',
    testRunner: 'cargo test',
    recommendedArch: 'Clean Architecture with Traits/Ports',
    fileLayout: 'src/domain, src/adapters, src/infrastructure, tests/'
  },
  go: {
    language: 'Go',
    packageManager: 'go mod',
    linter: 'golangci-lint',
    testRunner: 'go test ./...',
    recommendedArch: 'Hexagonal / Standard Go Project Layout',
    fileLayout: 'cmd/server, internal/core, internal/adapters, pkg/'
  },
  solidjs: {
    frontend: 'SolidJS',
    reactiveModel: 'Fine-grained Signals',
    styling: 'Tailwind or CSS Modules',
    fileLayout: 'src/components, src/stores, src/routes'
  },
  flutter: {
    framework: 'Flutter',
    language: 'Dart',
    recommendedArch: 'Clean Architecture con BLoC o Riverpod',
    fileLayout: 'lib/core, lib/features (data, domain, presentation), lib/widgets'
  },
  remix: {
    framework: 'Remix / React Router v7',
    recommendedArch: 'Flat Routes + Co-located Components',
    fileLayout: 'app/routes, app/components, app/services, app/styles'
  },
  nextjs: {
    framework: 'Next.js App Router',
    recommendedArch: 'Server Components + Client Leaves',
    fileLayout: 'app/(auth), app/(dashboard), components/ui, lib/, hooks/'
  },
  astro: {
    framework: 'Astro',
    recommendedArch: 'Islands Architecture & Atomic Design',
    fileLayout: 'src/components/atoms, src/components/molecules, src/components/organisms, src/layouts, src/pages, src/styles'
  }
};

/**
 * Investigates an "Otra" / custom input dynamically.
 * @param {string} category 'stack' | 'arch' | 'styling' | 'linter' | 'file_distribution'
 * @param {string} userInput
 * @returns {object} Inferred recommendations and configurations
 */
export function investigateCustomChoice(category, userInput = '') {
  const query = userInput.toLowerCase().trim();
  const matchedTech = Object.keys(TECH_KNOWLEDGE_BASE).find(key => query.includes(key));

  if (matchedTech) {
    const info = TECH_KNOWLEDGE_BASE[matchedTech];
    return {
      query: userInput,
      recognized: true,
      category,
      matchedTech,
      recommendation: `Detected custom preference for ${matchedTech.toUpperCase()}. Optimal alignment inferred:`,
      config: info
    };
  }

  // Fallback heuristic investigation
  return {
    query: userInput,
    recognized: false,
    category,
    recommendation: `Custom ${category} '${userInput}' adopted. Synthesizing universal zero-dependency governance:`,
    config: {
      customName: userInput,
      rules: [`Respect official conventions of ${userInput}`, 'Enforce modular boundaries and YAGNI']
    }
  };
}

/**
 * Returns the interactive questions tailored to the detected archetype and stack.
 * Dynamically prioritizes the optimal folder structure recommendation.
 * @param {object} detectedProfile
 * @returns {Array<object>} List of structured questions
 */
export function getTailoredQuestions(detectedProfile) {
  const isGreenfield = detectedProfile.archetype === 'GREENFIELD_EMPTY';
  const stack = detectedProfile.techStack || {};
  const hasFrontend = stack.hasNext || stack.hasAstro || stack.hasExpo;

  const questions = [];

  // Question 0: Project Lifecycle Stage
  questions.push({
    id: 'project_lifecycle',
    title: '🏗️ ¿En qué etapa del ciclo de vida se encuentra el proyecto?',
    options: [
      isGreenfield
        ? 'Proyecto Nuevo (Greenfield): Comenzando desde cero sin dependencias previas [Recomendado]'
        : 'Proyecto Nuevo (Greenfield): Comenzando desde cero sin dependencias previas',
      !isGreenfield
        ? 'En Construcción (Activo): Desarrollo activo, agregando módulos y stack en evolución [Recomendado]'
        : 'En Construcción (Activo): Desarrollo activo, agregando módulos y stack en evolución',
      'Mantenimiento (Legacy / Maduro): Base de código establecida, estabilidad crítica y foco en seguridad',
      '[Otra / Personalizada]'
    ]
  });

  // Question 1: Greenfield purpose OR Adoption confirmation
  if (isGreenfield) {
    questions.push({
      id: 'project_purpose',
      title: '🛸 ¿Qué tipo de nave espacial deseas forjar desde cero?',
      options: [
        'SaaS Fullstack (Monorepo con Web + Mobile + API)',
        'Portal de Contenidos / Blog / SSG con Atomic Design (Astro)',
        'Backend / Microservicio API (Go, FastAPI, NestJS, Rust)',
        'Pipeline de Datos / Scraper / RAG (Python, Vector DB, Docker)',
        'Aplicación Móvil (React Native / Expo, Flutter)',
        'Herramienta CLI / Scripting Autónomo',
        '[Otra / Personalizada]'
      ]
    });
  }

  // Question 2: Architecture pattern
  questions.push({
    id: 'architecture_pattern',
    title: '🏛️ ¿Qué patrón de arquitectura deseas que gobierne el proyecto?',
    options: [
      'Hexagonal Architecture (Ports & Adapters) [Recomendado para APIs y Core]',
      'Event-Driven / Reactive (WebSockets, EventBus, Zero Polling)',
      'Pipeline ETL / RAG Ingest & Distillation [Recomendado para Datos]',
      'Vertical Slice Architecture (Agrupado por features/negocio)',
      'Modular Monolith con Monorepo Packages',
      'Minimalist Flat Scripting (Scripts modulares sin over-engineering)',
      '[Otra / Personalizada]'
    ]
  });

  // Question 3: Directory layout / File distribution (Intelligently ordered by stack!)
  const distributionOptions = [];

  if (stack.hasAstro) {
    // Astro specializes in Atomic Design UI
    distributionOptions.push('Atomic Design UI (src/components/atoms, molecules, organisms, layouts, pages) [⭐ Recomendado para Astro y Design Systems]');
    distributionOptions.push('Modular Estándar (src/components, src/services, src/utils, src/routes)');
    distributionOptions.push('Vertical Slice / Feature-Driven (features/explore, features/missions, etc.)');
  } else if (stack.hasNext && !stack.hasTurbo) {
    // Next.js App Router
    distributionOptions.push('Next.js App Router Estándar (app/(routes), components/ui, lib/, hooks/) [⭐ Recomendado para Next.js]');
    distributionOptions.push('Atomic Design UI (components/atoms, molecules, organisms, templates) [⭐ Ideal si usas Design System]');
    distributionOptions.push('Vertical Slice / Feature-Driven (features/auth, features/billing con componentes locales)');
  } else if (stack.hasTurbo || stack.hasPnpmWorkspace) {
    // Monorepos
    distributionOptions.push('Monorepo Packages (apps/web, apps/mobile, apps/api, packages/ui, packages/core) [⭐ Recomendado para Monorepos]');
    distributionOptions.push('Monorepo + Atomic Design (apps/* + packages/ui/src/atoms, molecules, organisms)');
    distributionOptions.push('Vertical Slice Monorepo (apps/* + features/*)');
  } else if (detectedProfile.archetype === 'MOBILE_CROSS_PLATFORM' || stack.hasExpo) {
    // Mobile React Native / Expo
    distributionOptions.push('Mobile Feature-First (src/features/screens, src/components/ui, src/navigation, src/hooks) [⭐ Recomendado para Expo / React Native]');
    distributionOptions.push('Atomic Design UI (src/components/atoms, molecules, organisms, screens)');
    distributionOptions.push('Modular Estándar (src/screens, src/components, src/services)');
  } else if (detectedProfile.archetype === 'CHROME_EXTENSION') {
    // Chrome Extension MV3
    distributionOptions.push('Web Extension Layout (src/background, src/popup, src/content, src/options, manifest.json) [⭐ Recomendado para Manifest V3]');
    distributionOptions.push('Feature-Driven Extension (features/tab-sync, features/ui, features/storage)');
  } else if (detectedProfile.archetype === 'SYSTEM_CLI_RUST_GO') {
    // System CLIs
    distributionOptions.push('System CLI Layout (src/cli, src/commands, src/core, src/terminal) [⭐ Recomendado para CLIs]');
    distributionOptions.push('Capas Hexagonales (domain/, application/, infrastructure/, adapters/)');
  } else if (detectedProfile.archetype === 'DATA_PIPELINE_RAG') {
    // Data & RAG
    distributionOptions.push('Data Vault & Pipelines (ingest/, processing/, storage/, models/, vault/, tests/) [⭐ Recomendado para RAG y Datos]');
    distributionOptions.push('Capas Hexagonales (domain/, application/, infrastructure/, adapters/)');
    distributionOptions.push('Modular Estándar (scripts/, data/, models/, utils/)');
  } else if (detectedProfile.archetype === 'BACKEND_API_ONLY' || stack.hasGo || stack.hasRust) {
    // APIs and Backend
    distributionOptions.push('Capas Hexagonales (domain/, application/, infrastructure/, adapters/) [⭐ Recomendado para APIs y DDD]');
    distributionOptions.push('Vertical Slice Architecture (features/users, features/billing agrupando handlers y db)');
    distributionOptions.push('Modular Estándar Plano (controllers/, services/, models/, routes/)');
  } else {
    // General fallback
    distributionOptions.push('Atomic Design UI (src/components/atoms, molecules, organisms, layouts, pages) [⭐ Recomendado para UI y Design Systems]');
    distributionOptions.push('Vertical Slice / Feature-Driven (features/auth, features/dashboard con sus propios componentes)');
    distributionOptions.push('Capas Hexagonales (domain/, application/, infrastructure/, adapters/)');
    distributionOptions.push('Modular Estándar (src/components, src/services, src/utils, src/routes)');
    distributionOptions.push('Monorepo Packages (apps/*, packages/* con Turborepo o pnpm)');
  }

  // Ensure all major patterns are present if not already added
  const standardPool = [
    'Atomic Design UI (src/components/atoms, molecules, organisms, layouts, pages)',
    'Vertical Slice / Feature-Driven (features/auth, features/billing con componentes locales)',
    'Capas Hexagonales (domain/, application/, infrastructure/, adapters/)',
    'Next.js App Router Estándar (app/(routes), components/ui, lib/, hooks/)',
    'Data Vault & Pipelines (ingest/, processing/, storage/, models/, vault/)',
    'Modular Estándar Plano (src/components, src/services, src/utils, src/routes)'
  ];

  for (const std of standardPool) {
    const baseName = std.split(' ')[0];
    if (!distributionOptions.some(opt => opt.includes(baseName))) {
      distributionOptions.push(std);
    }
  }

  // Guaranteed [Otra / Personalizada] option!
  distributionOptions.push('[Otra / Personalizada]');

  questions.push({
    id: 'file_distribution',
    title: '📂 ¿Cómo prefieres distribuir y estructurar las carpetas del proyecto?',
    options: distributionOptions
  });

  // Question 4: Styling strategy (Adaptive: Never hardcode a universal ban!)
  if (hasFrontend || isGreenfield) {
    questions.push({
      id: 'styling_strategy',
      title: '🎨 ¿Cuál es la estrategia de estilos y UI (CSS / Tailwind / Native)?',
      options: [
        'Mixto: CSS Puro / Modules + TailwindCSS (Híbrido utilitario y modular)',
        'TailwindCSS Puro / Tailwind v4 (Utilitarios y directivas)',
        'CSS3 Puro & CSS Modules Estricto (Prohibición estricta de Tailwind / Cero Bloat)',
        'Native StyleSheet puro (React Native / Expo sin abstracciones)',
        'CSS-in-JS (Styled-Components o Emotion)',
        'Sin Estilos / Headless (APIs, Pipelines, CLIs sin frontend)',
        '[Otra / Personalizada]'
      ]
    });
  }

  // Question 5: Linters, Formatters & Type Safety
  questions.push({
    id: 'coding_styles',
    title: '📏 ¿Qué herramientas de linter, formato y calidad gobernarán el código?',
    options: [
      'Biome (Linter + Formatter ultra-rápido todo-en-uno)',
      'ESLint + Prettier + TypeScript Strict',
      'Ruff + Black + MyPy (Python moderno de alto rendimiento)',
      'Golangci-lint + Go Fmt (Go)',
      'Cargo Clippy + Cargo Fmt (Rust)',
      '[Otra / Personalizada]'
    ]
  });

  // Question 6: Shields rigidity (Tasha Yar Security)
  questions.push({
    id: 'shield_rigidity',
    title: '🛡️ ¿Qué nivel de rigidez de escudos tácticos (Tasha Yar) deseas activar?',
    options: [
      'Standard Starfleet (Moderado): Bloquea comandos destructivos y audita tipos/linters [Recomendado]',
      'Red Alert (Paranoico): Intercepta comandos, bloquea installs sin auditor de Tasha Yar, escudos reforzados',
      'Warp Speed (Ágil): Modo advertencia informativo sin bloqueos físicos',
      '[Otra / Personalizada]'
    ]
  });

  // Question 7: Crew Flavor / Identity
  questions.push({
    id: 'crew_flavor',
    title: '🎭 ¿Qué estilo de identidad deseas para la tripulación?',
    options: [
      'Híbrido: Star Trek TNG con subtítulo corporativo formal [Recomendado]',
      'Star Trek TNG Nativo: Inmersión temática completa (Picard, Data, Tasha Yar, etc.)',
      'Corporativo Formal: Títulos enterprise puros (StrategicOrchestrator, SecurityGuardrail)',
      '[Otra / Personalizada]'
    ]
  });

  return questions;
}

/**
 * Heuristically inspects a target directory to determine project maturity and lifecycle
 */
export function detectProjectLifecycle(targetDir = process.cwd()) {
  const resolved = path.resolve(targetDir);
  const exists = (rel) => fs.existsSync(path.join(resolved, rel));

  const hasPkg = exists('package.json');
  const hasGit = exists('.git');

  let commitCount = 0;
  if (hasGit) {
    try {
      commitCount = parseInt(execSync('git rev-list --count HEAD 2>/dev/null', { cwd: resolved, encoding: 'utf-8' }).trim(), 10) || 0;
    } catch {}
  }

  let rootFiles = [];
  try {
    rootFiles = fs.readdirSync(resolved).filter(f => !f.startsWith('.git') && f !== 'node_modules');
  } catch {}

  let inferredStage = PROJECT_LIFECYCLE.IN_CONSTRUCTION;
  if (rootFiles.length <= 3 && commitCount <= 2) {
    inferredStage = PROJECT_LIFECYCLE.GREENFIELD;
  } else if (commitCount > 50 || exists('CHANGELOG.md') || exists('dist') || exists('release.config.js')) {
    inferredStage = PROJECT_LIFECYCLE.MAINTENANCE;
  }

  const hasTests = exists('test') || exists('tests') || exists('vitest.config.ts') || exists('jest.config.js');
  const hasLinter = exists('eslint.config.js') || exists('.eslintrc.json') || exists('biome.json');
  const hasMcp = exists('.mcp/mcp-servers.config.json');
  const hasCrew = exists('.agents/crew');
  const hasSemgrep = exists('.semgrep.yml') || exists('.agents/rules/semgrep-starfleet.yml');
  const hasGitHooks = exists('.git/hooks/pre-commit');

  return {
    inferredStage,
    commitCount,
    hasPkg,
    hasGit,
    gaps: {
      hasTests,
      hasLinter,
      hasMcp,
      hasCrew,
      hasSemgrep,
      hasGitHooks
    }
  };
}

/**
 * Generates actionable gap recommendations based on lifecycle stage
 */
export function generateRecommendations(stage, gaps) {
  const recommendations = [];

  if (stage === PROJECT_LIFECYCLE.GREENFIELD) {
    recommendations.push({
      category: 'Arquitectura & Scaffolding',
      title: 'Scaffolding Greenfield con Atomic Design / Modular Clean',
      details: 'Ejecuta `iss new <name>` para forjar una estructura limpia con cero deuda técnica.'
    });
    recommendations.push({
      category: 'Linters & Type Safety',
      title: 'Biome o ESLint + TypeScript Strict',
      details: 'Configura formateo y análisis estático antes de comenzar la codificación.'
    });
    recommendations.push({
      category: 'Testing Framework',
      title: 'Node Native Test Runner o Vitest',
      details: 'Integra pruebas unitarias continuas con `pnpm test`.'
    });
  } else if (stage === PROJECT_LIFECYCLE.IN_CONSTRUCTION) {
    recommendations.push({
      category: 'Escudos de Desarrollo',
      title: 'Activar Escudo Perimetral de Tasha Yar (`iss engage`)',
      details: 'Despliega hooks de pre-commit y circuit breaker para proteger el código en construcción activa.'
    });
    if (!gaps.hasMcp) {
      recommendations.push({
        category: 'Tríada MCP',
        title: 'Configurar Indispensable MCP Triad (`iss mcps`)',
        details: 'Agrega Context7, Codebase Memory y GitHub MCP para acelerar el desarrollo con IA.'
      });
    }
    if (!gaps.hasTests) {
      recommendations.push({
        category: 'Testing',
        title: 'Incorporar Suite de Pruebas Automatizadas',
        details: 'Crea pruebas unitarias para módulos críticos en desarrollo.'
      });
    }
  } else {
    // MAINTENANCE
    recommendations.push({
      category: 'Auditoría & Hardening',
      title: 'Auditoría Periódica de Seguridad (`iss doctor`)',
      details: 'Verifica la integridad de los escudos, detecta desviaciones en hooks y audita dependencias.'
    });
    recommendations.push({
      category: 'Gobernanza de Skills',
      title: 'Compactar y Fusionar Habilidades (`iss skills compact`)',
      details: 'Optimiza el consumo de contexto consolidando skills dispersas en dominios canónicos.'
    });
    recommendations.push({
      category: 'SAST & Semgrep',
      title: 'Análisis Estático Continuo Semgrep',
      details: 'Previene regresiones, vulnerabilidades OWASP y polling destructivo en bases de código maduras.'
    });
  }

  return recommendations;
}

/**
 * Runs interactive or automatic lifecycle advisor
 */
export async function runLifecycleAdvisor(targetDir = process.cwd(), options = {}) {
  const resolved = path.resolve(targetDir);
  console.log(`\n\x1b[38;5;220m==============================================================================\x1b[0m`);
  console.log(`\x1b[1m⚔️ ISS-ENTERPRISE: ASESOR TÁCTICO DE CICLO DE VIDA (TASHA YAR & CONSEJO)\x1b[0m`);
  console.log(`\x1b[38;5;220m==============================================================================\x1b[0m\n`);

  const detection = detectProjectLifecycle(resolved);
  console.log(`\x1b[1mProyecto inspeccionado:\x1b[0m \x1b[36m${resolved}\x1b[0m`);
  console.log(`- Commits detectados: \x1b[1m${detection.commitCount}\x1b[0m`);
  console.log(`- Etapa sugerida por sensores: \x1b[32m${detection.inferredStage.toUpperCase()}\x1b[0m\n`);

  let chosenStage = detection.inferredStage;

  if (!options.yes && process.stdin.isTTY) {
    console.log(`\x1b[1m¿En qué etapa del ciclo de vida se encuentra el proyecto?\x1b[0m`);
    console.log(`1) Greenfield (Nuevo / Desde cero)`);
    console.log(`2) In-Construction (En construcción / Desarrollo activo)`);
    console.log(`3) Maintenance (Mantenimiento / Estable / Legacy)`);
    const ans = await promptUser(`Selecciona [1-3, defecto=${chosenStage === 'greenfield' ? 1 : chosenStage === 'construction' ? 2 : 3}]: `);
    if (ans === '1') chosenStage = PROJECT_LIFECYCLE.GREENFIELD;
    else if (ans === '2') chosenStage = PROJECT_LIFECYCLE.IN_CONSTRUCTION;
    else if (ans === '3') chosenStage = PROJECT_LIFECYCLE.MAINTENANCE;
  }

  console.log(`\n\x1b[1mGenerando diagnóstico táctico para etapa:\x1b[0m \x1b[38;5;220m${chosenStage.toUpperCase()}\x1b[0m...\n`);
  const recommendations = generateRecommendations(chosenStage, detection.gaps);

  console.log(`\x1b[1m📊 DIAGNÓSTICO DE BRECHAS Y RECOMENDACIONES TÁCTICAS:\x1b[0m`);
  recommendations.forEach((rec, idx) => {
    console.log(`\n\x1b[38;5;220m[${idx + 1}] ${rec.category}: \x1b[1m${rec.title}\x1b[0m`);
    console.log(`    ${rec.details}`);
  });

  const profile = {
    evaluatedAt: new Date().toISOString(),
    lifecycleStage: chosenStage,
    targetDir: resolved,
    metrics: {
      commitCount: detection.commitCount,
      gaps: detection.gaps
    },
    recommendations
  };

  const agentsDir = path.join(resolved, '.agents');
  if (!fs.existsSync(agentsDir)) {
    fs.mkdirSync(agentsDir, { recursive: true });
  }
  const outFile = path.join(agentsDir, 'project-profile.json');
  fs.writeFileSync(outFile, JSON.stringify(profile, null, 2), 'utf-8');
  console.log(`\n\x1b[32m✔ Perfil de ciclo de vida guardado en:\x1b[0m \x1b[36m${outFile}\x1b[0m\n`);
  return profile;
}
