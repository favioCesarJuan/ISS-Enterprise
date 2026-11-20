/**
 * ==============================================================================
 * 🛰️ ISS-ENTERPRISE: TACTICAL PROJECT DETECTOR & SCANNER
 * ==============================================================================
 * Inspects a directory to identify stack signatures, frameworks, and archetypes.
 * Handles diverse projects: Monorepos, Astro portals, Python RAG, APIs, and Greenfield.
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';

export const ARCHETYPES = {
  GREENFIELD_EMPTY: 'GREENFIELD_EMPTY',
  FULLSTACK_MONOREPO: 'FULLSTACK_MONOREPO',
  CONTENT_SSG_PORTAL: 'CONTENT_SSG_PORTAL',
  DATA_PIPELINE_RAG: 'DATA_PIPELINE_RAG',
  STANDALONE_SCRIPT_PROTOTYPE: 'STANDALONE_SCRIPT_PROTOTYPE',
  BACKEND_API_ONLY: 'BACKEND_API_ONLY',
  MOBILE_CROSS_PLATFORM: 'MOBILE_CROSS_PLATFORM',
  CHROME_EXTENSION: 'CHROME_EXTENSION',
  SYSTEM_CLI_RUST_GO: 'SYSTEM_CLI_RUST_GO'
};

/**
 * Scans a target directory and returns an exhaustive archetype profile.
 * @param {string} [targetDir]
 * @returns {import('../types/index.d.ts').ProjectProfile} Archetype profile
 */
