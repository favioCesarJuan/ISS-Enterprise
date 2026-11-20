/**
 * ==============================================================================
 * 📐 ISS-ENTERPRISE: DETERMINISTIC SDD SPEC CHECKER & DRIFT DETECTOR
 * ==============================================================================
 * Zero-dependency parser and structural drift validator for SDD specs
 * (docs/designs/*.md and frontmatter-enabled spec.md).
 * Validates status lifecycle, required Heilmeier/Cold Review sections,
 * referenced file existence, and post-approval modification staleness.
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export const VALID_SPEC_STATUSES = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'SUPERSEDED'];

export const REQUIRED_SDD_SECTIONS = [
  'Problem & Objectives',
  'Scope & Explicit Non-Goals',
  'Verification & Acceptance Criteria',
  'Cold Review Log'
];

const DEFAULT_STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_STALE_DRAFT_MS = 14 * 24 * 60 * 60 * 1000;
const BODY_PATH_REGEX = /`((?:src|apps|packages|bin|scripts|test|\.agents|config)\/[A-Za-z0-9._/\-]+)`/g;

/**
 * Parses YAML-like frontmatter and body references from a specification file.
 * @param {string} filePath
 * @param {string} [rootDir]
 * @returns {import('../types/index.d.ts').SpecFileReport}
 */
