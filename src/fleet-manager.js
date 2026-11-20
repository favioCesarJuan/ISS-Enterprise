/**
 * ==============================================================================
 * 🤖 ISS-ENTERPRISE: MULTI-MODEL & MIXED-FLEET ORCHESTRATOR
 * ==============================================================================
 * Manages heterogeneous fleets (Claude, DeepSeek, Qwen, Gemini, OpenAI, Ollama).
 * Calculates context window budgets (8k-32k vs 200k vs 1M+) to prevent context
 * overflow, attention degradation, and excessive token expenditure.
 * ==============================================================================
 */

import fs from 'node:fs';

/** @type {Record<string, import('../types/index.d.ts').ModelMetadata>} */
export const MODEL_REGISTRY = {
  // Google Gemini
  'gemini-2.5-pro': { provider: 'google', context: 1000000, tier: 'HIGH_REASONING', speed: 'MEDIUM' },
  'gemini-2.5-flash': { provider: 'google', context: 1000000, tier: 'FAST_ECONOMY', speed: 'ULTRA_FAST' },
  'gemini-2.5-flash-lite': { provider: 'google', context: 1000000, tier: 'FAST_ECONOMY', speed: 'ULTRA_FAST' },

  // Anthropic Claude
  'claude-3-7-sonnet': { provider: 'anthropic', context: 200000, tier: 'HIGH_REASONING', speed: 'FAST' },
  'claude-3-5-sonnet': { provider: 'anthropic', context: 200000, tier: 'HIGH_REASONING', speed: 'FAST' },
  'claude-3-5-haiku': { provider: 'anthropic', context: 200000, tier: 'FAST_ECONOMY', speed: 'ULTRA_FAST' },

  // DeepSeek
  'deepseek-r1': { provider: 'deepseek', context: 64000, tier: 'HIGH_REASONING', speed: 'THINKING' },
  'deepseek-v3': { provider: 'deepseek', context: 64000, tier: 'HIGH_REASONING', speed: 'FAST' },

  // Alibaba Qwen (Local or API)
  'qwen2.5-coder-72b': { provider: 'qwen', context: 32768, tier: 'HIGH_REASONING', speed: 'MEDIUM' },
  'qwen2.5-coder-32b': { provider: 'qwen', context: 32768, tier: 'BALANCED', speed: 'FAST' },
  'qwen2.5-coder-7b': { provider: 'qwen', context: 32768, tier: 'FAST_ECONOMY', speed: 'ULTRA_FAST' },

  // OpenAI
  'o3-mini': { provider: 'openai', context: 200000, tier: 'HIGH_REASONING', speed: 'FAST' },
  'gpt-4o': { provider: 'openai', context: 128000, tier: 'HIGH_REASONING', speed: 'FAST' },
  'gpt-4o-mini': { provider: 'openai', context: 128000, tier: 'FAST_ECONOMY', speed: 'ULTRA_FAST' }
};

export const PROVIDER_REGISTRY = {
  google: { name: 'Google Gemini', envKey: 'GEMINI_API_KEY' },
  anthropic: { name: 'Anthropic Claude', envKey: 'ANTHROPIC_API_KEY' },
  openai: { name: 'OpenAI', envKey: 'OPENAI_API_KEY' },
  deepseek: { name: 'DeepSeek', envKey: 'DEEPSEEK_API_KEY' },
  qwen: { name: 'Alibaba Qwen / Ollama', envKey: 'DASHSCOPE_API_KEY' }
};

/**
 * Detects available model fleet based on environment keys and local setups.
 * @returns {import('../types/index.d.ts').FleetProfile}
 */
export function detectAvailableFleet() {
  /** @type {string[]} */
  const detected = [];
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) detected.push('gemini');
  if (process.env.ANTHROPIC_API_KEY) detected.push('anthropic');
  if (process.env.OPENAI_API_KEY) detected.push('openai');
  if (process.env.DEEPSEEK_API_KEY) detected.push('deepseek');

  // Fallback defaults to make the CLI work seamlessly everywhere
  if (detected.length === 0) {
    detected.push('gemini', 'anthropic', 'deepseek', 'qwen');
  }

  let hasLocalRunner = Boolean(process.env.OLLAMA_HOST);
  try {
    if (!hasLocalRunner && fs.existsSync('/usr/local/bin/ollama')) {
      hasLocalRunner = true;
    }
  } catch {}

  return {
    detectedProviders: detected,
    hasLocalRunner
  };
}

