#!/usr/bin/env node
/**
 * ==============================================================================
 * MONOREPO CASCADE IMPACT SCOPER (Workspace Dependency DAG)
 * ==============================================================================
 * Maps modified files to their dependent downstream packages using dynamic
 * package.json workspace dependency topology (with static heuristic fallback).
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { getHookLabel } from './theme-loader.js';

const scopeLabel = () => getHookLabel('cascade');
const simLabel = () => getHookLabel('sim');

export const TOPOLOGY_RULES = [
  {
    sourceMatch: /^packages\/shared-types\//,
    affects: ['apps/web', 'apps/mobile', 'apps/api', 'apps/landing', 'apps/extension']
  },
  {
    sourceMatch: /^packages\/shared-utils\//,
    affects: ['apps/web', 'apps/mobile', 'apps/api']
  },
  {
    sourceMatch: /^packages\/ui-tokens\//,
    affects: ['apps/web', 'apps/mobile', 'apps/landing']
  },
  {
    sourceMatch: /^apps\/api\//,
    affects: ['apps/api']
  },
  {
    sourceMatch: /^apps\/mobile\//,
    affects: ['apps/mobile']
  },
  {
    sourceMatch: /^apps\/web\//,
    affects: ['apps/web']
  }
];

/**
 * @typedef {{
 *   dirToName: Map<string, string>,
 *   nameToDir: Map<string, string>,
 *   dependentsOf: Map<string, Set<string>>
 * }} WorkspaceTopology
 */

/**
 * Discovers monorepo package directories and builds a dependency DAG.
 * @param {string} [rootDir]
 * @returns {WorkspaceTopology|null}
 */
export function discoverWorkspaceTopology(rootDir = process.cwd()) {
  const root = path.resolve(rootDir);
  const candidateRoots = ['apps', 'packages', 'libs', 'services', 'modules'];
  /** @type {Array<{ relPath: string, fullPath: string, pkgJsonPath: string }>} */
  const pkgDirs = [];

  for (const cand of candidateRoots) {
    const parent = path.join(root, cand);
    if (fs.existsSync(parent) && fs.statSync(parent).isDirectory()) {
      const children = fs.readdirSync(parent);
      for (const child of children) {
        const fullChild = path.join(parent, child);
        const pkgJson = path.join(fullChild, 'package.json');
        if (fs.existsSync(pkgJson)) {
          pkgDirs.push({
            relPath: path.posix.join(cand, child),
            fullPath: fullChild,
            pkgJsonPath: pkgJson
          });
        }
      }
    }
  }

  if (pkgDirs.length === 0) {
    return null;
  }

  /** @type {Map<string, string>} */
  const dirToName = new Map();
  /** @type {Map<string, string>} */
  const nameToDir = new Map();
  /** @type {Map<string, string[]>} */
  const pkgDeps = new Map();

  for (const item of pkgDirs) {
    try {
      const data = JSON.parse(fs.readFileSync(item.pkgJsonPath, 'utf-8'));
      const pkgName = data.name || path.basename(item.relPath);
      dirToName.set(item.relPath, pkgName);
      nameToDir.set(pkgName, item.relPath);

      const allDeps = {
        ...(data.dependencies || {}),
        ...(data.devDependencies || {}),
        ...(data.peerDependencies || {})
      };
      pkgDeps.set(pkgName, Object.keys(allDeps));
    } catch {}
  }

  /** @type {Map<string, Set<string>>} */
  const dependentsOf = new Map();
  for (const [pkgName, deps] of pkgDeps.entries()) {
    for (const dep of deps) {
      if (nameToDir.has(dep)) {
        let set = dependentsOf.get(dep);
        if (!set) {
          set = new Set();
          dependentsOf.set(dep, set);
        }
        set.add(pkgName);
      }
    }
  }

  return { dirToName, nameToDir, dependentsOf };
}

/**
 * Calculates downstream affected projects based on changed file paths.
 * @param {string[]} [changedFiles]
 * @param {string} [rootDir]
 * @returns {string[]} List of affected packages/apps
 */
export function calculateAffectedNodes(changedFiles = [], rootDir = process.cwd()) {
  /** @type {Set<string>} */
  const affected = new Set();
  const topology = discoverWorkspaceTopology(rootDir);

  if (topology && topology.dirToName.size > 0) {
    for (const file of changedFiles) {
      const normalized = file.replace(/^\.\//, '').replace(/\\/g, '/');

      let matchedRelDir = null;
      let matchedPkgName = null;

      for (const [relDir, pkgName] of topology.dirToName.entries()) {
        if (normalized === relDir || normalized.startsWith(relDir + '/')) {
          matchedRelDir = relDir;
          matchedPkgName = pkgName;
          break;
        }
      }

      if (matchedRelDir && matchedPkgName) {
        affected.add(matchedRelDir);

        const queue = [matchedPkgName];
        const visited = new Set([matchedPkgName]);

        while (queue.length > 0) {
          const current = queue.shift();
          if (!current) continue;
          const dependents = topology.dependentsOf.get(current) || [];
          for (const depName of dependents) {
            if (!visited.has(depName)) {
              visited.add(depName);
              const depDir = topology.nameToDir.get(depName);
              if (depDir) affected.add(depDir);
              queue.push(depName);
            }
          }
        }
      }
    }
  }

  if (affected.size === 0) {
    for (const file of changedFiles) {
      const normalized = file.replace(/^\.\//, '').replace(/\\/g, '/');
      for (const rule of TOPOLOGY_RULES) {
        if (rule.sourceMatch.test(normalized)) {
          for (const target of rule.affects) {
            affected.add(target);
          }
        }
      }
    }
  }

  return Array.from(affected);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  if (process.argv.includes('--test')) {
    console.log(`${simLabel()} ${scopeLabel()}: Running monorepo cascade scope self-test...`);

    const sampleChanges = [
      'packages/shared-types/src/workday.ts',
      'apps/mobile/src/screens/PunchScreen.tsx'
    ];

    const affected = calculateAffectedNodes(sampleChanges);

    console.log('Inputs:', sampleChanges);
    console.log('Affected nodes calculated:', affected);

    if (affected.includes('apps/web') && affected.includes('apps/api') && affected.includes('apps/mobile')) {
      console.log(`${scopeLabel()}: Self-test PASSED.`);
      process.exit(0);
    } else {
      console.error('FAILED to map cascade impact.');
      process.exit(1);
    }
  }
}