export function parseSpecDocument(filePath, rootDir = process.cwd()) {
  const absFile = path.resolve(filePath);
  const absRoot = path.resolve(rootDir);
  const content = fs.readFileSync(absFile, 'utf-8');
  const stat = fs.statSync(absFile);
  const relPath = path.relative(absRoot, absFile);

  /** @type {import('../types/index.d.ts').SpecFrontmatterMeta} */
  const meta = {
    id: null,
    title: null,
    status: null,
    track: null,
    author: null,
    reviewer: null,
    updated: null,
    target_files: []
  };

  let hasFrontmatter = false;
  let body = content;

  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (fmMatch) {
    hasFrontmatter = true;
    body = content.slice(fmMatch[0].length);
    const lines = fmMatch[1].split(/\r?\n/);
    let inTargetFiles = false;

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      if (!line.trim() || line.trim().startsWith('#')) continue;

      if (/^target_files\s*:\s*(\[\s*\])?$/.test(line.trim())) {
        inTargetFiles = !line.trim().endsWith('[]');
        continue;
      }

      if (inTargetFiles && /^\s+-\s+/.test(rawLine)) {
        const item = rawLine
          .replace(/^\s+-\s+/, '')
          .replace(/\s+#.*$/, '')
          .trim()
          .replace(/^['"]|['"]$/g, '');
        if (item) meta.target_files.push(item);
        continue;
      }

      inTargetFiles = false;
      const kv = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
      if (kv) {
        const key = kv[1];
        const val = kv[2].replace(/\s+#.*$/, '').trim().replace(/^['"]|['"]$/g, '');
        if (key === 'id' || key === 'title' || key === 'status' || key === 'track' || key === 'author' || key === 'reviewer' || key === 'updated') {
          meta[key] = val || null;
        }
      }
    }
  }

  // Extract headings and repo-relative paths from the document body
  /** @type {string[]} */
  const headings = [];
  /** @type {Set<string>} */
  const bodyPaths = new Set();

  for (const line of body.split(/\r?\n/)) {
    const headingMatch = line.match(/^#{1,4}\s+(.+)$/);
    if (headingMatch) {
      headings.push(headingMatch[1].trim());
    }
    if (/\bNEW\b/.test(line)) {
      continue;
    }
    BODY_PATH_REGEX.lastIndex = 0;
    let m;
    while ((m = BODY_PATH_REGEX.exec(line)) !== null) {
      bodyPaths.add(m[1]);
    }
  }

  const referencedFiles = Array.from(new Set([...meta.target_files, ...bodyPaths]));
  const missingSections = REQUIRED_SDD_SECTIONS.filter(
    req => !headings.some(h => h.toLowerCase().includes(req.toLowerCase()))
  );

  return {
    filePath: absFile,
    relPath,
    hasFrontmatter,
    meta,
    referencedFiles,
    missingSections,
    mtimeMs: stat.mtimeMs
  };
}

/**
 * Collects SDD specification files inside docs/designs/ and optional root spec.md.
 * @param {string} root
 * @returns {string[]}
 */
function discoverSpecFiles(root) {
  /** @type {string[]} */
  const files = [];
  const designsDir = path.join(root, 'docs', 'designs');

  if (fs.existsSync(designsDir) && fs.statSync(designsDir).isDirectory()) {
    /** @param {string} dir */
    const walk = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(full);
        }
      }
    };
    walk(designsDir);
  }

  const rootSpec = path.join(root, 'spec.md');
  if (fs.existsSync(rootSpec) && fs.statSync(rootSpec).isFile()) {
    try {
      const head = fs.readFileSync(rootSpec, 'utf-8').slice(0, 1024);
      if (/^---\r?\n[\s\S]*?\bstatus\s*:/m.test(head)) {
        files.push(rootSpec);
      }
    } catch {}
  }

  return files;
}

/**
 * Runs deterministic structural and path-drift checks on SDD specification files.
 * @param {string} [rootDir]
 * @param {import('../types/index.d.ts').SpecAuditOptions} [options]
 * @returns {import('../types/index.d.ts').SpecDriftReport}
 */
export function auditSpecDrift(rootDir = process.cwd(), options = {}) {
  const root = path.resolve(rootDir);
  const staleThresholdMs = options.staleThresholdMs ?? DEFAULT_STALE_THRESHOLD_MS;
  const staleDraftMs = options.staleDraftMs ?? DEFAULT_STALE_DRAFT_MS;

  const specFiles = discoverSpecFiles(root);
  /** @type {string[]} */
  const passed = [];
  /** @type {string[]} */
  const warnings = [];
  /** @type {string[]} */
  const failures = [];
  /** @type {import('../types/index.d.ts').SpecFileReport[]} */
  const specs = [];

  if (specFiles.length === 0) {
    return { ok: true, specsFound: 0, specs, passed, warnings, failures };
  }

  for (const filePath of specFiles) {
    const parsed = parseSpecDocument(filePath, root);
    specs.push(parsed);

    const status = String(parsed.meta.status || '').trim().toUpperCase();
    if (!status || !VALID_SPEC_STATUSES.includes(status)) {
      failures.push(`Spec '${parsed.relPath}' has invalid or missing status ('${parsed.meta.status || 'none'}').`);
      continue;
    }

    if (status === 'SUPERSEDED') {
      passed.push(`Spec '${parsed.relPath}' (SUPERSEDED) archived.`);
      continue;
    }

    if (status === 'APPROVED') {
      if (parsed.referencedFiles.length === 0) {
        warnings.push(`Approved spec '${parsed.relPath}' declares no target_files or repo-relative paths.`);
        continue;
      }

      let missingCount = 0;
      for (const ref of parsed.referencedFiles) {
        const resolvedRef = path.resolve(root, ref);
        const insideRoot = resolvedRef === root || resolvedRef.startsWith(root + path.sep);
        if (!insideRoot) {
          failures.push(`Spec drift in '${parsed.relPath}': referenced path '${ref}' escapes project root.`);
          missingCount++;
          continue;
        }
        if (!fs.existsSync(resolvedRef)) {
          failures.push(`Spec drift in '${parsed.relPath}': referenced path '${ref}' does not exist on disk.`);
          missingCount++;
          continue;
        }
        const refStat = fs.statSync(resolvedRef);
        if (refStat.mtimeMs - parsed.mtimeMs > staleThresholdMs) {
          warnings.push(`Potential spec staleness in '${parsed.relPath}': '${ref}' was modified after spec update; consider zero-context drift review.`);
        }
      }

      if (missingCount === 0) {
        passed.push(`Spec '${parsed.relPath}' (APPROVED): ${parsed.referencedFiles.length} referenced path(s) verified on disk.`);
      }
      continue;
    }

    // DRAFT or IN_REVIEW
    if (parsed.missingSections.length > 0) {
      warnings.push(`Spec '${parsed.relPath}' (${status}) is missing SDD section(s): ${parsed.missingSections.join(', ')}.`);
    } else {
      passed.push(`Spec '${parsed.relPath}' (${status}) conforms to SDD template structure.`);
    }

    if (Date.now() - parsed.mtimeMs > staleDraftMs) {
      warnings.push(`Spec '${parsed.relPath}' has been in ${status} without updates.`);
    }
  }

  return {
    ok: failures.length === 0,
    specsFound: specs.length,
    specs,
    passed,
    warnings,
    failures
  };
}

/**
 * Generates a canonical SDD specification template under docs/designs/<slug>.md.
 * @param {string} [targetDir]
 * @param {string} [slug]
 * @param {import('../types/index.d.ts').CreateSpecOptions} [options]
 * @returns {import('../types/index.d.ts').CreateSpecResult}
 */
export function createSpecTemplate(targetDir = process.cwd(), slug = '', options = {}) {
  const rawSlug = String(slug || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-');
  let start = 0;
  let end = rawSlug.length;
  while (start < end && rawSlug[start] === '-') start++;
  while (end > start && rawSlug[end - 1] === '-') end--;
  const sanitizedSlug = rawSlug.slice(start, end);

  if (!sanitizedSlug) {
    throw new Error('Invalid spec slug: must contain at least one alphanumeric character.');
  }

  const root = path.resolve(targetDir);
  const designsDir = path.join(root, 'docs', 'designs');
  const fullPath = path.resolve(designsDir, `${sanitizedSlug}.md`);
  if (!fullPath.startsWith(designsDir + path.sep)) {
    throw new Error('Invalid spec target path.');
  }

  const relPath = path.relative(root, fullPath);
  const isDryRun = Boolean(options.dryRun);

  if (fs.existsSync(fullPath) && !options.force) {
    throw new Error(`Spec already exists at '${relPath}'. Use --force to overwrite.`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const title = options.title || sanitizedSlug.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
  const track = options.track || 'VITAL_LOGIC';
  const targetFiles = Array.isArray(options.targetFiles) && options.targetFiles.length > 0
    ? options.targetFiles
    : ['src/example/module.js'];

  const content = `---
id: ${sanitizedSlug}
title: ${title}
status: DRAFT
track: ${track}
author: Lead AI Orchestrator
reviewer: Meta-Critic Evaluator (Zero-Context)
updated: ${today}
target_files:
${targetFiles.map(f => `  - ${f}`).join('\n')}
---

# ${title}

> **Lifecycle**: \`DRAFT -> IN_REVIEW -> APPROVED -> SUPERSEDED\`

## 1. Problem & Objectives (Heilmeier Core)
- **Objective**: State what this change achieves without jargon.
- **Current Baseline & Failure**: Current state and exact gap/failure being solved.
- **Proposed Mechanism**: Core design decision and why it succeeds.

## 2. Scope & Explicit Non-Goals
- **In Scope**:
  - Concrete deliverables.
- **Out of Scope (Non-Goals)**:
  - Explicit exclusions to prevent scope creep.

## 3. Target Files & Interface Contracts
| File Path | Action (\`MODIFY\` \\| \`NEW\`) | Contract / Exported Symbols |
| :--- | :--- | :--- |
${targetFiles.map(f => `| \`${f}\` | \`MODIFY\` | Describe exported functions / behavior |`).join('\n')}

## 4. Risks, Failure Modes & Edge Cases
- **Offline / Missing Binaries**: Fallback behavior.
- **Malformed Inputs / Boundary Conditions**: Validation rules and error paths.

## 5. Verification & Acceptance Criteria
- Exact runnable test/audit commands (e.g., \`node --test\`, \`node ./bin/iss.js doctor\`).

## 6. Cold Review Log (Zero-Context Gates)
- **Gate 1 (Paraphrase)**: \`PENDING\`
- **Gate 2 (Adversarial & Heilmeier)**: \`PENDING\`
- **Gate 3 (Implementation Readiness)**: \`PENDING\`
- **Human Sign-Off (\`APPROVED\`)**: \`PENDING\`
`;

  if (!isDryRun) {
    fs.mkdirSync(designsDir, { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
  }

  return {
    slug: sanitizedSlug,
    relPath,
    fullPath,
    dryRun: isDryRun,
    content
  };
}