/**
 * Normalizes provider aliases to canonical MODEL_REGISTRY provider keys.
 * @param {string} provider
 * @returns {string}
 */
function normalizeProvider(provider = '') {
  const p = String(provider).toLowerCase().trim();
  if (p === 'claude' || p === 'anthropic') return 'anthropic';
  if (p === 'gemini' || p === 'google') return 'google';
  if (p === 'ollama' || p === 'qwen' || p === 'local_ollama') return 'qwen';
  if (p === 'openai' || p === 'gpt') return 'openai';
  if (p === 'deepseek') return 'deepseek';
  return p || 'anthropic';
}

/**
 * Selects a distinct cross-model reviewer for Zero-Context Cold Review when
 * multiple providers are available, mitigating same-model self-confirmation bias.
 * @param {string[]} availableModels
 * @param {string} authorProvider
 * @param {string[]} detectedProviders
 * @param {string} fallbackModel
 * @returns {{ model: string, crossModel: boolean, provider: string }}
 */
function selectCrossModelReviewer(availableModels = [], authorProvider = 'anthropic', detectedProviders = [], fallbackModel = 'claude-3-7-sonnet') {
  const fromAvailable =
    availableModels.find(m => MODEL_REGISTRY[m] && MODEL_REGISTRY[m].provider !== authorProvider && MODEL_REGISTRY[m].tier === 'HIGH_REASONING') ||
    availableModels.find(m => MODEL_REGISTRY[m] && MODEL_REGISTRY[m].provider !== authorProvider && MODEL_REGISTRY[m].tier === 'BALANCED');

  if (fromAvailable) {
    return {
      model: fromAvailable,
      crossModel: true,
      provider: MODEL_REGISTRY[fromAvailable].provider
    };
  }

  for (const rawProv of detectedProviders) {
    const prov = normalizeProvider(rawProv);
    if (prov && prov !== authorProvider) {
      const candidate = getDefaultFleetForProvider(prov)[0];
      if (candidate) {
        return {
          model: candidate,
          crossModel: true,
          provider: MODEL_REGISTRY[candidate]?.provider || prov
        };
      }
    }
  }

  return {
    model: fallbackModel,
    crossModel: false,
    provider: authorProvider
  };
}

/**
 * Recommends optimal role assignment based on user's available fleet.
 * @param {string[]} [availableModels] List of model IDs available to user
 * @param {string} [dominantProvider] Preferred or detected provider
 * @param {{ detectedProviders?: string[] }} [options] Optional routing overrides
 * @returns {import('../types/index.d.ts').FleetConfig} Role-to-model mapping with context budgeting rules
 */
