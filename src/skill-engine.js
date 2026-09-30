/**
 * ==============================================================================
 * 🗜️ ISS-ENTERPRISE: DYNAMIC SKILL ENGINE & COMPACTOR
 * ==============================================================================
 * Manages full skill lifecycle:
 * 1. Proactive recommendations based on project archetype.
 * 2. Dynamic skill searching & addition.
 * 3. Scaffolding new custom skills from scratch.
 * 4. Surgical compaction: fuses overlapping skills into 4 to 6 canonical pillars
 *    preventing token bloat, instruction collision, and "Diogenes Syndrome".
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';

export const CANONICAL_DOMAINS = [
  'security-guardrails',
  'design-system-and-ui',
  'code-health-and-ponytail',
  'fullstack-architecture',
  'data-engineering-and-rag',
  'workflow-and-coordination',
  'meta-critic-q',
  'skill-governance-lifecycle'
];

/**
 * Recommends a lean, compact skill suite tailored to the project archetype.
 * @param {string} archetype ARCHETYPES.*
 * @param {object} techStack
 * @returns {string[]} List of recommended canonical skills
 */
export function recommendSkillsForArchetype(archetype, techStack = {}) {
  const skills = ['security-guardrails', 'meta-critic-q'];

  switch (archetype) {
    case 'DATA_PIPELINE_RAG':
      skills.push('data-engineering-and-rag');
      skills.push('code-health-and-ponytail');
      skills.push('workflow-and-coordination');
      // Notice: NO UI/CSS skills for data pipelines!
      break;

    case 'CONTENT_SSG_PORTAL':
      skills.push('design-system-and-ui');
      skills.push('code-health-and-ponytail');
      skills.push('workflow-and-coordination');
      break;

    case 'BACKEND_API_ONLY':
      skills.push('fullstack-architecture');
      skills.push('code-health-and-ponytail');
      skills.push('workflow-and-coordination');
      break;

    case 'FULLSTACK_MONOREPO':
    default:
      skills.push('design-system-and-ui');
      skills.push('code-health-and-ponytail');
      skills.push('fullstack-architecture');
      skills.push('workflow-and-coordination');
      skills.push('skill-governance-lifecycle');
      break;
  }

  return skills;
}

/**
 * Creates a new custom skill template with standard YAML frontmatter.
 * @param {string} name
 * @param {string} description
 * @param {string} assignedOfficer
 * @returns {{ name: string, content: string }}
 */
export function createCustomSkill(name, description = '', assignedOfficer = 'Data') {
  const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const content = `---
name: ${slug}
description: ${description || `Custom tactical skill for ${name} managed by ${assignedOfficer}.`}
---

# ⚔️ ${name.toUpperCase()} (Officer: ${assignedOfficer})

## 🎯 Purpose & Scope
${description || `Specialized operational instructions for ${name}.`}

## 📋 Directives & Best Practices
1. **YAGNI & Minimalism**: Ascend the Ponytail ladder. Do not over-engineer.
2. **Quality & Verification**: Every change must be validated by automated tests.
3. **Security Shield**: Respect Lt. Tasha Yar's security perimeter rules.
`;

  return { name: slug, content };
}

/**
 * Physically creates a new skill directory and SKILL.md in targetDir.
 * @param {string} targetDir
 * @param {string} name
 * @param {object} options
 */
export function createNewSkill(targetDir, name, options = {}) {
  const skill = createCustomSkill(name, options.description, options.officer);
  const skillDir = path.resolve(targetDir, '.agents/skills', skill.name);
  if (!fs.existsSync(skillDir)) {
    fs.mkdirSync(skillDir, { recursive: true });
  }
  const filePath = path.join(skillDir, 'SKILL.md');
  fs.writeFileSync(filePath, skill.content, 'utf-8');
  return { name: skill.name, path: filePath };
}

/**
 * Compacts and fuses multiple raw skills into the canonical domain set.
 * Detects duplicates, collisions, and merges them into clean pillars.
 * @param {string|Array<{ name: string, content: string }>} inputDirOrList
 * @returns {Array<{ canonicalName: string, domain: string, sourceSkills: string[], fusedContent: string }>}
 */
export function compactAndFuseSkills(inputDirOrList = []) {
  let rawSkills = [];

  if (typeof inputDirOrList === 'string') {
    const skillsDir = path.resolve(inputDirOrList, '.agents/skills');
    if (fs.existsSync(skillsDir)) {
      const dirs = fs.readdirSync(skillsDir);
      for (const d of dirs) {
        const skillMd = path.join(skillsDir, d, 'SKILL.md');
        if (fs.existsSync(skillMd)) {
          rawSkills.push({
            name: d,
            content: fs.readFileSync(skillMd, 'utf-8')
          });
        }
      }
    }
    if (rawSkills.length === 0) {
      // Default canonical skills fallback
      rawSkills = CANONICAL_DOMAINS.map(d => ({
        name: d,
        content: `# ${d}\nCanonical directives for ${d}`
      }));
    }
  } else if (Array.isArray(inputDirOrList)) {
    rawSkills = inputDirOrList;
  }

  const domains = {};

  for (const skill of rawSkills) {
    const domain = classifySkillToDomain(skill.name, skill.content);
    if (!domains[domain]) {
      domains[domain] = [];
    }
    domains[domain].push(skill);
  }

  const compacted = [];
  for (const [domain, list] of Object.entries(domains)) {
    const fusedDirectives = list.map(s => `### Sub-domain: ${s.name}\n${(s.content || '').replace(/^---[\s\S]*?---/, '').trim()}`).join('\n\n---\n\n');
    const header = `---
name: ${domain}
description: Canonical compacted skill fusing ${list.map(s => s.name).join(', ')}.
---

# 🛡️ ${domain.toUpperCase()} (Compacted Canonical Domain)

${fusedDirectives}
`;
    compacted.push({
      canonicalName: domain,
      domain,
      sourceSkills: list.map(s => s.name),
      fusedContent: header,
      originalCount: list.length
    });
  }

  return compacted;
}

/**
 * Helper to classify a skill into one of the canonical pillars.
 */
function classifySkillToDomain(name = '', content = '') {
  const text = (name + ' ' + content).toLowerCase();

  if (/security|semgrep|vulnerability|audit|hardening|strix|auth/i.test(text)) {
    return 'security-guardrails';
  }
  if (/design|ui|ux|css|tailwind|style|apple|typography|color|contrast|a11y/i.test(text)) {
    return 'design-system-and-ui';
  }
  if (/health|ponytail|minimal|clean|solid|refactor|debt|smell/i.test(text)) {
    return 'code-health-and-ponytail';
  }
  if (/rag|vector|python|pipeline|scraper|pandas|data|etl|ingest/i.test(text)) {
    return 'data-engineering-and-rag';
  }
  if (/architecture|nest|next|monorepo|turbo|drizzle|orm|database/i.test(text)) {
    return 'fullstack-architecture';
  }
  if (/critic|q-continuum|timeline|chaos|evaluator|bias/i.test(text)) {
    return 'meta-critic-q';
  }

  return 'workflow-and-coordination';
}