export function detectProject(targetDir = process.cwd()) {
  const dir = path.resolve(targetDir);

  if (!fs.existsSync(dir)) {
    return {
      archetype: ARCHETYPES.GREENFIELD_EMPTY,
      exists: false,
      path: dir,
      summary: 'Directory does not exist yet (Greenfield).'
    };
  }

  const entries = fs.readdirSync(dir);
  const visibleEntries = entries.filter(e => !e.startsWith('.'));

  if (visibleEntries.length === 0) {
    return {
      archetype: ARCHETYPES.GREENFIELD_EMPTY,
      exists: true,
      path: dir,
      files: [],
      summary: 'Empty directory ready for Greenfield Starbase creation.'
    };
  }

  /** @param {string} filename */
  const hasFile = (filename) => fs.existsSync(path.join(dir, filename));
  /** @param {RegExp} regex */
  const hasPattern = (regex) => entries.some(e => regex.test(e));

  // Manifests & Configs
  const hasPackageJson = hasFile('package.json');
  const hasTurbo = hasFile('turbo.json');
  const hasPnpmWorkspace = hasFile('pnpm-workspace.yaml');
  const hasAstroConfig = hasPattern(/^astro\.config\./);
  const hasPython = hasFile('requirements.txt') || hasFile('pyproject.toml') || entries.some(e => e.endsWith('.py'));
  const hasGo = hasFile('go.mod');
  const hasRust = hasFile('Cargo.toml');
  const hasFlutter = hasFile('pubspec.yaml');
  const hasDocker = hasFile('Dockerfile') || hasFile('docker-compose.yml');
  const hasPlaywright = hasFile('playwright.config.ts') || hasFile('playwright.config.js');
  const hasMaestro = fs.existsSync(path.join(dir, '.maestro'));
  const hasApps = fs.existsSync(path.join(dir, 'apps'));
  const hasPackages = fs.existsSync(path.join(dir, 'packages'));

  let pythonManifest = '';
  for (const pyFile of ['requirements.txt', 'pyproject.toml']) {
    if (hasFile(pyFile)) {
      try {
        pythonManifest += '\n' + fs.readFileSync(path.join(dir, pyFile), 'utf-8');
      } catch { /* fallback: unreadable python manifest */ }
    }
  }
  const hasFastApi = /fastapi/i.test(pythonManifest);
  const hasDjango = /django/i.test(pythonManifest);
  const hasFlask = /flask/i.test(pythonManifest);

  // Detailed dependency analysis if package.json exists
  /** @type {{ dependencies?: Record<string, string>, devDependencies?: Record<string, string> }} */
  let packageJson = {};
  if (hasPackageJson) {
    try {
      packageJson = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
    } catch {
      packageJson = {};
    }
  }

  const allDeps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {})
  };

  const hasNext = 'next' in allDeps;
  const hasNest = '@nestjs/core' in allDeps;
  const hasExpo = 'expo' in allDeps;
  const hasAstro = 'astro' in allDeps || hasAstroConfig;
  const hasVite = 'vite' in allDeps;
  const hasTailwind = 'tailwindcss' in allDeps;
  const hasBiome = '@biomejs/biome' in allDeps || hasFile('biome.json');
  const hasDrizzle = 'drizzle-orm' in allDeps;

  const hasManifest = hasFile('manifest.json');
  let isChromeExtension = false;
  if (hasManifest) {
    try {
      const mf = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf-8'));
      if (mf.manifest_version === 2 || mf.manifest_version === 3) {
        isChromeExtension = true;
      }
    } catch { /* fallback: ignore malformed manifest.json */ }
  }

  // Determine Archetype
  let archetype = ARCHETYPES.STANDALONE_SCRIPT_PROTOTYPE;
  let summary = '';

  if ((hasTurbo || hasPnpmWorkspace) && (hasApps || hasPackages)) {
    archetype = ARCHETYPES.FULLSTACK_MONOREPO;
    summary = 'Complex Monorepo with workspaces and distributed packages.';
  } else if (hasExpo || hasFlutter || ('react-native' in allDeps && !hasNext)) {
    archetype = ARCHETYPES.MOBILE_CROSS_PLATFORM;
    summary = hasFlutter
      ? 'Mobile Cross-Platform Application (Flutter / Dart).'
      : 'Mobile Cross-Platform Application (Expo / React Native).';
  } else if (isChromeExtension) {
    archetype = ARCHETYPES.CHROME_EXTENSION;
    summary = 'Browser Web Extension (Manifest V3 / WebExtensions).';
  } else if (hasAstro) {
    archetype = ARCHETYPES.CONTENT_SSG_PORTAL;
    summary = 'Content & SSG Portal powered by Astro.';
  } else if (hasPython && (entries.some(e => /rag|scraper|ingest|pipeline/i.test(e)) || hasDocker)) {
    archetype = ARCHETYPES.DATA_PIPELINE_RAG;
    summary = 'Data Engineering, Web Scraper, or RAG Pipeline.';
  } else if ((hasGo || hasRust) && !hasNest && !hasNext && !hasExpo && !entries.some(e => /api|server|routes/i.test(e))) {
    archetype = ARCHETYPES.SYSTEM_CLI_RUST_GO;
    summary = 'High-Performance System CLI or Native Tool (Rust / Go).';
  } else if (hasGo || hasRust || hasFastApi || hasDjango || hasFlask || (hasNest && !hasNext && !hasExpo)) {
    archetype = ARCHETYPES.BACKEND_API_ONLY;
    summary = 'Backend Service or API without dedicated frontend.';
  } else if (hasPython && !hasPackageJson) {
    archetype = ARCHETYPES.DATA_PIPELINE_RAG;
    summary = 'Python-centric Data or Scripting project.';
  } else {
    archetype = ARCHETYPES.STANDALONE_SCRIPT_PROTOTYPE;
    summary = 'Modular application or prototype scripts.';
  }

  // Detect styling strategy
  let stylingStrategy = 'UNKNOWN';
  const rulesContent = hasFile('rules.md') ? fs.readFileSync(path.join(dir, 'rules.md'), 'utf-8') : '';
  const forbidsTailwindInRules = /(?:no\s+tailwind|prohibit.*tailwind|forbid.*tailwind|STRICT_NO_TAILWIND|pure CSS3)/i.test(rulesContent);

  if (hasTailwind && (hasFile('style.css') || hasPattern(/\.module\.css$/) || hasAstro)) {
    stylingStrategy = 'MIXED_CSS_TAILWIND'; // Mixed utility + CSS modules
  } else if (hasTailwind) {
    stylingStrategy = 'TAILWIND_PURE';
  } else if (forbidsTailwindInRules) {
    stylingStrategy = 'STRICT_NO_TAILWIND'; // Strict zero-Tailwind directive
  } else if ((hasExpo || hasFlutter) && !hasTailwind) {
    stylingStrategy = 'NATIVE_STYLESHEET';
  } else if (!hasNext && !hasAstro && !hasExpo && !hasVite) {
    stylingStrategy = 'HEADLESS_NO_UI'; // Headless backend or data pipeline
  }

  return {
    archetype,
    path: dir,
    summary,
    techStack: {
      hasPackageJson,
      hasTurbo,
      hasPnpmWorkspace,
      hasNext,
      hasNest,
      hasExpo,
      hasAstro,
      hasVite,
      hasFlutter,
      hasPython,
      hasFastApi,
      hasDjango,
      hasFlask,
      hasGo,
      hasRust,
      hasDocker,
      hasPlaywright,
      hasMaestro,
      hasDrizzle,
      hasBiome
    },
    stylingStrategy,
    detectedFrameworks: Object.keys(allDeps).slice(0, 15)
  };
}