export function allocateFleet(availableModels = [], dominantProvider = 'anthropic', options = {}) {
  // If no explicit models provided, create default based on preferred provider
  const models = availableModels.length > 0 ? availableModels : getDefaultFleetForProvider(dominantProvider);

  // Classify available models into Reasoning vs Fast Economy
  const highReasoningModel = models.find(m => MODEL_REGISTRY[m]?.tier === 'HIGH_REASONING') || models[0] || 'claude-3-7-sonnet';
  const fastEconomyModel = models.find(m => MODEL_REGISTRY[m]?.tier === 'FAST_ECONOMY') || models[models.length - 1] || 'claude-3-5-haiku';

  const authorProvider = MODEL_REGISTRY[highReasoningModel]?.provider || normalizeProvider(dominantProvider);
  const reviewer = selectCrossModelReviewer(models, authorProvider, options.detectedProviders || [], highReasoningModel);

  /** @type {Record<string, import('../types/index.d.ts').FleetModelAssignment>} */
  const officerRoster = {
    'Human / Product Owner': {
      nature: 'HUMAN',
      navalAlias: 'Captain',
      deck: 'BRIDGE',
      model: 'Human User',
      role: 'Strategic direction, requirements, executive sign-off'
    },
    'Lead AI Orchestrator': {
      nature: 'AI_AGENT',
      navalAlias: 'First Officer',
      deck: 'BRIDGE',
      model: highReasoningModel,
      contextBudget: getContextBudget(highReasoningModel),
      purpose: 'Lead AI orchestrator, task planning, subagent dispatch'
    },
    'Systems & Logic Analyst': {
      nature: 'AI_AGENT',
      navalAlias: 'Science & Logic Officer',
      deck: 'BRIDGE',
      model: highReasoningModel,
      contextBudget: getContextBudget(highReasoningModel),
      purpose: 'Formal logic, DDD, workspace DAG, mathematical algorithms'
    },
    'Architecture Lead': {
      nature: 'AI_AGENT',
      navalAlias: 'Chief Engineer',
      deck: 'BRIDGE',
      model: highReasoningModel,
      contextBudget: getContextBudget(highReasoningModel),
      purpose: 'Architecture lead, monorepo boundaries, CI/build pipelines'
    },
    'Security Guardrail': {
      nature: 'AI_AGENT',
      navalAlias: 'Security Officer',
      deck: 'BRIDGE',
      model: highReasoningModel,
      fallbackModel: fastEconomyModel,
      contextBudget: getContextBudget(highReasoningModel),
      purpose: 'Pre-tool shell/path guard, Semgrep SAST, skill security scanning'
    },
    'Design System & UX Enforcer': {
      nature: 'AI_AGENT',
      navalAlias: 'UX & Comms Officer',
      deck: 'BRIDGE',
      model: highReasoningModel,
      fallbackModel: fastEconomyModel,
      contextBudget: getContextBudget(highReasoningModel),
      purpose: 'Design system, CLI ergonomics, styling governance, WCAG AAA'
    },
    'Quality & Health Auditor': {
      nature: 'AI_AGENT',
      navalAlias: 'Chief Medical Officer',
      deck: 'BRIDGE',
      model: highReasoningModel,
      fallbackModel: fastEconomyModel,
      contextBudget: getContextBudget(highReasoningModel),
      purpose: 'Post-edit policy check, KISS/YAGNI/DRY/SOLID minimalism, anti-polling rules'
    },
    'Test Automation Runner': {
      nature: 'AI_AGENT',
      navalAlias: 'Lower-Deck Runner',
      deck: 'LOWER_DECK',
      model: fastEconomyModel,
      contextBudget: getContextBudget(fastEconomyModel),
      purpose: 'Stateless script execution, simulation & test runners (node --test/Vitest/Pytest)'
    },
    'Meta-Critic Evaluator': {
      nature: 'META_AGENT',
      navalAlias: 'Lower-Deck Evaluator',
      deck: 'LOWER_DECK',
      model: reviewer.model,
      paraphraseModel: fastEconomyModel,
      crossModel: reviewer.crossModel,
      authorProvider,
      reviewerProvider: reviewer.provider,
      isolationMode: 'ZERO_CONTEXT_READ_ONLY',
      contextBudget: getContextBudget(reviewer.model),
      purpose: 'Stateless zero-context cold review (Paraphraser, Critic, Verifier), bias detection, doc-to-code parity'
    }
  };

  return {
    dominantProvider,
    availableModels: models,
    officerRoster,
    budgetingDirectives: {
      enforceSmallContextQuarantine: true,
      maxSnippetLinesForSmallContext: 50,
      cognitiveLanguageProtocol: {
        enabled: true,
        reasoningCore: 'en',
        ioLanguage: 'auto_detect_mirror',
        zeroTheatricalFiller: true
      },
      coldReviewPolicy: {
        isolationMode: 'ZERO_CONTEXT_READ_ONLY',
        crossModelActive: reviewer.crossModel,
        authorProvider,
        reviewerProvider: reviewer.provider,
        paraphraseModel: fastEconomyModel,
        criticModel: reviewer.model,
        vitalLogicOnly: true
      }
    }
  };
}

/**
 * Allocates all governance roles using detected provider list.
 * @param {string[]} [providers]
 * @returns {import('../types/index.d.ts').FleetConfig}
 */
export function allocateCrewToFleet(providers = []) {
  const provider = providers[0] || 'anthropic';
  return allocateFleet([], provider, { detectedProviders: providers });
}

/**
 * Calculates context budgeting directives for a given model.
 * @param {string} modelId
 */
function getContextBudget(modelId) {
  const meta = MODEL_REGISTRY[modelId] || { context: 32768 };
  const isConstrained = meta.context <= 32768;

  return {
    maxTokens: meta.context,
    isConstrained,
    systemPromptBudget: isConstrained ? 800 : 4000,
    chunkLimitLines: isConstrained ? 50 : 250,
    quarantineInSubagent: isConstrained
  };
}

