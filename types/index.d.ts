/**
 * Type declarations for ISS-Enterprise (Intelligent Stack Scaffolding for Enterprise).
 * Zero-build runtime: implementation lives in ES modules with strict JSDoc + checkJs.
 */

export type ThemeMode = 'standard' | 'naval' | 'local';
export type RigidityLevel = 'standard' | 'strict' | 'fast-track';

export interface ThemeOptions {
  theme?: ThemeMode | string;
  themeFile?: string;
  rootDir?: string;
  args?: string[];
}

export interface RoleDefinition {
  key: string;
  standardRole: string;
  navalAlias: string;
  deck: string;
  responsibility: string;
}

export interface ThemePalette {
  name: string;
  zones: Record<string, string>;
  labels: Record<string, string>;
  defaults: {
    from: string;
    to: string;
  };
  clockPrefix: string | null;
}

export interface ThemeDescriptor extends ThemePalette {
  roles: Record<string, string>;
  mode: ThemeMode;
  source: string;
}

export interface TechStackFlags {
  hasPackageJson: boolean;
  hasTurbo: boolean;
  hasPnpmWorkspace: boolean;
  hasNext: boolean;
  hasNest: boolean;
  hasExpo: boolean;
  hasAstro: boolean;
  hasVite: boolean;
  hasFlutter: boolean;
  hasPython: boolean;
  hasFastApi: boolean;
  hasDjango: boolean;
  hasFlask: boolean;
  hasGo: boolean;
  hasRust: boolean;
  hasDocker: boolean;
  hasPlaywright: boolean;
  hasMaestro: boolean;
  hasDrizzle: boolean;
  hasBiome: boolean;
}

export interface ProjectProfile {
  archetype: string;
  exists?: boolean;
  path: string;
  files?: string[];
  summary: string;
  techStack?: Partial<TechStackFlags>;
  stylingStrategy?: string;
  detectedFrameworks?: string[];
}

export interface VerificationCommands {
  language: string;
  testCommand: string;
  lintCommand: string;
  buildCommand: string;
}

export interface CustomInvestigationConfig {
  runtime?: string;
  packageManager?: string;
  linter?: string;
  typecheck?: string;
  recommendedArch?: string;
  fileLayout?: string;
  framework?: string;
  pattern?: string;
  language?: string;
  testRunner?: string;
  frontend?: string;
  reactiveModel?: string;
  styling?: string;
  customName?: string;
  rules?: string[];
}

export interface CustomInvestigation {
  query: string;
  recognized: boolean;
  category: string;
  matchedTech?: string;
  recommendation: string;
  config: CustomInvestigationConfig;
}

export interface TextQuestion {
  id: string;
  type: 'text';
  title: string;
  defaultValue: string;
}

export interface ChoiceQuestion {
  id: string;
  type?: 'choice';
  title: string;
  options: string[];
}

export type AdvisorQuestion = TextQuestion | ChoiceQuestion;

export type AdvisorAnswers = Record<string, unknown> &
  Partial<ProjectProfile> & {
    project_lifecycle?: string;
    project_summary?: string;
    project_domain?: string;
    domain_invariants?: string;
    project_non_goals?: string;
    project_purpose?: string;
    purpose?: string;
    architecture_pattern?: string;
    architecturePattern?: string;
    file_distribution?: string;
    fileDistribution?: string;
    styling_strategy?: string;
    coding_styles?: string;
    shield_rigidity?: string;
    crew_flavor?: string;
    domain?: string;
    invariants?: string;
    nonGoals?: string;
    projectName?: string;
    lifecycle?: string;
    interviewCompleted?: boolean;
  };

export interface ProjectContext {
  projectName: string;
  archetype: string;
  lifecycle: string;
  styling: string;
  distribution: string;
  allowTailwind: boolean;
  theme: ThemeMode;
  rigidity: RigidityLevel;
  commands: VerificationCommands;
  isMonorepo: boolean;
  isHeadless: boolean;
  interviewCompleted: boolean;
  domain: string;
  summary: string;
  invariants: string;
  nonGoals: string;
  architecturePattern: string;
  codingStyles: string;
  customInvestigations: Record<string, CustomInvestigation>;
}

export interface ModelMetadata {
  provider: string;
  context: number;
  tier: string;
  speed: string;
}

export interface FleetModelAssignment {
  nature: string;
  navalAlias: string;
  deck: string;
  model: string;
  fallbackModel?: string;
  paraphraseModel?: string;
  crossModel?: boolean;
  authorProvider?: string;
  reviewerProvider?: string;
  isolationMode?: string;
  role?: string;
  purpose?: string;
  contextBudget?: {
    maxTokens: number;
    isConstrained: boolean;
    systemPromptBudget: number;
    chunkLimitLines: number;
    quarantineInSubagent: boolean;
  };
}

export interface FleetProfile {
  detectedProviders: string[];
  hasLocalRunner: boolean;
}

