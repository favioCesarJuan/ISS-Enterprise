/**
 * ==============================================================================
 * 🧠 ISS-ENTERPRISE: ADVISOR & AUTONOMOUS INVESTIGATION ENGINE
 * ==============================================================================
 * Formulates tailored questions with guaranteed [Otra / Custom] write-ins.
 * When a custom choice is made, runs heuristic investigation to infer optimal
 * file distribution, linters, compiler flags, and architecture patterns.
 * ==============================================================================
 */

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
  }
};

/**
 * Investigates an "Otra" / custom input dynamically.
 * @param {string} category 'stack' | 'arch' | 'styling' | 'linter' | 'layout'
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
 * Returns the interactive questions tailored to the detected archetype.
 * @param {object} detectedProfile
 * @returns {Array<object>} List of structured questions
 */
export function getTailoredQuestions(detectedProfile) {
  const isGreenfield = detectedProfile.archetype === 'GREENFIELD_EMPTY';
  const hasFrontend = detectedProfile.techStack?.hasNext || detectedProfile.techStack?.hasAstro || detectedProfile.techStack?.hasExpo;

  const questions = [];

  // Question 1: Greenfield purpose OR Adoption confirmation
  if (isGreenfield) {
    questions.push({
      id: 'project_purpose',
      title: '🛸 ¿Qué tipo de nave espacial deseas forjar desde cero?',
      options: [
        'SaaS Fullstack (Monorepo con Web + Mobile + API)',
        'Backend / Microservicio API (Go, FastAPI, NestJS, Rust)',
        'Pipeline de Datos / Scraper / RAG (Python, Vector DB, Docker)',
        'Portal de Contenidos / Blog / SSG (Astro, Markdown/MDX)',
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

  // Question 3: Directory layout / File distribution
  questions.push({
    id: 'file_distribution',
    title: '📂 ¿Cómo prefieres distribuir y estructurar los archivos?',
    options: [
      'Monorepo Packages (apps/*, packages/* con Turborepo o pnpm)',
      'Vertical Slice (features/billing, features/auth, features/dashboard)',
      'Capas Hexagonales (domain/, application/, infrastructure/, adapters/)',
      'Modular Estándar (src/components, src/services, src/utils, src/routes)',
      'Data Vault & Pipelines (ingest/, processing/, storage/, models/, vault/)',
      '[Otra / Personalizada]'
    ]
  });

  // Question 4: Styling strategy (Adaptive: Never hardcode a universal ban!)
  if (hasFrontend || isGreenfield) {
    questions.push({
      id: 'styling_strategy',
      title: '🎨 ¿Cuál es la estrategia de estilos y UI (CSS / Tailwind / Native)?',
      options: [
        'Mixto: CSS Puro / Modules + TailwindCSS (Caso como en cosmo-hub)',
        'TailwindCSS Puro / Tailwind v4 (Utilitarios y directivas)',
        'CSS3 Puro & CSS Modules Estricto (Prohibición de Tailwind como en extra-time)',
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

  // Question 6: Shields rigidity (Worf Security)
  questions.push({
    id: 'shield_rigidity',
    title: '🛡️ ¿Qué nivel de rigidez de escudos tácticos (Worf) deseas activar?',
    options: [
      'Standard Starfleet (Moderado): Bloquea comandos destructivos y audita tipos/linters [Recomendado]',
      'Red Alert (Paranoico): Intercepta comandos, bloquea installs sin auditor de Worf, Strix activo',
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
      'Star Trek TNG Nativo: Inmersión temática completa (Picard, Data, Worf, etc.)',
      'Corporativo Formal: Títulos enterprise puros (StrategicOrchestrator, SecurityGuardrail)',
      '[Otra / Personalizada]'
    ]
  });

  return questions;
}