/** @param {string} provider @returns {string[]} */
function getDefaultFleetForProvider(provider) {
  switch (provider.toLowerCase()) {
    case 'anthropic':
    case 'claude':
      return ['claude-3-7-sonnet', 'claude-3-5-haiku'];
    case 'deepseek':
      return ['deepseek-r1', 'deepseek-v3'];
    case 'qwen':
    case 'ollama':
      return ['qwen2.5-coder-72b', 'qwen2.5-coder-7b'];
    case 'openai':
      return ['gpt-4o', 'gpt-4o-mini'];
    case 'google':
    case 'gemini':
    default:
      return ['gemini-2.5-pro', 'gemini-2.5-flash'];
  }
}

/** @param {Partial<import('../types/index.d.ts').FleetConfig>} [fleetPlan] @returns {string[]} */
function collectPlanModels(fleetPlan = {}) {
  const baseModels = fleetPlan.availableModels || fleetPlan.models || [];
  const criticModel = fleetPlan.officerRoster?.['Meta-Critic Evaluator']?.model;
  return criticModel && !baseModels.includes(criticModel) ? [...baseModels, criticModel] : baseModels;
}

/**
 * Emits .env.fleet.example content with the required API keys based on fleet allocation.
 * @param {Partial<import('../types/index.d.ts').FleetConfig>} [fleetPlan]
 * @returns {string}
 */
export function generateFleetEnvConfig(fleetPlan = {}) {
  const models = collectPlanModels(fleetPlan);
  const lines = [
    '# ==============================================================================',
    '# 🛸 ISS-ENTERPRISE MULTI-MODEL FLEET CREDENTIALS & ENDPOINTS',
    '# ==============================================================================',
    '# Populate the credentials corresponding to your tactical fleet allocation.',
    ''
  ];

  const hasAnthropic = models.some(m => m.includes('claude'));
  const hasDeepSeek = models.some(m => m.includes('deepseek'));
  const hasOpenAI = models.some(m => m.includes('gpt') || m.includes('o3'));
  const hasGemini = models.some(m => m.includes('gemini'));

  lines.push('# Primary Orchestration & High-Reasoning Providers');
  lines.push(`ANTHROPIC_API_KEY=${hasAnthropic ? 'sk-ant-api03-...' : ''}`);
  lines.push(`DEEPSEEK_API_KEY=${hasDeepSeek ? 'sk-...' : ''}`);
  lines.push(`GEMINI_API_KEY=${hasGemini ? 'AIzaSy...' : ''}`);
  lines.push(`OPENAI_API_KEY=${hasOpenAI ? 'sk-proj-...' : ''}`);
  lines.push('');

  lines.push('# Local Ollama Endpoint (for air-gapped / economy models)');
  lines.push('OLLAMA_HOST=http://localhost:11434');
  lines.push('');

  return lines.join('\n');
}

/**
 * Generates an automated shell script to pull local Ollama models assigned to the fleet.
 * @param {Partial<import('../types/index.d.ts').FleetConfig>} [fleetPlan]
 * @returns {string}
 */
export function generateOllamaPullScript(fleetPlan = {}) {
  const models = collectPlanModels(fleetPlan);
  /** @type {string[]} */
  const ollamaModels = [];

  for (const m of models) {
    if (m.includes('qwen2.5-coder-7b')) ollamaModels.push('qwen2.5-coder:7b');
    else if (m.includes('qwen2.5-coder-72b')) ollamaModels.push('qwen2.5-coder:32b');
    else if (m.includes('deepseek-r1') && !models.some(x => x.includes('claude'))) ollamaModels.push('deepseek-r1:8b');
  }

  if (ollamaModels.length === 0) {
    ollamaModels.push('qwen2.5-coder:7b');
  }

  const unique = Array.from(new Set(ollamaModels));

  return `#!/usr/bin/env bash
# ==============================================================================
# 🤖 ISS-ENTERPRISE OLLAMA FLEET BOOTSTRAPPER
# ==============================================================================
set -e

echo "🛸 Pulling local models for ISS-Enterprise tactical fleet..."

which ollama >/dev/null 2>&1 || {
  echo "❌ Error: Ollama is not installed. Visit https://ollama.com to install."
  exit 1
}

${unique.map(m => `echo "⬇️  Pulling ${m}..."\nollama pull ${m}`).join('\n\n')}

echo "✅ All local fleet models are pulled and ready for engagement!"
`;
}