export interface FleetConfig {
  dominantProvider: string;
  availableModels: string[];
  models?: string[];
  officerRoster: Record<string, FleetModelAssignment>;
  budgetingDirectives: {
    enforceSmallContextQuarantine: boolean;
    maxSnippetLinesForSmallContext: number;
    cognitiveLanguageProtocol: {
      enabled: boolean;
      reasoningCore: string;
      ioLanguage: string;
      zeroTheatricalFiller: boolean;
    };
    coldReviewPolicy: {
      isolationMode: string;
      crossModelActive: boolean;
      authorProvider: string;
      reviewerProvider: string;
      paraphraseModel: string;
      criticModel: string;
      vitalLogicOnly: boolean;
    };
  };
}

export interface McpServerDefinition {
  command?: string;
  args?: string[];
  priority?: string;
  env?: Record<string, string>;
  type?: string;
  tool?: string;
  description: string;
}

export interface McpCatalogEntry {
  id: string;
  name: string;
  defaultServer: string;
  alternatives: string[];
  description: string;
  envVarsNeeded: string[];
}

export interface McpPlan {
  triad: Record<string, McpCatalogEntry>;
  recommendedConfig: {
    mcpServers: Record<string, McpServerDefinition>;
  };
  envVarsToCheck: string[];
}

export interface SkillFrontmatter {
  name: string;
  content: string;
}

export type SkillRecommendation = string;

export interface CompactedSkillPillar {
  canonicalName: string;
  domain: string;
  sourceSkills: string[];
  fusedContent: string;
  originalCount: number;
}

export interface SpecFrontmatterMeta {
  id: string | null;
  title: string | null;
  status: string | null;
  track: string | null;
  author: string | null;
  reviewer: string | null;
  updated: string | null;
  target_files: string[];
}

export interface SpecFileReport {
  filePath: string;
  relPath: string;
  hasFrontmatter: boolean;
  meta: SpecFrontmatterMeta;
  referencedFiles: string[];
  missingSections: string[];
  mtimeMs: number;
}

export interface SpecAuditOptions {
  staleThresholdMs?: number;
  staleDraftMs?: number;
}

export interface SpecDriftReport {
  ok: boolean;
  specsFound: number;
  specs: SpecFileReport[];
  passed: string[];
  warnings: string[];
  failures: string[];
}

export interface CreateSpecOptions {
  dryRun?: boolean;
  force?: boolean;
  title?: string;
  track?: string;
  targetFiles?: string[];
}

export interface CreateSpecResult {
  slug: string;
  relPath: string;
  fullPath: string;
  dryRun: boolean;
  content: string;
}

export type AuditOptions = SpecAuditOptions;

export interface AuditReport {
  targetDir: string;
  passed: string[];
  warnings: string[];
  failures: string[];
  ok: boolean;
}

export interface GenerateOptions {
  dryRun?: boolean;
  force?: boolean;
  theme?: ThemeMode | string;
  rigidity?: RigidityLevel | string;
  interviewCompleted?: boolean;
  createInitialSpec?: boolean;
}

export interface ScaffoldOptions {
  project_purpose?: string;
  purpose?: string;
  archetype?: string;
  file_distribution?: string;
  distribution?: string;
  projectName?: string;
}

export interface UpdaterOptions {
  source?: string | null;
  checkOnly?: boolean;
  yes?: boolean;
}

export interface UpdaterResult {
  updateAvailable?: boolean;
  currentVersion?: string;
  upstreamVersion?: string;
  aborted?: boolean;
  reason?: string;
  success?: boolean;
  version?: string;
  backupDir?: string;
  rollback?: boolean;
  error?: string;
}

export interface LifecycleGaps {
  hasTests: boolean;
  hasLinter: boolean;
  hasMcp: boolean;
  hasCrew: boolean;
  hasSemgrep: boolean;
  hasGitHooks: boolean;
}

export interface LifecycleDetection {
  inferredStage: string;
  commitCount: number;
  hasPkg: boolean;
  hasGit: boolean;
  gaps: LifecycleGaps;
}

export interface LifecycleRecommendation {
  category: string;
  title: string;
  details: string;
}

export interface LifecycleProfile {
  evaluatedAt: string;
  lifecycleStage: string;
  targetDir: string;
  metrics: {
    commitCount: number;
    gaps: LifecycleGaps;
  };
  recommendations: LifecycleRecommendation[];
}

export function runCLI(args?: string[]): Promise<void>;
export function detectProject(targetDir?: string): ProjectProfile;
export function resolveTheme(args?: string[], options?: ThemeOptions): ThemeMode;
export function allocateFleet(
  availableModels?: string[],
  dominantProvider?: string,
  options?: { detectedProviders?: string[] }
): FleetConfig;
export function allocateCrewToFleet(providers?: string[]): FleetConfig;
export function buildMcpPlan(
  techStack?: Partial<TechStackFlags>,
  dominantProvider?: string
): McpPlan;
export function generateGovernanceArchitecture(
  targetDir: string,
  profile?: Partial<AdvisorAnswers> | ProjectProfile,
  fleetPlan?: Partial<FleetConfig>,
  mcpPlan?: Partial<McpPlan>,
  options?: GenerateOptions
): string[];
export function runGovernanceAudit(targetDir?: string, options?: AuditOptions): AuditReport;
export function auditSpecDrift(rootDir?: string, options?: SpecAuditOptions): SpecDriftReport;
export function createSpecTemplate(
  targetDir?: string,
  slug?: string,
  options?: CreateSpecOptions
): CreateSpecResult;
