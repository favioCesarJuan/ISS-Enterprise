/**
 * ==============================================================================
 * 🏗️ ISS-ENTERPRISE: GREENFIELD SCAFFOLDER ENGINE
 * ==============================================================================
 * Builds physical project directory layouts and initial manifests from scratch
 * for brand-new starbases (Monorepos, APIs, RAG Data Pipelines, Astro, etc.).
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Scaffolds project directories and starter files based on chosen architecture.
 * @param {string} targetDir
 * @param {object} choices User choices from advisor
 * @returns {string[]} List of created directories and files
 */
export function scaffoldGreenfieldProject(targetDir, choices = {}) {
  const root = path.resolve(targetDir);
  const created = [];

  const mkdir = (sub) => {
    const full = path.join(root, sub);
    if (!fs.existsSync(full)) {
      fs.mkdirSync(full, { recursive: true });
      created.push(sub + '/');
    }
  };

  const writeFile = (sub, content) => {
    const full = path.join(root, sub);
    const parent = path.dirname(full);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.writeFileSync(full, content.trim() + '\n', 'utf-8');
    created.push(sub);
  };

  const purpose = choices.project_purpose || choices.purpose || choices.archetype || 'SAAS_MONOREPO';
  const projectName = choices.projectName || path.basename(root);

  // 1. Standard Gitignore
  writeFile('.gitignore', `# Node & Python
node_modules/
__pycache__/
*.pyc
.env
.env.local
dist/
build/
.DS_Store
*.log
`);

  // 2. Topology Scaffolding
  if (/monorepo/i.test(purpose)) {
    mkdir('apps/web/src');
    mkdir('apps/api/src');
    mkdir('packages/shared-types/src');
    mkdir('packages/shared-utils/src');

    writeFile('package.json', JSON.stringify({
      name: projectName,
      version: '1.0.0',
      private: true,
      workspaces: ['apps/*', 'packages/*'],
      scripts: {
        build: 'turbo run build',
        dev: 'turbo run dev',
        test: 'turbo run test'
      }
    }, null, 2));

    writeFile('packages/shared-types/src/index.ts', `export interface VitalEntity {\n  id: string;\n  createdAt: string;\n}\n`);
    writeFile('apps/api/src/main.ts', `console.log('🚀 API Service online on Starship Enterprise');\n`);
    writeFile('apps/web/src/index.tsx', `export const App = () => <h1>Welcome to ${projectName}</h1>;\n`);

  } else if (/data|rag|pipeline/i.test(purpose)) {
    mkdir('ingest');
    mkdir('processing');
    mkdir('storage');
    mkdir('models');
    mkdir('vault');
    mkdir('tests');

    writeFile('pyproject.toml', `[project]
name = "${projectName}"
version = "0.1.0"
description = "Tactical Data Engineering & RAG Pipeline"
dependencies = [
    "pydantic>=2.0.0",
    "numpy>=1.24.0"
]
`);

    writeFile('main.py', `"""
🛰️ ISS-Enterprise: Tactical Data & RAG Pipeline Entrypoint
"""
def main():
    print("🛰️ Ingestion & RAG engine online. All systems nominal.")

if __name__ == "__main__":
    main()
`);

    writeFile('ingest/pipeline.py', `def run_ingest():\n    print("Ingesting tactical data stream...")\n`);

  } else if (/astro|ssg|portal|content/i.test(purpose)) {
    mkdir('src/pages');
    mkdir('src/components');
    mkdir('src/content');
    mkdir('public');

    writeFile('package.json', JSON.stringify({
      name: projectName,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'astro dev',
        build: 'astro build',
        preview: 'astro preview'
      },
      dependencies: {
        astro: '^4.0.0'
      }
    }, null, 2));

    writeFile('astro.config.mjs', `import { defineConfig } from 'astro/config';\nexport default defineConfig({});\n`);
    writeFile('src/pages/index.astro', `---\n---\n<html>\n  <body>\n    <h1>🚀 ${projectName} Online</h1>\n  </body>\n</html>\n`);

  } else {
    // Modular Hexagonal Backend API
    mkdir('src/domain');
    mkdir('src/application');
    mkdir('src/infrastructure');
    mkdir('src/adapters');
    mkdir('tests');

    writeFile('package.json', JSON.stringify({
      name: projectName,
      version: '1.0.0',
      type: 'module',
      scripts: {
        test: 'vitest run',
        build: 'tsc'
      }
    }, null, 2));

    writeFile('src/domain/entity.ts', `export class DomainEntity {\n  constructor(public readonly id: string) {}\n}\n`);
    writeFile('src/index.ts', `console.log("Enterprise Core online.");\n`);
  }

  return created;
}

export const scaffoldGreenfield = scaffoldGreenfieldProject;
