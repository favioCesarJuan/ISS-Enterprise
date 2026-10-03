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

export const MODEL_REGISTRY = {
  // Google Gemini
  'gemini-3.1-pro': { provider: 'google', context: 1000000, tier: 'HIGH_REASONING', speed: 'MEDIUM' },
  'gemini-3.8-flash': { provider: 'google', context: 1000000, tier: 'FAST_ECONOMY', speed: 'ULTRA_FAST' },
  'gemini-1.5-pro': { provider: 'google', context: 2000000, tier: 'HIGH_REASONING', speed: 'MEDIUM' },

  // Anthropic Claude
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
  'o1': { provider: 'openai', context: 200000, tier: 'HIGH_REASONING', speed: 'THINKING' },
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
 */
export function detectAvailableFleet() {
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
 * Recommends optimal officer assignment based on user's available fleet.
 * @param {string[]} availableModels List of model IDs available to user
 * @param {string} dominantProvider Preferred or detected provider
 * @returns {object} Officer-to-model mapping with context budgeting rules
 */
export function allocateFleet(availableModels = [], dominantProvider = 'anthropic') {
  // If no explicit models provided, create default based on preferred provider
  let models = availableModels.length > 0 ? availableModels : getDefaultFleetForProvider(dominantProvider);

  // Classify available models into Reasoning vs Fast Economy
  let highReasoningModel = models.find(m => MODEL_REGISTRY[m]?.tier === 'HIGH_REASONING') || models[0] || 'claude-3-5-sonnet';
  let fastEconomyModel = models.find(m => MODEL_REGISTRY[m]?.tier === 'FAST_ECONOMY') || models[models.length - 1] || 'claude-3-5-haiku';

  const officerRoster = {
    'Captain (User)': {
      nature: 'HUMAN',
      model: 'The Captain (Human User)',
      role: 'Strategic direction, requirements, executive sign-off'
    },
    'William T. Riker (First Officer)': {
      nature: 'AI_AGENT',
      model: highReasoningModel,
      contextBudget: getContextBudget(highReasoningModel),
      purpose: 'Lead AI orchestrator, task planning, subagent dispatch'
    },
    'Lt. Cmdr. Data (Systems & Logic)': {
      nature: 'AI_AGENT',
      model: highReasoningModel,
      contextBudget: getContextBudget(highReasoningModel),
      purpose: 'Formal logic, DDD, RAG pipelines, mathematical algorithms'
    },
    'Lt. Cmdr. Geordi La Forge (Engineering)': {
      nature: 'AI_AGENT',
      model: highReasoningModel,
      contextBudget: getContextBudget(highReasoningModel),
      purpose: 'Architecture lead, monorepo boundaries, Docker, mentorship'
    },
    'Lt. Tasha Yar (Security Guardrail)': {
      nature: 'AI_AGENT',
      model: highReasoningModel,
      fallbackModel: fastEconomyModel,
      contextBudget: getContextBudget(highReasoningModel),
      purpose: 'Tactical security shields, input sanitization, Semgrep, defensive perimeter'
    },
    'Lt. Worf (Offensive Security & Red Team)': {
      nature: 'AI_AGENT',
      model: highReasoningModel,
      fallbackModel: fastEconomyModel,
      contextBudget: getContextBudget(highReasoningModel),
      purpose: 'Adversarial red teaming (Strix), penetration testing, supply chain audits, away-team incursions'
    },
    'Counselor Deanna Troi (Design & UX)': {
      nature: 'AI_AGENT',
      model: highReasoningModel,
      fallbackModel: fastEconomyModel,
      contextBudget: getContextBudget(highReasoningModel),
      purpose: 'Design system, ergonomics, styling governance, WCAG AAA'
    },
    'Dr. Beverly Crusher (Health & Quality)': {
      nature: 'AI_AGENT',
      model: highReasoningModel,
      fallbackModel: fastEconomyModel,
      contextBudget: getContextBudget(highReasoningModel),
      purpose: 'Code health, Ponytail minimalism, compiler diagnostics'
    },
    'Ensign Wesley Crusher (Automation Runner)': {
      nature: 'AI_AGENT',
      model: fastEconomyModel,
      contextBudget: getContextBudget(fastEconomyModel),
      purpose: 'Fast script execution, test runners (Vitest/Pytest/Playwright)'
    },
    'Q (The Q Continuum)': {
      nature: 'META_AGENT',
      model: highReasoningModel,
      contextBudget: getContextBudget(highReasoningModel),
      purpose: 'Omniscient meta-critic, timeline audits, bias challenge'
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
        tokenSavingsEstimate: '30-50%'
      }
    }
  };
}

export function allocateCrewToFleet(providers = []) {
  const provider = providers[0] || 'anthropic';
  return allocateFleet([], provider);
}

/**
 * Calculates context budgeting directives for a given model.
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

function getDefaultFleetForProvider(provider) {
  switch (provider.toLowerCase()) {
    case 'anthropic':
    case 'claude':
      return ['claude-3-5-sonnet', 'claude-3-5-haiku'];
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
      return ['gemini-3.1-pro', 'gemini-3.8-flash'];
  }
}

/**
 * Emits .env.fleet.example content with the required API keys based on fleet allocation.
 * @param {object} fleetPlan
 * @returns {string}
 */
export function generateFleetEnvConfig(fleetPlan = {}) {
  const models = fleetPlan.models || [];
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
 * @param {object} fleetPlan
 * @returns {string}
 */
export function generateOllamaPullScript(fleetPlan = {}) {
  const models = fleetPlan.models || [];
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

